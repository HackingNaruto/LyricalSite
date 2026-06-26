"""
🎵 Auto-Updater for Tamil2Lyrics Database
==========================================
Fetches the live sitemap, compares against all existing db1-db5.json,
scrapes only NEW songs, cleans metadata from lyrics, and prepends to db5.json.

Designed to run via GitHub Actions (daily cron) or manually.
"""

import json
import re
import os
import time
import xml.etree.ElementTree as ET
import requests
from bs4 import BeautifulSoup

# --- ⚙️ CONFIGURATION ---
SITEMAP_URL = "https://www.tamil2lyrics.com/lyrics-sitemap.xml"
DB_FILES = ["db1.json", "db2.json", "db3.json", "db4.json", "db5.json"]
TARGET_DB = "db5.json"
REQUEST_DELAY = 1.5  # seconds between requests (be polite to the server)
REQUEST_TIMEOUT = 30
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}


# ============================================================
#  STEP 1: Fetch all URLs from the live sitemap
# ============================================================
def fetch_sitemap_urls():
    """Fetch and parse all song URLs from the lyrics sitemap XML."""
    print("📡 Fetching sitemap from:", SITEMAP_URL)
    resp = requests.get(SITEMAP_URL, headers=HEADERS, timeout=REQUEST_TIMEOUT)
    resp.raise_for_status()

    root = ET.fromstring(resp.content)
    ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}

    urls = []
    for url_elem in root.findall("s:url", ns):
        loc = url_elem.find("s:loc", ns)
        if loc is not None and loc.text:
            urls.append(loc.text.strip())

    print(f"✅ Found {len(urls)} URLs in sitemap")
    return urls


# ============================================================
#  STEP 2: Load existing URLs from all DB files
# ============================================================
def load_existing_urls():
    """Load all existing song URLs from db1.json through db5.json."""
    existing = set()
    for db_file in DB_FILES:
        if not os.path.exists(db_file):
            print(f"⚠️  {db_file} not found, skipping...")
            continue
        with open(db_file, "r", encoding="utf-8") as f:
            data = json.load(f)
        for song in data:
            url = song.get("url", "").strip()
            if url:
                existing.add(url)
    print(f"📦 Loaded {len(existing)} existing URLs from databases")
    return existing


# ============================================================
#  STEP 3: Scrape a single song page
# ============================================================
def scrape_song(url):
    """Scrape metadata and lyrics from a single song page."""
    try:
        resp = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
    except requests.RequestException as e:
        print(f"   ❌ Failed to fetch {url}: {e}")
        return None

    soup = BeautifulSoup(resp.text, "html.parser")

    # --- Extract title from <h1> ---
    h1 = soup.select_one("h1")
    title = "Unknown"
    if h1:
        # Remove the "Lyrics" span suffix
        title_text = h1.get_text(separator=" ", strip=True)
        title = re.sub(r'\s*Lyrics\s*$', '', title_text).strip()

    # --- Extract metadata from the footer grid (Singer / Lyricist / Music Director) ---
    singer = "Unknown"
    lyricist = "Unknown"
    music = "Unknown"
    movie = "Unknown"

    # Movie name from breadcrumb or movie badge
    movie_badge = soup.select_one("a[href*='/movie/']")
    if movie_badge:
        movie = movie_badge.get_text(strip=True)

    # Metadata grid (Singer, Lyricist, Music Director)
    meta_grid = soup.select(".grid.grid-cols-1.sm\\:grid-cols-3 > div")
    for div in meta_grid:
        label_el = div.select_one("div:first-child")
        value_el = div.select_one("div:last-child")
        if label_el and value_el:
            label = label_el.get_text(strip=True).lower()
            value = value_el.get_text(strip=True)
            if "singer" in label:
                singer = value
            elif "lyricist" in label:
                lyricist = value
            elif "music" in label:
                music = value

    # --- Extract English lyrics ---
    eng_panel = soup.select_one('[data-t2l-tab-panel="english"]')
    lyrics_en = ""
    if eng_panel:
        lyrics_en = extract_lyrics_text(eng_panel)

    # --- Extract Tamil lyrics ---
    tamil_panel = soup.select_one('[data-t2l-tab-panel="tamil"]')
    lyrics_ta = ""
    if tamil_panel:
        lyrics_ta = extract_lyrics_text(tamil_panel)

    # --- Apply cleaning ---
    lyrics_en = clean_english_metadata(lyrics_en)
    lyrics_ta = clean_tamil_metadata(lyrics_ta)

    return {
        "title": title,
        "movie": movie,
        "singers": singer,
        "music": music,
        "lyricist": lyricist,
        "lyrics": lyrics_en,
        "lyrics_tamil": lyrics_ta,
        "url": url
    }


