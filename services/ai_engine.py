import os
import requests
from typing import Optional
from PIL import Image
import io
import base64
from .geo_service import hydration_nudge

def configure_gemini():
    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        raise ValueError('GEMINI_API_KEY required')
    return api_key

def generate_response(prompt: str, image: Optional[Image.Image] = None, user_query_contains_food_options: bool = False) -> str:
    try:
        api_key = configure_gemini()

        system_instruction = (
            'You are AaharSetu Phase 4. Nutrition DB: Poha GL15 GI70 fiber4g, Misal GL12 GI55 protein, Jowar Bhakri fiber8g GI50, '
            'Bajra fiber10g lowGL. Hidden sugars (maltodextrin HFCS dextrose): "**⚠️ ECO LOW Score 30/100 - Swap natural**". '
            'Local Poha 90/100 eco, imported cereal 40/100. Busy schedule: Quick fuel makhana/fruit. Eco Score/meal. '
            'Format: ### 🍽️ Calories ### 🥗 Swap ### 📊 Notes(fiber/GL/budget) ### 🌿 Eco: XX/100'
        )

        contents = [{"parts": [{"text": system_instruction}]}]

        if prompt:
            contents.append({"parts": [{"text": prompt}]})

        if image:
            buffer = io.BytesIO()
            image.save(buffer, format="JPEG")
            image_data = base64.b64encode(buffer.getvalue()).decode()
            contents.append({
                "parts": [
                    {"text": "Analyze this food image:"},
                    {"inline_data": {"mime_type": "image/jpeg", "data": image_data}}
                ]
            })

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={api_key}"
        response = requests.post(url, json={"contents": contents}, timeout=30)

        if response.status_code == 200:
            result = response.json()["candidates"][0]["content"]["parts"][0]["text"]
            result += hydration_nudge()
            if user_query_contains_food_options:
                result += '\n📍 Spots!'
            return result
        else:
            return f"AI Error: {response.status_code}"

    except Exception as e:
        return f"AI Service temporarily unavailable. Error: {str(e)}. Please try again later."
