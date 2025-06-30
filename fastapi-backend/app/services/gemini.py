import google.generativeai as genai
from typing import Dict, Any, Optional
import json
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

# Configure Gemini AI
genai.configure(api_key="YOUR_GEMINI_API_KEY")  # Add this to your .env file

class GeminiAnalyzer:
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-pro')
    
    def analyze_product_for_skin_type(
        self, 
        skin_type: str, 
        product_name: Optional[str] = None,
        ingredients: Optional[str] = None,
        product_image_data: Optional[bytes] = None
    ) -> Dict[str, Any]:
        """Analyze product suitability for given skin type using Gemini AI."""
        
        try:
            # Create prompt based on available data
            prompt = self._create_analysis_prompt(skin_type, product_name, ingredients)
            
            # Generate analysis
            response = self.model.generate_content(prompt)
            
            # Parse response and create structured result
            analysis_result = self._parse_gemini_response(response.text, skin_type)
            
            return analysis_result
            
        except Exception as e:
            logger.error(f"Gemini AI analysis failed: {e}")
            return self._fallback_analysis(skin_type, product_name, ingredients)
    
    def _create_analysis_prompt(
        self, 
        skin_type: str, 
        product_name: Optional[str], 
        ingredients: Optional[str]
    ) -> str:
        """Create analysis prompt for Gemini AI."""
        
        prompt = f"""
        You are a professional dermatologist and cosmetic chemist. Analyze the following product for someone with {skin_type} skin type.

        Product Name: {product_name or 'Not provided'}
        Ingredients: {ingredients or 'Not provided'}

        Please provide a detailed analysis in the following JSON format:
        {{
            "suitability_score": <number from 1-10>,
            "is_suitable": <true/false>,
            "beneficial_ingredients": [<list of good ingredients for this skin type>],
            "problematic_ingredients": [<list of ingredients that might cause issues>],
            "recommendation": "<detailed recommendation>",
            "warnings": "<any warnings or precautions>",
            "skin_benefits": [<list of potential benefits>],
            "usage_tips": "<how to use this product for best results>"
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
    
    def _parse_gemini_response(self, response_text: str, skin_type: str) -> Dict[str, Any]:
        """Parse Gemini AI response into structured format."""
        
        try:
            # Try to extract JSON from response
            start_idx = response_text.find('{')
            end_idx = response_text.rfind('}') + 1
            
            if start_idx != -1 and end_idx != -1:
                json_str = response_text[start_idx:end_idx]
                parsed_response = json.loads(json_str)
                
                # Validate and ensure required fields
                result = {
                    "suitability_score": parsed_response.get("suitability_score", 5),
                    "is_suitable": parsed_response.get("is_suitable", True),
                    "beneficial_ingredients": parsed_response.get("beneficial_ingredients", []),
                    "problematic_ingredients": parsed_response.get("problematic_ingredients", []),
                    "recommendation": parsed_response.get("recommendation", "Consult with a dermatologist for personalized advice."),
                    "warnings": parsed_response.get("warnings", ""),
                    "skin_benefits": parsed_response.get("skin_benefits", []),
                    "usage_tips": parsed_response.get("usage_tips", "Follow product instructions."),
                    "skin_type_analyzed": skin_type,
                    "analysis_source": "gemini_ai"
                }
                
                return result
            else:
                raise ValueError("No valid JSON found in response")
                
        except Exception as e:
            logger.error(f"Failed to parse Gemini response: {e}")
            return self._fallback_analysis(skin_type)
    
    def _fallback_analysis(
        self, 
        skin_type: str, 
        product_name: Optional[str] = None,
        ingredients: Optional[str] = None
    ) -> Dict[str, Any]:
        """Provide fallback analysis when Gemini AI fails."""
        
        fallback_recommendations = {
            "dry": {
                "recommendation": "Look for products with hyaluronic acid, ceramides, and avoid harsh sulfates.",
                "beneficial": ["hyaluronic acid", "ceramides", "glycerin", "shea butter"],
                "avoid": ["alcohol", "sulfates", "benzoyl peroxide"]
            },
            "oily": {
                "recommendation": "Choose lightweight, non-comedogenic products with salicylic acid or niacinamide.",
                "beneficial": ["salicylic acid", "niacinamide", "zinc", "tea tree oil"],
                "avoid": ["heavy oils", "petroleum", "coconut oil"]
            },
            "sensitive": {
                "recommendation": "Opt for fragrance-free, hypoallergenic products with minimal ingredients.",
                "beneficial": ["aloe vera", "chamomile", "oatmeal", "zinc oxide"],
                "avoid": ["fragrances", "essential oils", "retinoids", "alpha hydroxy acids"]
            },
            "combination": {
                "recommendation": "Use different products for different areas, or choose balanced formulations.",
                "beneficial": ["niacinamide", "hyaluronic acid", "gentle exfoliants"],
                "avoid": ["overly harsh or overly rich products"]
            },
            "normal": {
                "recommendation": "Most products are suitable. Focus on protection and maintenance.",
                "beneficial": ["vitamin C", "sunscreen", "gentle cleansers"],
                "avoid": ["over-treating", "harsh scrubs"]
            }
        }
        
        skin_advice = fallback_recommendations.get(skin_type, fallback_recommendations["normal"])
        
        return {
            "suitability_score": 6,
            "is_suitable": True,
            "beneficial_ingredients": skin_advice["beneficial"],
            "problematic_ingredients": skin_advice["avoid"],
            "recommendation": skin_advice["recommendation"],
            "warnings": "This is a basic analysis. Consult a dermatologist for personalized advice.",
            "skin_benefits": ["Consult product specifications"],
            "usage_tips": "Patch test before full use. Start slowly with new products.",
            "skin_type_analyzed": skin_type,
            "analysis_source": "fallback_basic"
        }