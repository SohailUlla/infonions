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
// LOAD DEEP DIVE FROM GITHUB
// ===============================
async function loadDeepDive() {

    const container = document.getElementById("feedContainer");
    if (!container) return;

    container.innerHTML = loadingUI();

    try {

        const res = await fetch(
            "https://api.github.com/repos/SohailUlla/infonions/contents/content/deepdive"
        );

        const files = await res.json();

        container.innerHTML = `<div class="pulse-feed" id="pulseFeed"></div>`;

        for (const file of files) {

            if (!file.name.endsWith(".md")) continue;

            const raw = await fetch(file.download_url);
            const md = await raw.text();

            renderDeepDive(md, file.name);
        }

    } catch (err) {

        console.error(err);
        container.innerHTML = "⚠️ Failed to load Deep Dive";

    }
}
// ===============================
// RENDER SWITCH
// ===============================
function renderFeed() {
    if (currentMode === "pulse") {
        loadPulse();
    } else {
        loadDeepDive();
    }
}

// ===============================
// RENDER CARD
// ===============================
// Render PULSE mode (short format cards)
// Pulse stories are publicly visible for 24 hours only.
function renderPulseFeed() {
    const feed = document.getElementById('pulseFeed');

    const now = Date.now();

    // Only show Pulse stories published within the last 24 hours
    const activePulse = newsData.filter(item => {
        if (!item.date) return false;

        const publishedAt = new Date(item.date).getTime();

        if (Number.isNaN(publishedAt)) return false;

        const age = now - publishedAt;

        return age >= 0 && age < 24 * 60 * 60 * 1000;
    });

    // Newest Pulse stories first
    activePulse.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });

    if (activePulse.length === 0) {
        feed.innerHTML = `
            <div class="loading">
                <p>No fresh Pulse stories right now.</p>
            </div>
        `;
        return;
    }

    activePulse.forEach(item => {
        const card = document.createElement('div');

        card.className = 'pulse-card';

        card.onclick = () => viewDeepDive(item.id);

        const wordCount = item.pulse.trim().split(/\s+/).length;

        const publishedAt = new Date(item.date);
        const ageMs = now - publishedAt.getTime();
        const ageMinutes = Math.floor(ageMs / 60000);

        let timeText;

        if (ageMinutes < 1) {
            timeText = 'JUST NOW';
        } else if (ageMinutes < 60) {
            timeText = `${ageMinutes}m AGO`;
        } else {
            const ageHours = Math.floor(ageMinutes / 60);
            timeText = `${ageHours}h AGO`;
        }

        card.innerHTML = `
            <div class="card-category category-${item.category}">
                ${item.category}
            </div>

            <div class="pulse-content">
                ${item.pulse}
            </div>

            <div class="pulse-meta">
                <span class="word-count">
                    ${wordCount} WORDS
                </span>

                <span>
                    ${timeText}
                </span>
            </div>

            <div class="action-bar">

                <button
                    class="action-btn"
                    onclick="event.stopPropagation(); signal('${item.id}')">
                    📡 Signal
                </button>

                <button
                    class="action-btn"
                    onclick="event.stopPropagation(); shareItem('${item.id}')">
                    🔗 Share
                </button>

                ${item.deepdive ? `
                    <button
                        class="action-btn"
                        style="margin-left:auto;
                               border-color:var(--electric-blue);
                               color:var(--electric-blue);">
                        🔍 Deep Dive →
                    </button>
                ` : ''}

            </div>
        `;

        feed.appendChild(card);
    });
}
// ===============================
// RENDER DEEP DIVE
// ===============================

function renderDeepDive(md, fileName) {

    const data = parseFrontmatter(md);

    const feed = document.getElementById("pulseFeed");
    if (!feed) return;

const card = document.createElement("div");
card.className = "pulse-card";

card.style.cursor = "pointer";

card.onclick = () => {
    window.location.href = `/article.html?file=${encodeURIComponent(fileName)}`;
};

    const title = data.title || "Untitled";
    const excerpt = data.excerpt || "";
    const category = (data.category || "").toLowerCase();

    const id = title.replace(/\s+/g, "-").toLowerCase();

    const date = data.date
        ? new Date(data.date).toLocaleDateString()
        : "";

    card.innerHTML = `
        <div class="card-category category-${category}">
            ${data.category || ""}
        </div>

        <h2>${title}</h2>

        <div class="pulse-content">
            ${excerpt}
        </div>

        <div class="pulse-meta">
            <span>${data.author || "Infonions"}</span>
            <span>${date}</span>
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

    // unique user vote key
    const voteKey = `voted_${id}`;

    // check already voted
    if (localStorage.getItem(voteKey)) {
        alert("You already reacted to this signal 📡");
        return;
    }

    let signals = JSON.parse(localStorage.getItem("signals") || "{}");
    let activity = JSON.parse(localStorage.getItem("activity") || "[]");

    // create post if not exists
    if (!signals[id]) {
        signals[id] = {};
    }

    // count reaction
    signals[id][type] = (signals[id][type] || 0) + 1;

    // save activity
    activity.unshift({
        id: id,
        reaction: type,
        time: new Date().toLocaleTimeString()
    });

    // keep latest 50
    activity = activity.slice(0, 50);

    // save data
    localStorage.setItem("signals", JSON.stringify(signals));
    localStorage.setItem("activity", JSON.stringify(activity));

    // 🔥 IMPORTANT
    // mark user voted
    localStorage.setItem(voteKey, type);

    alert(`Signal ${type} recorded 📡`);
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
setInterval(() => {

    if (currentMode === 'pulse') {
        renderFeed();
    }

}, 60 * 1000);
