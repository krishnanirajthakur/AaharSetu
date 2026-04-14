import os
import requests
from google.maps import Client as GoogleMapsClient
from typing import Dict, List, Optional
import random
from datetime import datetime

def get_maps_client() -> Optional[GoogleMapsClient]:
    """Initialize Google Maps client with env var."""
    api_key = os.environ.get('GOOGLE_MAPS_API_KEY')
    if not api_key:
        print('Warning: GOOGLE_MAPS_API_KEY not set, Maps features disabled.')
        return None
    try:
        return GoogleMapsClient(key=api_key)
    except Exception as e:
        print(f'Maps client error (quota?): {e}. Using fallback.')
        return None

def get_weather_thane() -> Dict[str, float]:
    """Get/simulate weather for Thane. Fallback to simulated for demo/quota."""
    api_key_weather = os.environ.get('WEATHER_API_KEY')  # Optional OpenWeather
    if api_key_weather:
        try:
            url = f'https://api.openweathermap.org/data/2.5/weather?q=Thane,IN&appid={api_key_weather}&units=metric'
            resp = requests.get(url, timeout=5)
            if resp.status_code == 200:
                data = resp.json()
                return {'temp': data['main']['temp'], 'condition': data['weather'][0]['main']}
        except Exception as e:
            print(f'Weather API error: {e}')
    
    # Simulated fallback (random 25-35C for Thane summer)
    temp = round(random.uniform(25, 35), 1)
    return {'temp': temp, 'condition': 'Sunny' if temp > 28 else 'Pleasant'}

def get_healthy_restaurants_near_thane(client: Optional[GoogleMapsClient] = None, num: int = 3) -> List[str]:
    """Fetch 3 healthy restaurants near Thane using Places API."""
    if not client:
        return ['Fallback: Healthy spots unavailable (check API key)']
    
    try:
        places_result = client.places_nearby(
            location=(19.2183, 72.9781),  # Thane coords
            radius=5000,
            type='restaurant',
            keyword='healthy vegetarian'
        )
        return [place.name for place in places_result.results[:num]]
    except Exception as e:
        print(f'Places API error (quota?): {e}')
        return ['Fallback: Check API quota']

def get_context_dashboard() -> Dict:
    """Full context for dashboard."""
    weather = get_weather_thane()
    client = get_maps_client()
    spots = get_healthy_restaurants_near_thane(client)
    current_time = datetime.now().strftime('%H:%M')
    return {
        'weather': f'🌡️ {weather['temp']}°C ({weather['condition']})',
        'location': '📍 Thane, Maharashtra',
        'time': f'🕒 {current_time}',
        'healthy_spots': spots
    }

# Quick actions helpers
def hydration_nudge() -> str:
    weather = get_weather_thane()
    if weather['temp'] > 30:
        return f'\n\n💧 **Hydration Alert**: High temp ({weather['temp']}°C)! Drink 500ml water now.'
    return ''

def nearby_spots() -> List[str]:
    client = get_maps_client()
    return get_healthy_restaurants_near_thane(client)
