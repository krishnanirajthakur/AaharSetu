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
            'You are AaharSetu Phase 4. Nutrition DB: Poha GL15 GI70 fiber4g, Misal GL12 GI55 protein, Jowar Bhakri fiber8g GI50, '
            'Bajra fiber10g lowGL. Hidden sugars (maltodextrin HFCS dextrose): "**⚠️ ECO LOW Score 30/100 - Swap natural**". '
            'Local Poha 90/100 eco, imported cereal 40/100. Busy schedule: Quick fuel makhana/fruit. Eco Score/meal. '
            'Format: ### 🍽️ Calories ### 🥗 Swap ### 📊 Notes(fiber/GL/budget) ### 🌿 Eco: XX/100'
        )
        
        contents = [system_instruction, prompt or '', image or '']
        response = model.generate_content(contents)
        result = response.text + hydration_nudge()
        if user_query_contains_food_options:
            result += '\n📍 Spots!'
        return result
    
    except Exception as e:
        return f'Error: {e}'
