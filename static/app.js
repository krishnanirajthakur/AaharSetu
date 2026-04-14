document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chatBox');
    const chatForm = document.getElementById('chatForm');
    const textInput = document.getElementById('textInput');
    const imageInput = document.getElementById('imageInput');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    const imagePreview = document.getElementById('imagePreview');
    const removeImageBtn = document.getElementById('removeImageBtn');
    const sendBtn = document.getElementById('sendBtn');
    const dashboardItems = document.getElementById('dashboardItems');
    const highContrastBtn = document.getElementById('highContrastBtn');
    const langSelect = document.getElementById('langSelect');
    const streakCtx = document.getElementById('streakChart').getContext('2d');

    let selectedFile = null;
    let streakChart = null;
    let isHighContrast = false;
    let currentLang = 'en';

    // Init
    loadContext();
    initStreakChart();
    updateHighContrast(false);

    // Phase 3 High Contrast Toggle
    highContrastBtn.addEventListener('click', () => {
        isHighContrast = !isHighContrast;
        updateHighContrast(isHighContrast);
    });

    // Phase 3 Language Selector
    langSelect.addEventListener('change', async (e) => {
        currentLang = e.target.value === 'मराठी' ? 'mr' : e.target.value === 'हिंदी' ? 'hi' : 'en';
        await translateUI(currentLang);
    });

    // Service Worker
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/static/service-worker.js');

    // Input
    textInput.addEventListener('keydown', e => e.key === 'Enter' && !e.shiftKey && chatForm.dispatchEvent(new Event('submit')));
    imageInput.addEventListener('change', e => {
        const file = e.target.files[0];
        if (file) {
            selectedFile = file;
            const reader = new FileReader();
            reader.onload = ev => {
                imagePreview.src = ev.target.result;
                imagePreviewContainer.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    });
    removeImageBtn.addEventListener('click', () => {
        selectedFile = null;
        imageInput.value = '';
        imagePreviewContainer.classList.add('hidden');
    });

    // Chat submit
    chatForm.addEventListener('submit', async e => {
        e.preventDefault();
        const text = textInput.value.trim();
        if (!text && !selectedFile) return;

        // User msg
        const hasImage = selectedFile ? `<img src="${imagePreview.src}" class="w-48 rounded-xl mb-2 shadow object-cover">` : '';
        addMessageToChat(`<div class="flex justify-end"><div class="bg-brand-600 text-white p-3 rounded-2xl max-w-[80%]"><div>${hasImage}${text}</div></div></div>`);

        // Reset
        textInput.value = '';
        textInput.style.height = 'auto';
        selectedFile = null;
        imageInput.value = '';
        imagePreviewContainer.classList.add('hidden');

        // Loading
        const loadingId = 'ld' + Date.now();
        addMessageToChat(`<div id="${loadingId}" class="flex gap-2"><div class="h-8 w-8 bg-brand-500 rounded-full flex items-center justify-center animate-spin">⏳</div></div>`);

        try {
            sendBtn.disabled = true;
            const formData = new FormData();
            if (text) formData.append('prompt', text);
            if (selectedFile) formData.append('image', selectedFile);
            const res = await fetch('/api/analyze', { method: 'POST', body: formData });
            const data = await res.json();
            document.getElementById(loadingId).remove();
            if (res.ok) {
                const parsed = marked.parse(data.result);
                addMessageToChat(`<div class="flex gap-2"><div class="h-8 w-8 bg-emerald-500 rounded-full flex items-center justify-center">🤖</div><div class="bg-white p-3 rounded-2xl shadow border msg-content">${parsed}</div></div>`);
                logMealToStreak(data.result);  // Phase 3
            } else showError(data.error);
        } catch (err) {
            document.getElementById(loadingId).remove();
            showError('Server error');
        } finally {
            sendBtn.disabled = false;
            textInput.focus();
        }
    });

    // Quick Actions
    window.quickAction = async action => {
        const loadingId = 'quick' + Date.now();
        addMessageToChat(`<div id="${loadingId}" class="flex"><div class="h-8 w-8 bg-brand-500 rounded-full animate-spin flex items-center justify-center">...</div></div>`);
        try {
            const formData = new FormData();
            formData.append('action', action);
            const res = await fetch('/api/quick-action', { method: 'POST', body: formData });
            const data = await res.json();
            document.getElementById(loadingId).remove();
            const parsed = marked.parse(data.result);
            const icon = {'hydration':'💧','spots':'📍','budget':'💰'}[action];
            addMessageToChat(`<div class="flex gap-2"><div class="h-8 w-8 bg-emerald-500 rounded-full flex items-center justify-center text-white">${icon}</div><div class="bg-white p-3 rounded-2xl shadow border msg-content">${parsed}</div></div>`);
        } catch {
            showError(`Action ${action} failed`);
        }
    };

    // Phase 3 Context Load
    async function loadContext() {
        try {
            const res = await fetch('/api/context');
            const data = await res.json();
            dashboardItems.innerHTML = `
                <div aria-label="Weather">${data.weather || '🌡️ N/A'}</div>
                <div aria-label="Time">${data.time || '🕒 N/A'}</div>
                <div aria-label="Healthy spots" class="col-span-2">${(data.healthy_spots || []).slice(0,2).join(' • ')}</div>
            `;
        } catch {
            dashboardItems.innerHTML = '<div class="col-span-2 text-slate-500">Context N/A</div>';
        }
    }

    // Phase 3 Streak Chart
    function initStreakChart() {
        const ctx = document.getElementById('streakChart').getContext('2d');
        streakChart = new Chart(ctx, {
            type: 'line',
            data: { labels: [], datasets: [{ label: 'Health Score', data: [], borderColor: '#10b981', fill: true }] },
            options: { responsive: true, scales: { y: { beginAtZero: true, max: 100 } }, plugins: { legend: { display: false } } }
        });
        updateStreakChart();
    }
    function updateStreakChart() {
        const streak = getStreakData();
        streakChart.data.labels = streak.labels;
        streakChart.data.datasets[0].data = streak.scores;
        streakChart.update('none');
    }
    function getStreakData() {
        const mealsStr = localStorage.getItem('meals') || '[]';
        const meals = JSON.parse(mealsStr);
        const days = [];
        const scores = [];
        const sevenDays = Array(7).fill(0).map((_, i) => new Date(Date.now() - i * 86400000).toISOString().split('T')[0]);
        sevenDays.reverse();
        meals.slice(-7).forEach(m => {
            const date = new Date(m.date).toISOString().split('T')[0];
            const score = m.calories < 600 ? 80 + Math.random()*20 : 40 + Math.random()*20;  // Dummy score
            days.push(date);
            scores.push(score);
        });
        return { labels: sevenDays.slice(0, -days.length).concat(days), scores };
    }
    window.logCurrentMeal = () => {
        const mealsStr = localStorage.getItem('meals') || '[]';
        const meals = JSON.parse(mealsStr);
        meals.push({ date: new Date().toISOString(), calories: 500 + Math.random()*300, swap: 'Healthy' });
        localStorage.setItem('meals', JSON.stringify(meals));
        updateStreakChart();
        alert('Meal logged to streak!');
    };

    // High Contrast
    function updateHighContrast(on) {
        document.body.classList.toggle('high-contrast', on);
        highContrastBtn.setAttribute('aria-pressed', on);
    }

    // Language Translate (Phase 3)
    async function translateUI(lang) {
        try {
            const formData = new FormData();
            formData.append('prompt', `Translate to ${lang}: Nutrition Streak, Quick Actions, Hydration`);
            const res = await fetch('/api/analyze', { method: 'POST', body: formData });
            const data = await res.json();
            // Update texts dummy
            console.log('Translated:', data.result);
        } catch {}
    }

    function showError(msg) {
        addMessageToChat(`<div class="flex"><div class="h-8 w-8 bg-red-500 rounded-full flex items-center justify-center text-white shadow">⚠️</div><div class="bg-red-50 p-3 rounded-2xl text-red-800 border border-red-100">${msg}</div></div>`);
    }

    function addMessageToChat(html) {
        chatBox.insertAdjacentHTML('beforeend', html);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
});
