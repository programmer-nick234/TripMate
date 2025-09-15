#!/usr/bin/env python
"""
Quick development setup script
"""
import os
import sys
import subprocess

def run_command(command, description):
    print(f"\n{description}...")
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error: {result.stderr}")
        return False
    print(f"✓ {description} completed")
    return True

def main():
    print("Setting up TripMate backend for development...")
    
    # Install dependencies
    if not run_command("pip install -r requirements.txt", "Installing Python dependencies"):
        return
    
    # Run migrations
    if not run_command("python manage.py makemigrations", "Creating migrations"):
        return
    
    if not run_command("python manage.py migrate", "Running migrations"):
        return
    
    # Create superuser
    print("\nCreating admin user...")
    from django.contrib.auth.models import User
    import django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trip_mate.settings')
    django.setup()
    
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
        print("✓ Admin user created: username=admin, password=admin123")
    else:
        print("✓ Admin user already exists")
    
    print("\n🎉 Setup complete! You can now run:")
    print("  python manage.py runserver")
    print("\nOr use the quick start:")
    print("  python run_server.py")

if __name__ == "__main__":
    main()