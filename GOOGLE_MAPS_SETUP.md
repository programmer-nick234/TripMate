# 🗺️ Google Maps API Setup Guide

## Step 1: Get Google Maps API Key

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create or Select Project**
   - Click "Select a project" → "New Project"
   - Name it "TripMate" or similar
   - Click "Create"

3. **Enable Required APIs**
   - Go to "APIs & Services" → "Library"
   - Search and enable these APIs:
     - **Maps JavaScript API** (for displaying maps)
     - **Places API** (for location search)
     - **Geocoding API** (for address conversion)

4. **Create API Key**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the generated API key

5. **Secure Your API Key (Optional but Recommended)**
   - Click on your API key to edit it
   - Under "Application restrictions", select "HTTP referrers"
   - Add: `http://localhost:3000/*` and `https://yourdomain.com/*`
   - Under "API restrictions", select "Restrict key" and choose the APIs you enabled

## Step 2: Configure Environment Variables

Create a file called `.env.local` in the `frontend` folder:

```bash
# In frontend/.env.local
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

**Replace `your_actual_api_key_here` with your real API key from Step 1.**

## Step 3: Test the Setup

1. **Start the backend** (if not already running):
   ```bash
   cd backend
   venv_new\Scripts\python.exe manage.py runserver
   ```

2. **Start the frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test the map**:
   - Go to http://localhost:3000
   - Fill out the form and generate an itinerary
   - Click on the "Map" tab to see your locations

## Troubleshooting

### "Google Maps API key not configured" Error
- Make sure you created `frontend/.env.local` with your API key
- Restart the frontend server after adding the environment variable
- Check that the API key is correct (no extra spaces or characters)

### "This page can't load Google Maps correctly" Error
- Check that you enabled the required APIs in Google Cloud Console
- Verify your API key restrictions allow localhost
- Make sure you have billing enabled on your Google Cloud project

### Map Not Showing
- Check browser console for errors
- Verify the API key is working by testing it in a simple HTML file
- Make sure you have internet connection

## Cost Information

- Google Maps has a free tier with generous limits
- For development and small projects, you likely won't exceed the free tier
- Check Google Cloud Console for usage and billing information

## Need Help?

If you're still having issues:
1. Check the browser console for error messages
2. Verify your API key in Google Cloud Console
3. Make sure all required APIs are enabled
4. Test with a simple HTML file first to isolate the issue
