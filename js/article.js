// ==========================================
// INFONIONS ARTICLE READER
// Clean URLs + Markdown + SEO
// ==========================================

const GITHUB_API =
    "https://api.github.com/repos/SohailUlla/infonions/contents/content/deepdive";

const GITHUB_RAW =
    "https://raw.githubusercontent.com/SohailUlla/infonions/main/content/deepdive/";


// ==========================================
// START
// ==========================================

document.addEventListener("DOMContentLoaded", initArticle);


async function initArticle() {

    const params =
        new URLSearchParams(window.location.search);

    const fileParam =
        params.get("file");

    const slugParam =
        params.get("slug");


    // ------------------------------------------
    // OLD URL SUPPORT
    // /article.html?file=filename.md
    // ------------------------------------------

    if (fileParam) {

        await loadArticle(fileParam);

        return;

    }


    // ------------------------------------------
    // OLD SLUG SUPPORT
    // /article.html?slug=article-slug
    // ------------------------------------------

    if (slugParam) {

        await findArticleBySlug(slugParam);

        return;

    }


    // ------------------------------------------
    // NEW CLEAN URL
    // /deep-dive/article-slug/
    // ------------------------------------------

    const pathname =
        window.location.pathname;


    const slug =
        getSlugFromPath(pathname);


    if (slug) {

        await findArticleBySlug(slug);

        return;

    }


    showNotFound();

}


// ==========================================
// GET SLUG FROM CLEAN URL
// ==========================================

function getSlugFromPath(pathname) {

    const parts =
        pathname
            .split("/")
            .filter(Boolean);


    // Expected:
    // /deep-dive/the-river-is-sending-a-warning/

    const deepDiveIndex =
        parts.indexOf("deep-dive");


    if (deepDiveIndex === -1) {

        return null;

    }


    if (!parts[deepDiveIndex + 1]) {

        return null;

    }


    return decodeURIComponent(
        parts[deepDiveIndex + 1]
    );

}


// ==========================================
// FIND ARTICLE BY SLUG
// ==========================================

async function findArticleBySlug(slug) {

    try {

        const response =
            await fetch(
                GITHUB_API,
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Unable to read article list: " +
                response.status
            );

        }


        const files =
            await response.json();


        const targetSlug =
            slug
                .toLowerCase()
                .trim();


        // --------------------------------------
        // Find matching Markdown file
        // --------------------------------------

        const article =
            files.find(file => {

                if (
                    !file.name ||
                    !file.name.toLowerCase().endsWith(".md")
                ) {

                    return false;

                }


                const fileSlug =
                    file.name
                        .replace(/\.md$/i, "")
                        .replace(
                            /^\d{4}-\d{2}-\d{2}-/,
                            ""
                        )
                        .toLowerCase();


                return fileSlug === targetSlug;

            });


        if (!article) {

            console.error(
                "No article found for slug:",
                slug
            );

            showNotFound();

            return;

        }


        await loadArticle(article.name);

    }

    catch (error) {

        console.error(
            "Slug lookup error:",
            error
        );

        showNotFound();

    }

}


// ==========================================
// LOAD ARTICLE
// ==========================================

async function loadArticle(file) {

    try {

        const url =
            GITHUB_RAW +
            encodeURIComponent(file);


        const response =
            await fetch(
                url,
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Article not found: " +
                response.status
            );

        }


        const markdown =
            await response.text();


        // --------------------------------------
        // Parse frontmatter
        // --------------------------------------

        const data =
            parseFrontmatter(markdown);


        // --------------------------------------
        // Remove frontmatter
        // --------------------------------------

        const body =
            removeFrontmatter(markdown);


        // --------------------------------------
        // Render
        // --------------------------------------

        renderArticle(
            data,
            body
        );


        // --------------------------------------
        // SEO
        // --------------------------------------

        updateSEO(
            data,
            file
        );


        // --------------------------------------
        // Update browser URL
        // --------------------------------------

        updateBrowserURL(
            file
        );

    }

    catch (error) {

        console.error(
            "Article loading error:",
            error
        );

        showNotFound();

    }

}


// ==========================================
// UPDATE BROWSER URL
// ==========================================

function updateBrowserURL(file) {

    const slug =
        file
            .replace(/\.md$/i, "")
            .replace(
                /^\d{4}-\d{2}-\d{2}-/,
                ""
            );


    const cleanURL =
        "/deep-dive/" +
        encodeURIComponent(slug) +
        "/";


    // Only replace old query URLs.
    // Do not reload the page.

    if (
        window.location.pathname !== cleanURL
    ) {

        window.history.replaceState(
            {},
            "",
            cleanURL
        );

    }

}


// ==========================================
// RENDER ARTICLE
// ==========================================

