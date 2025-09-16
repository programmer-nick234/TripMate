import requests
import json

def test_complex_chat():
    base_url = "http://localhost:8000/api"
    
    print("Testing Complex Chat Scenarios...")
    
    # Start chat session
    print("\n1. Starting chat session...")
    response = requests.post(
        f"{base_url}/chat/start/",
        json={"itinerary_id": None},
        headers={"Content-Type": "application/json"}
    )
    
    if response.status_code != 201:
        print(f"❌ Failed to start chat: {response.status_code}")
        return
    
    session_id = response.json().get('session_id')
    print(f"✅ Chat session started: {session_id}")
    
    # Test various message types
    test_messages = [
        "Hello, I want to plan a trip to Tokyo",
        "Can you add a visit to the Tokyo Skytree?",
        "What's the total cost of this trip?",
        "Make it more budget-friendly",
        "Add a romantic dinner for two"
    ]
    
    for i, message in enumerate(test_messages, 1):
        print(f"\n{i}. Testing: '{message}'")
        
        response = requests.post(
            f"{base_url}/chat/send/",
            json={
                "session_id": session_id,
                "message": message
            },
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Response: {data['response'][:100]}...")
            print(f"✅ Edit applied: {data['edit_applied']}")
            
            if data.get('updated_itinerary'):
                print(f"✅ Itinerary updated with {len(data['updated_itinerary'].get('days', []))} days")
        else:
            print(f"❌ Failed: {response.status_code} - {response.text}")

if __name__ == "__main__":
    test_complex_chat()
