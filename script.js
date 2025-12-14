// Dark mode functionality
const toggleBtn = document.querySelector('.toggle-btn');
const modeLabel = document.querySelector('.mode-label');
const body = document.body;

// Load saved preference
const savedMode = localStorage.getItem('darkMode');
if (savedMode === 'true') {
    body.classList.add('dark-mode');
    modeLabel.textContent = 'Dark';
}

// Toggle dark mode
toggleBtn.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    modeLabel.textContent = isDark ? 'Dark' : 'Light';
    localStorage.setItem('darkMode', isDark);
});

// Particle system
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
    const particleCount = Math.floor((canvas.width * canvas.height) / 8000);
    
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            radius: 2
        });
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const isDark = body.classList.contains('dark-mode');
    ctx.fillStyle = isDark ? '#ffffff' : '#000000';
    
    particles.forEach(particle => {
        const dx = mouse.x - particle.x;
        const dy = mouse.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const repelRadius = 100;

        if (distance < repelRadius) {
            const force = (repelRadius - distance) / repelRadius;
            particle.x -= (dx / distance) * force * 3;
            particle.y -= (dy / distance) * force * 3;
        }

        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        particle.y = Math.max(0, Math.min(canvas.height, particle.y));

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
    });

    requestAnimationFrame(animate);
}

// Mouse tracking
document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

// Initialize
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
animate();

// Page Navigation
const pageButtons = document.querySelectorAll('.page-btn');
const backBtn = document.querySelector('.back-btn');
const mainPage = document.getElementById('mainPage');
const discordPage = document.getElementById('discordPage');

pageButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const page = btn.getAttribute('data-page');
        if (page === 'discordbot') {
            mainPage.classList.remove('active');
            discordPage.classList.add('active');
            window.history.pushState({page: 'discordbot'}, '', '/discordbot');
        }
    });
});

backBtn.addEventListener('click', () => {
    discordPage.classList.remove('active');
    mainPage.classList.add('active');
    window.history.pushState({page: 'home'}, '', '/');
});

// Handle browser back/forward
window.addEventListener('popstate', (e) => {
    if (e.state && e.state.page === 'discordbot') {
        mainPage.classList.remove('active');
        discordPage.classList.add('active');
    } else {
        discordPage.classList.remove('active');
        mainPage.classList.add('active');
    }
});

// Check initial URL
if (window.location.pathname.includes('discordbot')) {
    mainPage.classList.remove('active');
    discordPage.classList.add('active');
}

// Discord Chat Functionality
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');

// IMPORTANT: Replace this with your actual Discord webhook URL
const WEBHOOK_URL = CONFIG.DISCORD_WEBHOOK_URL;

// Poll for new messages every 2 seconds
let lastMessageId = null;

async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    const username = localStorage.getItem('discordUsername') || promptForUsername();
    
    try {
        // Send to Discord webhook
        await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: message,
                username: username
            })
        });

        messageInput.value = '';
        
        // Add message to UI immediately
        addMessageToUI(username, message, true);
        
    } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message. Check your webhook URL.');
    }
}

function promptForUsername() {
    const username = prompt('Enter your display name:') || 'Anonymous';
    localStorage.setItem('discordUsername', username);
    return username;
}

function addMessageToUI(author, text, isSent = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${isSent ? 'sent' : ''}`;
    
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `
        <div class="chat-message-author">${author}</div>
        <div class="chat-message-text">${text}</div>
        <div class="chat-message-time">${timeStr}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
