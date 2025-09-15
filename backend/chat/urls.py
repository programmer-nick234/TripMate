from django.urls import path
from . import views

urlpatterns = [
    path('start/', views.start_chat_session, name='start_chat_session'),
    path('send/', views.send_message, name='send_message'),
    path('history/<str:session_id>/', views.get_chat_history, name='get_chat_history'),
    path('end/', views.end_chat_session, name='end_chat_session'),
    path('sessions/', views.list_chat_sessions, name='list_chat_sessions'),
]
