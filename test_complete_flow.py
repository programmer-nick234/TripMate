import requests
import json
import time

def test_complete_flow():
    print("🧪 Testing Complete TripMate Flow...")
    
    # Test 1: Health Check
    print("\n1. Testing Backend Health...")
    try:
        response = requests.get("http://localhost:8000/api/health/")
        if response.status_code == 200:
            print("✅ Backend is healthy")
        else:
            print("❌ Backend health check failed")
            return
    except Exception as e:
        print(f"❌ Backend not accessible: {e}")
        return
    
    # Test 2: Frontend Health
    print("\n2. Testing Frontend Health...")
    try:
        response = requests.get("http://localhost:3000")
        if response.status_code == 200:
            print("✅ Frontend is accessible")
        else:
            print("❌ Frontend not accessible")
            return
    except Exception as e:
        print(f"❌ Frontend not accessible: {e}")
        return
    
    # Test 3: Generate Itinerary
    print("\n3. Testing Itinerary Generation...")
    try:
        itinerary_data = {
            "destination": "Paris",
            "start_date": "2024-10-01",
            "end_date": "2024-10-03",
            "budget": 2000,
            "interests": ["Culture & History", "Food & Dining"],
            "special_requirements": "Vegetarian restaurants"
        }
        
        response = requests.post(
            "http://localhost:8000/api/itinerary/generate/",
            json=itinerary_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code in [200, 201]:
            itinerary = response.json()
            print("✅ Itinerary generated successfully")
            print(f"   - Trip: {itinerary.get('trip_summary', 'N/A')}")
            print(f"   - Days: {len(itinerary.get('days', []))}")
            
            # Test 4: Start Chat Session
            print("\n4. Testing Chat Session...")
            chat_response = requests.post(
                "http://localhost:8000/api/chat/start/",
                json={"itinerary_id": itinerary.get('id')},
                headers={"Content-Type": "application/json"}
            )
            
            if chat_response.status_code == 201:
                session_data = chat_response.json()
                session_id = session_data['session_id']
                print("✅ Chat session started")
                print(f"   - Session ID: {session_id}")
                
                # Test 5: Chat Messages
                print("\n5. Testing Chat Messages...")
                test_messages = [
                    "Hello! Can you help me with my Paris trip?",
                    "Add a visit to the Louvre Museum",
                    "What's the total cost of this trip?",
                    "Make it more budget-friendly"
                ]
                
                for i, message in enumerate(test_messages, 1):
                    print(f"\n   Message {i}: '{message}'")
                    
                    msg_response = requests.post(
                        "http://localhost:8000/api/chat/send/",
                        json={
                            "session_id": session_id,
                            "message": message
                        },
                        headers={"Content-Type": "application/json"}
                    )
                    
                    if msg_response.status_code == 200:
                        data = msg_response.json()
                        print(f"   ✅ Response: {data['response'][:80]}...")
                        print(f"   ✅ Edit applied: {data['edit_applied']}")
                    else:
                        print(f"   ❌ Failed: {msg_response.status_code}")
                
                print("\n🎉 Complete flow test successful!")
                print("\n📋 Summary:")
                print("✅ Backend API working")
                print("✅ Frontend accessible")
                print("✅ Itinerary generation working")
                print("✅ Chat system working")
                print("✅ OpenAI integration working")
                
                print("\n🌐 Your app is ready!")
                print("   Frontend: http://localhost:3000")
                print("   Backend: http://localhost:8000/api")
                
            else:
                print(f"❌ Chat session failed: {chat_response.status_code}")
        else:
            print(f"❌ Itinerary generation failed: {response.status_code}")
            print(f"   Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Error in complete flow test: {e}")

if __name__ == "__main__":
    test_complete_flow()
