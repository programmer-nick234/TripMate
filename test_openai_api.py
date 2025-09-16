import os
import sys
import django

# Add the backend directory to the Python path
sys.path.append('backend')

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trip_mate.settings')
django.setup()

# Now we can import Django models and settings
from django.conf import settings
from chat.services import TripMateService

def test_openai_api():
    print("Testing OpenAI API Configuration...")
    
    # Check if API key is set
    api_key = getattr(settings, 'OPENAI_API_KEY', None)
    if not api_key:
        api_key = os.getenv('OPENAI_API_KEY')
    
    if not api_key:
        print("❌ OPENAI_API_KEY not found in settings or environment")
        return False
    
    print(f"✅ API Key found: {api_key[:10]}...")
    
    # Test TripMateService
    try:
        print("\nTesting TripMateService...")
        trip_mate = TripMateService()
        
        if trip_mate.openai_client is None:
            print("❌ OpenAI client not initialized")
            return False
        
        print("✅ OpenAI client initialized successfully")
        
        # Test a simple message
        print("\nTesting message processing...")
        test_itinerary = {
            "trip_summary": "3-day trip to Paris",
            "days": [
                {"day": 1, "schedule": [{"time": "9:00 AM", "activity": "Visit Eiffel Tower", "location": "Paris"}]}
            ]
        }
        
        result = trip_mate.process_message("Hello, can you help me?", test_itinerary)
        print(f"✅ Response: {result['response'][:100]}...")
        print(f"✅ Edit applied: {result['edit_applied']}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing TripMateService: {e}")
        return False

if __name__ == "__main__":
    success = test_openai_api()
    if success:
        print("\n🎉 OpenAI API is working correctly!")
    else:
        print("\n💥 OpenAI API has issues that need to be fixed.")
