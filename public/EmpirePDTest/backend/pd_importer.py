import re
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin


# ============================================================
# PROFUND DECISIONS
# ============================================================

PD_HOME = "https://www.profounddecisions.co.uk/home"

PD_LOGIN = (
    "https://www.profounddecisions.co.uk/"
    "home?0-1.-topCentrePanel-loginPanel-loginForm"
)

PD_CHARACTERS = (
    "https://www.profounddecisions.co.uk/"
    "account/characters?2"
)

PD_BASE = "https://www.profounddecisions.co.uk"


# ============================================================
# HELPERS
# ============================================================

def clean_text(element):
    if not element:
        return ""

    return element.get_text(" ", strip=True)


def absolute_url(url):
    if not url:
        return None

    if url.startswith("//"):
        return "https:" + url

    if url.startswith("/"):
        return PD_BASE + url

    if url.startswith("http://"):
        return url

    if url.startswith("https://"):
        return url

    return url


def safe_filename(name):
    return re.sub(
        r"[^a-zA-Z0-9_-]",
        "_",
        name
    )


# ============================================================
# DETAILS
# ============================================================

def parse_details(soup):

    details = {}

    table = soup.find(
        "table",
        class_="viewerTable"
    )

    if not table:
        return details

    for row in table.find_all("tr"):

        cells = row.find_all("td")

        if len(cells) < 2:
            continue

        key = clean_text(cells[0])
        value = clean_text(cells[1])

        if key:
            details[key] = value

    return details


# ============================================================
# SKILLS
# ============================================================

def parse_skills(soup):

    skills = []

    container = soup.find(
        "div",
        class_="wikiSkillDetails"
    )

    if not container:
        return skills

    for block in container.find_all(
        "div",
        class_="skillBlock"
    ):

        link = block.find("a")

        if not link:
            continue

        header = block.find(
            "span",
            class_="skillHeader"
        )

        description = block.find(
            "span",
            class_="skillText"
        )

        image = block.find("img")

        name = clean_text(header)

        if not name:
            continue

        skills.append({
            "name": name,
            "description": clean_text(description),
            "url": absolute_url(
                link.get("href")
            ),
            "icon": absolute_url(
                image.get("src")
                if image else None
            )
        })

    return skills


# ============================================================
# RIBBONS
# ============================================================

def parse_ribbons(soup):

    ribbons = []

    for table in soup.find_all("table"):

        headers = [
            clean_text(th).lower()
            for th in table.find_all("th")
        ]

        if (
            "ribbon" not in headers
            or "item" not in headers
        ):
            continue

        for row in table.find_all("tr"):

            cells = row.find_all("td")

            if not cells:
                continue

            values = [
                clean_text(cell)
                for cell in cells
            ]

            ribbons.append({
                "ribbon":
                    values[0]
                    if len(values) > 0
                    else "",

                "item":
                    values[1]
                    if len(values) > 1
                    else "",

                "type":
                    values[2]
                    if len(values) > 2
                    else "",

                "slot":
                    values[3]
                    if len(values) > 3
                    else ""
            })

    return ribbons


# ============================================================
# RITUALS
# ============================================================

def parse_rituals(soup):

    rituals = []

    container = soup.find(
        "div",
        class_="ritualList"
    )

    if not container:
        return rituals

    for block in container.find_all(
        "div",
        class_="skillBlock"
    ):

        link = block.find("a")

        if not link:
            continue

        headers = block.find_all(
            "span",
            class_="skillHeader"
        )

        description = block.find(
            "span",
            class_="skillText"
        )

        image = block.find("img")

        if not headers:
            continue

        name = clean_text(headers[0])

        realm = ""

        if len(headers) > 1:
            realm = clean_text(headers[1])

        rituals.append({
            "name": name,
            "realm": realm,
            "description":
                clean_text(description),
            "url": absolute_url(
                link.get("href")
            ),
            "icon": absolute_url(
                image.get("src")
                if image else None
            )
        })

    return rituals


# ============================================================
# SPELLS
# ============================================================

def parse_spells(soup):

    spells = []

    container = soup.find(
        "div",
        class_="spellList"
    )

    if not container:
        return spells

    for block in container.find_all(
        "div",
        class_="skillBlock"
    ):

        link = block.find("a")

        if not link:
            continue

        header = block.find(
            "span",
            class_="skillHeader"
        )

        description = block.find(
            "span",
            class_="skillText"
        )

        image = block.find("img")

        name = clean_text(header)

        if not name:
            continue

        spells.append({
            "name": name,
            "description":
                clean_text(description),
            "url": absolute_url(
                link.get("href")
            ),
            "icon": absolute_url(
                image.get("src")
                if image else None
            )
        })

    return spells


