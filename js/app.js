// ===============================
// INFONIONS HOMEPAGE APP
// Pulse + Deep Dive loader
// Pulse stories are visible for 24 hours only.
// ===============================

let currentMode = "pulse";

// INIT
document.addEventListener("DOMContentLoaded", init);

function init() {
    setupModeSwitcher();
    loadPulse();
}

// ===============================
// MODE SWITCH
// ===============================
function setupModeSwitcher() {
    const buttons = document.querySelectorAll(".mode-btn");

    buttons.forEach(btn => {
        btn.addEventListener("click", () => {

            buttons.forEach(b => b.classList.remove("active"));

            btn.classList.add("active");

            currentMode = btn.dataset.mode;

            if (currentMode === "pulse") {
                loadPulse();
            } else {
                loadDeepDive();
            }
        });
    });
}

// ===============================
// LOAD PULSE FROM GITHUB
// ===============================
async function loadPulse() {

    const container = document.getElementById("feedContainer");

    if (!container) return;

    container.innerHTML = loadingUI();

    try {

        const res = await fetch(
            "https://api.github.com/repos/SohailUlla/infonions/contents/content/pulse",
            {
                cache: "no-store"
            }
        );

        if (!res.ok) {
            throw new Error(
                `GitHub Pulse API error: ${res.status}`
            );
        }

        const files = await res.json();

        if (!Array.isArray(files)) {
            throw new Error(
                "GitHub did not return a Pulse file list."
            );
        }

        const articles = [];

        for (const file of files) {

            if (!file.name.endsWith(".md")) {
                continue;
            }

            const raw = await fetch(
                file.download_url,
                {
                    cache: "no-store"
                }
            );

            if (!raw.ok) {
                continue;
            }

            const md = await raw.text();

            const data = parseFrontmatter(md);

            // Pulse must have a valid date
            if (!data.date) {
                continue;
            }

            const publishedAt =
                new Date(data.date).getTime();

            if (Number.isNaN(publishedAt)) {
                continue;
            }

            const age =
                Date.now() - publishedAt;

            // ===============================
            // 24 HOUR PULSE RULE
            // ===============================

            const twentyFourHours =
                24 * 60 * 60 * 1000;

            // Future-dated stories are ignored.
            // Stories 24 hours or older are ignored.
            if (
                age < 0 ||
                age >= twentyFourHours
            ) {
                continue;
            }

            // Do not show drafts
            if (
                data.status &&
                data.status.toLowerCase() !== "published"
            ) {
                continue;
            }

            articles.push({
                ...data,
                fileName: file.name
            });
        }

        renderPulseFeed(articles);

    } catch (err) {

        console.error(
            "Pulse loading failed:",
            err
        );

        container.innerHTML = `
            <div class="loading">
                <p>⚠️ Failed to load Pulse</p>
            </div>
        `;
    }
}


// ===============================
// RENDER PULSE FEED
// ===============================
function renderPulseFeed(articles) {

    const container =
        document.getElementById("feedContainer");

    if (!container) return;

    container.innerHTML = `
        <div class="pulse-feed" id="pulseFeed"></div>
    `;

    const feed =
        document.getElementById("pulseFeed");

    if (!articles.length) {

        feed.innerHTML = `
            <div class="loading">
                <p>No fresh Pulse stories right now.</p>
            </div>
        `;

        return;
    }

    // Newest stories first
    articles.sort((a, b) => {

        return (
            new Date(b.date).getTime() -
            new Date(a.date).getTime()
        );

    });

    articles.forEach(item => {

        renderPulse(item);

    });
}