function renderArticle(
    data,
    markdown
) {

    const category =
        data.category ||
        "News";


    const title =
        data.title ||
        "Infonions";


    const excerpt =
        data.excerpt ||
        "";


    const author =
        data.author ||
        "Infonions Desk";


    const date =
        data.date
            ? formatDate(data.date)
            : "";


    // ------------------------------------------
    // Category
    // ------------------------------------------

    const categoryElement =
        document.getElementById(
            "category"
        );


    if (categoryElement) {

        categoryElement.textContent =
            formatCategory(category);

    }


    // ------------------------------------------
    // Title
    // ------------------------------------------

    const titleElement =
        document.getElementById(
            "title"
        );


    if (titleElement) {

        titleElement.textContent =
            title;

    }


    // ------------------------------------------
    // Excerpt
    // ------------------------------------------

    const excerptElement =
        document.getElementById(
            "excerpt"
        );


    if (excerptElement) {

        excerptElement.textContent =
            excerpt;

    }


    // ------------------------------------------
    // Author
    // ------------------------------------------

    const authorElement =
        document.getElementById(
            "author"
        );


    if (authorElement) {

        authorElement.textContent =
            author;

    }


    // ------------------------------------------
    // Date
    // ------------------------------------------

    const dateElement =
        document.getElementById(
            "date"
        );


    if (dateElement) {

        dateElement.textContent =
            date;

    }


    // ------------------------------------------
    // Reading time
    // ------------------------------------------

    const readingElement =
        document.getElementById(
            "reading"
        );


    if (readingElement) {

        const words =
            markdown
                .replace(/\s+/g, " ")
                .trim()
                .split(" ")
                .filter(Boolean)
                .length;


        const minutes =
            Math.max(
                1,
                Math.ceil(words / 220)
            );


        readingElement.textContent =
            `${minutes} min read`;

    }


    // ------------------------------------------
    // Article content
    // ------------------------------------------

    const contentElement =
        document.getElementById(
            "content"
        );


    if (contentElement) {

        if (
            typeof marked !== "undefined"
        ) {

            contentElement.innerHTML =
                marked.parse(markdown);

        }

        else {

            contentElement.innerHTML =
                `<p>${escapeHTML(markdown)}</p>`;

        }

    }


    // ------------------------------------------
    // Featured Image
    // ------------------------------------------

    if (data.image) {

        const hero =
            document.getElementById(
                "hero"
            );


        if (hero) {

            hero.innerHTML = `
                <img
                    src="${escapeAttribute(data.image)}"
                    alt="${escapeAttribute(title)}"
                >
            `;

        }

    }

}


// ==========================================
// CATEGORY FORMATTER
// ==========================================

function formatCategory(category) {

    return String(category)
        .replace(/-/g, " ")
        .replace(/\b\w/g, char =>
            char.toUpperCase()
        );

}


// ==========================================
// SEO
// ==========================================

function updateSEO(
    data,
    file
) {

    const title =
        data.title ||
        "Infonions";


    const description =
        data.seo_description ||
        data.excerpt ||
        "Fearless Intelligence from Infonions.";


    const canonical =
        buildCanonicalURL(file);


    // ------------------------------------------
    // Browser title
    // ------------------------------------------

    document.title =
        `${title} | Infonions`;


    // ------------------------------------------
    // Meta description
    // ------------------------------------------

    setMeta(
        "description",
        description
    );


    // ------------------------------------------
    // Canonical
    // ------------------------------------------

    let canonicalElement =
        document.getElementById(
            "canonical"
        );


    if (!canonicalElement) {

        canonicalElement =
            document.createElement(
                "link"
            );

        canonicalElement.id =
            "canonical";

        canonicalElement.rel =
            "canonical";

        document.head.appendChild(
            canonicalElement
        );

    }


    canonicalElement.href =
        canonical;


    // ------------------------------------------
    // Open Graph
    // ------------------------------------------

    setProperty(
        "og:title",
        `${title} | Infonions`
    );


    setProperty(
        "og:description",
        description
    );


    setProperty(
        "og:url",
        canonical
    );


    setProperty(
        "og:type",
        "article"
    );


    setProperty(
        "og:site_name",
        "Infonions"
    );


    if (data.image) {

        setProperty(
            "og:image",
            absoluteURL(
                data.image
            )
        );

    }


    // ------------------------------------------
    // Twitter / X
    // ------------------------------------------

    setMeta(
        "twitter:card",
        "summary_large_image"
    );


    setMeta(
        "twitter:title",
        `${title} | Infonions`
    );


    setMeta(
        "twitter:description",
        description
    );


    if (data.image) {

        setMeta(
            "twitter:image",
            absoluteURL(
                data.image
            )
        );

    }


    // ------------------------------------------
    // Structured Data
    // ------------------------------------------

    createArticleSchema(
        data,
        canonical
    );

}


// ==========================================
// ARTICLE STRUCTURED DATA
// ==========================================

