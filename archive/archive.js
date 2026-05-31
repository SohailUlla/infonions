let allArticles = [];

document.addEventListener("DOMContentLoaded", () => {
    loadArchive();

    document
        .getElementById("searchInput")
        .addEventListener("input", searchArticles);
});

// ============================================
// LOAD ARCHIVE
// ============================================
async function loadArchive() {

    const container =
        document.getElementById("archiveList");

    container.innerHTML = "Loading...";

    try {

        allArticles = [];

        // =========================
        // LOAD PULSE
        // =========================
        const pulseRes = await fetch(
            "https://api.github.com/repos/SohailUlla/infonions/contents/content/pulse"
        );

        const pulseFiles = await pulseRes.json();

        if (!Array.isArray(pulseFiles)) {
            throw new Error("Pulse folder not found");
        }

        for (const file of pulseFiles) {

            if (!file.name.endsWith(".md")) continue;

            const raw = await fetch(file.download_url);
            const md = await raw.text();

            const data = parseFrontmatter(md);

            data.contentType = "Pulse";

            allArticles.push(data);
        }

        // =========================
        // LOAD DEEP DIVE
        // =========================
        const deepRes = await fetch(
            "https://api.github.com/repos/SohailUlla/infonions/contents/content/deepdive"
        );

        const deepFiles = await deepRes.json();

        if (!Array.isArray(deepFiles)) {
            throw new Error("Deep Dive folder not found");
        }

        for (const file of deepFiles) {

            if (!file.name.endsWith(".md")) continue;

            const raw = await fetch(file.download_url);
            const md = await raw.text();

            const data = parseFrontmatter(md);

            data.contentType = "Deep Dive";

            allArticles.push(data);
        }

        renderArticles(allArticles);

    } catch (err) {

        console.error(err);

        container.innerHTML = `
            <div style="padding:30px;color:#ff6b6b;">
                Failed to load archive
            </div>
        `;
    }
}

// ============================================
// RENDER ARTICLES
// ============================================
function renderArticles(data) {

    const container =
        document.getElementById("archiveList");

    container.innerHTML = "";

    if (data.length === 0) {

        container.innerHTML = `
            <div class="archive-item">
                No articles found 🔍
            </div>
        `;

        return;
    }

    [...data].reverse().forEach(item => {

        const title =
            item.pulse ||
            item.title ||
            item.headline ||
            item.summary ||
            "Untitled";

        container.innerHTML += `
            <div class="archive-item">

                <div class="archive-category">
                    ${item.category || "general"}
                </div>

                <div style="
                    color:#00ff88;
                    margin-bottom:10px;
                    font-size:13px;
                    font-weight:600;
                ">
                    ${item.contentType}
                </div>

                <div class="archive-title">
                    ${title}
                </div>

            </div>
        `;
    });
}

// ============================================
// SEARCH
// ============================================
function searchArticles() {

    const q =
        document
        .getElementById("searchInput")
        .value
        .toLowerCase();

    const filtered = allArticles.filter(item => {

        return (
            (
                (item.pulse || "") +
                " " +
                (item.title || "") +
                " " +
                (item.summary || "") +
                " " +
                (item.content || "") +
                " " +
                (item.category || "") +
                " " +
                (item.contentType || "")
            )
            .toLowerCase()
            .includes(q)
        );
    });

    renderArticles(filtered);
}

// ============================================
// FRONTMATTER PARSER
// ============================================
function parseFrontmatter(md) {

    const match =
        md.match(/---([\s\S]*?)---/);

    if (!match) return {};

    let data = {};

    match[1].split("\n").forEach(line => {

        if (!line.includes(":")) return;

        const i = line.indexOf(":");

        const key =
            line.slice(0, i)
            .trim()
            .toLowerCase();

        const value =
            line.slice(i + 1)
            .trim();

        data[key] = value;
    });

    return data;
}