def extract_lyrics_text(panel):
    """
    Extract lyrics text from a lyrics panel element.
    Handles <br> tags, <p> tags, and part dividers.
    """
    lines = []

    for child in panel.children:
        if isinstance(child, str):
            text = child.strip()
            if text:
                lines.append(text)
            continue

        if not hasattr(child, 'name'):
            continue

        # Part dividers (Male Part, Female Part, Chorus, etc.)
        if child.get('class') and 't2l-part-divider' in ' '.join(child.get('class', [])):
            label_span = child.select_one('span.text-\\[10px\\]')
            if not label_span:
                # Fallback: find the span that isn't h-px
                for span in child.find_all('span'):
                    classes = ' '.join(span.get('class', []))
                    if 'h-px' not in classes:
                        label_span = span
                        break
            if label_span:
                part_label = label_span.get_text(strip=True)
                if part_label:
                    lines.append(f"{part_label} :")
            continue

        # Paragraphs and verse blocks
        if child.name in ('p', 'div'):
            # Process inline content, replacing <br> with newlines
            text = ""
            for el in child.children:
                if isinstance(el, str):
                    text += el
                elif hasattr(el, 'name'):
                    if el.name == 'br':
                        text += "\n"
                    else:
                        text += el.get_text()
            text = text.strip()
            if text:
                lines.append(text)

    result = "\n".join(lines)
    # Clean up excessive newlines
    result = re.sub(r'\n{3,}', '\n\n', result)
    return result.strip()


# ============================================================
#  STEP 4: Cleaning functions (same logic as lyrics fix.py + lyricsclean.py)
# ============================================================
def clean_english_metadata(text):
    """
    Remove inline metadata lines from English lyrics.
    Matches patterns like: 'Singer :', 'Music by :', 'Lyrics by :', etc.
    Also removes decorative dot lines and 'Not Known' lines.
    """
    if not text:
        return text

    lines = text.split('\n')
    cleaned = []
    i = 0

    while i < len(lines):
        line = lines[i].strip()

        # Skip empty lines (will be re-added naturally)
        if not line:
            i += 1
            continue

        # --- Remove metadata lines (single-line with value) ---
        # e.g., "Singer : Sujatha Mohan", "Music by : A.R. Rahman"
        if re.match(
            r'^(Singer|Singers?|Music\s*(?:by|Director)?|Lyric(?:s|ist)?\s*(?:by)?|'
            r'Film|Movie|Music\s*by|Lyrics\s*by|Composer|Artists?|'
            r'Star\s*Cast|Starring|Director|Album|Year|Language)\s*[:\-]+\s*.+$',
            line, re.IGNORECASE
        ):
            i += 1
            continue

        # --- Remove metadata label on its own line (next line has value) ---
        if re.match(
            r'^(Singer|Singers?|Music\s*(?:by|Director)?|Lyric(?:s|ist)?\s*(?:by)?|'
            r'Film|Movie|Music\s*by|Lyrics\s*by|Composer|Artists?|'
            r'Star\s*Cast|Starring|Director|Album|Year|Language)\s*[:\-]*$',
            line, re.IGNORECASE
        ):
            # Skip this line and the next (which contains the value)
            if i + 1 < len(lines) and lines[i + 1].strip():
                i += 2
            else:
                i += 1
            continue

        # --- Remove decorative dot/dash lines ---
        if re.match(r'^[\.\-–—_\s…·•*=~]+$', line):
            i += 1
            continue

        # --- Remove "Not Known" / "Unknown" standalone ---
        if re.match(r'^(Not\s*Known|Unknown|N/?A)\s*$', line, re.IGNORECASE):
            i += 1
            continue

        cleaned.append(line)
        i += 1

    return "\n".join(cleaned).strip()