// ===============================
// RENDER ONE PULSE CARD
// ===============================
function renderPulse(item) {

    const feed =
        document.getElementById("pulseFeed");

    if (!feed) return;

    const card =
        document.createElement("div");

    card.className = "pulse-card";

    // ===============================
    // CATEGORY
    // ===============================

    const category =
        item.category || "news";

    const categoryClass =
        category
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, "-");

    // ===============================
    // CONTENT
    // ===============================

    const pulseText =
        item.pulse || "";

    const wordCount =
        pulseText.trim()
            ? pulseText.trim().split(/\s+/).length
            : 0;

    const timeText =
        formatAge(item.date);

    // ===============================
    // CARD CLICK
    // ===============================

    card.onclick = () => {

        if (item.deepDiveId) {

            viewDeepDive(
                item.deepDiveId
            );

        } else if (item.id) {

            viewDeepDive(
                item.id
            );

        }

    };

    // ===============================
    // CARD HTML
    // ===============================

    card.innerHTML = `

        <div class="card-category category-${categoryClass}">
            ${escapeHTML(category)}
        </div>

        <div class="pulse-content">
            ${escapeHTML(pulseText)}
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
                onclick="
                    event.stopPropagation();
                    sendSignal(
                        '${escapeJS(item.id || item.fileName)}',
                        '📡'
                    )
                "
            >
                📡 Signal
            </button>

            <button
                class="action-btn"
                onclick="
                    event.stopPropagation();
                    shareItem(
                        '${escapeJS(item.id || item.fileName)}'
                    )
                "
            >
                🔗 Share
            </button>

            ${
                item.deepDiveId
                    ? `
                        <button
                            class="action-btn deep-dive-btn"
                            onclick="
                                event.stopPropagation();
                                viewDeepDive(
                                    '${escapeJS(item.deepDiveId)}'
                                )
                            "
                        >
                            🔍 Deep Dive →
                        </button>
                    `
                    : ""
            }

        </div>
    `;

    feed.appendChild(card);
}


// ===============================
// LOAD DEEP DIVE FROM GITHUB
// ===============================
async function loadDeepDive() {

    const container =
        document.getElementById("feedContainer");

    if (!container) return;

    container.innerHTML =
        loadingUI();

    try {

        const res = await fetch(
            "https://api.github.com/repos/SohailUlla/infonions/contents/content/deepdive",
            {
                cache: "no-store"
            }
        );

        if (!res.ok) {

            throw new Error(
                `GitHub Deep Dive API error: ${res.status}`
            );

        }

        const files =
            await res.json();

        if (!Array.isArray(files)) {

            throw new Error(
                "GitHub did not return a Deep Dive file list."
            );

        }

        container.innerHTML = `
            <div
                class="pulse-feed"
                id="pulseFeed"
            ></div>
        `;

        const articles = [];

        for (const file of files) {

            if (!file.name.endsWith(".md")) {
                continue;
            }

            const raw =
                await fetch(
                    file.download_url,
                    {
                        cache: "no-store"
                    }
                );

            if (!raw.ok) {
                continue;
            }

            const md =
                await raw.text();

            articles.push({
                data: parseFrontmatter(md),
                fileName: file.name
            });

        }

        // Newest first
        articles.sort((a, b) => {

            return (
                new Date(
                    b.data.date || 0
                ).getTime() -

                new Date(
                    a.data.date || 0
                ).getTime()
            );

        });

        articles.forEach(article => {

            renderDeepDive(
                article.data,
                article.fileName
            );

        });

        if (!articles.length) {

            document.getElementById(
                "pulseFeed"
            ).innerHTML = `
                <div class="loading">
                    <p>No Deep Dive articles found.</p>
                </div>
            `;

        }

    } catch (err) {

        console.error(
            "Deep Dive loading failed:",
            err
        );

        container.innerHTML = `
            <div class="loading">
                <p>⚠️ Failed to load Deep Dive</p>
            </div>
        `;
    }
}


