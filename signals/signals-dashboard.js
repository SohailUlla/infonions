// INFONIONS SIGNALS DASHBOARD (FINAL STABLE + LIVE)

// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    loadDashboard();

    // 🔥 AUTO REFRESH EVERY 2s (no flicker)
    setInterval(loadDashboard, 2000);
});

// ===============================
// MAIN LOAD
// ===============================
function loadDashboard() {
    const signals = safeParse("signals", {});
    const activity = safeParse("activity", []);

    renderSignals(signals);
    loadTotalSignals(signals);
    loadActivityFeed(activity);
    loadTrending(signals);
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
// 🔥 RENDER SIGNAL CARDS
// ===============================
function renderSignals(signals) {
    const container = document.getElementById("signals-container");
    if (!container) return;

    // avoid unnecessary re-render flicker
    if (container.dataset.rendered === JSON.stringify(signals)) return;
    container.dataset.rendered = JSON.stringify(signals);

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
// TOTAL SIGNALS (ANIMATED)
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
// ACTIVITY FEED (SMOOTH)
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

        // fade-in animation
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
