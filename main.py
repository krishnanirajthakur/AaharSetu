import os
import io
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
from dotenv import load_dotenv
import PIL.Image

# Load environment variables
load_dotenv()

# Configure Gemini
api_key = os.environ.get("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

app = FastAPI(title="AaharSetu Backend")

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
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        contents = []
        if prompt:
            contents.append(prompt)
        if image:
            image_data = await image.read()
            img = PIL.Image.open(io.BytesIO(image_data))
            contents.append(img)
            
        system_instruction = (
            "You are a nutritional assistant for an app called AaharSetu. "
            "The user will provide an image of food and/or a text description. "
            "You must respond with two things formatted nicely in Markdown: \n"
            "### 🍽️ Estimated Calories\n"
            "[Your calorie estimate here]\n\n"
            "### 🥗 Healthy Swap\n"
            "[One clear, actionable healthy swap recommendation]"
        )
        
        contents.insert(0, system_instruction)
        
        response = model.generate_content(contents)
        
        return {"result": response.text}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

# Serve static files
static_dir = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(static_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static_assets")

@app.get("/{path:path}")
async def serve_static(path: str):
    file_path = os.path.join(static_dir, path)
    if path and os.path.isfile(file_path):
        return FileResponse(file_path)
    # Default to index.html for SPA behavior or root path
    return FileResponse(os.path.join(static_dir, "index.html"))

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
