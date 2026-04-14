import os
import io
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import PIL.Image
from services.ai_engine import configure_gemini, generate_response
from services.geo_service import get_context_dashboard, hydration_nudge, nearby_spots

# Load environment variables
load_dotenv()

# Configure Gemini (Phase 2)
configure_gemini()

app = FastAPI(title="AaharSetu Backend - Phase 2 Contextual Intelligence")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/analyze")
async def analyze_food(
    prompt: str = Form(None),
    image: UploadFile = File(None)
):
    if not prompt and not image:
        return JSONResponse(status_code=400, content={"error": "Must provide either text or image."})
    
    if not os.environ.get("GEMINI_API_KEY"):
        return JSONResponse(status_code=500, content={"error": "GEMINI_API_KEY is not configured on the server."})

    try:
        img = None
        if image:
            image_data = await image.read()
            img = PIL.Image.open(io.BytesIO(image_data))
        
        # Phase 2: Detect food options request and enrich with geo context
        food_options = bool(prompt and ('food options' in prompt.lower() or 'restaurant' in prompt.lower() or 'eat out' in prompt.lower()))
        
        # Enrich prompt with geo context if food options
        enriched_prompt = prompt
        if food_options:
            context = get_context_dashboard()
            spots = context.get('healthy_spots', [])
            enriched_prompt = f"{prompt}\n\nContext: Weather: {context['weather']}, Location: {context['location']}, Nearby healthy spots: {', '.join(spots)}"
        
        result = generate_response(enriched_prompt or '', img, food_options)
        return {"result": result}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/api/context")
async def get_context():
    """Context Dashboard data (Phase 2)"""
    try:
        return get_context_dashboard()
    except Exception as e:
        return {
            "error": "Context service unavailable",
            "weather": "🌡️ N/A",
            "location": "📍 Thane, Maharashtra",
            "time": "🕒 N/A",
            "healthy_spots": ["Service temporarily unavailable"]
        }

@app.post("/api/quick-action")
async def quick_action(action: str = Form(...)):
    """Quick Actions (Phase 2)"""
    try:
        if action == "hydration":
            nudge = hydration_nudge()
            return {"result": nudge or "🌤️ Pleasant weather in Thane. Regular hydration recommended!"}
        elif action == "spots":
            spots = nearby_spots()
            result = "**Nearby Healthy Spots:**\\n" + "\\n".join(f"• {s}" for s in spots[:3])
            return {"result": result}
        elif action == "budget":
            budget_prompt = "You are AaharSetu. Suggest 3 budget-friendly healthy Maharashtrian meals under ₹200. Include estimated calories, glycemic index notes, and healthy swaps."
            result = generate_response(budget_prompt, None, False)
            return {"result": result}
        else:
            return JSONResponse(status_code=400, content={"error": "Valid actions: hydration, spots, budget"})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": "Quick action failed: " + str(e)})

# Serve static files
static_dir = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(static_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static_assets")

@app.get("/{path:path}")
async def serve_static(path: str):
    file_path = os.path.join(static_dir, path)
    if path and os.path.isfile(file_path):
        return FileResponse(file_path)
    # Default to index.html for SPA
    return FileResponse(os.path.join(static_dir, "index.html"))

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
