// ==========================================
// INFONIONS ARTICLE READER
// Article loading + Markdown rendering + SEO
// ==========================================

const params = new URLSearchParams(window.location.search);
const file = params.get("file");


// ==========================================
// START
// ==========================================

if (!file) {

    document.getElementById("content").innerHTML =
        "<h2>Article not found.</h2>";

} else {

    loadArticle(file);

}


// ==========================================
// LOAD ARTICLE
// ==========================================

async function loadArticle(file) {

    const url =
        "https://raw.githubusercontent.com/SohailUlla/infonions/main/content/deepdive/" +
        encodeURIComponent(file);

    try {

        const res = await fetch(url, {
            cache: "no-store"
        });

        if (!res.ok) {

            throw new Error(
                "Article not found: " + res.status
            );

        }

        const markdown = await res.text();

        // ------------------------------------------
        // Parse frontmatter
        // ------------------------------------------

        const data =
            parseFrontmatter(markdown);


        // ------------------------------------------
        // Get article body
        // ------------------------------------------

        const body =
            removeFrontmatter(markdown);


        // ------------------------------------------
        // Render article
        // ------------------------------------------

        renderArticle(data, body);


        // ------------------------------------------
        // SEO
        // ------------------------------------------

        updateSEO(data, file);


    }

    catch (err) {

        console.error(
            "Article loading error:",
            err
        );

        document.getElementById("content").innerHTML = `
            <h2>Unable to load article.</h2>
            <p>Please try again later.</p>
        `;

    }

}


// ==========================================
// RENDER ARTICLE
// ==========================================

function renderArticle(data, markdown) {

    const category =
        data.category || "News";

    const title =
        data.title || "Infonions";

    const excerpt =
        data.excerpt || "";

    const author =
        data.author || "Infonions Desk";

    const date =
        data.date
            ? formatDate(data.date)
            : "";

    // ------------------------------------------
    // Category
    // ------------------------------------------

    const categoryElement =
        document.getElementById("category");

    if (categoryElement) {

        categoryElement.textContent =
            category;

    }


    // ------------------------------------------
    // Title
    // ------------------------------------------

    const titleElement =
        document.getElementById("title");

    if (titleElement) {

        titleElement.textContent =
            title;

    }


    // ------------------------------------------
    // Excerpt
    // ------------------------------------------

    const excerptElement =
        document.getElementById("excerpt");

    if (excerptElement) {

        excerptElement.textContent =
            excerpt;

    }


    // ------------------------------------------
    // Author
    // ------------------------------------------

    const authorElement =
        document.getElementById("author");

    if (authorElement) {

        authorElement.textContent =
            "By " + author;

    }


    // ------------------------------------------
    // Date
    // ------------------------------------------

    const dateElement =
        document.getElementById("date");

    if (dateElement) {

        dateElement.textContent =
            date;

    }


    // ------------------------------------------
    // Reading time
    // ------------------------------------------

    const readingElement =
        document.getElementById("reading");

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
    // Article Markdown
    // ------------------------------------------

    const contentElement =
        document.getElementById("content");

    if (contentElement) {

        if (
            typeof marked !== "undefined"
        ) {

            contentElement.innerHTML =
                marked.parse(markdown);

        } else {

            contentElement.innerHTML =
                `<p>${escapeHTML(markdown)}</p>`;

        }

    }


    // ------------------------------------------
    // Featured Image
    // ------------------------------------------

    if (data.image) {

        const hero =
            document.getElementById("hero");

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
// SEO
// ==========================================

function updateSEO(data, file) {

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

    const canonicalElement =
        document.getElementById("canonical");

    if (canonicalElement) {

        canonicalElement.href =
            canonical;

    }


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


    if (data.image) {

        setProperty(
            "og:image",
            absoluteURL(data.image)
        );

    }


    // ------------------------------------------
    // Twitter / X
    // ------------------------------------------

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
            absoluteURL(data.image)
        );

    }


    // ------------------------------------------
    // Structured data
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
        JSON.stringify(schema);


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


        // Ignore empty lines

        if (!line.trim()) {

            continue;

        }


        // Nested SEO description

        if (
            line.match(
                /^\s+description:/
            ) &&
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


        // Top-level key

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


            if (
                value !== ""
            ) {

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

    return md.replace(
        /^---\s*[\s\S]*?\s*---\s*/,
        ""
    ).trim();

}


// ==========================================
// YAML VALUE CLEANER
// ==========================================

function cleanYamlValue(value) {

    return value
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
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

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
