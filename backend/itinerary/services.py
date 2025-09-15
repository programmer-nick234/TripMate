"""
PlanEngine service for generating structured itineraries
"""
import json
import openai
from django.conf import settings
from datetime import datetime, timedelta
import requests


class PlanEngine:
    """AI service for generating and maintaining structured itineraries"""
    
    def __init__(self):
        self.openai_client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
    
    def generate_itinerary(self, request_data):
        """Generate a complete itinerary based on user input"""
        destination = request_data['destination']
        start_date = request_data['start_date']
        end_date = request_data['end_date']
        budget = float(request_data['budget'])
        interests = request_data.get('interests', [])
        constraints = request_data.get('constraints', {})
        
        # Calculate trip duration
        start = datetime.strptime(str(start_date), '%Y-%m-%d')
        end = datetime.strptime(str(end_date), '%Y-%m-%d')
        duration = (end - start).days + 1
        
        # Generate itinerary using OpenAI
        itinerary_json = self._generate_with_ai(
            destination, start_date, end_date, budget, 
            interests, constraints, duration
        )
        
        return itinerary_json
    
    def _generate_with_ai(self, destination, start_date, end_date, budget, interests, constraints, duration):
        """Use OpenAI to generate structured itinerary"""
        
        interests_str = ", ".join(interests) if interests else "general sightseeing"
        constraints_str = self._format_constraints(constraints)
        
        prompt = f"""
        Generate a {duration}-day travel itinerary for {destination} starting {start_date} ending {end_date}.
        
        Budget: ${budget}
        Interests: {interests_str}
        Constraints: {constraints_str}
        
        Return ONLY valid JSON in this exact schema:
        {{
          "trip_summary": "2-line overview",
          "days": [
            {{
              "day": 1,
              "date": "YYYY-MM-DD",
              "schedule": [
                {{
                  "time": "09:00",
                  "activity": "Visit Louvre Museum",
                  "type": "cultural",
                  "duration": "3h",
                  "cost_estimate": 20,
                  "location": {{"lat": 48.8606, "lng": 2.3376}},
                  "notes": "Book skip-the-line tickets online."
                }}
              ]
            }}
          ],
          "total_estimated_cost": 0,
          "map_points": [
            {{"name": "Louvre Museum", "lat": 48.8606, "lng": 2.3376}}
          ],
          "adjustment_reasons": [],
          "booking_links": [],
          "warnings": []
        }}
        
        Rules:
        - Max 4-5 activities per day
        - Include realistic costs
        - Add GPS coordinates for major attractions
        - Include practical notes
        - Ensure total cost fits budget
        """
        
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=2000
            )
            
            content = response.choices[0].message.content.strip()
            
            # Extract JSON from response
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]
            
            return json.loads(content)
            
        except Exception as e:
            # Fallback to template itinerary
            return self._generate_fallback_itinerary(destination, start_date, end_date, budget, duration)
    
    def _format_constraints(self, constraints):
        """Format constraints for AI prompt"""
        if not constraints:
            return "None"
        
        formatted = []
        for key, value in constraints.items():
            formatted.append(f"{key}: {value}")
        return "; ".join(formatted)
    
    def _generate_fallback_itinerary(self, destination, start_date, end_date, budget, duration):
        """Generate a basic template itinerary as fallback"""
        start = datetime.strptime(str(start_date), '%Y-%m-%d')
        
        days = []
        map_points = []
        total_cost = 0
        
        for i in range(duration):
            current_date = start + timedelta(days=i)
            day_schedule = [
                {
                    "time": "09:00",
                    "activity": f"Explore {destination} - Day {i+1}",
                    "type": "sightseeing",
                    "duration": "2h",
                    "cost_estimate": 15,
                    "location": {"lat": 0.0, "lng": 0.0},
                    "notes": "Plan your day based on local recommendations"
                },
                {
                    "time": "12:00",
                    "activity": f"Lunch in {destination}",
                    "type": "dining",
                    "duration": "1h",
                    "cost_estimate": 25,
                    "location": {"lat": 0.0, "lng": 0.0},
                    "notes": "Try local cuisine"
                },
                {
                    "time": "14:00",
                    "activity": f"Afternoon activities in {destination}",
                    "type": "cultural",
                    "duration": "3h",
                    "cost_estimate": 20,
                    "location": {"lat": 0.0, "lng": 0.0},
                    "notes": "Visit museums or landmarks"
                }
            ]
            
            days.append({
                "day": i + 1,
                "date": current_date.strftime('%Y-%m-%d'),
                "schedule": day_schedule
            })
            
            total_cost += 60  # Daily estimate
        
        return {
            "trip_summary": f"{duration}-day trip to {destination} with a budget of ${budget}",
            "days": days,
            "total_estimated_cost": min(total_cost, budget),
            "map_points": map_points,
            "adjustment_reasons": [],
            "booking_links": [],
            "warnings": ["This is a template itinerary. Please customize based on your preferences."]
        }
    
    def edit_itinerary(self, itinerary_data, edit_request):
        """Apply edits to an existing itinerary"""
        edit_type = edit_request['edit_type']
        
        if edit_type == 'add_activity':
            return self._add_activity(itinerary_data, edit_request)
        elif edit_type == 'remove_activity':
            return self._remove_activity(itinerary_data, edit_request)
        elif edit_type == 'modify_activity':
            return self._modify_activity(itinerary_data, edit_request)
        elif edit_type == 'move_activity':
            return self._move_activity(itinerary_data, edit_request)
        else:
            return itinerary_data
    
    def _add_activity(self, itinerary_data, edit_request):
        """Add a new activity to the itinerary"""
        day = edit_request.get('day', 1)
        new_activity = edit_request.get('new_activity', {})
        
        if day <= len(itinerary_data['days']):
            itinerary_data['days'][day-1]['schedule'].append(new_activity)
            itinerary_data['adjustment_reasons'].append(f"Added activity to day {day}")
        
        return itinerary_data
    
    def _remove_activity(self, itinerary_data, edit_request):
        """Remove an activity from the itinerary"""
        day = edit_request.get('day', 1)
        activity_index = edit_request.get('activity_index', 0)
        
        if day <= len(itinerary_data['days']) and activity_index < len(itinerary_data['days'][day-1]['schedule']):
            itinerary_data['days'][day-1]['schedule'].pop(activity_index)
            itinerary_data['adjustment_reasons'].append(f"Removed activity from day {day}")
        
        return itinerary_data
    
    def _modify_activity(self, itinerary_data, edit_request):
        """Modify an existing activity"""
        day = edit_request.get('day', 1)
        activity_index = edit_request.get('activity_index', 0)
        new_activity = edit_request.get('new_activity', {})
        
        if day <= len(itinerary_data['days']) and activity_index < len(itinerary_data['days'][day-1]['schedule']):
            itinerary_data['days'][day-1]['schedule'][activity_index].update(new_activity)
            itinerary_data['adjustment_reasons'].append(f"Modified activity on day {day}")
        
        return itinerary_data
    
    def _move_activity(self, itinerary_data, edit_request):
        """Move an activity to a different day or time"""
        # Implementation for moving activities
        return itinerary_data
