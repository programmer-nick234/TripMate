from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import ChatSession, ChatMessage
from .services import TripMateService
from itinerary.models import Itinerary
import uuid
import json


@api_view(['POST'])
def start_chat_session(request):
    """Start a new chat session with TripMate"""
    itinerary_id = request.data.get('itinerary_id')
    session_id = str(uuid.uuid4())
    
    # Create chat session
    session = ChatSession.objects.create(
        session_id=session_id,
        itinerary_id=itinerary_id,
        user=request.user if request.user.is_authenticated else None
    )
    
    # Add welcome message
    welcome_message = ChatMessage.objects.create(
        session=session,
        message_type='assistant',
        content="Hi! I'm TripMate, your personal travel assistant. I can help you edit your itinerary, answer questions, or suggest improvements. What would you like to do?",
        metadata={'type': 'welcome'}
    )
    
    return Response({
        'session_id': session_id,
        'welcome_message': welcome_message.content
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def send_message(request):
    """Send a message to TripMate and get response"""
    session_id = request.data.get('session_id')
    message = request.data.get('message', '').strip()
    
    if not session_id or not message:
        return Response({'error': 'Session ID and message are required'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    # Get chat session
    session = get_object_or_404(ChatSession, session_id=session_id, is_active=True)
    
    # Save user message
    user_message = ChatMessage.objects.create(
        session=session,
        message_type='user',
        content=message
    )
    
    # Get itinerary data
    itinerary_data = session.itinerary.itinerary_data if session.itinerary else {}
    
    # Process message with TripMate
    trip_mate = TripMateService()
    result = trip_mate.process_message(message, itinerary_data)
    
    # Save assistant response
    assistant_message = ChatMessage.objects.create(
        session=session,
        message_type='assistant',
        content=result['response'],
        metadata={
            'edit_applied': result['edit_applied'],
            'updated_itinerary': result['updated_itinerary'] if result['edit_applied'] else None
        }
    )
    
    response_data = {
        'response': result['response'],
        'edit_applied': result['edit_applied']
    }
    
    # If itinerary was updated, include the new data
    if result['edit_applied']:
        response_data['updated_itinerary'] = result['updated_itinerary']
        # Update the itinerary in the database
        if session.itinerary:
            session.itinerary.itinerary_data = result['updated_itinerary']
            session.itinerary.save()
    
    return Response(response_data)


@api_view(['GET'])
def get_chat_history(request, session_id):
    """Get chat history for a session"""
    session = get_object_or_404(ChatSession, session_id=session_id, is_active=True)
    messages = session.messages.all()
    
    chat_history = []
    for message in messages:
        chat_history.append({
            'id': message.id,
            'type': message.message_type,
            'content': message.content,
            'timestamp': message.created_at.isoformat(),
            'metadata': message.metadata
        })
    
    return Response({'messages': chat_history})


@api_view(['POST'])
def end_chat_session(request):
    """End a chat session"""
    session_id = request.data.get('session_id')
    session = get_object_or_404(ChatSession, session_id=session_id)
    session.is_active = False
    session.save()
    
    return Response({'message': 'Chat session ended successfully'})


@api_view(['GET'])
def list_chat_sessions(request):
    """List all chat sessions for a user"""
    sessions = ChatSession.objects.filter(
        user=request.user if request.user.is_authenticated else None,
        is_active=True
    ).order_by('-created_at')
    
    session_list = []
    for session in sessions:
        session_list.append({
            'session_id': session.session_id,
            'itinerary_title': session.itinerary.title if session.itinerary else 'No itinerary',
            'created_at': session.created_at.isoformat(),
            'message_count': session.messages.count()
        })
    
    return Response({'sessions': session_list})
