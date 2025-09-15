from django.contrib import admin
from .models import Itinerary, ItineraryEdit


@admin.register(Itinerary)
class ItineraryAdmin(admin.ModelAdmin):
    list_display = ['title', 'destination', 'start_date', 'end_date', 'budget', 'created_at']
    list_filter = ['destination', 'start_date', 'created_at']
    search_fields = ['title', 'destination']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(ItineraryEdit)
class ItineraryEditAdmin(admin.ModelAdmin):
    list_display = ['itinerary', 'edit_type', 'created_at']
    list_filter = ['edit_type', 'created_at']
    search_fields = ['itinerary__title', 'edit_reason']
    readonly_fields = ['created_at']
