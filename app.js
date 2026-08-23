// Initial Characters Data
const initialCharacters = [
    {
        id: 'ciel',
        name: 'Ciel Phantomhive',
        status: 'Online',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        preview: 'Check the latest case report.',
        responses: [
            "A trivial matter, yet worth noting.",
            "Failure is not an option in the Phantomhive household.",
            "Order some Earl Grey tea immediately.",
            "Sebastian is currently handling the arrangements."
        ]
    },
    {
        id: 'subaru',
        name: 'Subaru Natsuki',
        status: 'Online',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        preview: 'Emilia-tan is amazing!',
        responses: [
            "I'll definitely change the future this time!",
            "Don't underestimate my resolve!",
            "Everything is going to be alright, trust me!",
            "Suffering? That's just part of the loop!"
        ]
    },
    {
        id: 'emilia',
        name: 'Emilia',
        status: 'Online',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        preview: 'Thank you for your help today.',
        responses: [
            "Puck is resting right now, but hello!",
            "Let's work together to make things right.",
            "Is everything alright? You look worried.",
            "Thank you so much!"
        ]
    },
    {
        id: 'sebastian',
        name: 'Sebastian Michaelis',
        status: 'Online',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        preview: 'I am simply one hell of a butler.',
        responses: [
            "Naturally. It is my duty as a butler.",
            "Would you care for a refreshment?",
            "Observing human behavior never ceases to amuse me.",
            "Allow me to take care of that for you."
        ]
    }
];

// App State
let characters = JSON.parse(localStorage.getItem('animechat_characters')) || initialCharacters;
let chatHistories = JSON.parse(localStorage.getItem('animechat_histories')) || {};
let activeCharId = null;
let currentCallType = null;
let callTimerInterval = null;
let callSeconds = 0;
let isMuted = false;
let isVideoOn = false;

// DOM Elements
const sidebar = document.getElementById('sidebar');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileCloseBtn = document.getElementById('mobileCloseBtn');
const contactList = document.getElementById('contactList');
const searchInput = document.getElementById('searchInput');
const activeAvatar = document.getElementById('activeAvatar');
const activeName = document.getElementById('activeName');
const activeStatus = document.getElementById('activeStatus');
const messageContainer = document.getElementById('messageContainer');
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');

// Call Modal Elements
const callModal = document.getElementById('callModal');
const callAvatar = document.getElementById('callAvatar');
const callName = document.getElementById('callName');
const callStatus = document.getElementById('callStatus');
const callTimer = document.getElementById('callTimer');
const audioCallBtn = document.getElementById('audioCallBtn');
const videoCallBtn = document.getElementById('videoCallBtn');
const muteBtn = document.getElementById('muteBtn');
const endCallBtn = document.getElementById('endCallBtn');
const videoToggleBtn = document.getElementById('videoToggleBtn');

// Initialize App
function init() {
    renderContacts();
    setupEventListeners();
}

// Render Contact List with Search Filter
function renderContacts(filter = '') {
    contactList.innerHTML = '';
    const filtered = characters.filter(c => c.name.toLowerCase().includes(filter.toLowerCase()));

    if (filtered.length === 0) {
        contactList.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--text-muted);">No characters found</div>`;
        return;
    }

    filtered.forEach(char => {
        const history = chatHistories[char.id] || [];
        const lastMsg = history.length > 0 ? history[history.length - 1].text : char.preview;
        const lastTime = history.length > 0 ? history[history.length - 1].time : '';

        const item = document.createElement('div');
        item.className = `contact-item ${activeCharId === char.id ? 'active' : ''}`;
        item.innerHTML = `
            <div class="avatar-container">
                <img src="${char.avatar}" alt="${char.name}">
                <span class="status-indicator"></span>
            </div>
            <div class="contact-info">
                <div class="contact-name-row">
                    <span class="contact-name">${char.name}</span>
                    <span class="contact-time">${lastTime}</span>
                </div>
                <div class="contact-preview">${lastMsg}</div>
            </div>
        `;
        item.addEventListener('click', () => {
            selectCharacter(char.id);
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('mobile-open');
            }
        });
        contactList.appendChild(item);
    });
}

// Select Active Character
function selectCharacter(id) {
    activeCharId = id;
    const char = characters.find(c => c.id === id);
    if (!char) return;

    activeAvatar.src = char.avatar;
    activeName.textContent = char.name;
    activeStatus.textContent = char.status;

    messageInput.disabled = false;
    sendBtn.disabled = false;
    messageInput.focus();

    renderContacts(searchInput.value);
    renderMessages();
}