function createArticleSchema(
    data,
    canonical
) {

    const oldSchema =
        document.getElementById(
            "article-schema"
        );


    if (oldSchema) {

        oldSchema.remove();

    }


    const title =
        data.title ||
        "Infonions";


    const description =
        data.seo_description ||
        data.excerpt ||
        "";


    const author =
        data.author ||
        "Infonions Desk";


    const schema = {

        "@context":
            "https://schema.org",

        "@type":
            "NewsArticle",

        "headline":
            title,

        "description":
            description,

        "url":
            canonical,

        "author": {

            "@type":
                "Person",

            "name":
                author

        },

        "publisher": {

            "@type":
                "Organization",

            "name":
                "Infonions",

            "url":
                "https://infonions.com/"

        }

    };


    if (data.date) {

        schema.datePublished =
            data.date;

        schema.dateModified =
            data.date;

    }


    if (data.image) {

        schema.image = [
            absoluteURL(
                data.image
            )
        ];

    }


    const script =
        document.createElement(
            "script"
        );


    script.id =
        "article-schema";


    script.type =
        "application/ld+json";


    script.textContent =
        JSON.stringify(
            schema
        );


    document.head.appendChild(
        script
    );

}


// ==========================================
// BUILD CANONICAL URL
// ==========================================

function buildCanonicalURL(file) {

    const slug =
        file
            .replace(/\.md$/i, "")
            .replace(
                /^\d{4}-\d{2}-\d{2}-/,
                ""
            );


    return (
        "https://infonions.com/deep-dive/" +
        encodeURIComponent(slug) +
        "/"
    );

}


// ==========================================
// FRONTMATTER PARSER
// ==========================================

function parseFrontmatter(md) {

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
        yaml.split(/\r?\n/);


    let currentKey =
        null;


    for (
        let i = 0;
        i < lines.length;
        i++
    ) {

        const line =
            lines[i];


        if (!line.trim()) {

            continue;

        }


        // --------------------------------------
        // SEO description
        // --------------------------------------

        if (
            /^\s+description:/.test(line) &&
            currentKey === "seo"
        ) {

            const value =
                line
                    .split(":")
                    .slice(1)
                    .join(":")
                    .trim();


            data.seo_description =
                cleanYamlValue(
                    value
                );


            continue;

        }


        // --------------------------------------
        // Top-level key
        // --------------------------------------

        const matchKey =
            line.match(
                /^([A-Za-z0-9_-]+):\s*(.*)$/
            );


        if (matchKey) {

            currentKey =
                matchKey[1]
                    .toLowerCase();


            const value =
                matchKey[2].trim();


            // SEO object

            if (
                currentKey === "seo" &&
                value === ""
            ) {

                continue;

            }


            if (value !== "") {

                data[currentKey] =
                    cleanYamlValue(
                        value
                    );

            }

        }

    }


    return data;

}


// ==========================================
// REMOVE FRONTMATTER
// ==========================================

function removeFrontmatter(md) {

    return md
        .replace(
            /^---\s*[\s\S]*?\s*---\s*/,
            ""
        )
        .trim();

}


// ==========================================
// YAML CLEANER
// ==========================================

function cleanYamlValue(value) {

    return String(value)
        .replace(/^["']|["']$/g, "")
        .trim();

}


// ==========================================
// META HELPERS
// ==========================================

function setMeta(
    name,
    content
) {

    let element =
        document.querySelector(
            `meta[name="${name}"]`
        );


    if (!element) {

        element =
            document.createElement(
                "meta"
            );

        element.name =
            name;

        document.head.appendChild(
            element
        );

    }


    element.content =
        content;

}


// ==========================================
// OPEN GRAPH HELPERS
// ==========================================

function setProperty(
    property,
    content
) {

    let element =
        document.querySelector(
            `meta[property="${property}"]`
        );


    if (!element) {

        element =
            document.createElement(
                "meta"
            );

        element.setAttribute(
            "property",
            property
        );

        document.head.appendChild(
            element
        );

    }


    element.content =
        content;

}


// ==========================================
// ABSOLUTE URL
// ==========================================

function absoluteURL(url) {

    if (
        !url
    ) {

        return "";

    }


    if (
        url.startsWith("http://") ||
        url.startsWith("https://")
    ) {

        return url;

    }


    return (
        "https://infonions.com/" +
        url.replace(/^\/+/, "")
    );

}


// ==========================================
// DATE
// ==========================================

function formatDate(
    dateString
) {

    const date =
        new Date(
            dateString
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "";

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );

}


// ==========================================
// NOT FOUND
// ==========================================

function showNotFound() {

    const content =
        document.getElementById(
            "content"
        );


    if (content) {

        content.innerHTML = `
            <h2>Article not found.</h2>
            <p>
                Please check the article URL and try again.
            </p>
        `;

    }

}


// ==========================================
// HTML ESCAPE
// ==========================================

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


// ==========================================
// ATTRIBUTE ESCAPE
// ==========================================

function escapeAttribute(
    value
) {

    return escapeHTML(
        value
    );

}
