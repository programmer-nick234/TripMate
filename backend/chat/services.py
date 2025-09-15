"""
TripMate conversational AI service
"""
import openai
import json
from django.conf import settings
from itinerary.services import PlanEngine


class TripMateService:
    """Conversational AI service for itinerary editing"""
    
    def __init__(self):
        # Initialize OpenAI client with proper error handling
        self.openai_client = None
        self.plan_engine = PlanEngine()
        
        # Try to initialize OpenAI client
        try:
            # Check if API key is available
            api_key = getattr(settings, 'OPENAI_API_KEY', None)
            if not api_key:
                # Try to load from environment
                import os
                api_key = os.getenv('OPENAI_API_KEY')
            
            if api_key and api_key.strip():
                # Initialize with older OpenAI version
                self.openai_client = openai
                openai.api_key = api_key
                print("✅ OpenAI client initialized successfully")
            else:
                print("⚠️  OPENAI_API_KEY not found, using fallback responses only")
                self.openai_client = None
        except Exception as e:
            print(f"⚠️  Failed to initialize OpenAI client: {e}")
            print("   Using keyword-based fallback responses")
            self.openai_client = None
    
    def process_message(self, message, itinerary_data, session_history=None):
        """Process user message and return TripMate response"""
        
        # Analyze the user's intent
        intent = self._analyze_intent(message, itinerary_data)
        
        if intent['type'] == 'edit_request':
            return self._handle_edit_request(message, itinerary_data, intent)
        elif intent['type'] == 'question':
            return self._handle_question(message, itinerary_data)
        elif intent['type'] == 'general_chat':
            return self._handle_general_chat(message, itinerary_data)
        else:
            return self._handle_unknown_request(message, itinerary_data)
    
    def _analyze_intent(self, message, itinerary_data):
        """Analyze user message to determine intent"""
        
        # Simple keyword-based intent recognition as fallback
        message_lower = message.lower()
        
        # Check for edit requests
        edit_keywords = ['add', 'remove', 'change', 'modify', 'update', 'replace', 'move', 'reschedule']
        if any(keyword in message_lower for keyword in edit_keywords):
            return {
                "type": "edit_request",
                "confidence": 0.8,
                "details": {
                    "edit_type": "add" if "add" in message_lower else "modify",
                    "target_day": 1,
                    "target_activity": "",
                    "new_content": message,
                    "question_type": "general"
                }
            }
        
        # Check for questions
        question_keywords = ['what', 'how', 'when', 'where', 'why', 'cost', 'price', 'time', 'duration']
        if any(keyword in message_lower for keyword in question_keywords):
            return {
                "type": "question",
                "confidence": 0.7,
                "details": {
                    "edit_type": "",
                    "target_day": 0,
                    "target_activity": "",
                    "new_content": "",
                    "question_type": "general"
                }
            }
        
        # Check for general chat
        greeting_keywords = ['hello', 'hi', 'hey', 'thanks', 'thank you', 'good', 'great']
        if any(keyword in message_lower for keyword in greeting_keywords):
            return {
                "type": "general_chat",
                "confidence": 0.6,
                "details": {
                    "edit_type": "",
                    "target_day": 0,
                    "target_activity": "",
                    "new_content": "",
                    "question_type": "general"
                }
            }
        
        # Try OpenAI if available
        if self.openai_client:
            prompt = f"""
            Analyze this user message about their travel itinerary and determine the intent:
            
            User message: "{message}"
            
            Current itinerary summary: {itinerary_data.get('trip_summary', 'No summary available')}
            
            Respond with JSON only:
            {{
                "type": "edit_request|question|general_chat|unknown",
                "confidence": 0.0-1.0,
                "details": {{
                    "edit_type": "add|remove|modify|move|reschedule",
                    "target_day": 1-7,
                    "target_activity": "activity name or index",
                    "new_content": "what they want to change to",
                    "question_type": "cost|timing|location|general"
                }}
            }}
            """
            
            try:
                response = self.openai_client.ChatCompletion.create(
                    model="gpt-4",
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.3,
                    max_tokens=200
                )
                
                content = response.choices[0].message.content.strip()
                if "```json" in content:
                    content = content.split("```json")[1].split("```")[0]
                
                return json.loads(content)
            except Exception as e:
                print(f"OpenAI API error: {e}")
        
        # Default fallback
        return {
            "type": "general_chat",
            "confidence": 0.5,
            "details": {
                "edit_type": "",
                "target_day": 0,
                "target_activity": "",
                "new_content": "",
                "question_type": "general"
            }
        }
    
    def _handle_edit_request(self, message, itinerary_data, intent):
        """Handle requests to edit the itinerary"""
        details = intent.get('details', {})
        edit_type = details.get('edit_type', 'modify')
        
        # Generate the edit
        edit_request = {
            'edit_type': edit_type,
            'day': details.get('target_day', 1),
            'activity_index': details.get('target_activity', 0),
            'new_activity': self._generate_activity_from_request(message, details),
            'edit_reason': message
        }
        
        # Apply the edit
        updated_itinerary = self.plan_engine.edit_itinerary(itinerary_data, edit_request)
        
        # Generate friendly response
        response = self._generate_edit_response(message, edit_type, details, updated_itinerary)
        
        return {
            'response': response,
            'updated_itinerary': updated_itinerary,
            'edit_applied': True
        }
    
    def _handle_question(self, message, itinerary_data):
        """Handle questions about the itinerary"""
        
        message_lower = message.lower()
        
        # Handle cost-related questions
        if any(word in message_lower for word in ['cost', 'price', 'budget', 'expensive', 'cheap']):
            total_cost = itinerary_data.get('total_estimated_cost', 0)
            return {
                'response': f"The total estimated cost for your trip is ${total_cost}. This includes all planned activities and expenses.",
                'updated_itinerary': itinerary_data,
                'edit_applied': False
            }
        
        # Handle time-related questions
        if any(word in message_lower for word in ['time', 'duration', 'how long', 'when']):
            days = len(itinerary_data.get('days', []))
            return {
                'response': f"Your trip is planned for {days} days. Each day has a detailed schedule with specific times for activities.",
                'updated_itinerary': itinerary_data,
                'edit_applied': False
            }
        
        # Handle location questions
        if any(word in message_lower for word in ['where', 'location', 'place', 'address']):
            trip_summary = itinerary_data.get('trip_summary', 'No summary available')
            return {
                'response': f"Based on your itinerary: {trip_summary}. All locations are marked on the map for easy navigation.",
                'updated_itinerary': itinerary_data,
                'edit_applied': False
            }
        
        # Try OpenAI for complex questions
        if self.openai_client:
            prompt = f"""
            You are TripMate, a friendly travel assistant. Answer this question about the itinerary:
            
            Question: "{message}"
            
            Itinerary data: {json.dumps(itinerary_data, indent=2)}
            
            Rules:
            - Be helpful and conversational
            - Keep responses under 3 sentences
            - Use simple language
            - Be specific about costs, times, and locations when available
            - If you don't know something, say so politely
            """
            
            try:
                response = self.openai_client.ChatCompletion.create(
                    model="gpt-4",
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.7,
                    max_tokens=150
                )
                
                content = response.choices[0].message.content.strip()
                return {
                    'response': content,
                    'updated_itinerary': itinerary_data,
                    'edit_applied': False
                }
            except Exception as e:
                print(f"OpenAI API error: {e}")
        
        # Default response
        return {
            'response': "I'd be happy to help with your itinerary! Could you be more specific about what you'd like to know?",
            'updated_itinerary': itinerary_data,
            'edit_applied': False
        }
    
    def _handle_general_chat(self, message, itinerary_data):
        """Handle general conversation"""
        
        responses = [
            "I'm here to help make your trip amazing! What would you like to adjust?",
            "Great! I can help you customize your itinerary. What changes would you like to make?",
            "I'm excited to help you plan! What part of your trip would you like to work on?",
            "Let's make your trip perfect! What would you like to change or add?"
        ]
        
        import random
        return {
            'response': random.choice(responses),
            'updated_itinerary': itinerary_data,
            'edit_applied': False
        }
    
    def _handle_unknown_request(self, message, itinerary_data):
        """Handle unclear or unknown requests"""
        
        return {
            'response': "I'm not sure what you'd like to do. You can ask me to add activities, change times, adjust your budget, or ask questions about your itinerary!",
            'updated_itinerary': itinerary_data,
            'edit_applied': False
        }
    
    def _generate_activity_from_request(self, message, details):
        """Generate a new activity based on user request"""
        
        prompt = f"""
        Based on this user request: "{message}"
        
        Generate a new activity in this JSON format:
        {{
            "time": "HH:MM",
            "activity": "Activity name",
            "type": "cultural|dining|sightseeing|entertainment|shopping|outdoor",
            "duration": "Xh",
            "cost_estimate": 0,
            "location": {{"lat": 0.0, "lng": 0.0}},
            "notes": "Helpful notes"
        }}
        
        Make it realistic and detailed.
        """
        
        try:
            response = self.openai_client.ChatCompletion.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=200
            )
            
            content = response.choices[0].message.content.strip()
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            
            return json.loads(content)
        except:
            return {
                "time": "14:00",
                "activity": "Custom Activity",
                "type": "sightseeing",
                "duration": "2h",
                "cost_estimate": 20,
                "location": {"lat": 0.0, "lng": 0.0},
                "notes": "Added based on your request"
            }
    
    def _generate_edit_response(self, message, edit_type, details, updated_itinerary):
        """Generate a friendly response about the edit made"""
        
        responses = {
            'add': f"Perfect! I've added that to your itinerary. Your day now includes more exciting activities!",
            'remove': f"Done! I've removed that from your schedule. Your day is now more relaxed.",
            'modify': f"Great suggestion! I've updated that activity to better match what you wanted.",
            'move': f"Excellent! I've moved that to a better time slot for you.",
            'reschedule': f"Perfect timing! I've rescheduled that activity for you."
        }
        
        return responses.get(edit_type, "I've made that change to your itinerary! Is there anything else you'd like to adjust?")
