// ==========================================
// INFONIONS ARTICLE READER
// Article loading + Markdown rendering + SEO
// ==========================================


// ==========================================
// URL PARAMETERS
// ==========================================

const params = new URLSearchParams(
    window.location.search
);

const fileParam = params.get("file");
const slugParam = params.get("slug");


// ==========================================
// START
// ==========================================

if (fileParam) {

    // --------------------------------------
    // OLD URL SUPPORT
    // /article.html?file=article.md
    // --------------------------------------

    loadArticle(fileParam);

} else if (slugParam) {

    // --------------------------------------
    // NEW PRETTY URL SUPPORT
    // /deep-dive/article-slug/
    // --------------------------------------

    findArticleBySlug(slugParam);

} else {

    showError(
        "Article not found."
    );

}


// ==========================================
// FIND ARTICLE BY SLUG
// ==========================================

async function findArticleBySlug(slug) {

    try {

        // Get all Deep Dive files from GitHub
        const response = await fetch(
            "https://api.github.com/repos/SohailUlla/infonions/contents/content/deepdive",
            {
                cache: "no-store"
            }
        );


        if (!response.ok) {

            throw new Error(
                "Unable to load article list: " +
                response.status
            );

        }


        const files =
            await response.json();


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


                // Example:
                //
                // 2026-07-28-the-river-is-sending-a-warning.md
                //
                // becomes:
                //
                // the-river-is-sending-a-warning

                const filenameSlug =
                    file.name
                        .replace(
                            /\.md$/i,
                            ""
                        )
                        .replace(
                            /^\d{4}-\d{2}-\d{2}-/,
                            ""
                        );


                return (
                    filenameSlug.toLowerCase() ===
                    slug.toLowerCase()
                );

            });


        // --------------------------------------
        // Article not found
        // --------------------------------------

        if (!article) {

            console.error(
                "No article found for slug:",
                slug
            );

            showError(
                "Article not found."
            );

            return;

        }


        // --------------------------------------
        // Load actual Markdown file
        // --------------------------------------

        loadArticle(
            article.name
        );

    }

    catch (error) {

        console.error(
            "Slug lookup error:",
            error
        );

        showError(
            "Unable to load article."
        );

    }

}


// ==========================================
// LOAD ARTICLE
// ==========================================

async function loadArticle(file) {

    const url =
        "https://raw.githubusercontent.com/SohailUlla/infonions/main/content/deepdive/" +
        encodeURIComponent(file);


    try {

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
            parseFrontmatter(
                markdown
            );


        // --------------------------------------
        // Remove frontmatter
        // --------------------------------------

        const body =
            removeFrontmatter(
                markdown
            );


        // --------------------------------------
        // Render article
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

    }

    catch (error) {

        console.error(
            "Article loading error:",
            error
        );

        showError(
            "Unable to load article."
        );

    }

}


// ==========================================
// ERROR DISPLAY
// ==========================================

