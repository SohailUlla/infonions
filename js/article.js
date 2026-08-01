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

        console.log(markdown);

    }

    catch (err) {

        console.error(err);

        document.getElementById("content").innerHTML =
            "<h2>Unable to load article.</h2>";

    }

}
