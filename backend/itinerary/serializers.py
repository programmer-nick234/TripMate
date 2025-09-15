from rest_framework import serializers
from .models import Itinerary, ItineraryEdit


class ItinerarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Itinerary
        fields = [
            'id', 'title', 'destination', 'start_date', 'end_date', 
            'budget', 'interests', 'constraints', 'itinerary_data',
            'created_at', 'updated_at', 'is_active'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ItineraryEditSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItineraryEdit
        fields = [
            'id', 'edit_type', 'original_data', 'modified_data', 
            'edit_reason', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class ItineraryGenerationRequestSerializer(serializers.Serializer):
    destination = serializers.CharField(max_length=100)
    start_date = serializers.DateField()
    end_date = serializers.DateField()
    budget = serializers.DecimalField(max_digits=10, decimal_places=2)
    interests = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    constraints = serializers.DictField(required=False, default=dict)
    user_preferences = serializers.DictField(required=False, default=dict)


class ItineraryEditRequestSerializer(serializers.Serializer):
    edit_type = serializers.CharField(max_length=50)
    day = serializers.IntegerField(required=False)
    activity_index = serializers.IntegerField(required=False)
    new_activity = serializers.DictField(required=False)
    edit_reason = serializers.CharField(required=False, allow_blank=True)
