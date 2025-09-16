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

### Prerequisites
- Node.js 18+ 
- Python 3.8+
- OpenAI API key
- Google Maps API key

### Backend Setup
```bash
cd backend
pip install -r requirements.txt

# Set up environment variables
# Create backend/.env with your OpenAI API key:
OPENAI_API_KEY=your_openai_api_key_here

python run_dev.py  # Quick setup with migrations and admin user
# OR
python manage.py runserver
```

### Frontend Setup
```bash
cd frontend
npm install

# Set up environment variables
# Create frontend/.env.local with:
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
NEXT_PUBLIC_API_URL=http://localhost:8000/api

npm run dev
```

### Google Maps API Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. Create credentials (API Key)
5. Add the API key to `frontend/.env.local`

## API Endpoints

- `POST /api/itinerary/generate` - Generate new itinerary
- `PUT /api/itinerary/{id}/edit` - Edit existing itinerary
- `GET /api/itinerary/{id}` - Get itinerary details
- `POST /api/chat` - Conversational editing interface
