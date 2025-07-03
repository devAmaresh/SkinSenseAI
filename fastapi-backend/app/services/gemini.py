import google.generativeai as genai
from PIL import Image
import io
import base64
import json
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.crud.skin_memory import skin_memory_crud
import os
from dotenv import load_dotenv


load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))


class GeminiAnalyzer:
    def __init__(self):
        self.model = genai.GenerativeModel("gemini-2.5-flash")

    def analyze_product_with_memory(
        self,
        image_data: bytes,
        skin_type: str,
        user_allergens: List[Dict],
        user_issues: List[Dict],
        db: Session,
        user_id: int,
    ) -> Dict[str, Any]:
        """Main method for analyzing products with user's skin memory"""

        # Prepare user context
        user_context = self._prepare_user_context(user_allergens, user_issues)

        # Analyze product
        enhanced_analysis = self._analyze_with_context(
            image_data, skin_type, user_context
        )

        # Extract insights about potential new allergens or issues
        self._extract_and_store_insights(enhanced_analysis, db, user_id)

        # Create memory entry for this analysis
        memory_content = (
            f"Analyzed product: {enhanced_analysis.get('product_name', 'Unknown')}. "
        )
        memory_content += (
            f"Suitability score: {enhanced_analysis.get('suitability_score')}/10. "
        )
        if enhanced_analysis.get("allergen_warnings"):
            memory_content += f"Allergen warnings detected: {', '.join(enhanced_analysis.get('allergen_warnings', []))}."

        # Store analysis in memory
        try:
            skin_memory_crud.add_memory_entry(
                db=db,
                user_id=user_id,
                entry_type="analysis_finding",
                content=memory_content,
                entry_metadata={
                    "analysis_result": enhanced_analysis,
                    "product_name": enhanced_analysis.get("product_name")
                },
                source="product_analysis",
                importance=4
            )
        except Exception as e:
            print(f"Error storing memory entry: {e}")

        return enhanced_analysis


    def _prepare_user_context(self, allergens: List[Dict], issues: List[Dict]) -> str:
        context = "User's skin profile:\n"

        if allergens:
            context += "Known allergens/sensitivities:\n"
            for allergen in allergens:
                context += f"- {allergen['ingredient_name']} ({allergen['severity']} severity)\n"

        if issues:
            context += "Current skin issues:\n"
            for issue in issues:
                context += f"- {issue['issue_type']}: {issue['description']} (severity: {issue['severity']}/10)\n"

        return context

    def _analyze_with_context(
        self, image_data: bytes, skin_type: str, user_context: str
    ) -> Dict[str, Any]:
        try:
            # Convert image
            image = Image.open(io.BytesIO(image_data))

            prompt = f"""
            Analyze this skincare product image with the following user context:
            
            Skin Type: {skin_type}
            
            {user_context}
            
            Please provide a comprehensive analysis including:
            1. Product identification (name, brand, type)
            2. Key ingredients analysis
            3. Suitability score (1-10) based on user's skin type and known allergens
            4. Specific allergen warnings for this user
            5. Recommendations considering user's current skin issues
            6. Ingredients that might help with current issues
            7. Potential new sensitivities to watch for
            8. Usage recommendations
            
            IMPORTANT: Format your response using the EXACT structure below. All lists must be arrays, even if there is only one item:
            
            ```json
            {{
                "product_name": "Example Product Name",
                "brand": "Example Brand",
                "product_type": "Cleanser",
                "key_ingredients": [
                    {{
                        "name": "Ingredient 1",
                        "description": "Description of ingredient 1"
                    }},
                    {{
                        "name": "Ingredient 2", 
                        "description": "Description of ingredient 2"
                    }}
                ],
                "suitability_score": 7,
                "allergen_warnings": [
                    "Warning 1 about allergen X",
                    "Warning 2 about allergen Y"
                ],
                "personalized_recommendation": "Detailed recommendation based on user's skin profile",
                "beneficial_ingredients": [
                    "Ingredient A",
                    "Ingredient B"
                ],
                "watch_ingredients": [
                    {{
                        "name": "Problematic Ingredient 1",
                        "reason": "Reason why this might be problematic"
                    }},
                    {{
                        "name": "Problematic Ingredient 2",
                        "reason": "Reason why this might be problematic"
                    }}
                ],
                "usage_instructions": "Instructions on how to use the product",
                "potential_issues": "[Any other issues to be aware of , issue 2, issue 3]"
            }}
            ```

            Always provide arrays for key_ingredients, allergen_warnings, beneficial_ingredients,potential_issues and watch_ingredients, even if there is only one item or no items (use empty array in that case).
            """

            response = self.model.generate_content([prompt, image])

            # Parse JSON response
            try:
                analysis = json.loads(
                    response.text.strip().replace("```json", "").replace("```", "")
                )
                
                # Ensure all expected fields are arrays, even if empty
                for field in ['key_ingredients', 'allergen_warnings', 'beneficial_ingredients', 'watch_ingredients']:
                    if field not in analysis:
                        analysis[field] = []
                    elif not isinstance(analysis[field], list):
                        analysis[field] = [analysis[field]]
                        
                return analysis
                
            except json.JSONDecodeError:
                # Fallback parsing
                analysis = self._parse_fallback_response(response.text)
                return analysis

        except Exception as e:
            print(f"Analysis error: {e}")
            return {
                "error": "Failed to analyze product",
                "product_name": "Unknown Product",
                "suitability_score": 5,
                "personalized_recommendation": "Unable to analyze. Please consult a dermatologist.",
                "allergen_warnings": [],
                "beneficial_ingredients": [],
                "watch_ingredients": [],
                "usage_instructions": "Follow product instructions"
            }

    def _extract_and_store_insights(
        self, analysis: Dict[str, Any], db: Session, user_id: int
    ):
        """Extract potential new allergens or issues from analysis"""
        try:
            # Check for new potential allergens mentioned in warnings
            if analysis.get("watch_ingredients"):
                for ingredient in analysis["watch_ingredients"]:
                    try:
                        skin_memory_crud.add_memory_entry(
                            db=db,
                            user_id=user_id,
                            entry_type="potential_allergen",
                            content=f"Recommended to watch ingredient: {ingredient} - mentioned in product analysis",
                            entry_metadata={
                                "ingredient": ingredient, 
                                "source": "product_analysis"
                            },
                            source="gemini_analysis",
                            importance=3
                        )
                    except Exception as e:
                        print(f"Error storing potential allergen memory: {e}")
        except Exception as e:
            print(f"Error extracting insights: {e}")

    def process_chat_for_insights(
        self, message: str, response: str, db: Session, user_id: int
    ):
        """Process chat conversations to extract skin-related insights"""

        # Check if user mentions new issues or improvements
        insight_prompt = f"""
        Analyze this skincare conversation for any mentions of:
        1. New skin issues or problems
        2. Improvements in existing conditions
        3. Reactions to products or ingredients
        4. Lifestyle factors affecting skin
        
        User message: {message}
        AI response: {response}
        
        Extract key insights as JSON with keys: new_issues, improvements, reactions, lifestyle_factors.
        If nothing relevant, return empty arrays.
        """

        try:
            insight_response = self.model.generate_content(insight_prompt)
            insights = json.loads(
                insight_response.text.strip().replace("```json", "").replace("```", "")
            )

            # Store relevant insights
            if any(insights.values()):
                content = f"Chat insights: User discussed skin concerns and experiences"
                try:
                    skin_memory_crud.add_memory_entry(
                        db=db,
                        user_id=user_id,
                        entry_type="chat_insight",
                        content=content,
                        entry_metadata={
                            "extracted_insights": insights,
                            "message_preview": message[:100]
                        },
                        source="chat_analysis",
                        importance=2
                    )
                except Exception as e:
                    print(f"Error storing chat insight memory: {e}")

        except Exception as e:
            print(f"Chat insight extraction error: {e}")

    def _parse_fallback_response(self, text: str) -> Dict[str, Any]:
        """Fallback parsing when JSON parsing fails"""
        return {
            "product_name": "Unknown Product",
            "suitability_score": 5,
            "personalized_recommendation": (
                text[:500] + "..." if len(text) > 500 else text
            ),
            "allergen_warnings": [],
            "beneficial_ingredients": [],
            "watch_ingredients": [],
            "usage_instructions": "Follow product instructions"
        }


gemini_analyzer = GeminiAnalyzer()