function showError(message) {

    const content =
        document.getElementById(
            "content"
        );


    if (content) {

        content.innerHTML = `
            <h2>${escapeHTML(message)}</h2>
            <p>
                Please check the article URL
                and try again.
            </p>
        `;

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
    // CATEGORY
    // ------------------------------------------

    const categoryElement =
        document.getElementById(
            "category"
        );


    if (categoryElement) {

        categoryElement.textContent =
            category;

    }


    // ------------------------------------------
    // TITLE
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
    // EXCERPT
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
    // AUTHOR
    // ------------------------------------------

    const authorElement =
        document.getElementById(
            "author"
        );


    if (authorElement) {

        authorElement.textContent =
            "By " + author;

    }


    // ------------------------------------------
    // DATE
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
    // READING TIME
    // ------------------------------------------

    const readingElement =
        document.getElementById(
            "reading"
        );


    if (readingElement) {

        const words =
            markdown
                .replace(
                    /\s+/g,
                    " "
                )
                .trim()
                .split(" ")
                .filter(Boolean)
                .length;


        const minutes =
            Math.max(
                1,
                Math.ceil(
                    words / 220
                )
            );


        readingElement.textContent =
            `${minutes} min read`;

    }


    // ------------------------------------------
    // ARTICLE MARKDOWN
    // ------------------------------------------

    const contentElement =
        document.getElementById(
            "content"
        );


    if (contentElement) {

        if (
            typeof marked !==
            "undefined"
        ) {

            contentElement.innerHTML =
                marked.parse(
                    markdown
                );

        } else {

            contentElement.innerHTML =
                `<p>${escapeHTML(markdown)}</p>`;

        }

    }


    // ------------------------------------------
    // FEATURED IMAGE
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
                    style="
                        width:100%;
                        height:100%;
                        object-fit:cover;
                        border-radius:22px;
                    "
                >
            `;

        }

    }

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
        buildCanonicalURL(
            file
        );


    // ------------------------------------------
    // BROWSER TITLE
    // ------------------------------------------

    document.title =
        `${title} | Infonions`;


    // ------------------------------------------
    // META DESCRIPTION
    // ------------------------------------------

    setMeta(
        "description",
        description
    );


    // ------------------------------------------
    // CANONICAL
    // ------------------------------------------

    setCanonical(
        canonical
    );


    // ------------------------------------------
    // OPEN GRAPH
    // ------------------------------------------

    setProperty(
        "og:type",
        "article"
    );


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
            absoluteURL(
                data.image
            )
        );

    }


    // ------------------------------------------
    // TWITTER / X
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
    // ARTICLE PUBLISHED DATE
    // ------------------------------------------

    if (data.date) {

        setMeta(
            "article:published_time",
            data.date
        );

    }


    // ------------------------------------------
    // STRUCTURED DATA
    // ------------------------------------------

    createArticleSchema(
        data,
        canonical
    );

}


// ==========================================
// CANONICAL LINK
// ==========================================

function setCanonical(
    canonical
) {

    let element =
        document.querySelector(
            'link[rel="canonical"]'
        );


    if (!element) {

        element =
            document.createElement(
                "link"
            );

        element.rel =
            "canonical";

        document.head.appendChild(
            element
        );

    }


    element.href =
        canonical;

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

        "mainEntityOfPage": {

            "@type":
                "WebPage",

            "@id":
                canonical

        },

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


    // ------------------------------------------
    // DATE
    // ------------------------------------------

    if (data.date) {

        schema.datePublished =
            data.date;

        schema.dateModified =
            data.date;

    }


    // ------------------------------------------
    // IMAGE
    // ------------------------------------------

    if (data.image) {

        schema.image = [
            absoluteURL(
                data.image
            )
        ];

    }


    // ------------------------------------------
    // INSERT SCHEMA
    // ------------------------------------------

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

function buildCanonicalURL(
    file
) {

    const slug =
        file
            .replace(
                /\.md$/i,
                ""
            )
            .replace(
                /^\d{4}-\d{2}-\d{2}-/,
                ""
            );


    return (
        "https://infonions.com/deep-dive/" +
        encodeURIComponent(
            slug
        ) +
        "/"
    );

}


// ==========================================
// FRONTMATTER PARSER
// ==========================================

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


    const data =
        {};


    const lines =
        yaml.split(
            /\r?\n/
        );


    let currentKey =
        null;


    for (
        let i = 0;
        i < lines.length;
        i++
    ) {

        const line =
            lines[i];


        // --------------------------------------
        // Ignore empty lines
        // --------------------------------------

        if (!line.trim()) {

            continue;

        }


        // --------------------------------------
        // SEO description
        // --------------------------------------

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

function removeFrontmatter(
    md
) {

    return md.replace(
        /^---\s*[\s\S]*?\s*---\s*/,
        ""
    ).trim();

}


// ==========================================
// YAML VALUE CLEANER
// ==========================================

function cleanYamlValue(
    value
) {

    return String(value)
        .replace(
            /^["']|["']$/g,
            ""
        )
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

function absoluteURL(
    url
) {

    if (
        !url
    ) {

        return "";

    }


    if (
        url.startsWith(
            "http://"
        ) ||
        url.startsWith(
            "https://"
        )
    ) {

        return url;

    }


    return (
        "https://infonions.com/" +
        url.replace(
            /^\/+/,
            ""
        )
    );

}


// ==========================================
// DATE FORMATTER
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
            month: "numeric",
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
