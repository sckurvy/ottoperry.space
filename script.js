// =====================
// Dark mode functionality
// =====================
const toggleBtn = document.querySelector('.toggle-btn');
const modeLabel = document.querySelector('.mode-label');
const body = document.body;

const savedMode = localStorage.getItem('darkMode');
if (savedMode === 'true') {
    body.classList.add('dark-mode');
    modeLabel.textContent = 'Dark';
}

toggleBtn.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    modeLabel.textContent = isDark ? 'Dark' : 'Light';
    localStorage.setItem('darkMode', isDark);
});


// =====================
// Particle system
// =====================
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
let mouse = { x: 0, y: 0 };

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
}

function initParticles() {
    particles = [];
    const count = Math.floor((canvas.width * canvas.height) / 8000);

    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            r: 2
        });
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = body.classList.contains('dark-mode') ? '#fff' : '#000';

    particles.forEach(p => {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const d = Math.sqrt(dx * dx + dy * dy);

        if (d < 100) {
            p.x -= dx / d * 3;
            p.y -= dy / d * 3;
        }

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
    });

    requestAnimationFrame(animate);
}

document.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
animate();


// =====================
// Page routing
// =====================
const mainPage = document.getElementById('mainPage');
const discordPage = document.getElementById('discordPage');
const backBtn = document.querySelector('.back-btn');
const pageButtons = document.querySelectorAll('[data-page="discordbot"]');

function showHome() {
    mainPage.classList.add('active');
    discordPage.classList.remove('active');
}

function showDiscord() {
    mainPage.classList.remove('active');
    discordPage.classList.add('active');
    setTimeout(() => initDiscordBot(), 0);
}

pageButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        showDiscord();
        history.pushState({ page: 'discordbot' }, '', '/discordbot');
    });
});

backBtn.addEventListener('click', () => {
    showHome();
    history.pushState({ page: 'home' }, '', '/');
});

window.addEventListener('popstate', e => {
    if (e.state?.page === 'discordbot') showDiscord();
    else showHome();
});

if (location.pathname === '/discordbot') showDiscord();
else showHome();


// =====================
// Discord bot logic (ISOLATED)
// =====================
let discordInitialized = false;

function initDiscordBot() {
    if (discordInitialized) return;
    discordInitialized = true;

    const chatMessages = document.getElementById('chatMessages');
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const WEBHOOK_URL = CONFIG.DISCORD_WEBHOOK_URL;

    if (!chatMessages || !messageInput || !sendBtn) return;

    // ===== ADDED: username input (no prompt, live change)
    function getUsername() {
        return localStorage.getItem('discordUsername') || 'Anonymous';
    }

    const usernameInput = document.getElementById('usernameSetting');
    if (usernameInput) {
        usernameInput.value = getUsername();
        usernameInput.addEventListener('input', () => {
            localStorage.setItem('discordUsername', usernameInput.value || 'Anonymous');
        });
    }
    // ===== END ADD

    function addMessage(author, text) {
        const div = document.createElement('div');
        const time = new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });

        div.className = 'chat-message sent';
        div.innerHTML = `
            <div class="chat-message-author">${author}</div>
            <div class="chat-message-text">${text}</div>
            <div class="chat-message-time">${time}</div>
        `;

        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async function sendMessage() {
        const text = messageInput.value.trim();
        if (!text) return;

        const username = getUsername();

        await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: text, username })
        }).catch(console.error);

        messageInput.value = '';
        addMessage(username, text);
    }

    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') sendMessage();
    });
}
