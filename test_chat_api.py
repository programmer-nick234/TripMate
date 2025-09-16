import requests
import json

# Test chat API
def test_chat_api():
    base_url = "http://localhost:8000/api"
    
    print("Testing Chat API...")
    
    # Test 1: Start chat session
    print("\n1. Testing start chat session...")
    try:
        response = requests.post(
            f"{base_url}/chat/start/",
            json={"itinerary_id": None},
            headers={"Content-Type": "application/json"}
        )
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 201:
            session_id = response.json().get('session_id')
            print(f"✅ Chat session started: {session_id}")
            
            # Test 2: Send message
            print("\n2. Testing send message...")
            message_response = requests.post(
                f"{base_url}/chat/send/",
                json={
                    "session_id": session_id,
                    "message": "Hello, can you help me plan a trip to Paris?"
                },
                headers={"Content-Type": "application/json"}
            )
            print(f"Status: {message_response.status_code}")
            print(f"Response: {message_response.json()}")
            
            if message_response.status_code == 200:
                print("✅ Message sent successfully")
            else:
                print("❌ Failed to send message")
        else:
            print("❌ Failed to start chat session")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_chat_api()
