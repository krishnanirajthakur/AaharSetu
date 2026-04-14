import os
import google.generativeai as genai
from typing import Optional
from PIL import Image
from .geo_service import hydration_nudge

def configure_gemini():
    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        raise ValueError('GEMINI_API_KEY required')
    genai.configure(api_key=api_key)

def generate_response(prompt: str, image: Optional[Image.Image] = None, user_query_contains_food_options: bool = False) -> str:
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        system_instruction = (
            'You are AaharSetu AI. Maharashtrian Nutrition DB: Poha GL~15 GI~70 4g fiber, Misal GL~12 GI~55 high protein, '
            'Jowar Bhakri fiber 8g/100g GI~50, Bajra Bhakri fiber 10g/100g low GL. '
            'Labels: Hidden sugars (maltodextrin, HFCS) -> "**⚠️ HEALTH WARNING: Hidden sugars! Swap natural**". '
            'Budget <₹200 Thane seasonal tag. '
            'Format: ### 🍽️ Calories [est] ### 🥗 Swap [action] ### 📊 Notes (fiber/GL/budget/warning)'
        )
        
        contents = [system_instruction]
        if prompt:
            contents.append(prompt)
        if image:
            contents.append(image)
        
        response = model.generate_content(contents)
        result = response.text
        
        result += hydration_nudge()
        
        if user_query_contains_food_options:
            result += '\n\n📍 Check Nearby Spots!'
        
        return result
    
    except Exception as e:
        return f'AI error: {str(e)}. Retry.'
