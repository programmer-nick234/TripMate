"""
URL configuration for trip_mate project.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/itinerary/', include('itinerary.urls')),
    path('api/chat/', include('chat.urls')),
]
