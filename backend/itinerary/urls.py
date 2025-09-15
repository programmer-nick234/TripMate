from django.urls import path
from . import views

urlpatterns = [
    path('generate/', views.generate_itinerary, name='generate_itinerary'),
    path('<int:itinerary_id>/', views.get_itinerary, name='get_itinerary'),
    path('<int:itinerary_id>/edit/', views.edit_itinerary, name='edit_itinerary'),
    path('list/', views.list_itineraries, name='list_itineraries'),
    path('<int:itinerary_id>/delete/', views.delete_itinerary, name='delete_itinerary'),
]
