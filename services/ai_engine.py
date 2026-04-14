import os
import google.generativeai as genai  # Note: Migrate to google.genai per warning when ready
from typing import Optional
from PIL import Image
from .geo_service import hydration_nudge  # No get_weather_thane needed

def configure_gemini():
    """Configure Gemini with env var."""
    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        raise ValueError('GEMINI_API_KEY required')
    genai.configure(api_key=api_key)

def generate_response(prompt: str, image: Optional[Image.Image] = None, user_query_contains_food_options: bool = False) -> str:
    """Gemini response with Phase 2: Maharashtrian focus + hydration nudge."""
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Phase 2 System Prompt
        system_instruction = (
            'You are AaharSetu AI, expert in Maharashtrian cuisine. '
            'Recognize staples: Poha (GI~70, moderate carbs), Misal (high protein, GI~55), Bhakri (low GI~50, high fiber). '
            'Provide specific nutritional advice with glycemic index notes. '
            'Format: ### 🍽️ Estimated Calories\n[estimate]\n\n### 🥗 Healthy Swap\n[actionable swap]'
        )
        
        contents = [system_instruction]
        if prompt:
            contents.append(prompt)
        if image:
            contents.append(image)
        
        response = model.generate_content(contents)
        result = response.text
        
        # Append nudge
        result += hydration_nudge()
        
        if user_query_contains_food_options:
            result += '\n\n📍 **Pro Tip**: Check Quick Actions > Spots for healthy options near Thane!'
        
        return result
    
    except Exception as e:
        return f'AI service error (quota?): {str(e)}. Please try again.'

