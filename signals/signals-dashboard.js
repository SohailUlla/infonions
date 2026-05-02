// INFONIONS SIGNALS DASHBOARD (FINAL + SYNCED WITH CMS)

// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    loadDashboard();

    // 🔥 AUTO REFRESH
    setInterval(loadDashboard, 3000);
});

// ===============================
// MAIN LOAD
// ===============================
async function loadDashboard() {
    const signals = safeParse("signals", {});
    const activity = safeParse("activity", []);

    // 🔥 GET VALID IDS FROM CMS
    const validIds = await getValidPulseIds();

    // 🔥 FILTER DELETED CONTENT
    const filteredSignals = {};
    Object.keys(signals).forEach(id => {
        if (validIds.includes(id)) {
            filteredSignals[id] = signals[id];
        }
    });

    // OPTIONAL: CLEAN STORAGE
    localStorage.setItem("signals", JSON.stringify(filteredSignals));

    renderSignals(filteredSignals);
    loadTotalSignals(filteredSignals);
    loadActivityFeed(activity);
    loadTrending(filteredSignals);
}

// ===============================
// GET VALID PULSE IDS (FROM GITHUB)
// ===============================
async function getValidPulseIds() {
    try {
        const res = await fetch("https://api.github.com/repos/SohailUlla/infonions/contents/content/pulse");
        const files = await res.json();

        let ids = [];

        for (let file of files) {
            if (!file.name.endsWith(".md")) continue;

            const raw = await fetch(file.download_url);
            const md = await raw.text();

            const data = parseFrontmatter(md);
            if (data.id) ids.push(data.id);
        }

        return ids;
    } catch (err) {
        console.error("Error fetching pulse IDs", err);
        return [];
    }
}

// ===============================
// FRONTMATTER PARSER
// ===============================
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

// ===============================
// SAFE PARSE
// ===============================
function safeParse(key, fallback) {
    try {
        return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch {
        return fallback;
    }
}

// ===============================
// RENDER SIGNAL CARDS
// ===============================
function renderSignals(signals) {
    const container = document.getElementById("signals-container");
    if (!container) return;

    const currentData = JSON.stringify(signals);
    if (container.dataset.rendered === currentData) return;

    container.dataset.rendered = currentData;
    container.innerHTML = "";

    if (Object.keys(signals).length === 0) {
        container.innerHTML = `<div class="empty-state">No signals yet 🚀</div>`;
        return;
    }

    Object.entries(signals).forEach(([id, reactions]) => {
        const card = document.createElement("div");
        card.className = "signal-card";

        const reactionsHTML = Object.entries(reactions)
            .map(([emoji, count]) => `<span>${emoji} ${count}</span>`)
            .join(" &nbsp; ");

        card.innerHTML = `
            <div class="signal-title">${id}</div>
            <div class="signal-pulse">${reactionsHTML}</div>
        `;

        container.appendChild(card);
    });
}

// ===============================
// TOTAL SIGNALS
// ===============================
function loadTotalSignals(signals) {
    let total = 0;

    Object.values(signals).forEach(post => {
        Object.values(post).forEach(count => {
            total += count;
        });
    });

    const el = document.getElementById("totalSignals");
    if (!el) return;

    animateNumber(el, total);
}

function animateNumber(el, target) {
    const current = parseInt(el.innerText) || 0;
    if (current === target) return;

    let start = current;
    const step = Math.ceil((target - current) / 10);

    const interval = setInterval(() => {
        start += step;

        if (start >= target) {
            start = target;
            clearInterval(interval);
        }

        el.innerText = start;
    }, 50);
}

// ===============================
// ACTIVITY FEED
// ===============================
function loadActivityFeed(activity) {
    const container = document.getElementById("activityFeed");
    if (!container) return;

    container.innerHTML = "";

    if (activity.length === 0) {
        container.innerHTML = `<div class="empty-state">No activity yet 🚀</div>`;
        return;
    }

    activity.forEach(item => {
        const div = document.createElement("div");
        div.className = "activity-item";
        div.style.opacity = "0";

        div.innerHTML = `
            <div style="font-size:18px;">${item.reaction || "📡"}</div>
            <div>
                <strong>${item.id || "Unknown"}</strong><br/>
                <small>${item.time || "just now"}</small>
            </div>
        `;

        container.appendChild(div);

        setTimeout(() => {
            div.style.opacity = "1";
        }, 50);
    });
}

// ===============================
// TRENDING
// ===============================
function loadTrending(signals) {
    const container = document.getElementById("trendingList");
    if (!container) return;

    let ranking = [];

    Object.keys(signals).forEach(id => {
        let total = Object.values(signals[id]).reduce((a, b) => a + b, 0);
        ranking.push({ id, total });
    });

    ranking.sort((a, b) => b.total - a.total);

    container.innerHTML = "";

    if (ranking.length === 0) {
        container.innerHTML = `<div class="empty-state">No trends yet 📊</div>`;
        return;
    }

    ranking.slice(0, 5).forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "trend-item";

        div.innerHTML = `
            <strong>#${index + 1}</strong>
            <span>${item.id}</span>
            <span>🔥 ${item.total}</span>
        `;

        container.appendChild(div);
    });
}
