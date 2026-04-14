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

    let selectedFile = null;

    // --- Service Worker Registration ---
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/static/service-worker.js', {scope: '/'})
                .then(reg => console.log('SW registered!', reg))
                .catch(err => console.log('SW registration failed', err));
        });
    }

    // --- PWA Install Prompt ---
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        installBtn.classList.remove('hidden');
    });

    installBtn.addEventListener('click', async () => {
        if (deferredPrompt !== null) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                installBtn.classList.add('hidden');
            }
            deferredPrompt = null;
        }
    });

    // --- Input Handling ---
    // Handle Enter key for submission
    textInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            chatForm.dispatchEvent(new Event('submit'));
        }
    });

    // Handle image selection
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

    // --- Form Submission ---
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const text = textInput.value.trim();
        if (!text && !selectedFile) return;

        // Construct User Message HTML
        let userMsgHtml = `<div class="flex gap-2 max-w-[90%] self-end">`;
        let innerHtml = '';
        
        if (selectedFile) {
            innerHtml += `<div class="bg-brand-600 text-white px-4 py-3 rounded-2xl rounded-br-sm shadow-md shadow-brand-500/20 text-[14px] leading-relaxed"><img src="${imagePreview.src}" class="max-w-[220px] rounded-xl mb-3 object-cover shadow-sm">`;
            if (text) innerHtml += `<p>${text}</p>`;
            innerHtml += `</div>`;
        } else {
            innerHtml += `<div class="bg-brand-600 text-white px-4 py-3 rounded-2xl rounded-br-sm shadow-md shadow-brand-500/20 text-[14px] leading-relaxed"><p>${text}</p></div>`;
        }
        
        userMsgHtml += innerHtml + `</div>`;
        addMessageToChat(userMsgHtml);

        // Prepare request data
        const requestFormData = new FormData();
        if (text) requestFormData.append('prompt', text);
        if (selectedFile) requestFormData.append('image', selectedFile);

        // Reset inputs
        textInput.value = '';
        textInput.style.height = 'auto';
        selectedFile = null;
        imageInput.value = '';
        imagePreviewContainer.classList.add('hidden');
        imagePreview.src = '';

        // Show typing indicator
        const loadingId = 'loading-' + Date.now();
        const loadingHtml = `
            <div id="${loadingId}" class="flex gap-2 max-w-[90%] self-start transition-all">
                <div class="h-8 w-8 rounded-full bg-gradient-to-tr from-brand-500 to-emerald-400 flex-shrink-0 flex items-center justify-center text-white shadow-sm self-end mb-1">
                    <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
        `;
        addMessageToChat(loadingHtml);

        // Transact with Backend via FastAPI
        try {
            sendBtn.disabled = true;
            textInput.disabled = true;
            
            const res = await fetch('/api/analyze', {
                method: 'POST',
                body: requestFormData
            });
            const data = await res.json();
            
            const loaderEl = document.getElementById(loadingId);
            if(loaderEl) loaderEl.remove();

            if (res.ok) {
                // Parse markdown securely
                const parsedHtml = marked.parse(data.result);
                const botMsgHtml = `
                    <div class="flex gap-2 max-w-[90%] self-start animate-fade-in">
                         <div class="h-8 w-8 rounded-full bg-gradient-to-tr from-brand-500 to-emerald-400 flex-shrink-0 flex items-center justify-center text-white shadow-sm self-end mb-1">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM6 9a1 1 0 112 0 1 1 0 01-2 0zm4 3a.5.5 0 00-.5.5v1a.5.5 0 001 0v-1a.5.5 0 00-.5-.5zm2-3a1 1 0 112 0 1 1 0 01-2 0z" clip-rule="evenodd" /></svg>
                        </div>
                        <div class="bg-white px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm border border-slate-100 msg-content prose prose-sm max-w-none bg-opacity-90">
                            ${parsedHtml}
                        </div>
                    </div>
                `;
                addMessageToChat(botMsgHtml);
            } else {
                showError(data.error || 'Oops, something went wrong.');
            }
        } catch (err) {
            const loaderEl = document.getElementById(loadingId);
            if(loaderEl) loaderEl.remove();
            showError('Network error. Is the server running?');
        } finally {
            sendBtn.disabled = false;
            textInput.disabled = false;
            textInput.focus();
        }
    });

    function showError(msg) {
        const botMsgHtml = `
            <div class="flex gap-2 max-w-[90%] self-start animate-fade-in">
                 <div class="h-8 w-8 rounded-full bg-red-500 flex-shrink-0 flex items-center justify-center text-white shadow-sm self-end mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                </div>
                <div class="bg-red-50 px-4 py-3 rounded-2xl rounded-bl-sm text-red-800 border border-red-100 text-[14px]">
                    ${msg}
                </div>
            </div>
        `;
        addMessageToChat(botMsgHtml);
    }

    function addMessageToChat(htmlStr) {
        chatBox.insertAdjacentHTML('beforeend', htmlStr);
        // Scroll to very bottom of chatBox
        setTimeout(() => {
            chatBox.scrollTop = chatBox.scrollHeight;
        }, 10);
    }
});
