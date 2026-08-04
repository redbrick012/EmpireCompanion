from flask import Flask, request, jsonify
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import json
import re

app = Flask(__name__)

# ============================================================
# PROFUND DECISIONS URLs
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


# ============================================================
# HELPERS
# ============================================================

def clean_text(element):
    """Return clean text from a BeautifulSoup element."""

    if not element:
        return ""

    return element.get_text(
        " ",
        strip=True
    )


def absolute_url(url):
    """Turn PD relative URLs into full URLs."""

    if not url:
        return None

    if url.startswith("//"):
        return "https:" + url

    if url.startswith("/"):
        return "https://www.profounddecisions.co.uk" + url

    if url.startswith("http://"):
        return url

    if url.startswith("https://"):
        return url

    return url


# ============================================================
# CHARACTER DETAILS
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

    # The skills tab has wikiSkillDetails
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

            "description":
                clean_text(description),

            "url":
                absolute_url(
                    link.get("href")
                ),

            "icon":
                absolute_url(
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

    # Find the table with Ribbon / Item / Type / Slot
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

            "name":
                name,

            "realm":
                realm,

            "description":
                clean_text(description),

            "url":
                absolute_url(
                    link.get("href")
                ),

            "icon":
                absolute_url(
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

            "name":
                name,

            "description":
                clean_text(description),

            "url":
                absolute_url(
                    link.get("href")
                ),

            "icon":
                absolute_url(
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

    # Find the Bonded Items heading
    heading = None

    for h2 in soup.find_all("h2"):

        if clean_text(h2) == "Bonded Items":
            heading = h2
            break

    if not heading:
        return items

    # The skillBlock follows the heading
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

            "text":
                text,

            "description":
                clean_text(description),

            "url":
                absolute_url(
                    link.get("href")
                ),

            "icon":
                absolute_url(
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

    # Background is currently mostly an empty panel on the
    # supplied character page. We keep this generic so that
    # future background content is not lost.

    panels = soup.find_all(
        "div",
        class_="TabPanel"
    )

    for panel in panels:

        text = clean_text(panel)

        if not text:
            continue

        # Avoid duplicating the actual structured tabs.
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
# FULL CHARACTER PARSER
# ============================================================

def parse_character(soup):

    details = parse_details(soup)

    skills = parse_skills(soup)

    ribbons = parse_ribbons(soup)

    rituals = parse_rituals(soup)

    spells = parse_spells(soup)

    bonded_items = parse_bonded_items(soup)

    background = parse_background(soup)

    # Character name
    name = ""

    h1 = soup.find(
        "h1"
    )

    if h1:
        name = clean_text(h1)

    return {

        "name":
            name,

        "details":
            details,

        "skills":
            skills,

        "ribbons":
            ribbons,

        "rituals":
            rituals,

        "spells":
            spells,

        "bonded_items":
            bonded_items,

        "background":
            background

    }


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

            "name":
                name,

            "url":
                url

        })

    return characters


# ============================================================
# SAVE CHARACTER
# ============================================================

def save_character(character):

    with open(
        "character.json",
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            character,
            file,
            indent=2,
            ensure_ascii=False
        )

    print()
    print("Saved character.json")


# ============================================================
# LOGIN / IMPORT
# ============================================================

@app.route(
    "/test-login",
    methods=["POST"]
)
def test_login():

    data = request.get_json()

    login = data.get("login")
    password = data.get("password")

    if not login or not password:

        return jsonify({

            "success":
                False,

            "error":
                "Login and password are required"

        }), 400

    session = requests.Session()

    session.headers.update({

        "User-Agent":
            "Empire Companion",

        "Accept":
            "text/html,application/xhtml+xml,"
            "application/xml;q=0.9,*/*;q=0.8"

    })

    try:

        # ====================================================
        # STEP 1 - ESTABLISH SESSION
        # ====================================================

        print()
        print("=" * 50)
        print("STEP 1 - INITIAL REQUEST")
        print("=" * 50)

        initial = session.get(
            PD_HOME,
            timeout=20
        )

        print(
            "Status:",
            initial.status_code
        )

        print(
            "Cookies:",
            list(session.cookies.keys())
        )

        # ====================================================
        # STEP 2 - LOGIN
        # ====================================================

        print()
        print("=" * 50)
        print("STEP 2 - LOGIN")
        print("=" * 50)

        response = session.post(

            PD_LOGIN,

            data={

                "login":
                    login,

                "password":
                    password

            },

            timeout=20

        )

        print(
            "Status:",
            response.status_code
        )

        logged_in = (
            "logout"
            in response.text.lower()
        )

        if not logged_in:

            print(
                "Authentication could NOT be confirmed"
            )

            return jsonify({

                "success":
                    False,

                "stage":
                    "login",

                "message":
                    "Login could not be confirmed"

            })

        print(
            "Authenticated: YES"
        )

        # ====================================================
        # STEP 3 - GET CHARACTER LIST
        # ====================================================

        print()
        print("=" * 50)
        print("STEP 3 - CHARACTER LIST")
        print("=" * 50)

        characters = get_characters(
            session
        )

        print(
            "Characters found:",
            len(characters)
        )

        for character in characters:

            print(
                " ",
                character["name"],
                "=>",
                character["url"]
            )

        if not characters:

            return jsonify({

                "success":
                    False,

                "stage":
                    "character-list",

                "message":
                    "No characters found"

            })

        # ====================================================
        # STEP 4 - IMPORT CHARACTERS
        # ====================================================

        imported_characters = []

        for character in characters:

            print()
            print("=" * 50)
            print(
                "IMPORTING:",
                character["name"]
            )
            print("=" * 50)

            character_response = session.get(

                character["url"],

                timeout=20

            )

            print(
                "Status:",
                character_response.status_code
            )

            print(
                "Final URL:",
                character_response.url
            )

            print(
                "Size:",
                len(character_response.text)
            )

            # ----------------------------------------------
            # Save raw HTML
            # ----------------------------------------------

            filename = (
                "character_"
                + re.sub(
                    r"[^a-zA-Z0-9_-]",
                    "_",
                    character["name"]
                )
                + ".html"
            )

            with open(
                filename,
                "w",
                encoding="utf-8"
            ) as file:

                file.write(
                    character_response.text
                )

            print(
                "Saved:",
                filename
            )

            # ----------------------------------------------
            # Parse
            # ----------------------------------------------

            soup = BeautifulSoup(

                character_response.text,

                "html.parser"

            )

            parsed = parse_character(
                soup
            )

            # ----------------------------------------------
            # Add URLs
            # ----------------------------------------------

            parsed["request_url"] = (
                character["url"]
            )

            parsed["final_url"] = (
                character_response.url
            )

            # ----------------------------------------------
            # Save individual JSON
            # ----------------------------------------------

            json_filename = (
                "character_"
                + re.sub(
                    r"[^a-zA-Z0-9_-]",
                    "_",
                    character["name"]
                )
                + ".json"
            )

            with open(
                json_filename,
                "w",
                encoding="utf-8"
            ) as file:

                json.dump(

                    parsed,

                    file,

                    indent=2,

                    ensure_ascii=False

                )

            print(
                "Saved:",
                json_filename
            )

            imported_characters.append(
                parsed
            )

        # ====================================================
        # SAVE ALL CHARACTERS
        # ====================================================

        with open(
            "characters.json",
            "w",
            encoding="utf-8"
        ) as file:

            json.dump(

                imported_characters,

                file,

                indent=2,

                ensure_ascii=False

            )

        print()
        print("=" * 50)
        print("IMPORT COMPLETE")
        print("=" * 50)

        print(
            "Imported:",
            len(imported_characters)
        )

        # ====================================================
        # RETURN
        # ====================================================

        return jsonify({

            "success":
                True,

            "authenticated":
                True,

            "character_count":
                len(imported_characters),

            "characters":
                imported_characters

        })

    except requests.RequestException as error:

        print()
        print(
            "REQUEST ERROR:",
            error
        )

        return jsonify({

            "success":
                False,

            "error":
                str(error)

        }), 500

    except Exception as error:

        print()
        print(
            "ERROR:",
            error
        )

        return jsonify({

            "success":
                False,

            "error":
                str(error)

        }), 500


# ============================================================
# TEST PAGE
# ============================================================

@app.route("/")
def index():

    return """
<!DOCTYPE html>

<html>

<head>

<title>Empire Companion</title>

<meta
    name="viewport"
    content="width=device-width, initial-scale=1"
>

<style>

body {

    font-family:
        Arial,
        sans-serif;

    max-width:
        500px;

    margin:
        40px auto;

    padding:
        20px;

    background:
        #f4f4f4;

}

.card {

    background:
        white;

    padding:
        20px;

    border-radius:
        12px;

    box-shadow:
        0 2px 8px
        rgba(0,0,0,0.15);

}

h1 {

    color:
        #315b73;

}

input {

    width:
        100%;

    padding:
        12px;

    margin:
        8px 0;

    box-sizing:
        border-box;

    border:
        1px solid #ccc;

    border-radius:
        6px;

    font-size:
        16px;

}

button {

    width:
        100%;

    padding:
        14px;

    margin-top:
        10px;

    border:
        none;

    border-radius:
        8px;

    background:
        #315b73;

    color:
        white;

    font-size:
        16px;

    font-weight:
        bold;

}

pre {

    white-space:
        pre-wrap;

    word-break:
        break-word;

    background:
        #eee;

    padding:
        15px;

    margin-top:
        20px;

    border-radius:
        8px;

    max-height:
        600px;

    overflow:
        auto;

}

</style>

</head>

<body>

<div class="card">

<h1>⚔ Empire Companion</h1>

<h2>PD Character Import</h2>

<form id="loginForm">

<input
    id="login"
    placeholder="PD Login"
    autocomplete="username"
    required
>

<input
    id="password"
    type="password"
    placeholder="PD Password"
    autocomplete="current-password"
    required
>

<button type="submit">
    🔐 Login & Import Character
</button>

</form>

<pre id="result">Waiting...</pre>

</div>

<script>

document
.getElementById("loginForm")
.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        const result =
            document.getElementById(
                "result"
            );

        result.textContent =
            "🔄 Logging into Profound Decisions...";

        try {

            const response =
                await fetch(
                    "/test-login",
                    {

                        method:
                            "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify({

                                login:
                                    document
                                    .getElementById(
                                        "login"
                                    )
                                    .value,

                                password:
                                    document
                                    .getElementById(
                                        "password"
                                    )
                                    .value

                            })

                    }
                );

            const data =
                await response.json();

            result.textContent =
                JSON.stringify(
                    data,
                    null,
                    2
                );

        }

        catch(error) {

            result.textContent =
                "ERROR: " + error;

        }

    }
);

</script>

</body>

</html>
"""


# ============================================================
# START SERVER
# ============================================================

if __name__ == "__main__":

    print()
    print("=" * 50)
    print("       EMPIRE COMPANION - PD IMPORT")
    print("=" * 50)
    print()
    print("Open:")
    print()
    print("http://127.0.0.1:5000")
    print()
    print("Press CTRL+C to stop.")
    print()

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=False
    )