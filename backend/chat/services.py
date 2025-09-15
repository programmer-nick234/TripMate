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
        self.openai_client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        self.plan_engine = PlanEngine()
    
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
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=200
            )
            
            content = response.choices[0].message.content.strip()
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            
            return json.loads(content)
        except:
            return {"type": "unknown", "confidence": 0.0, "details": {}}
    
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
            response = self.openai_client.chat.completions.create(
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
        except:
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
            response = self.openai_client.chat.completions.create(
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
