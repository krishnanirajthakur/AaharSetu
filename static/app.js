document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chatBox');
    const chatForm = document.getElementById('chatForm');
    const textInput = document.getElementById('textInput');
    const imageInput = document.getElementById('imageInput');
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    const imagePreview = document.getElementById('imagePreview');
    const removeImageBtn = document.getElementById('removeImageBtn');
    const sendBtn = document.getElementById('sendBtn');
    const installBtn = document.getElementById('installBtn');
    const dashboardItems = document.getElementById('dashboardItems');

    let selectedFile = null;

    // Phase 2: Load Context Dashboard on start
    loadContext();

    // --- Service Worker ---
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/static/service-worker.js', {scope: '/'})
            .then(reg => console.log('SW registered'));
    }

    // --- PWA Install ---
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        installBtn.classList.remove('hidden');
    });
    installBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') installBtn.classList.add('hidden');
            deferredPrompt = null;
        }
    });

    // --- Input Handling ---
    textInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            chatForm.dispatchEvent(new Event('submit'));
        }
    });

    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            selectedFile = file;
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                imagePreviewContainer.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    });

    removeImageBtn.addEventListener('click', () => {
        selectedFile = null;
        imageInput.value = '';
        imagePreviewContainer.classList.add('hidden');
        imagePreview.src = '';
    });

    // --- Chat Form Submit ---
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = textInput.value.trim();
        if (!text && !selectedFile) return;

        // User message
        let userMsgHtml = `<div class="flex gap-2 max-w-[90%] self-end">
            <div class="bg-brand-600 text-white px-4 py-3 rounded-2xl rounded-br-sm shadow-md text-[14px] leading-relaxed">${
                selectedFile ? `<img src="${imagePreview.src}" class="max-w-[220px] rounded-xl mb-3 object-cover shadow-sm"><p>${text || ''}</p>` : `<p>${text}</p>`
            }</div>
        </div>`;
        addMessageToChat(userMsgHtml);

        // Reset
        textInput.value = '';
        textInput.style.height = 'auto';
        selectedFile = null;
        imageInput.value = '';
        imagePreviewContainer.classList.add('hidden');

        // Loading
        const loadingId = 'loading-' + Date.now();
        addMessageToChat(`
            <div id="${loadingId}" class="flex gap-2 max-w-[90%] self-start">
                <div class="h-8 w-8 rounded-full bg-gradient-to-tr from-brand-500 to-emerald-400 flex-shrink-0 flex items-center justify-center text-white shadow-sm self-end mb-1">
                    <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
                <div class="bg-white px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm border border-slate-100 flex items-center h-[46px] min-w-[60px] justify-center bg-opacity-90">
                    <span class="flex gap-1.5 opacity-60">
                        <span class="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
                        <span class="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
                        <span class="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
                    </span>
                </div>
            </div>
        `);

        try {
            sendBtn.disabled = true;
            textInput.disabled = true;
            
            const formData = new FormData();
            if (text) formData.append('prompt', text);
            if (selectedFile) formData.append('image', selectedFile);

            const res = await fetch('/api/analyze', { method: 'POST', body: formData });
            const data = await res.json();
            document.getElementById(loadingId).remove();
            
            if (res.ok) {
                const parsed = marked.parse(data.result);
                addMessageToChat(`
                    <div class="flex gap-2 max-w-[90%] self-start animate-fade-in">
                        <div class="h-8 w-8 rounded-full bg-gradient-to-tr from-brand-500 to-emerald-400 flex-shrink-0 flex items-center justify-center text-white shadow-sm self-end mb-1">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                                <path fill-rule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM6 9a1 1 0 112 0 1 1 0 01-2 0zm4 3a.5.5 0 00-.5.5v1a.5.5 0 001 0v-1a.5.5 0 00-.5-.5zm2-3a1 1 0 112 0 1 1 0 01-2 0z" clip-rule="evenodd" />
                            </svg>
                        </div>
                        <div class="bg-white px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm border border-slate-100 msg-content prose prose-sm max-w-none bg-opacity-90">
                            ${parsed}
                        </div>
                    </div>
                `);
            } else {
                showError(data.error || 'Error');
            }
        } catch (err) {
            document.getElementById(loadingId).remove();
            showError('Network error. Check server.');
        } finally {
            sendBtn.disabled = false;
            textInput.disabled = false;
            textInput.focus();
        }
    });

    // Phase 2: Load Context Dashboard
    async function loadContext() {
        try {
            const res = await fetch('/api/context');
            const data = await res.json();
            if (data.error) {
                dashboardItems.innerHTML = '<div class="col-span-2 text-xs text-slate-500 p-2">Context loading...</div>';
                return;
            }
            dashboardItems.innerHTML = `
                <div class="dashboard-item">${data.weather}</div>
                <div class="dashboard-item">${data.time}</div>
                <div class="dashboard-item col-span-2">${data.healthy_spots.slice(0,2).join(' • ')}</div>
            `;
        } catch (e) {
            dashboardItems.innerHTML = '<div class="col-span-2 text-xs text-slate-500 p-2">Context unavailable</div>';
        }
    }

    // Phase 2: Quick Actions
    window.quickAction = async (action) => {
        const loadingId = 'quick-' + Date.now();
        addMessageToChat(`
            <div id="${loadingId}" class="flex gap-2 max-w-[90%] self-start">
                <div class="h-8 w-8 bg-brand-500 rounded-full flex items-center justify-center shadow-sm">
                    <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    </svg>
                </div>
            </div>
        `);

        try {
            const formData = new FormData();
            formData.append('action', action);
            const res = await fetch('/api/quick-action', { method: 'POST', body: formData });
            const data = await res.json();
            document.getElementById(loadingId).remove();
            
            const parsed = marked.parse(data.result || data.error);
            const icon = action === 'hydration' ? '💧' : action === 'spots' ? '📍' : '💰';
            addMessageToChat(`
                <div class="flex gap-2 max-w-[90%] self-start animate-fade-in">
                    <div class="h-8 w-8 bg-gradient-to-tr from-brand-500 to-emerald-400 rounded-full flex items-center justify-center text-white shadow-sm self-end mb-1">${icon}</div>
                    <div class="bg-white px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm border border-slate-100 msg-content prose prose-sm max-w-none bg-opacity-90">
                        ${parsed}
                    </div>
                </div>
            `);
        } catch (e) {
            document.getElementById(loadingId).remove();
            showError(`Quick action '${action}' failed.`);
        }
    };

    function showError(msg) {
        addMessageToChat(`
            <div class="flex gap-2 max-w-[90%] self-start">
                <div class="h-8 w-8 bg-red-500 rounded-full flex items-center justify-center text-white shadow-sm self-end mb-1">
                    <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                </div>
                <div class="bg-red-50 px-4 py-3 rounded-2xl rounded-bl-sm text-red-800 border border-red-100 text-[14px]">
                    ${msg}
                </div>
            </div>
        `);
    }

    function addMessageToChat(htmlStr) {
        chatBox.insertAdjacentHTML('beforeend', htmlStr);
        setTimeout(() => chatBox.scrollTop = chatBox.scrollHeight, 10);
    }
});
