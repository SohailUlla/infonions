// INFONIONS SIGNALS DASHBOARD (REAL DATA - FINAL)

// INIT
document.addEventListener("DOMContentLoaded", () => {
    loadDashboard();
});

// ============================================
// LOAD EVERYTHING
// ============================================

function loadDashboard() {
    loadTotalSignals();
    loadActivityFeed();
    loadTrending();
}

// ============================================
// TOTAL SIGNALS
// ============================================

function loadTotalSignals() {
    const signals = JSON.parse(localStorage.getItem("signals") || "{}");

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
// ACTIVITY FEED (REAL USER ACTIONS)
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
            <div style="font-size:20px;">${item.reaction}</div>
            <div>
                <strong>${item.id}</strong><br/>
                <small>${item.time}</small>
            </div>
        `;

        container.appendChild(div);
    });
}

// ============================================
// TRENDING POSTS (TOP SIGNALS)
// ============================================

function loadTrending() {
    const signals = JSON.parse(localStorage.getItem("signals") || "{}");

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