// Render Messages for Active Chat
function renderMessages() {
    messageContainer.innerHTML = '';
    if (!activeCharId) return;

    const history = chatHistories[activeCharId] || [];
    if (history.length === 0) {
        messageContainer.innerHTML = `
            <div class="empty-chat-state">
                <i class="fa-regular fa-comment-dots"></i>
                <p>Say hello to start the conversation!</p>
            </div>
        `;
        return;
    }

    history.forEach(msg => {
        const div = document.createElement('div');
        div.className = `message ${msg.sender}`;
        div.innerHTML = `
            ${msg.text}
            <span class="message-time">${msg.time}</span>
        `;
        messageContainer.appendChild(div);
    });
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

// Send Message & Trigger AI Response
function handleSendMessage(e) {
    e.preventDefault();
    const text = messageInput.value.trim();
    if (!text || !activeCharId) return;

    const timeStr = getCurrentTime();

    // Push User Message
    if (!chatHistories[activeCharId]) chatHistories[activeCharId] = [];
    chatHistories[activeCharId].push({ sender: 'sent', text, time: timeStr });
    
    messageInput.value = '';
    saveData();
    renderMessages();
    renderContacts(searchInput.value);

    // Simulate Character AI Response
    setTimeout(() => {
        const char = characters.find(c => c.id === activeCharId);
        const randomResp = char.responses[Math.floor(Math.random() * char.responses.length)];
        
        chatHistories[activeCharId].push({ sender: 'received', text: randomResp, time: getCurrentTime() });
        saveData();
        renderMessages();
        renderContacts(searchInput.value);
    }, 1000);
}

// Call Feature Handlers
function startCall(type) {
    if (!activeCharId) return;
    currentCallType = type;
    const char = characters.find(c => c.id === activeCharId);

    callAvatar.src = char.avatar;
    callName.textContent = char.name;
    callStatus.textContent = type === 'audio' ? 'Calling audio...' : 'Calling video...';
    callTimer.textContent = '00:00';
    callModal.classList.add('active');

    videoToggleBtn.style.display = type === 'video' ? 'flex' : 'none';
    callSeconds = 0;

    // Simulate connecting after 2 seconds
    setTimeout(() => {
        if (!callModal.classList.contains('active')) return;
        callStatus.textContent = 'Connected';
        startTimer();
    }, 2000);
}

function endCall() {
    callModal.classList.remove('active');
    clearInterval(callTimerInterval);
    isMuted = false;
    isVideoOn = false;
    muteBtn.classList.remove('muted');
}

function startTimer() {
    clearInterval(callTimerInterval);
    callTimerInterval = setInterval(() => {
        callSeconds++;
        const mins = String(Math.floor(callSeconds / 60)).padStart(2, '0');
        const secs = String(callSeconds % 60).padStart(2, '0');
        callTimer.textContent = `${mins}:${secs}`;
    }, 1000);
}

// Utility Helpers
function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function saveData() {
    localStorage.setItem('animechat_histories', JSON.stringify(chatHistories));
}

// Event Listeners Setup
function setupEventListeners() {
    messageForm.addEventListener('submit', handleSendMessage);
    
    searchInput.addEventListener('input', (e) => {
        renderContacts(e.target.value);
    });

    mobileMenuBtn.addEventListener('click', () => sidebar.classList.add('mobile-open'));
    mobileCloseBtn.addEventListener('click', () => sidebar.classList.remove('mobile-open'));

    audioCallBtn.addEventListener('click', () => startCall('audio'));
    videoCallBtn.addEventListener('click', () => endCall && startCall('video'));
    endCallBtn.addEventListener('click', endCall);

    muteBtn.addEventListener('click', () => {
        isMuted = !isMuted;
        muteBtn.classList.toggle('muted', isMuted);
        muteBtn.querySelector('i').className = isMuted ? 'fa-solid fa-microphone-slash' : 'fa-solid fa-microphone';
    });

    videoToggleBtn.addEventListener('click', () => {
        isVideoOn = !isVideoOn;
        videoToggleBtn.classList.toggle('active', isVideoOn);
        videoToggleBtn.querySelector('i').className = isVideoOn ? 'fa-solid fa-video-slash' : 'fa-solid fa-video';
    });
}

// Run on Load
init();