def clean_tamil_metadata(text):
    """
    Remove inline Tamil metadata from lyrics.
    Matches patterns like: 'பாடலாசிரியர் :', 'இசையமைப்பாளர் :', etc.
    Also removes 'அறியபடவில்லை' lines and decorative dots.
    """
    if not text:
        return text

    lines = text.split('\n')
    cleaned = []
    i = 0

    while i < len(lines):
        line = lines[i].strip()

        if not line:
            i += 1
            continue

        # --- Two-line metadata (label on one line, value on next) ---
        if re.match(
            r'^(பாடலாசிரியர்|இசையமைப்பாளர்|இசை|பாடகர்|பாடியவர்|பாடியவர்கள்|படம்|'
            r'பாடகி|இயக்குநர்|நடிகர்கள்|ஆண்டு|மொழி)\s*[:\-]*$',
            line
        ):
            if i + 1 < len(lines):
                next_line = lines[i + 1].strip()
                if next_line and not re.match(r'^(ஆண்|பெண்|குழு|அனைவரும்)\s*[:\-]', next_line):
                    i += 2
                    continue
            i += 1
            continue

        # --- Single-line metadata (label : value) ---
        if re.match(
            r'^(பாடலாசிரியர்|இசையமைப்பாளர்|இசை|பாடகர்|பாடியவர்|பாடியவர்கள்|படம்|'
            r'பாடகி|இயக்குநர்|நடிகர்கள்|ஆண்டு|மொழி)\s*[:\-]+\s*(.+)$',
            line
        ):
            i += 1
            continue

        # --- Remove "அறியபடவில்லை" / "Not Known" ---
        if "அறியபடவில்லை" in line or "அறியப்படவில்லை" in line or "Not Known" in line:
            i += 1
            continue

        # --- Remove decorative dot/dash lines ---
        if re.match(r'^[\.\-–—_\s…·•*=~]+$', line):
            i += 1
            continue

        cleaned.append(line)
        i += 1

    return "\n".join(cleaned).strip()


# ============================================================
#  STEP 5: Main workflow
# ============================================================
def main():
    print("=" * 60)
    print("🎵 Tamil2Lyrics Auto-Updater")
    print("=" * 60)

    # 1. Get sitemap URLs
    sitemap_urls = fetch_sitemap_urls()

    # 2. Load existing URLs from all DBs
    existing_urls = load_existing_urls()

    # 3. Find new URLs
    new_urls = [u for u in sitemap_urls if u not in existing_urls]
    print(f"\n🆕 Found {len(new_urls)} NEW songs to scrape")

    if not new_urls:
        print("✅ Database is already up-to-date! No new songs found.")
        return

    # 4. Scrape new songs
    new_songs = []
    for idx, url in enumerate(new_urls, 1):
        print(f"\n🎶 [{idx}/{len(new_urls)}] Scraping: {url}")
        song = scrape_song(url)
        if song:
            new_songs.append(song)
            print(f"   ✅ {song['title']} — {song['movie']}")
        else:
            print(f"   ⚠️  Skipped (failed to scrape)")

        # Rate limiting
        if idx < len(new_urls):
            time.sleep(REQUEST_DELAY)

    if not new_songs:
        print("\n⚠️  No songs were successfully scraped.")
        return

    # 5. Load existing db5.json and prepend new songs
    print(f"\n📝 Updating {TARGET_DB}...")
    if os.path.exists(TARGET_DB):
        with open(TARGET_DB, "r", encoding="utf-8") as f:
            existing_data = json.load(f)
    else:
        existing_data = []

    # Prepend new songs at the beginning
    updated_data = new_songs + existing_data

    with open(TARGET_DB, "w", encoding="utf-8") as f:
        json.dump(updated_data, f, indent=4, ensure_ascii=False)

    print(f"✅ Successfully added {len(new_songs)} new songs to {TARGET_DB}")
    print(f"📊 Total songs in {TARGET_DB}: {len(updated_data)}")
    print("\n" + "=" * 60)
    print("🎉 Auto-Update Complete!")
    print("=" * 60)


if __name__ == "__main__":
    main()
