# TripMate - AI Travel Assistant

A conversational AI travel assistant that helps users create, edit, and refine their travel itineraries through natural language interactions.

## Architecture

- **Frontend**: Next.js with React for the conversational interface
- **Backend**: Django with FastAPI-style structure for itinerary generation
- **AI Service**: PlanEngine for structured itinerary generation

## Features

- 🗣️ Conversational itinerary editing
- 🗺️ Interactive map visualization
- 🌤️ Weather-aware adjustments
- 💰 Budget tracking and optimization
- 📱 Responsive design for mobile and desktop

## Project Structure

```
trip-mate/
├── frontend/          # Next.js application
├── backend/           # Django API server
├── shared/            # Shared types and schemas
└── README.md
```

## Getting Started

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python run_dev.py  # Quick setup with migrations and admin user
# OR
python manage.py runserver
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

- `POST /api/itinerary/generate` - Generate new itinerary
- `PUT /api/itinerary/{id}/edit` - Edit existing itinerary
- `GET /api/itinerary/{id}` - Get itinerary details
- `POST /api/chat` - Conversational editing interface
