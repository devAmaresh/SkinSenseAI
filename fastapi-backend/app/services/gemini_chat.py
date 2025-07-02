import google.generativeai as genai
import os
from typing import List, Dict, Any, Optional
import json
import logging
from app.models.chat import ChatMessage
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

class GeminiChatService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel("gemini-2.5-flash")

    def generate_chat_response(
        self,
        user_message: str,
        skin_type: Optional[str] = None,
        skin_concerns: Optional[List[str]] = None,
        conversation_history: Optional[List[ChatMessage]] = None
    ) -> str:
        """Generate a context-aware response for skincare queries."""
        
        try:
            # Build context-aware prompt
            prompt = self._build_chat_prompt(
                user_message, 
                skin_type, 
                skin_concerns, 
                conversation_history
            )
            
            # Generate response
            response = self.model.generate_content(prompt)
            
            # Clean and return response
            cleaned_response = self._clean_response(response.text)
            
            return cleaned_response
            
        except Exception as e:
            logger.error(f"Gemini chat error: {e}")
            return self._fallback_response(user_message, skin_type)

    def _build_chat_prompt(
        self,
        user_message: str,
        skin_type: Optional[str],
        skin_concerns: Optional[List[str]],
        conversation_history: Optional[List[ChatMessage]]
    ) -> str:
        """Build a comprehensive prompt with user context."""
        
        # Base system prompt
        system_prompt = """You are SkinSense AI, an expert skincare and cosmetics consultant. You provide personalized, evidence-based advice about skincare routines, product recommendations, ingredient analysis, and beauty concerns.

Key Guidelines:
- Always provide helpful, accurate, and safe skincare advice
- Recommend patch testing for new products
- Suggest consulting dermatologists for serious skin conditions
- Be conversational and friendly while maintaining expertise
- Focus on practical, actionable advice
- Consider the user's specific skin type and concerns
- If asked about non-skincare topics, politely redirect to skincare

"""
        
        # Add user context
        context_info = []
        if skin_type:
            context_info.append(f"User's skin type: {skin_type}")
            
        if skin_concerns:
            context_info.append(f"User's skin concerns: {', '.join(skin_concerns)}")
        
        if context_info:
            system_prompt += f"\nUser Context:\n" + "\n".join(context_info) + "\n"
        
        # Add conversation history
        if conversation_history:
            system_prompt += "\nRecent conversation history:\n"
            for msg in reversed(conversation_history[-6:]):  # Last 6 messages for context
                role = "User" if msg.is_user else "AI"
                system_prompt += f"{role}: {msg.message}\n"
        
        # Add current user message
        full_prompt = f"{system_prompt}\nUser: {user_message}\n\nAI:"
        
        return full_prompt

    def _clean_response(self, response_text: str) -> str:
        """Clean the response text."""
        cleaned = response_text.strip()
        
        # Remove any markdown formatting that might interfere
        cleaned = cleaned.replace("**", "")
        cleaned = cleaned.replace("*", "")
        
        return cleaned

    def _fallback_response(self, user_message: str, skin_type: Optional[str]) -> str:
        """Provide a fallback response when Gemini fails."""
        
        fallback_responses = {
            "dry": "For dry skin, I generally recommend gentle, hydrating products with ingredients like hyaluronic acid and ceramides. However, I'm having trouble processing your specific question right now. Could you rephrase it?",
            "oily": "For oily skin, lightweight, non-comedogenic products with ingredients like niacinamide and salicylic acid are usually beneficial. I'm experiencing a technical issue - could you ask your question again?",
            "sensitive": "For sensitive skin, fragrance-free, gentle products with minimal ingredients are typically best. I'm having trouble responding right now - please try rephrasing your question.",
            "combination": "For combination skin, using different products for different areas often works well. I'm experiencing difficulties - could you rephrase your question?",
            "normal": "For normal skin, maintaining a consistent, gentle routine is key. I'm having technical difficulties right now - please try asking again."
        }
        
        base_response = fallback_responses.get(skin_type, 
            "I'm having trouble processing your question right now. Could you please rephrase it or try again?")
        
        return f"{base_response}\n\nFor immediate help, you might want to consult with a dermatologist or check reputable skincare resources."

    def generate_session_title(self, first_message: str) -> str:
        """Generate a title for the chat session based on the first message."""
        try:
            prompt = f"""Generate a short, descriptive title (2-4 words) for a skincare chat session based on this first message:

"{first_message}"

Examples:
- "Acne Treatment Help"
- "Dry Skin Routine"  
- "Product Recommendation"
- "Ingredient Questions"

Title:"""

            response = self.model.generate_content(prompt)
            title = response.text.strip().replace('"', '').replace("Title:", "").strip()
            
            # Fallback if title is too long or empty
            if len(title) > 50 or not title:
                words = first_message.split()[:3]
                title = " ".join(words) + "..."
            
            return title
            
        except Exception:
            # Simple fallback
            words = first_message.split()[:3]
            return " ".join(words) + "..."