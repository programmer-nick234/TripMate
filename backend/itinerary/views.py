from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Itinerary, ItineraryEdit
from .serializers import (
    ItinerarySerializer, 
    ItineraryGenerationRequestSerializer,
    ItineraryEditRequestSerializer
)
from .services import PlanEngine
import json


@api_view(['POST'])
def generate_itinerary(request):
    """Generate a new itinerary based on user input"""
    serializer = ItineraryGenerationRequestSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # Generate itinerary using PlanEngine
    plan_engine = PlanEngine()
    itinerary_json = plan_engine.generate_itinerary(serializer.validated_data)
    
    # Create itinerary record
    itinerary_data = serializer.validated_data
    itinerary = Itinerary.objects.create(
        title=f"{itinerary_data['destination']} Trip",
        destination=itinerary_data['destination'],
        start_date=itinerary_data['start_date'],
        end_date=itinerary_data['end_date'],
        budget=itinerary_data['budget'],
        interests=itinerary_data.get('interests', []),
        constraints=itinerary_data.get('constraints', {}),
        itinerary_data=itinerary_json
    )
    
    return Response({
        'itinerary': ItinerarySerializer(itinerary).data,
        'generated_data': itinerary_json
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def get_itinerary(request, itinerary_id):
    """Get a specific itinerary"""
    itinerary = get_object_or_404(Itinerary, id=itinerary_id, is_active=True)
    return Response({
        'itinerary': ItinerarySerializer(itinerary).data,
        'generated_data': itinerary.itinerary_data
    })


@api_view(['PUT'])
def edit_itinerary(request, itinerary_id):
    """Edit an existing itinerary"""
    itinerary = get_object_or_404(Itinerary, id=itinerary_id, is_active=True)
    
    edit_serializer = ItineraryEditRequestSerializer(data=request.data)
    if not edit_serializer.is_valid():
        return Response(edit_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # Apply edits using PlanEngine
    plan_engine = PlanEngine()
    original_data = itinerary.itinerary_data.copy()
    updated_data = plan_engine.edit_itinerary(original_data, edit_serializer.validated_data)
    
    # Save the edit
    ItineraryEdit.objects.create(
        itinerary=itinerary,
        edit_type=edit_serializer.validated_data['edit_type'],
        original_data=original_data,
        modified_data=updated_data,
        edit_reason=edit_serializer.validated_data.get('edit_reason', '')
    )
    
    # Update itinerary
    itinerary.itinerary_data = updated_data
    itinerary.save()
    
    return Response({
        'itinerary': ItinerarySerializer(itinerary).data,
        'generated_data': updated_data
    })


@api_view(['GET'])
def list_itineraries(request):
    """List all itineraries for a user"""
    itineraries = Itinerary.objects.filter(is_active=True).order_by('-created_at')
    serializer = ItinerarySerializer(itineraries, many=True)
    return Response(serializer.data)


@api_view(['DELETE'])
def delete_itinerary(request, itinerary_id):
    """Soft delete an itinerary"""
    itinerary = get_object_or_404(Itinerary, id=itinerary_id)
    itinerary.is_active = False
    itinerary.save()
    return Response({'message': 'Itinerary deleted successfully'}, status=status.HTTP_200_OK)
