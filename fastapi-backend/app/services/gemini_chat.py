import google.generativeai as genai
import json
from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.chat import ChatSession, ChatMessage
from app.models.skin_memory import UserAllergen, SkinIssue, SkinMemoryEntry
from app.models.user import User

class GeminiChatService:
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-2.5-flash')
        
    async def create_chat_session(self, db: Session, user_id: int, title: str = None) -> ChatSession:
        """Create a new chat session"""
        try:
            session = ChatSession(
                user_id=user_id,
                title=title or "New Chat",
                is_active=True
            )
            db.add(session)
            db.commit()
            db.refresh(session)
            return session
        except Exception as e:
            db.rollback()
            raise Exception(f"Failed to create chat session: {str(e)}")
    
    async def get_user_context(self, db: Session, user_id: int) -> str:
        """Get user's skin memory context for personalized responses"""
        try:
            # Get user allergens from skin_memory table
            allergens = db.query(UserAllergen).filter(
                UserAllergen.user_id == user_id,
                UserAllergen.is_active == True
            ).all()
            
            allergen_list = []
            for allergen in allergens:
                status = "confirmed" if allergen.confirmed else "unconfirmed"
                allergen_list.append(f"{allergen.ingredient_name} ({allergen.severity} severity, {status})")
            
            # Get user skin issues from skin_memory table
            issues = db.query(SkinIssue).filter(
                SkinIssue.user_id == user_id
            ).all()
            
            issue_list = []
            for issue in issues:
                issue_list.append(f"{issue.issue_type} (severity: {issue.severity}/10, status: {issue.status})")
            
            # Get user basic info
            user = db.query(User).filter(User.id == user_id).first()
            
            context = f"""
User's Skin Profile:
- Skin Type: {user.skin_type if user and user.skin_type else 'Not specified'}
- Skin Concerns: {user.skin_concerns if user and user.skin_concerns else 'Not specified'}
- Known Allergens: {', '.join(allergen_list) if allergen_list else 'None recorded'}
- Current Skin Issues: {', '.join(issue_list) if issue_list else 'None recorded'}

Please provide personalized skincare advice based on this information.
"""
            return context
        except Exception as e:
            print(f"Error getting user context: {e}")
            return "No specific skin profile available."
    
    def generate_chat_response(
        self, 
        user_message: str, 
        skin_type: str = None, 
        skin_concerns: str = None, 
        conversation_history: List = None
    ) -> str:
        """Generate AI chat response - this method is called by the router"""
        try:
            # Build context from conversation history
            history_context = ""
            if conversation_history:
                recent_messages = conversation_history[:6]  # Last 6 messages
                for msg in reversed(recent_messages):
                    role = "User" if msg.is_user else "Assistant"
                    history_context += f"{role}: {msg.message}\n"
            
            # Build user profile context
            profile_context = ""
            if skin_type:
                profile_context += f"Skin Type: {skin_type}\n"
            if skin_concerns:
                profile_context += f"Skin Concerns: {skin_concerns}\n"
            
            # Create comprehensive prompt
            system_prompt = f"""
You are a helpful skincare AI assistant. You provide personalized skincare advice based on the user's profile.

{profile_context}

Conversation History:
{history_context if history_context else 'This is the start of the conversation.'}

Guidelines:
1. Be helpful and informative about skincare
2. Consider the user's skin type and concerns
3. Provide specific product recommendations when appropriate
4. Always prioritize safety and suggest consulting dermatologists for serious issues
5. Keep responses concise but informative
6. If you detect new skin issues or concerns, acknowledge them appropriately

Current message from user: {user_message}

Please provide a helpful response:
"""
            
            # Generate AI response
            response = self.model.generate_content(system_prompt)
            return response.text
            
        except Exception as e:
            print(f"Error generating chat response: {e}")
            return "I apologize, but I'm having trouble processing your message right now. Please try again or consult with a skincare professional for personalized advice."
    
    async def send_message(
        self, 
        db: Session, 
        session_id: int, 
        user_id: int, 
        message: str
    ) -> Dict[str, Any]:
        """Send a message and get AI response"""
        try:
            # Get comprehensive user context from skin_memory tables
            user_context = await self.get_user_context(db, user_id)
            
            # Get conversation history
            session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
            if not session:
                raise Exception("Chat session not found")
            
            # Get recent messages for context
            recent_messages = db.query(ChatMessage).filter(
                ChatMessage.session_id == session_id
            ).order_by(ChatMessage.created_at.desc()).limit(10).all()
            
            # Build conversation context
            conversation_history = []
            for msg in reversed(recent_messages):
                conversation_history.append(f"{'User' if msg.is_user else 'Assistant'}: {msg.message}")
            
            # Create comprehensive system prompt with skin memory context
            system_prompt = f"""
You are a helpful skincare AI assistant. You provide personalized skincare advice based on the user's detailed skin profile.

{user_context}

Conversation History:
{chr(10).join(conversation_history[-6:]) if conversation_history else 'This is the start of the conversation.'}

Guidelines:
1. Be helpful and informative about skincare
2. Consider the user's allergens and skin issues from their profile
3. Provide specific product recommendations while avoiding known allergens
4. Always prioritize safety and suggest consulting dermatologists for serious issues
5. Keep responses concise but informative
6. If you detect new allergens or skin issues mentioned by the user, acknowledge them and suggest adding to their profile
7. Reference their existing skin concerns and provide targeted advice

Current message from user: {message}

Please provide a personalized response based on their skin profile:
"""
            
            # Generate AI response
            response = self.model.generate_content(system_prompt)
            ai_response = response.text
            
            # Save user message
            user_message = ChatMessage(
                session_id=session_id,
                message=message,
                is_user=True
            )
            db.add(user_message)
            
            # Save AI response
            ai_message = ChatMessage(
                session_id=session_id,
                message=ai_response,
                is_user=False
            )
            db.add(ai_message)
            
            # Update session
            session.updated_at = datetime.utcnow()
            
            db.commit()
            
            # Extract potential new allergens/issues for memory system
            await self._extract_and_update_memory(db, user_id, message, ai_response)
            
            return {
                "user_message": {
                    "id": user_message.id,
                    "message": message,
                    "timestamp": user_message.created_at.isoformat()
                },
                "ai_response": {
                    "id": ai_message.id,
                    "message": ai_response,
                    "timestamp": ai_message.created_at.isoformat()
                }
            }
            
        except Exception as e:
            db.rollback()
            raise Exception(f"Failed to process message: {str(e)}")
    
    async def _extract_and_update_memory(
        self, 
        db: Session, 
        user_id: int, 
        user_message: str, 
        ai_response: str
    ):
        """Extract skin issues or allergens from conversation and update memory"""
        try:
            # Use AI to extract structured information
            extraction_prompt = f"""
Analyze this skincare conversation and extract any NEW skin issues or allergic reactions mentioned by the user.
Only extract information that seems to be new concerns or reactions, not general questions.

User message: {user_message}
AI response: {ai_response}

Return a JSON response with this structure:
{{
    "new_allergens": [
        {{
            "ingredient": "ingredient name",
            "reaction": "description of reaction",
            "severity": "mild|moderate|severe"
        }}
    ],
    "new_issues": [
        {{
            "issue_type": "issue name",
            "description": "detailed description",
            "severity": 1-10,
            "triggers": ["trigger1", "trigger2"]
        }}
    ],
    "insights": [
        {{
            "type": "improvement|concern|observation",
            "content": "description of insight"
        }}
    ]
}}

Only include items if they are clearly new issues or reactions. Return empty arrays if nothing new is mentioned.
"""
            
            response = self.model.generate_content(extraction_prompt)
            try:
                response_text = response.text.strip()
                if response_text.startswith("```json"):
                    response_text = response_text[7:].strip()
                if response_text.endswith("```"):
                    response_text = response_text[:-3].strip()
                
                # Parse the JSON response
                extracted_data = json.loads(response_text)
                
                # Add new allergens to skin_memory
                for allergen in extracted_data.get("new_allergens", []):
                    new_allergen = UserAllergen(
                        user_id=user_id,
                        ingredient_name=allergen["ingredient"],
                        severity=allergen["severity"],
                        notes=f"Detected from chat: {allergen['reaction']}",
                        confirmed=False,
                        is_active=True
                    )
                    db.add(new_allergen)
                
                # Add new skin issues to skin_memory
                for issue in extracted_data.get("new_issues", []):
                    new_issue = SkinIssue(
                        user_id=user_id,
                        issue_type=issue["issue_type"],
                        description=issue["description"],
                        severity=issue["severity"],
                        triggers=issue.get("triggers", []),
                        status="active"
                    )
                    db.add(new_issue)
                
                # Add insights to memory entries
                for insight in extracted_data.get("insights", []):
                    memory_entry = SkinMemoryEntry(
                        user_id=user_id,
                        entry_type="chat_insight",
                        content=insight["content"],
                        entry_metadata={
                            "insight_type": insight["type"],
                            "source_message": user_message[:100],
                            "extracted_from": "chat_conversation"
                        },
                        source=f"chat_analysis",
                        importance=2,
                        is_active=True
                    )
                    db.add(memory_entry)
                
                # Commit the new memory entries
                db.commit()
                    
            except json.JSONDecodeError:
                # If AI doesn't return valid JSON, skip memory extraction
                print("Failed to parse extraction response as JSON")
                pass
                
        except Exception as e:
            print(f"Error extracting memory from conversation: {e}")
            db.rollback()
    
    async def get_chat_sessions(self, db: Session, user_id: int) -> List[Dict]:
        """Get all chat sessions for a user"""
        sessions = db.query(ChatSession).filter(
            ChatSession.user_id == user_id
        ).order_by(ChatSession.updated_at.desc()).all()
        
        return [
            {
                "id": session.id,
                "title": session.title,
                "created_at": session.created_at.isoformat(),
                "updated_at": session.updated_at.isoformat(),
                "is_active": session.is_active
            }
            for session in sessions
        ]
    
    async def get_chat_messages(self, db: Session, session_id: int, user_id: int) -> List[Dict]:
        """Get all messages in a chat session"""
        # Verify session belongs to user
        session = db.query(ChatSession).filter(
            ChatSession.id == session_id,
            ChatSession.user_id == user_id
        ).first()
        
        if not session:
            raise Exception("Chat session not found")
        
        messages = db.query(ChatMessage).filter(
            ChatMessage.session_id == session_id
        ).order_by(ChatMessage.created_at.asc()).all()
        
        return [
            {
                "id": message.id,
                "message": message.message,
                "is_user": message.is_user,
                "timestamp": message.created_at.isoformat()
            }
            for message in messages
        ]
    
    async def delete_chat_session(self, db: Session, session_id: int, user_id: int):
        """Delete a chat session and all its messages"""
        try:
            # Verify session belongs to user
            session = db.query(ChatSession).filter(
                ChatSession.id == session_id,
                ChatSession.user_id == user_id
            ).first()
            
            if not session:
                raise Exception("Chat session not found")
            
            # Delete all messages in the session
            db.query(ChatMessage).filter(ChatMessage.session_id == session_id).delete()
            
            # Delete the session
            db.delete(session)
            db.commit()
            
        except Exception as e:
            db.rollback()
            raise Exception(f"Failed to delete chat session: {str(e)}")
