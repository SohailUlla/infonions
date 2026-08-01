// ===========================
// INFONIONS ARTICLE READER
// ===========================

const params = new URLSearchParams(window.location.search);
const file = params.get("file");

if (!file) {
    document.getElementById("content").innerHTML = "<h2>Article not found.</h2>";
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

        const md = await res.text();

        // -----------------------
        // Split frontmatter
        // -----------------------

        const parts = md.split("---");

        const yamlText = parts[1];
        const markdown = parts.slice(2).join("---");

        const data = jsyaml.load(yamlText);

        // -----------------------
        // Fill page
        // -----------------------

        document.title = data.title + " | Infonions";

        document.getElementById("category").textContent =
            data.category || "";

        document.getElementById("title").textContent =
            data.title || "";

        document.getElementById("excerpt").textContent =
            data.excerpt || "";

        document.getElementById("author").textContent =
            data.author || "";

        document.getElementById("date").textContent =
            new Date(data.date).toLocaleDateString();

        // Reading time

        const words = markdown
            .replace(/\n/g, " ")
            .split(/\s+/).length;

        document.getElementById("reading").textContent =
            Math.ceil(words / 200) + " min read";

        // Markdown → HTML

        document.getElementById("content").innerHTML =
            marked.parse(markdown);

    }

    catch(err){

        console.error(err);

        document.getElementById("content").innerHTML =
            "<h2>Unable to load article.</h2>";

    }

}