// ===============================
// RENDER DEEP DIVE CARD
// ===============================
function renderDeepDive(
    data,
    fileName
) {

    const feed =
        document.getElementById("pulseFeed");

    if (!feed) return;

    const card =
        document.createElement("div");

    card.className =
        "pulse-card";

    card.style.cursor =
        "pointer";

card.onclick = () => {

    const slug = fileName
        .replace(/\.md$/i, "")
        .replace(/^\d{4}-\d{2}-\d{2}-/, "");

    window.location.href =
        `/deep-dive/${slug}/`;

};

    const title =
        data.title || "Untitled";

    const excerpt =
        data.excerpt || "";

    const category =
        (data.category || "news")
            .toLowerCase()
            .replace(
                /[^a-z0-9-]/g,
                "-"
            );

    const date =
        data.date
            ? new Date(
                data.date
              ).toLocaleDateString("en-GB")
            : "";

    const id =
        title
            .replace(/\s+/g, "-")
            .toLowerCase();

    card.innerHTML = `

        <div
            class="card-category category-${category}"
        >
            ${escapeHTML(
                data.category || ""
            )}
        </div>

        <h2>
            ${escapeHTML(title)}
        </h2>

        <div class="pulse-content">
            ${escapeHTML(excerpt)}
        </div>

        <div class="pulse-meta">

            <span>
                ${escapeHTML(
                    data.author ||
                    "Infonions"
                )}
            </span>

            <span>
                ${date}
            </span>

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

    const reactions = [
        "👍",
        "👎",
        "🔥",
        "😡",
        "😂",
        "🤯"
    ];

    return reactions
        .map(r => `

            <button
                class="action-btn"
                onclick="
                    event.stopPropagation();
                    sendSignal(
                        '${escapeJS(id)}',
                        '${r}'
                    )
                "
            >
                ${r}
            </button>

        `)
        .join("");
}


// ===============================
// SIGNAL + ACTIVITY SYSTEM
// ===============================
function sendSignal(
    id,
    type
) {

    const voteKey =
        `voted_${id}`;

    if (
        localStorage.getItem(
            voteKey
        )
    ) {

        showToast(
            "You already reacted to this signal 📡"
        );

        return;
    }

    let signals =
        safeParse(
            "signals",
            {}
        );

    let activity =
        safeParse(
            "activity",
            []
        );

    if (!signals[id]) {

        signals[id] = {};

    }

    signals[id][type] =
        (
            signals[id][type] ||
            0
        ) + 1;

    activity.unshift({

        id: id,

        reaction: type,

        time:
            new Date()
                .toLocaleTimeString()

    });

    activity =
        activity.slice(
            0,
            50
        );

    localStorage.setItem(
        "signals",
        JSON.stringify(signals)
    );

    localStorage.setItem(
        "activity",
        JSON.stringify(activity)
    );

    localStorage.setItem(
        voteKey,
        type
    );

    showToast(
        `Signal ${type} recorded 📡`
    );
}


// ===============================
// SHARE
// ===============================
function shareItem(id) {

    const url =
        `${window.location.origin}${window.location.pathname}#${encodeURIComponent(id)}`;

    if (navigator.share) {

        navigator.share({

            title: "Infonions",

            url: url

        }).catch(() => {});

    } else if (
        navigator.clipboard
    ) {

        navigator.clipboard
            .writeText(url)

            .then(() => {

                showToast(
                    "Link copied 🔗"
                );

            })

            .catch(() => {

                showToast(
                    "Unable to copy link"
                );

            });

    } else {

        showToast(
            "Sharing is not supported here"
        );

    }
}


// ===============================
// DEEP DIVE NAVIGATION
// ===============================
function viewDeepDive(slug) {

    if (!slug) return;

    if (
        String(slug)
            .endsWith(".md")
    ) {

        window.location.href =
            `/article.html?file=${encodeURIComponent(
                slug
            )}`;

    } else {

        window.location.href =
            `/deep.html?slug=${encodeURIComponent(
                slug
            )}`;

    }
}


// ===============================
// SAFE JSON PARSE
// ===============================
function safeParse(
    key,
    fallback
) {

    try {

        const value =
            localStorage.getItem(
                key
            );

        return value
            ? JSON.parse(value)
            : fallback;

    } catch {

        return fallback;

    }
}


