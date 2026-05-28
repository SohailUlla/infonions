// INFONIONS - FINAL VERSION (STABLE + CLEAN + ACTIVITY)

let currentMode = 'pulse';

// INIT
document.addEventListener('DOMContentLoaded', init);

function init() {
    setupModeSwitcher();
    loadPulse();
}

// ===============================
// MODE SWITCH
// ===============================
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

// ===============================
// LOAD PULSE FROM GITHUB
// ===============================
async function loadPulse() {
    const container = document.getElementById('feedContainer');
    if (!container) return;

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

// ===============================
// RENDER SWITCH
// ===============================
function renderFeed() {
    if (currentMode === 'pulse') {
        loadPulse();
    } else {
        const container = document.getElementById('feedContainer');
        if (!container) return;

        container.innerHTML = `
            <div style="padding:50px;text-align:center;">
                Deep Dive coming soon 🚀
            </div>
        `;
    }
}

// ===============================
// RENDER CARD
// ===============================
function renderPulse(md) {
    const data = parseFrontmatter(md);
    if (!data.pulse) return;

    const feed = document.getElementById('pulseFeed');
    if (!feed) return;

    const card = document.createElement('div');
    card.className = 'pulse-card';

    const wordCount = (data.pulse || "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean).length;
    const category = (data.category || '').toLowerCase();

    const id =
        data.id ||
        data.pulse.slice(0, 30).replace(/\s+/g, '-').toLowerCase();

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

// ===============================
// SIGNAL BUTTONS
// ===============================
function renderSignals(id) {
    const reactions = ["👍", "👎", "🔥", "😡", "😂", "🤯"];

    return reactions.map(r => `
        <button class="action-btn"
            onclick="event.stopPropagation(); sendSignal('${id}', '${r}')">
            ${r}
        </button>
    `).join('');
}

// ===============================
// 🔥 SIGNAL + ACTIVITY SYSTEM
// ===============================
function sendSignal(id, type) {
    let signals = safeParse("signals", {});
    let activity = safeParse("activity", []);

    // ===== COUNT SIGNAL =====
    if (!signals[id]) signals[id] = {};
    signals[id][type] = (signals[id][type] || 0) + 1;

    // ===== ACTIVITY LOG =====
    activity.unshift({
        id: id,
        reaction: type,
        time: formatTime()
    });

    // keep last 20 only (clean UI)
    activity = activity.slice(0, 20);

    localStorage.setItem("signals", JSON.stringify(signals));
    localStorage.setItem("activity", JSON.stringify(activity));

    // 🔥 smooth UX instead of alert
    showToast(`Signal ${type} recorded`);
}

// ===============================
// SAFE JSON PARSE
// ===============================
function safeParse(key, fallback) {
    try {
        return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch {
        return fallback;
    }
}

// ===============================
// TIME FORMATTER
// ===============================
function formatTime() {
    return new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ===============================
// TOAST (NO ALERT)
// ===============================
function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerText = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 2000);
}

// ===============================
// FRONTMATTER PARSER
// ===============================
function parseFrontmatter(md) {
    const match = md.match(/---([\s\S]*?)---/);

    if (!match) return {};

    const yaml = match[1];
    const data = {};

    let currentKey = null;

    yaml.split("\n").forEach(line => {

        // new key:value line
        if (/^\w+:/i.test(line)) {

            const index = line.indexOf(":");

            currentKey = line.slice(0, index)
                .trim()
                .toLowerCase();

            data[currentKey] = line
                .slice(index + 1)
                .trim();

        }

        // multiline continuation
        else if (currentKey && line.trim()) {

            data[currentKey] += " " + line.trim();

        }

    });

    return data;
}

// ===============================
// DEEP DIVE
// ===============================
function viewDeepDive(slug) {
    window.location.href = `/deep.html?slug=${slug}`;
}

// ===============================
// LOADING UI
// ===============================
function loadingUI() {
    return `
        <div class="loading">
            <div class="loading-spinner"></div>
            <p>Loading signals...</p>
        </div>
    `;
}
