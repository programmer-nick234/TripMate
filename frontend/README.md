# TripMate Frontend

Next.js frontend for the TripMate AI travel assistant.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env.local
```

3. Update environment variables in `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

4. Run the development server:
```bash
npm run dev
```

## Features

- Interactive itinerary wizard
- Conversational AI chat interface
- Map visualization with Mapbox
- Responsive design
- Real-time itinerary editing

## Components

- `ItineraryWizard`: Form for creating new itineraries
- `ItineraryResults`: Display and manage generated itineraries
- `TripMateChat`: Conversational interface for editing
- `ItineraryMap`: Map visualization component
