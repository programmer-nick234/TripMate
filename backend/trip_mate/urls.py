"""
URL configuration for trip_mate project.
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({'status': 'healthy', 'message': 'TripMate API is running'})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health_check, name='health_check'),
    path('api/itinerary/', include('itinerary.urls')),
    path('api/chat/', include('chat.urls')),
]
