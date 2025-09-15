#!/usr/bin/env python
"""
Test script for TripMate chat service
"""
import os
import sys
import django

# Add the backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trip_mate.settings')
django.setup()

# Mock the settings to avoid OpenAI issues
from django.conf import settings
settings.OPENAI_API_KEY = ''

from backend.chat.services import TripMateService

def test_chat_service():
    """Test the TripMate chat service"""
    print("🤖 Testing TripMate Chat Service...")
    
    # Create a sample itinerary
    sample_itinerary = {
        "trip_summary": "3-day trip to Paris with a budget of $500",
        "days": [
            {
                "day": 1,
                "date": "2024-01-15",
                "schedule": [
                    {
                        "time": "09:00",
                        "activity": "Visit Eiffel Tower",
                        "type": "sightseeing",
                        "duration": "2h",
                        "cost_estimate": 25,
                        "location": {"lat": 48.8584, "lng": 2.2945},
                        "notes": "Book tickets in advance"
                    }
                ]
            }
        ],
        "total_estimated_cost": 500,
        "map_points": [],
        "adjustment_reasons": [],
        "booking_links": [],
        "warnings": []
    }
    
    # Initialize TripMate service
    try:
        trip_mate = TripMateService()
        print("✅ TripMate service initialized successfully")
        
        # Test different types of messages
        test_messages = [
            "Add more food stops to day 1",
            "What's the total cost of this trip?",
            "Hello, how are you?",
            "Remove the Eiffel Tower visit",
            "Make this trip more budget-friendly"
        ]
        
        for message in test_messages:
            print(f"\n📝 Testing message: '{message}'")
            try:
                result = trip_mate.process_message(message, sample_itinerary)
                print(f"✅ Response: {result['response']}")
                print(f"📊 Edit applied: {result['edit_applied']}")
            except Exception as e:
                print(f"❌ Error: {str(e)}")
                
    except Exception as e:
        print(f"❌ Failed to initialize TripMate service: {str(e)}")
        print("💡 Make sure you have set OPENAI_API_KEY in your environment")

if __name__ == "__main__":
    test_chat_service()