// ===============================
// TIME FORMATTER
// ===============================
function formatAge(
    dateString
) {

    const publishedAt =
        new Date(
            dateString
        ).getTime();

    const ageMs =
        Date.now() -
        publishedAt;

    if (
        Number.isNaN(
            publishedAt
        ) ||
        ageMs < 0
    ) {

        return "JUST NOW";

    }

    const ageMinutes =
        Math.floor(
            ageMs / 60000
        );

    if (
        ageMinutes < 1
    ) {

        return "JUST NOW";

    }

    if (
        ageMinutes < 60
    ) {

        return `${ageMinutes}m AGO`;

    }

    const ageHours =
        Math.floor(
            ageMinutes / 60
        );

    return `${ageHours}h AGO`;
}


// ===============================
// LOADING UI
// ===============================
function loadingUI() {

    return `

        <div class="loading">

            <div
                class="loading-spinner"
            ></div>

            <p>
                Loading signals...
            </p>

        </div>

    `;
}


// ===============================
// ESCAPE HTML
// ===============================
function escapeHTML(
    value
) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );
}


// ===============================
// ESCAPE JAVASCRIPT
// ===============================
function escapeJS(
    value
) {

    return String(value)

        .replace(
            /\\/g,
            "\\\\"
        )

        .replace(
            /'/g,
            "\\'"
        );
}


// ===============================
// FRONTMATTER PARSER
// ===============================
function parseFrontmatter(
    md
) {

    const match =
        md.match(
            /^---\s*([\s\S]*?)\s*---/
        );

    if (!match) {

        return {};

    }

    const yaml =
        match[1];

    const data = {};

    const lines =
        yaml.split(
            /\r?\n/
        );

    let currentKey =
        null;

    let blockValue =
        null;

    let blockIndent =
        null;

    for (
        let i = 0;
        i < lines.length;
        i++
    ) {

        const line =
            lines[i];

        // YAML block string
        const blockMatch =
            line.match(
                /^([A-Za-z0-9_-]+):\s*\|?\s*$/
            );

        if (blockMatch) {

            currentKey =
                blockMatch[1]
                    .toLowerCase();

            data[currentKey] =
                "";

            blockValue =
                line
                    .trim()
                    .endsWith("|");

            blockIndent =
                null;

            if (!blockValue) {

                currentKey =
                    null;

            }

            continue;
        }

        // Continue block string
        if (blockValue) {

            if (
                line.trim() === ""
            ) {

                data[currentKey] +=
                    "\n";

                continue;
            }

            const indent =
                line.match(
                    /^\s*/
                )[0].length;

            if (
                blockIndent === null
            ) {

                blockIndent =
                    indent;

            }

            if (
                indent >=
                blockIndent
            ) {

                data[currentKey] +=
                    line.slice(
                        blockIndent
                    ) + "\n";

                continue;
            }

            blockValue =
                null;

            blockIndent =
                null;
        }

        // New key/value
        const keyMatch =
            line.match(
                /^([A-Za-z0-9_-]+):\s*(.*)$/
            );

        if (keyMatch) {

            currentKey =
                keyMatch[1]
                    .toLowerCase();

            let value =
                keyMatch[2].trim();

            // Remove YAML quotes
            if (
                (
                    value.startsWith('"') &&
                    value.endsWith('"')
                ) ||
                (
                    value.startsWith("'") &&
                    value.endsWith("'")
                )
            ) {

                value =
                    value.slice(
                        1,
                        -1
                    );

            }

            data[currentKey] =
                value;

            continue;
        }

        // Multiline value
        if (
            currentKey &&
            line.trim() &&
            !line
                .trim()
                .startsWith("- ")
        ) {

            data[currentKey] =
                `${data[currentKey]} ${line.trim()}`
                    .trim();

        }
    }

    // Clean strings
    Object.keys(data)
        .forEach(key => {

            if (
                typeof data[key] ===
                "string"
            ) {

                data[key] =
                    data[key].trim();

            }

        });

    return data;
}


// ===============================
// AUTOMATIC 24-HOUR REFRESH
// ===============================
//
// This does NOT delete the Markdown file.
// It only removes expired Pulse stories
// from the public homepage.
//

setInterval(() => {

    if (
        currentMode === "pulse"
    ) {

        loadPulse();

    }

}, 60 * 1000);
