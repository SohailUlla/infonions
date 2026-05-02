// INFONIONS - FINAL VERSION (CMS + MULTI SIGNALS)

let currentMode = 'pulse';

// Initialize
document.addEventListener('DOMContentLoaded', init);

function init() {
    setupModeSwitcher();
    loadPulse();
}

// Mode Switcher
function setupModeSwitcher() {
    const buttons = document.querySelectorAll('.mode-btn');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            currentMode = btn.dataset.mode;
            renderFeed();
        });
    });
}

// 🔥 LOAD PULSE FROM GITHUB
async function loadPulse() {
    const container = document.getElementById('feedContainer');

    container.innerHTML = loadingUI();

    try {
        const res = await fetch("https://api.github.com/repos/SohailUlla/infonions/contents/content/pulse");
        const files = await res.json();

        container.innerHTML = `<div class="pulse-feed" id="pulseFeed"></div>`;

        for (let file of files) {
            if (!file.name.endsWith(".md")) continue;

            const raw = await fetch(file.download_url);
            const md = await raw.text();

            renderPulse(md);
        }

    } catch (err) {
        console.error(err);
        container.innerHTML = "⚠️ Failed to load Pulse";
    }
}

// Render Feed
function renderFeed() {
    if (currentMode === 'pulse') {
        loadPulse();
    } else {
        document.getElementById('feedContainer').innerHTML = `
            <div style="padding:50px;text-align:center;">
                Deep Dive coming soon 🚀
            </div>
        `;
    }
}

// 🔥 RENDER CARD
function renderPulse(md) {
    const data = parseFrontmatter(md);

    if (!data.pulse) return;

    const feed = document.getElementById('pulseFeed');

    const card = document.createElement('div');
    card.className = 'pulse-card';

    const wordCount = data.pulse.split(' ').length;
    const category = (data.category || '').toLowerCase();

    // ⚠️ IMPORTANT: ensure ID exists
    const id = data.id || data.pulse.slice(0, 30).replace(/\s+/g, '-').toLowerCase();

    card.innerHTML = `
        <div class="card-category category-${category}">
            ${data.category || ""}
        </div>
        
        <div class="pulse-content">${data.pulse}</div>
        
        <div class="pulse-meta">
            <span class="word-count">${wordCount} words</span>
            <span>${data.time || "Just now"}</span>
        </div>
        
        <div class="action-bar">
            ${renderSignals(id)}
        </div>
    `;

    feed.appendChild(card);
}

// 🔥 MULTI SIGNAL BUTTONS
function renderSignals(id) {
    const reactions = ["👍", "👎", "🔥", "😡", "😂", "🤯"];

    return reactions.map(r => `
        <button class="action-btn" onclick="event.stopPropagation(); sendSignal('${id}', '${r}')">
            ${r}
        </button>
    `).join('');
}

// 🔥 SIGNAL STORAGE
function sendSignal(id, type) {
    let signals = JSON.parse(localStorage.getItem("signals")) || {};

    if (!signals[id]) {
        signals[id] = {};
    }

    signals[id][type] = (signals[id][type] || 0) + 1;

    localStorage.setItem("signals", JSON.stringify(signals));

    alert(`Signal ${type} recorded 📡`);
}

// 🔥 FRONTMATTER PARSER
function parseFrontmatter(md) {
    const match = md.match(/---([\s\S]*?)---/);
    if (!match) return {};

    let data = {};

    match[1].split("\n").forEach(line => {
        if (!line.includes(":")) return;

        const index = line.indexOf(":");
        const key = line.slice(0, index).trim().toLowerCase();
        const value = line.slice(index + 1).trim();

        data[key] = value;
    });

    return data;
}

// 🔥 DEEP DIVE LINK
function viewDeepDive(slug) {
    window.location.href = `/deep.html?slug=${slug}`;
}

// UI Loader
function loadingUI() {
    return `
        <div class="loading">
            <div class="loading-spinner"></div>
            <p>Loading signals...</p>
        </div>
    `;
}
