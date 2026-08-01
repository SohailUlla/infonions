// ===============================
// INFONIONS ARTICLE READER
// ===============================

const params = new URLSearchParams(window.location.search);
const file = params.get("file");

if (!file) {

    document.getElementById("content").innerHTML =
        "<h2>Article not found.</h2>";

} else {

    loadArticle(file);

}

async function loadArticle(file) {

    const url =
        "https://raw.githubusercontent.com/SohailUlla/infonions/main/content/deepdive/" + file;

    try {

        const res = await fetch(url);

        if (!res.ok)
            throw new Error("Article not found");

const markdown = await res.text();

document.getElementById("title").innerText =
    getFrontmatter(markdown, "title");

document.getElementById("author").innerText =
    getFrontmatter(markdown, "author");

document.getElementById("date").innerText =
    getFrontmatter(markdown, "date");

document.getElementById("content").innerHTML =
    markdownToHTML(removeFrontmatter(markdown));

    }

    catch (err) {

        console.error(err);

        document.getElementById("content").innerHTML =
            "<h2>Unable to load article.</h2>";

    }

}
// ===============================
// REMOVE FRONTMATTER
// ===============================
function removeFrontmatter(md) {

    return md.replace(/^---[\s\S]*?---/, "").trim();

}

// ===============================
// GET SINGLE FRONTMATTER VALUE
// ===============================
function getFrontmatter(md, key) {

    const match = md.match(/^---([\s\S]*?)---/);

    if (!match) return "";

    const lines = match[1].split("\n");

    for (const line of lines) {

        if (line.startsWith(key + ":")) {

            return line.replace(key + ":", "").trim();

        }

    }

    return "";

}
// ===============================
// SIMPLE MARKDOWN TO HTML
// ===============================
function markdownToHTML(md) {

    return md

        // Headings
        .replace(/^### (.*)$/gm, "<h3>$1</h3>")
        .replace(/^## (.*)$/gm, "<h2>$1</h2>")
        .replace(/^# (.*)$/gm, "<h1>$1</h1>")

        // Bold
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")

        // Italic
        .replace(/\*(.*?)\*/g, "<em>$1</em>")

        // Paragraphs
        .split("\n\n")
        .map(block => {

            block = block.trim();

            if (
                block.startsWith("<h1") ||
                block.startsWith("<h2") ||
                block.startsWith("<h3")
            ) {
                return block;
            }

            return `<p>${block.replace(/\n/g, "<br>")}</p>`;

        })
        .join("");

}
