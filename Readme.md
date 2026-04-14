# 🥗 AaharSetu Phase 2: Contextual Intelligence & GCP Security

**AaharSetu** - Phase 2 complete! Now with **Contextual Intelligence** (weather nudges, Thane healthy spots via Google Maps Places), **Maharashtrian Nutrition Expertise** (Poha GI notes), **Accessibility**, **Security** (env vars, quota handling), ready for Cloud Run.

## 🎯 Phase 2 Features
- **Backend**:
  | Feature | Details |
  |---------|---------|
  | Google Maps Places | 3 healthy vegetarian restaurants near Thane (API key secure)
  | Weather Nudge | Simulated/real (OpenWeather fallback), hydration if >30°C appended to Gemini
  | Modular Services | `services/ai_engine.py` (Gemini + prompt), `services/geo_service.py`
  | New Endpoints | `/api/context` (dashboard), `/api/quick-action` (hydration/spots/budget)
- **Frontend**:
  | UI | Details |
  |----|---------|
  | Context Dashboard | Weather/time/location/spots, semantic HTML, aria-labels
  | Quick Actions | Buttons for nudge/spots/budget meals, integrates chat
- **AI** | Gemini prompt: Maharashtrian staples (Poha GI~70, Misal GI~55, Bhakri GI~50)
- **Security** | All APIs `os.environ.get()`, try-except quotas

## 🛠️ Stack & Size
- FastAPI, google-generativeai, googlemaps, requests (CDNs for UI)
- Repo size: <500KB (CDN Tailwind/marked)
- PWA ready (offline static)

## 🚀 Local Run & Test
```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8080
```
- Open http://localhost:8080
- Test dashboard `/api/context`, quick-actions, analyze with \"food options near Thane\", image upload
- Weather nudge: if temp>30°C auto-append

## ☁️ Cloud Run Deploy
1. Set env vars: `GEMINI_API_KEY`, `GOOGLE_MAPS_API_KEY` (optional `WEATHER_API_KEY`)
2. ```bash
gcloud builds submit --tag gcr.io/[PROJECT]/aaharsetu-phase2
gcloud run deploy aaharsetu --image gcr.io/[PROJECT]/aaharsetu-phase2 --platform managed --allow-unauthenticated --set-env-vars GEMINI_API_KEY=xxx
```
3. Custom domain/port auto.

## 📋 Env Vars
| Key | Required | Desc |
|-----|----------|------|
| GEMINI_API_KEY | Yes | Gemini API |
| GOOGLE_MAPS_API_KEY | Recommended | Places API |
| WEATHER_API_KEY | Optional | OpenWeather fallback |
| PORT | 8080 default | Cloud Run |

## ⚖️ Evaluation
- **Security**: Env vars, quota try-except ✅
- **Accessibility**: aria-labels, semantic HTML, high contrast ✅
- **Efficiency**: <500KB, serverless ready ✅
- **GCP**: Maps/Gemini/Cloud Run ✅

**Thane, Maharashtra | Google Antigravity 2026**
