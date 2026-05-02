// INFONIONS SIGNALS DASHBOARD (FINAL FIXED)

// INIT
document.addEventListener("DOMContentLoaded", () => {
    loadDashboard();

    // 🔥 AUTO REFRESH EVERY 2 SECONDS
    setInterval(() => {
        loadDashboard();
    }, 2000);
});

// ============================================
// MAIN LOAD
// ============================================

function loadDashboard() {
    const signals = JSON.parse(localStorage.getItem("signals") || "{}");

    renderSignals(signals);      // 🔥 NEW (important)
    loadTotalSignals(signals);
    loadActivityFeed();
    loadTrending(signals);
}

// ============================================
// 🔥 RENDER SIGNAL CARDS (MAIN SECTION)
// ============================================

function renderSignals(signals) {
    const container = document.getElementById("signals-container");
    if (!container) return;

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

// ============================================
// TOTAL SIGNALS
// ============================================

function loadTotalSignals(signals) {
    let total = 0;

    Object.values(signals).forEach(post => {
        Object.values(post).forEach(count => {
            total += count;
        });
    });

    const el = document.getElementById("totalSignals");
    if (el) el.innerText = total;
}

// ============================================
// ACTIVITY FEED (FIXED)
// ============================================

function loadActivityFeed() {
    const activity = JSON.parse(localStorage.getItem("activity") || "[]");
    const container = document.getElementById("activityFeed");

    if (!container) return;

    container.innerHTML = "";

    if (activity.length === 0) {
        container.innerHTML = "<p>No activity yet 🚀</p>";
        return;
    }

    activity.forEach(item => {
        const div = document.createElement("div");
        div.className = "activity-item";

        div.innerHTML = `
            <div style="font-size:18px;">${item.reaction || "📡"}</div>
            <div>
                <strong>${item.id || "Unknown"}</strong><br/>
                <small>${item.time || "just now"}</small>
            </div>
        `;

        container.appendChild(div);
    });
}

// ============================================
// TRENDING (FIXED)
// ============================================

function loadTrending(signals) {
    let ranking = [];

    Object.keys(signals).forEach(id => {
        let total = 0;

        Object.values(signals[id]).forEach(count => {
            total += count;
        });

        ranking.push({ id, total });
    });

    ranking.sort((a, b) => b.total - a.total);

    const container = document.getElementById("trendingList");
    if (!container) return;

    container.innerHTML = "";

    if (ranking.length === 0) {
        container.innerHTML = "<p>No trends yet 📊</p>";
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
