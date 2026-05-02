// INFONIONS - FINAL CLEAN VERSION (CMS + Dynamic Pulse)

let currentMode = 'pulse';

// Initialize
document.addEventListener('DOMContentLoaded', init);

function init() {
    setupModeSwitcher();
    loadPulse(); // 🔥 main loader
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

// 🔥 MAIN PULSE LOADER (FIXED)
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

// Render feed switch
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

// 🔥 RENDER CARD (FIXED)
function renderPulse(md) {
    const data = parseFrontmatter(md);

    if (!data.pulse) return;

    const feed = document.getElementById('pulseFeed');

    const card = document.createElement('div');
    card.className = 'pulse-card';

    const wordCount = data.pulse.split(' ').length;
    const category = (data.category || '').toLowerCase();

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
            <button class="action-btn" onclick="react('agree','${data.id}')">
                👍
            </button>
            <button class="action-btn" onclick="react('disagree','${data.id}')">
                👎
            </button>

            ${data.deepdive ? `
                <button class="action-btn" onclick="viewDeepDive('${data.deepdive}')">
                    🔍 Deep Dive →
                </button>
            ` : ""}
        </div>
    `;

    feed.appendChild(card);
}

// 🔥 PARSER (SAFE)
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

// 🔥 TEMP SIGNAL SYSTEM (LOCAL)
function react(type, id) {
    let data = JSON.parse(localStorage.getItem("signals") || "{}");

    if (!data[id]) data[id] = {};
    if (!data[id][type]) data[id][type] = 0;

    data[id][type]++;

    localStorage.setItem("signals", JSON.stringify(data));

    alert("Signal recorded 📡");
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