# ============================================================
# BONDED ITEMS
# ============================================================

def parse_bonded_items(soup):

    items = []

    heading = None

    for h2 in soup.find_all("h2"):

        if clean_text(h2) == "Bonded Items":
            heading = h2
            break

    if not heading:
        return items

    parent = heading.parent

    if not parent:
        return items

    for block in parent.find_all(
        "div",
        class_="skillBlock"
    ):

        link = block.find("a")

        if not link:
            continue

        text_elements = block.find_all(
            "span",
            class_="skillHeader"
        )

        description = block.find(
            "span",
            class_="skillText"
        )

        image = block.find("img")

        text = [
            clean_text(x)
            for x in text_elements
            if clean_text(x)
        ]

        items.append({
            "text": text,
            "description":
                clean_text(description),
            "url": absolute_url(
                link.get("href")
            ),
            "icon": absolute_url(
                image.get("src")
                if image else None
            )
        })

    return items


# ============================================================
# BACKGROUND
# ============================================================

def parse_background(soup):

    background = []

    panels = soup.find_all(
        "div",
        class_="TabPanel"
    )

    for panel in panels:

        text = clean_text(panel)

        if not text:
            continue

        if (
            "Rituals" in text
            or "Spells" in text
            or "Magician" in text
        ):
            continue

        if len(text) > 20:
            background.append(text)

    return background


# ============================================================
# CHARACTER PARSER
# ============================================================

def parse_character(soup):

    h1 = soup.find("h1")

    name = clean_text(h1)

    return {
        "name": name,
        "details": parse_details(soup),
        "skills": parse_skills(soup),
        "ribbons": parse_ribbons(soup),
        "rituals": parse_rituals(soup),
        "spells": parse_spells(soup),
        "bonded_items": parse_bonded_items(soup),
        "background": parse_background(soup)
    }


# ============================================================
# SESSION
# ============================================================

def create_session():

    session = requests.Session()

    session.headers.update({
        "User-Agent":
            "Empire Companion",
        "Accept":
            "text/html,application/xhtml+xml,"
            "application/xml;q=0.9,*/*;q=0.8"
    })

    return session


# ============================================================
# LOGIN
# ============================================================

def login(session, login_name, password):

    session.get(
        PD_HOME,
        timeout=20
    )

    response = session.post(
        PD_LOGIN,
        data={
            "login": login_name,
            "password": password
        },
        timeout=20
    )

    response.raise_for_status()

    logged_in = (
        "logout"
        in response.text.lower()
    )

    if not logged_in:
        raise RuntimeError(
            "Profound Decisions login could not be confirmed"
        )

    return True


# ============================================================
# CHARACTER LIST
# ============================================================

def get_characters(session):

    response = session.get(
        PD_CHARACTERS,
        timeout=20
    )

    response.raise_for_status()

    soup = BeautifulSoup(
        response.text,
        "html.parser"
    )

    characters = []

    listing = soup.find(
        "div",
        class_="characterListing"
    )

    if not listing:
        return characters

    for link in listing.find_all("a"):

        span = link.find("span")

        if not span:
            continue

        name = clean_text(span)

        href = link.get("href")

        if not href:
            continue

        url = urljoin(
            PD_CHARACTERS,
            href
        )

        characters.append({
            "name": name,
            "url": url
        })

    return characters


# ============================================================
# IMPORT ONE CHARACTER
# ============================================================

def import_character(session, character):

    response = session.get(
        character["url"],
        timeout=20
    )

    response.raise_for_status()

    soup = BeautifulSoup(
        response.text,
        "html.parser"
    )

    parsed = parse_character(
        soup
    )

    parsed["request_url"] = (
        character["url"]
    )

    parsed["final_url"] = (
        response.url
    )

    return parsed


# ============================================================
# IMPORT EVERYTHING
# ============================================================

def import_characters(
    login_name,
    password
):

    session = create_session()

    login(
        session,
        login_name,
        password
    )

    characters = get_characters(
        session
    )

    imported = []

    for character in characters:

        parsed = import_character(
            session,
            character
        )

        imported.append(parsed)

    return {
        "authenticated": True,
        "character_count": len(imported),
        "characters": imported
    }