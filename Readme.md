# 🥗 AaharSetu: Smart Contextual Nutrition Assistant

**AaharSetu** (Diet Bridge) is a next-generation, installable Progressive Web App (PWA) designed to transform how individuals make food choices. Unlike traditional calorie trackers, AaharSetu is **proactive**, using real-world context like weather, location, and your Google Calendar to provide timely, healthy "nudges."

---

## 🎯 Project Vertical
**Health & Nutrition:** Designing a smart solution to help individuals build healthier eating habits through contextual data and behavioral psychology.

---

## ✨ Core Features (Phased Implementation)
- **Multimodal Plate Analysis:** Upload a photo of your meal, and Gemini 1.5 Flash identifies ingredients, portion sizes, and nutrition facts instantly.
- **Contextual Intelligence:** Integrates with Google Maps (nearby healthy spots) and Weather APIs (hydration/seasonal reminders).
- **Hyper-Local Logic:** Specialized recognition of Indian/Maharashtrian diets (e.g., Poha, Bhakri, Upma) for accurate regional nutrition.
- **Intelligent Automation:** Syncs with Google Calendar to suggest quick snacks during busy schedules and uses Google Keep for auto-generated grocery lists.
- **Social Impact:** Locates community fridges and NGOs in Thane, Maharashtra, to reduce food waste.

---

## 🛠️ Technical Architecture & Logic
### 🧠 The Brain
The solution leverages the **Gemini 1.5 Flash API** for high-speed multimodal reasoning. It doesn't just calculate calories; it suggests "Smart Swaps" based on the user's current environment.

### 🏗️ Stack
- **Backend:** FastAPI (Python) - lightweight and high-performance.
- **Frontend:** Vanilla JavaScript, HTML5, and Tailwind CSS (via CDN) to keep the repository size **< 1 MB**.
- **Deployment:** Google Cloud Run (Containerized).
- **Persistence:** LocalStorage for PWA offline capabilities.

### 🔄 The Logic Flow
1. **Input:** User sends a query (Text/Voice/Image).
2. **Context Enrichment:** The app fetches current weather, time, and user location.
3. **Reasoning:** Gemini processes the input + context + regional dietary rules.
4. **Action:** AaharSetu provides a nutrition breakdown, a "Smart Swap" suggestion, and an automated action (e.g., "Add to Grocery List").

---

## 🚀 How it Works (Installation)
As a PWA, AaharSetu can be installed on any Android, iOS, or Desktop device.
1. Open the [Deployed URL] in your browser.
2. Tap "Add to Home Screen."
3. Access AaharSetu like a native app with offline support.

---

## 📝 Assumptions & Considerations
- **Data Privacy:** All contextual data (Location/Calendar) is processed locally or via secure Google API calls. No personal data is stored permanently without consent.
- **Regional Accuracy:** Nutritional values for local dishes are based on Indian standard dietary averages.
- **Resource Constraints:** The app is optimized for low-bandwidth environments (Thane/Mumbai local transit).

---

## ⚖️ Evaluation Focus Areas
- **Efficiency:** Entire repository is kept under 1 MB by utilizing CDNs and serverless logic.
- **Security:** API keys are managed via Google Cloud Secret Manager.
- **Accessibility:** Semantic HTML and Tailwind ensure high contrast and screen-reader compatibility.
- **Google Services:** Deep integration with Gemini, Google Maps, Cloud Run, and Cloud Build.

---

**Developed by:** Krishna Niraj Thakur  
**Location:** Thane, Maharashtra, India  
**Challenge:** Google Antigravity Challenge 2026