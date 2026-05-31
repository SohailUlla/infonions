let allArticles = [];

document.addEventListener("DOMContentLoaded", () => {
    loadArchive();

    document
        .getElementById("searchInput")
        .addEventListener("input", searchArticles);
});

async function loadArchive() {

    const container =
        document.getElementById("archiveList");

    container.innerHTML = "Loading...";

    try {

        allArticles = [];

        // PULSE
        const pulseRes = await fetch(
            "https://api.github.com/repos/SohailUlla/infonions/contents/content/pulse"
        );

        const pulseFiles = await pulseRes.json();

        for (const file of pulseFiles) {

            if (!file.name.endsWith(".md")) continue;

            const raw = await fetch(file.download_url);
            const md = await raw.text();

            const data = parseFrontmatter(md);

            data.contentType = "Pulse";

            allArticles.push(data);
        }

        // DEEP DIVE
        const deepRes = await fetch(
            "https://api.github.com/repos/SohailUlla/infonions/contents/content/deepdive"
        );

        const deepFiles = await deepRes.json();

        for (const file of deepFiles) {

            if (!file.name.endsWith(".md")) continue;

            const raw = await fetch(file.download_url);
            const md = await raw.text();

            const data = parseFrontmatter(md);

            data.contentType = "Deep Dive";

            allArticles.push(data);
        }

        renderArticles(allArticles);

    } catch(err) {

        console.error(err);

        container.innerHTML =
            "Failed to load archive";
    }
}

function renderArticles(data){

    const container =
        document.getElementById("archiveList");

    container.innerHTML = "";

    data.reverse().forEach(item => {

        const title =
            item.pulse ||
            item.title ||
            item.headline ||
            "Untitled";

        container.innerHTML += `
            <div class="archive-item">

                <div class="archive-category">
                    ${item.category || ""}
                </div>

                <div style="
                    color:#00ff88;
                    margin-bottom:10px;
                    font-size:13px;
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
function searchArticles(){

    const q =
        document
        .getElementById("searchInput")
        .value
        .toLowerCase();

    const filtered = allArticles.filter(item => {

        return (
    (item.pulse || "") +
    " " +
    (item.title || "") +
    " " +
    (item.category || "")
)
            .toLowerCase()
            .includes(q)
        );
    });

    renderArticles(filtered);
}

function parseFrontmatter(md){

    const match =
        md.match(/---([\s\S]*?)---/);

    if(!match) return {};

    let data = {};

    match[1].split("\n").forEach(line => {

        if(!line.includes(":")) return;

        const i = line.indexOf(":");

        const key =
            line.slice(0,i)
            .trim()
            .toLowerCase();

        const value =
            line.slice(i+1)
            .trim();

        data[key] = value;

    });

    return data;
}
