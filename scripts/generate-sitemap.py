import os
import re
from datetime import datetime
from xml.sax.saxutils import escape

BASE_URL = "https://infonions.com"
DEEPDIVE_DIR = "content/deepdive"
SITEMAP_FILE = "sitemap.xml"


def get_frontmatter(content):
    """
    Extract YAML frontmatter from a Markdown file.
    """
    match = re.match(r"^---\s*\n(.*?)\n---", content, re.DOTALL)

    if not match:
        return {}

    frontmatter = {}

    for line in match.group(1).splitlines():

        if ":" not in line:
            continue

        key, value = line.split(":", 1)

        key = key.strip()
        value = value.strip()

        frontmatter[key] = value

    return frontmatter


def clean_slug(filename):
    """
    Convert:

    2026-07-28-the-river-is-sending-a-warning.md

    into:

    the-river-is-sending-a-warning
    """

    slug = os.path.splitext(filename)[0]

    # Remove date prefix: YYYY-MM-DD-
    slug = re.sub(r"^\d{4}-\d{2}-\d{2}-", "", slug)

    return slug


def get_lastmod(frontmatter, filepath):

    date_value = frontmatter.get("date")

    if date_value:

        try:
            # Handles values such as:
            # 2026-07-29T04:52:00.000+05:30

            date_value = date_value.replace("Z", "+00:00")

            date = datetime.fromisoformat(date_value)

            return date.strftime("%Y-%m-%d")

        except Exception:
            pass

    # Fallback: file modification date
    timestamp = os.path.getmtime(filepath)

    return datetime.fromtimestamp(timestamp).strftime("%Y-%m-%d")


def generate_sitemap():

    urls = []

    # =========================
    # HOMEPAGE
    # =========================

    urls.append({
        "loc": f"{BASE_URL}/",
        "lastmod": None
    })

    # =========================
    # DEEP DIVE ARTICLES
    # =========================

    if os.path.exists(DEEPDIVE_DIR):

        for filename in sorted(os.listdir(DEEPDIVE_DIR)):

            if not filename.endswith(".md"):
                continue

            filepath = os.path.join(DEEPDIVE_DIR, filename)

            with open(filepath, "r", encoding="utf-8") as file:
                content = file.read()

            frontmatter = get_frontmatter(content)

            # Only include published articles
            if frontmatter.get("status", "published").lower() != "published":
                continue

            slug = clean_slug(filename)

            lastmod = get_lastmod(
                frontmatter,
                filepath
            )

            urls.append({
                "loc": f"{BASE_URL}/deep-dive/{slug}/",
                "lastmod": lastmod
            })

    # =========================
    # BUILD XML
    # =========================

    xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ""
    ]

    for url in urls:

        xml.append("    <url>")

        xml.append(
            f"        <loc>{escape(url['loc'])}</loc>"
        )

        if url["lastmod"]:

            xml.append(
                f"        <lastmod>{url['lastmod']}</lastmod>"
            )

        xml.append("    </url>")
        xml.append("")

    xml.append("</urlset>")

    # =========================
    # WRITE SITEMAP
    # =========================

    with open(SITEMAP_FILE, "w", encoding="utf-8") as file:

        file.write("\n".join(xml))

    print(
        f"Sitemap generated successfully: {len(urls)} URLs"
    )


if __name__ == "__main__":
    generate_sitemap()
