"""
ASGI config for trip_mate project.
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trip_mate.settings')

application = get_asgi_application()
