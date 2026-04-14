# 🥗 AaharSetu **Phase 3 Complete** - Advanced Analytics & Regional Logic

Phase 3 adds Nutrition Streak charts (LocalStorage), Maharashtrian DB (fiber/GL), Thane APMC prices budget tags, label sugar warnings, tests, high contrast/lang, enhanced offline PWA.

## 🚀 Quick Start
```
pip install -r requirements.txt
uvicorn main:app --reload
```
localhost:8080 - Log meals for streak, toggle contrast/lang, offline UI.

## Phase 3 Highlights
| Feature | Impl |
|---------|------|
| Streak Chart | Chart.js CDN, localStorage JSON streak |
| Regional DB | Gemini: Jowar 8g fiber, Bajra 10g, label sugars ⚠️ |
| APMC Prices | utils/market_data.py Thane veggies ₹, budget tags |
| Tests | pytest basic_test.py: maps/gemini/manifest |
| UI | High contrast toggle, lang (mr/hi/en Gemini), chart a11y aria |
| Offline PWA | SW caches UI/icons, API live |

## Deploy Cloud Run
```
docker build -t gcr.io/PROJECT/aaharsetu .
gcloud run deploy aaharsetu --image gcr.io/PROJECT/aaharsetu --allow-unauthenticated --set-env-vars GEMINI_API_KEY=... GOOGLE_MAPS_API_KEY=...
```
Size <700KB.

**Thane | Antigravity 2026**
