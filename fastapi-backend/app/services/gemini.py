import google.generativeai as genai
import os
from PIL import Image
import io
import base64
from typing import Optional, Dict, Any
import json
import logging
from app.core.config import settings
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

class GeminiAnalyzer:
    def __init__(self):
        # Configure Gemini API
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel("gemini-1.5-flash")

    def analyze_product_image(self, image_data: bytes, skin_type: str) -> Dict[str, Any]:
        """Analyze product ingredients from image using Gemini Vision."""
        try:
            # Convert bytes to PIL Image
            image = Image.open(io.BytesIO(image_data))
            
            prompt = f"""
            Analyze this product image for someone with {skin_type} skin type.
            
            If you can see the ingredients list clearly, extract all ingredients and provide a detailed analysis.
            If you can only see the product name/front label, provide a general analysis based on the product type.
            
            IMPORTANT: Always provide a numerical suitability_score between 1-10, never null.
            
            Return ONLY a valid JSON response in this exact format (no markdown, no code blocks):
            {{
                "product_name": "extracted product name",
                "ingredients_list": ["ingredient1", "ingredient2"],
                "suitability_score": 8,
                "beneficial_ingredients": ["ingredient1", "ingredient2"],
                "problematic_ingredients": ["ingredient1", "ingredient2"],
                "recommendation": "detailed recommendation text",
                "warnings": "any warnings or precautions",
                "skin_benefits": ["benefit1", "benefit2"],
                "usage_tips": "how to use this product properly"
            }}
            
            Guidelines for {skin_type} skin:
            - If ingredients are visible: Analyze each ingredient for {skin_type} skin compatibility
            - If only product name is visible: Provide general advice for that product category
            - Always assign a score 1-10 (1=avoid, 5=neutral, 10=excellent)
            - If uncertain, use score 4-5 and mention limitations in recommendation
            """
            
            print(f"Analyzing image for {skin_type} skin type...")
            
            # Generate content using Gemini Vision
            response = self.model.generate_content([prompt, image])
            
            print(f"Raw Gemini response: {response.text}")

            # Clean the response text - Remove markdown code blocks
            cleaned_response = self._clean_json_response(response.text)
            print(f"Cleaned response: {cleaned_response}")
            
            # Parse JSON response
            analysis_result = json.loads(cleaned_response)
            
            # Validate the result
            validated_result = self._validate_analysis_result(analysis_result, skin_type)
            
            return validated_result

        except json.JSONDecodeError as e:
            print(f"JSON parsing error: {e}")
            print(f"Cleaned response was: {cleaned_response if 'cleaned_response' in locals() else 'Not available'}")
            return self._fallback_analysis_with_image_info(skin_type)
        except Exception as e:
            print(f"Gemini analysis error: {e}")
            return self._fallback_analysis_with_image_info(skin_type)

    def analyze_product_for_skin_type(
        self,
        skin_type: str,
        product_name: Optional[str] = None,
        ingredients: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Analyze product suitability for given skin type using Gemini AI."""

        try:
            # Create prompt based on available data
            prompt = self._create_analysis_prompt(skin_type, product_name, ingredients)

            # Generate analysis
            response = self.model.generate_content(prompt)

            print(f"Gemini text response: {response.text}")

            # Clean the response text - Remove markdown code blocks
            cleaned_response = self._clean_json_response(response.text)
            print(f"Cleaned response: {cleaned_response}")

            # Parse response and create structured result
            analysis_result = json.loads(cleaned_response)
            
            # Validate required fields
            validated_result = self._validate_analysis_result(analysis_result, skin_type)

            return validated_result

        except json.JSONDecodeError as e:
            print(f"JSON parsing error in text analysis: {e}")
            print(f"Cleaned response was: {cleaned_response if 'cleaned_response' in locals() else 'Not available'}")
            return self._fallback_analysis(skin_type, product_name, ingredients)
        except Exception as e:
            logger.error(f"Gemini AI analysis failed: {e}")
            return self._fallback_analysis(skin_type, product_name, ingredients)

    def _create_analysis_prompt(
        self, skin_type: str, product_name: Optional[str], ingredients: Optional[str]
    ) -> str:
        """Create analysis prompt for Gemini AI."""

        prompt = f"""
        You are a professional dermatologist and cosmetic chemist. Analyze the following product for someone with {skin_type} skin type.

        Product Name: {product_name or 'Not provided'}
        Ingredients: {ingredients or 'Not provided'}

        Return ONLY a valid JSON response in this exact format (no markdown, no code blocks):
        {{
            "suitability_score": 8,
            "beneficial_ingredients": ["ingredient1", "ingredient2"],
            "problematic_ingredients": ["ingredient1", "ingredient2"],
            "recommendation": "detailed recommendation text",
            "warnings": "any warnings or precautions",
            "skin_benefits": ["benefit1", "benefit2"],
            "usage_tips": "how to use this product for best results"
        }}

        Consider the following for {skin_type} skin:
        - Dry skin: Needs hydration, avoid harsh sulfates, look for ceramides, hyaluronic acid
        - Oily skin: Avoid heavy oils, look for salicylic acid, niacinamide, lightweight formulas
        - Sensitive skin: Avoid fragrances, harsh chemicals, look for gentle, hypoallergenic ingredients
        - Combination skin: Balance between hydrating and oil-controlling ingredients
        - Normal skin: Most ingredients are suitable, focus on maintenance and protection

        Provide specific, actionable advice based on the ingredients and skin type.
        """

        return prompt

    def _clean_json_response(self, response_text: str) -> str:
        """Clean JSON response by removing markdown code blocks and extra formatting."""
        cleaned_text = response_text.strip()
        
        # Remove ```json from beginning
        if cleaned_text.startswith('```json'):
            cleaned_text = cleaned_text[7:]  # Remove '```json'
        elif cleaned_text.startswith('```'):
            cleaned_text = cleaned_text[3:]   # Remove '```'
        
        # Remove ``` from end
        if cleaned_text.endswith('```'):
            cleaned_text = cleaned_text[:-3]  # Remove trailing '```'
        
        # Strip any remaining whitespace
        cleaned_text = cleaned_text.strip()
        
        # Additional cleaning - remove any remaining backticks or markdown
        lines = cleaned_text.split('\n')
        cleaned_lines = []
        for line in lines:
            line = line.strip()
            if line and not line.startswith('```') and line != '```':
                cleaned_lines.append(line)
        
        cleaned_text = '\n'.join(cleaned_lines)
        
        return cleaned_text

    def _validate_analysis_result(self, result: Dict[str, Any], skin_type: str) -> Dict[str, Any]:
        """Validate and ensure all required fields are present in the analysis result."""
        
        # Handle null/None suitability_score
        suitability_score = result.get("suitability_score")
        if suitability_score is None:
            suitability_score = 5  # Default score when analysis is incomplete
        else:
            suitability_score = max(1, min(10, int(suitability_score)))
        
        # For image analysis, ensure all fields are present
        if "ingredients_list" in result:
            return {
                "product_name": result.get("product_name", "Unknown Product"),
                "ingredients_list": result.get("ingredients_list", []),
                "suitability_score": suitability_score,
                "beneficial_ingredients": result.get("beneficial_ingredients", []),
                "problematic_ingredients": result.get("problematic_ingredients", []),
                "recommendation": result.get("recommendation", "Consult with a dermatologist."),
                "warnings": result.get("warnings", ""),
                "skin_benefits": result.get("skin_benefits", []),
                "usage_tips": result.get("usage_tips", "Follow product instructions."),
            }
        else:
            # For text analysis, different structure
            return {
                "suitability_score": suitability_score,
                "beneficial_ingredients": result.get("beneficial_ingredients", []),
                "problematic_ingredients": result.get("problematic_ingredients", []),
                "recommendation": result.get("recommendation", "Consult with a dermatologist."),
                "warnings": result.get("warnings", ""),
                "skin_benefits": result.get("skin_benefits", []),
                "usage_tips": result.get("usage_tips", "Follow product instructions."),
            }

    def _fallback_analysis_with_image_info(self, skin_type: str) -> Dict[str, Any]:
        """Provide fallback analysis specifically for image analysis failures."""
        return {
            "product_name": "Analysis Error",
            "ingredients_list": [],
            "suitability_score": 5,
            "beneficial_ingredients": [],
            "problematic_ingredients": [],
            "recommendation": f"Unable to analyze the product image properly. For {skin_type} skin, consider consulting with a dermatologist.",
            "warnings": "Image analysis failed. Please ensure the image is clear and contains visible ingredients.",
            "skin_benefits": [],
            "usage_tips": "Consult with a dermatologist for personalized advice.",
        }

    def _fallback_analysis(
        self,
        skin_type: str,
        product_name: Optional[str] = None,
        ingredients: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Provide fallback analysis when Gemini AI fails."""

        fallback_recommendations = {
            "dry": {
                "recommendation": "Look for products with hyaluronic acid, ceramides, and avoid harsh sulfates.",
                "beneficial": ["hyaluronic acid", "ceramides", "glycerin", "shea butter"],
                "avoid": ["alcohol", "sulfates", "benzoyl peroxide"],
            },
            "oily": {
                "recommendation": "Choose lightweight, non-comedogenic products with salicylic acid or niacinamide.",
                "beneficial": ["salicylic acid", "niacinamide", "zinc", "tea tree oil"],
                "avoid": ["heavy oils", "petroleum", "coconut oil"],
            },
            "sensitive": {
                "recommendation": "Opt for fragrance-free, hypoallergenic products with minimal ingredients.",
                "beneficial": ["aloe vera", "chamomile", "oatmeal", "zinc oxide"],
                "avoid": ["fragrances", "essential oils", "retinoids", "alpha hydroxy acids"],
            },
            "combination": {
                "recommendation": "Use different products for different areas, or choose balanced formulations.",
                "beneficial": ["niacinamide", "hyaluronic acid", "gentle exfoliants"],
                "avoid": ["overly harsh or overly rich products"],
            },
            "normal": {
                "recommendation": "Most products are suitable. Focus on protection and maintenance.",
                "beneficial": ["vitamin C", "sunscreen", "gentle cleansers"],
                "avoid": ["over-treating", "harsh scrubs"],
            },
        }

        skin_advice = fallback_recommendations.get(skin_type, fallback_recommendations["normal"])

        return {
            "suitability_score": 6,
            "beneficial_ingredients": skin_advice["beneficial"],
            "problematic_ingredients": skin_advice["avoid"],
            "recommendation": skin_advice["recommendation"],
            "warnings": "This is a basic analysis. Consult a dermatologist for personalized advice.",
            "skin_benefits": ["Consult product specifications"],
            "usage_tips": "Patch test before full use. Start slowly with new products.",
        }
