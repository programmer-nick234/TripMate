from django.db import models
from django.contrib.auth.models import User
import json


class Itinerary(models.Model):
    """Model to store travel itineraries"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    title = models.CharField(max_length=200)
    destination = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField()
    budget = models.DecimalField(max_digits=10, decimal_places=2)
    interests = models.JSONField(default=list)
    constraints = models.JSONField(default=dict)
    itinerary_data = models.JSONField(default=dict)  # Stores the full JSON structure
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.destination}"


class ItineraryEdit(models.Model):
    """Model to track edits made to itineraries"""
    itinerary = models.ForeignKey(Itinerary, on_delete=models.CASCADE, related_name='edits')
    edit_type = models.CharField(max_length=50)  # 'add', 'remove', 'modify', 'move'
    original_data = models.JSONField()
    modified_data = models.JSONField()
    edit_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Edit to {self.itinerary.title} - {self.edit_type}"
