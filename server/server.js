import express from "express";
import cors from "cors";
import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

/*
==========================================================
CONFIG
==========================================================
*/

const PD_LOGIN_URL =
    "https://www.profounddecisions.co.uk/account/login";

const PD_CHARACTERS_URL =
    "https://www.profounddecisions.co.uk/account/characters";

const PD_BASE_URL =
    "https://www.profounddecisions.co.uk";

const SESSION_DIR =
    path.join(process.cwd(), "pd-session");

const STORAGE_FILE =
    path.join(SESSION_DIR, "storage.json");
if (process.env.PD_STORAGE_STATE) {
    if (!fs.existsSync(SESSION_DIR)) {
        fs.mkdirSync(SESSION_DIR, { recursive: true });
    }

    fs.writeFileSync(
        STORAGE_FILE,
        process.env.PD_STORAGE_STATE,
        "utf8"
    );

    console.log(
        "[Empire Companion] Loaded PD session from environment."
    );
}
let browser = null;
let context = null;
let page = null;
let loginInProgress = false;


/*
==========================================================
TEXT HELPERS
==========================================================
*/

function cleanText(value) {

    if (!value) {
        return "";
    }

    return value
        .replace(/\u00a0/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}


function absoluteUrl(href) {

    if (!href) {
        return "";
    }

    try {
        return new URL(
            href,
            PD_BASE_URL
        ).href;
    } catch {
        return href;
    }
}


/*
==========================================================
BROWSER / SESSION
==========================================================
*/

async function getBrowserContext() {

    if (context) {
        return context;
    }

    console.log(
        "[Empire Companion] Starting Playwright..."
    );

    if (fs.existsSync(STORAGE_FILE)) {

        console.log(
            "[Empire Companion] Loading saved PD session..."
        );

    } else {

        console.log(
            "[Empire Companion] No saved PD session found."
        );
    }

browser = await chromium.launch({
    headless: false,
});

    context = await browser.newContext({

        storageState:
            fs.existsSync(STORAGE_FILE)
                ? STORAGE_FILE
                : undefined,

        userAgent:
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/149 Safari/537.36",
    });

    return context;
}


/*
==========================================================
SAVE SESSION
==========================================================
*/

async function saveSession() {

    if (!context) {
        return;
    }

    if (!fs.existsSync(SESSION_DIR)) {

        fs.mkdirSync(
            SESSION_DIR,
            {
                recursive: true,
            }
        );
    }

    await context.storageState({
        path: STORAGE_FILE,
    });

    console.log(
        "[Empire Companion] PD session saved."
    );
}


/*
==========================================================
GET PAGE
==========================================================
*/

async function getPage() {

    const ctx =
        await getBrowserContext();

    if (
        page &&
        !page.isClosed()
    ) {
        return page;
    }

    page =
        await ctx.newPage();

    return page;
}


/*
==========================================================
LOGIN CHECK
==========================================================
*/

async function checkPDLogin() {

    const currentPage =
        await getPage();

    console.log(
        "[Empire Companion] Checking PD session..."
    );

    await currentPage.goto(
        PD_CHARACTERS_URL,
        {
            waitUntil:
                "domcontentloaded",

            timeout: 30000,
        }
    );

    await currentPage.waitForTimeout(1000);

    const currentUrl =
        currentPage.url();

    console.log(
        "[Empire Companion] PD URL after navigation:",
        currentUrl
    );

    if (
        currentUrl.includes("/account/login")
    ) {

        console.log(
            "[Empire Companion] PD redirected to login."
        );

        return false;
    }

    const characterLinks =
        await currentPage
            .locator(
                "a[href*='characterLink']"
            )
            .count();

    console.log(
        "[Empire Companion] Character links found:",
        characterLinks
    );

    return characterLinks > 0;
}


/*
==========================================================
LOGIN
==========================================================
*/

async function startLogin() {

    if (loginInProgress) {
        return;
    }

    loginInProgress = true;

    try {

        const currentPage =
            await getPage();

        console.log(
            "[Empire Companion] Opening PD login..."
        );

        await currentPage.goto(
            PD_LOGIN_URL,
            {
                waitUntil:
                    "domcontentloaded",

                timeout: 30000,
            }
        );

        console.log("");
        console.log(
            "========================================"
        );
        console.log(
            " PD LOGIN REQUIRED"
        );
        console.log(
            "========================================"
        );
        console.log(
            "Login to Profound Decisions in the"
        );
        console.log(
            "browser window that just opened."
        );
        console.log("");
        console.log(
            "After login, leave the browser open."
        );
        console.log(
            "Empire Companion will detect it."
        );
        console.log(
            "========================================"
        );
        console.log("");

        await currentPage.waitForURL(
            url =>
                !url
                    .toString()
                    .includes(
                        "/account/login"
                    ),
            {
                timeout:
                    5 * 60 * 1000,
            }
        );

        console.log(
            "[Empire Companion] PD login detected."
        );

        await saveSession();

    } catch (error) {

        console.error(
            "[Empire Companion] Login failed:",
            error.message
        );

    } finally {

        loginInProgress = false;
    }
}


/*
==========================================================
GET CHARACTER LINKS
==========================================================
*/

async function getCharacterLinks() {

    const currentPage = await getPage();

    console.log(
        "[Empire Companion] Loading character list..."
    );

    await currentPage.goto(
        PD_CHARACTERS_URL,
        {
            waitUntil: "domcontentloaded",
            timeout: 30000,
        }
    );

    await currentPage.waitForTimeout(1000);

    /*
    ------------------------------------------------------
    Find the character links
    ------------------------------------------------------
    */

    const characterLinks =
        await currentPage.locator(
            "a[href*='characterLink']"
        ).evaluateAll(links => {

            return links.map((link, index) => {

                const name =
                    (
                        link.querySelector("span")?.textContent ||
                        link.textContent ||
                        `Character ${index + 1}`
                    )
                        .replace(/\s+/g, " ")
                        .trim();

                return {
                    name,
                    index,
                };
            });
        });

    console.log(
        `[Empire Companion] Found ${characterLinks.length} character links.`
    );

    if (!characterLinks.length) {
        return [];
    }

    /*
    ------------------------------------------------------
    IMPORTANT:
    The href on these links is NOT the character page.
    We must actually click the Wicket link and capture
    the resulting /empire/viewcharacter URL.
    ------------------------------------------------------
    */

    const characters = [];

    for (
        const character of characterLinks
    ) {

        try {

            console.log(
                `[Empire Companion] Opening character: ${character.name}`
            );

            /*
            Return to character list before each click.
            */

            if (
                !currentPage.url().includes(
                    "/account/characters"
                )
            ) {

                await currentPage.goto(
                    PD_CHARACTERS_URL,
                    {
                        waitUntil:
                            "domcontentloaded",

                        timeout:
                            30000,
                    }
                );

                await currentPage.waitForTimeout(
                    500
                );
            }

            const links =
                currentPage.locator(
                    "a[href*='characterLink']"
                );

            const link =
                links.nth(
                    character.index
                );

            await link.waitFor({
                state: "visible",
                timeout: 10000,
            });

            /*
            Click the actual PD/Wicket link.
            */

            await link.click();

            /*
            Give PD time to process the navigation.
            */

            await currentPage.waitForTimeout(
                1000
            );

            const actualUrl =
                currentPage.url();

            console.log(
                `[Empire Companion] ${character.name} opened at:`,
                actualUrl
            );

            /*
            We expect:
            
            /empire/viewcharacter?...
            
            */

            if (
                !actualUrl.includes(
                    "/empire/viewcharacter"
                )
            ) {

                console.warn(
                    `[Empire Companion] WARNING: ${character.name} did not open a character page.`
                );

                console.warn(
                    `[Empire Companion] Current URL: ${actualUrl}`
                );

                /*
                Go back to the character list
                and continue.
                */

                await currentPage.goto(
                    PD_CHARACTERS_URL,
                    {
                        waitUntil:
                            "domcontentloaded",

                        timeout:
                            30000,
                    }
                );

                continue;
            }

            characters.push({

                name:
                    character.name,

                url:
                    actualUrl,
            });

            /*
            Return to the character list.
            */

            await currentPage.goto(
                PD_CHARACTERS_URL,
                {
                    waitUntil:
                        "domcontentloaded",

                    timeout:
                        30000,
                }
            );

            await currentPage.waitForTimeout(
                500
            );

        } catch (error) {

            console.error(
                `[Empire Companion] Failed to open ${character.name}:`,
                error.message
            );

            /*
            Make sure we get back to the list
            if something went wrong.
            */

            try {

                await currentPage.goto(
                    PD_CHARACTERS_URL,
                    {
                        waitUntil:
                            "domcontentloaded",

                        timeout:
                            30000,
                    }
                );

            } catch {
                // Ignore recovery navigation errors
            }
        }
    }

    console.log(
        `[Empire Companion] Successfully resolved ${characters.length} character URLs.`
    );

    return characters;
}

/*
==========================================================
DETAILS
==========================================================
*/

async function scrapeDetails(characterPage) {

    return await characterPage.evaluate(() => {

        const result = {};

        const clean = value => {

            return (
                value || ""
            )
                .replace(/\u00a0/g, " ")
                .replace(/\s+/g, " ")
                .trim();
        };

        /*
        --------------------------------------------------
        Find the main character details table
        --------------------------------------------------
        */

        const tables =
            Array.from(
                document.querySelectorAll(
                    "#DisplayActiveCharacter table"
                )
            );

        for (
            const table of tables
        ) {

            const rows =
                Array.from(
                    table.querySelectorAll("tr")
                );

            for (
                const row of rows
            ) {

                const cells =
                    Array.from(
                        row.querySelectorAll(
                            "td, th"
                        )
                    )
                        .map(
                            cell =>
                                clean(
                                    cell.textContent
                                )
                        );

                if (
                    cells.length >= 2
                ) {

                    const label =
                        cells[0];

                    const value =
                        cells
                            .slice(1)
                            .join(" ")
                            .trim();

                    if (
                        label &&
                        value
                    ) {

                        result[label] =
                            value;
                    }
                }
            }
        }

        return result;
    });
}

/*
==========================================================
FIND SECTION
==========================================================
*/
async function findSectionContent(characterPage, sectionName) {

    return await characterPage.evaluate((sectionName) => {

        const normalise = (value) => {

            return (value || "")
                .replace(/\u00a0/g, " ")
                .replace(/\s+/g, " ")
                .trim();

        };

        const headings = Array.from(
            document.querySelectorAll(
                "h1, h2, h3, h4, h5, h6"
            )
        );

        const heading = headings.find((h) => {

            const text = normalise(
                h.textContent
            );

            return (
                text.toLowerCase() ===
                sectionName.toLowerCase()
            );

        });

        if (!heading) {
            return [];
        }

        const elements = [];

        let element =
            heading.nextElementSibling;

        while (element) {

            if (
                /^H[1-6]$/i.test(
                    element.tagName
                )
            ) {
                break;
            }

            elements.push(element);

            element =
                element.nextElementSibling;
        }

        return elements.map((element) => {

            const links =
                Array.from(
                    element.querySelectorAll("a")
                ).map((a) => {

                    return {
                        text: normalise(
                            a.textContent
                        ),

                        href:
                            a.href || ""
                    };

                });

            const rows =
                Array.from(
                    element.querySelectorAll("tr")
                ).map((row) => {

                    return Array.from(
                        row.querySelectorAll(
                            "th, td"
                        )
                    )
                        .map((cell) => {

                            return normalise(
                                cell.textContent
                            );

                        })
                        .filter(Boolean);

                });

            return {

                text: normalise(
                    element.innerText ||
                    element.textContent
                ),

                html:
                    element.outerHTML || "",

                links,

                rows

            };

        });

    }, sectionName);

}


/*
==========================================================
SKILLS
==========================================================
*/

async function scrapeSkills(characterPage) {

    const results =
        await characterPage.evaluate(() => {

            const clean = value => {

                return (
                    value || ""
                )
                    .replace(/\u00a0/g, " ")
                    .replace(/\s+/g, " ")
                    .trim();
            };

            const output = [];

            /*
            ----------------------------------------------
            Skills live inside .wikiSkillDetails
            ----------------------------------------------
            */

            const skillBlocks =
                Array.from(
                    document.querySelectorAll(
                        "#DisplayActiveCharacter .wikiSkillDetails .skillBlock"
                    )
                );

            for (
                const block of skillBlocks
            ) {

                const link =
                    block.querySelector("a");

                if (!link) {
                    continue;
                }

                const header =
                    clean(
                        block.querySelector(
                            ".skillHeader"
                        )?.textContent
                    );

                const description =
                    clean(
                        block.querySelector(
                            ".skillText"
                        )?.textContent
                    );

                const href =
                    link.getAttribute("href") ||
                    "";

                let wikiUrl = "";

                if (href) {

                    try {

                        wikiUrl =
                            new URL(
                                href,
                                window.location.href
                            ).href;

                    } catch {

                        wikiUrl =
                            href;
                    }
                }

                if (
                    header
                ) {

                    output.push({

                        name:
                            header,

                        description:
                            description,

                        wikiUrl:
                            wikiUrl,
                    });
                }
            }

            return output;
        });

    return removeDuplicates(
        results
    );
}


/*
==========================================================
BONDED ITEMS
==========================================================
*/

async function scrapeBondedItems(characterPage) {

    const results =
        await characterPage.evaluate(() => {

            const clean = value => {

                return (
                    value || ""
                )
                    .replace(/\u00a0/g, " ")
                    .replace(/\s+/g, " ")
                    .trim();
            };

            const output = [];

            const headings =
                Array.from(
                    document.querySelectorAll(
                        "#DisplayActiveCharacter h2"
                    )
                );

            const heading =
                headings.find(
                    h =>
                        clean(
                            h.textContent
                        ).toLowerCase() ===
                        "bonded items"
                );

            if (!heading) {
                return output;
            }

            let element =
                heading.nextElementSibling;

            while (element) {

                /*
                Stop at the next heading.
                */

                if (
                    /^H[1-6]$/i.test(
                        element.tagName
                    )
                ) {
                    break;
                }

                const blocks =
                    element.querySelectorAll(
                        ".skillBlock"
                    );

                for (
                    const block of blocks
                ) {

                    const link =
                        block.querySelector("a");

                    const spans =
                        Array.from(
                            block.querySelectorAll(
                                ".skillHeader"
                            )
                        )
                            .map(
                                span =>
                                    clean(
                                        span.textContent
                                    )
                            );

                    const description =
                        clean(
                            block.querySelector(
                                ".skillText"
                            )?.textContent
                        );

                    if (
                        spans.length
                    ) {

                        const first =
                            spans[0];

                        /*
                        Example:
                        56645 - Band of Destiny (Jotun Trinket) (Jewellery)
                        */

                        const idMatch =
                            first.match(
                                /^(\d+)\s*-\s*(.*)$/
                            );

                        output.push({

                            name:
                                idMatch
                                    ? idMatch[2]
                                    : first,

                            id:
                                idMatch
                                    ? idMatch[1]
                                    : "",

                            type:
                                spans[0]
                                    .match(
                                        /\(([^()]*)\)\s*$/
                                    )?.[1] || "",

                            expiry:
                                spans[1] || "",

                            description:
                                description,

                        });
                    }
                }

                element =
                    element.nextElementSibling;
            }

            return output;
        });

    return removeDuplicates(
        results
    );
}

/*
==========================================================
RIBBONS
==========================================================
*/

async function scrapeRibbons(characterPage) {

    const results =
        await characterPage.evaluate(() => {

            const clean = value => {

                return (
                    value || ""
                )
                    .replace(/\u00a0/g, " ")
                    .replace(/\s+/g, " ")
                    .trim();
            };

            const output = [];

            const tables =
                Array.from(
                    document.querySelectorAll(
                        "#DisplayActiveCharacter table"
                    )
                );

            for (
                const table of tables
            ) {

                const headers =
                    Array.from(
                        table.querySelectorAll(
                            "thead th, tr:first-child th"
                        )
                    )
                        .map(
                            th =>
                                clean(
                                    th.textContent
                                ).toLowerCase()
                        );

                if (
                    !headers.includes(
                        "ribbon"
                    )
                ) {
                    continue;
                }

                const rows =
                    Array.from(
                        table.querySelectorAll(
                            "tr"
                        )
                    );

                for (
                    const row of rows
                ) {

                    const cells =
                        Array.from(
                            row.querySelectorAll(
                                "td"
                            )
                        )
                            .map(
                                cell =>
                                    clean(
                                        cell.textContent
                                    )
                            );

                    if (
                        cells.length >= 4
                    ) {

                        output.push({

                            ribbon:
                                cells[0],

                            item:
                                cells[1],

                            type:
                                cells[2],

                            slot:
                                cells[3],
                        });
                    }
                }
            }

            return output;
        });

    return removeDuplicates(
        results
    );
}

/*
==========================================================
RITUALS
==========================================================
*/
async function scrapeRituals(characterPage) {

    return await scrapeMagicBlocks(
        characterPage,
        ".ritualList",
        "ritual"
    );
}

/*
==========================================================
SPELLS
==========================================================
*/

async function scrapeSpells(characterPage) {

    return await scrapeMagicBlocks(
        characterPage,
        ".spellList",
        "spell"
    );
}
async function scrapeMagicBlocks(
    characterPage,
    selector,
    type
) {

    const results =
        await characterPage.evaluate(
            ({ selector, type }) => {

                const clean = value => {

                    return (
                        value || ""
                    )
                        .replace(
                            /\u00a0/g,
                            " "
                        )
                        .replace(
                            /\s+/g,
                            " "
                        )
                        .trim();
                };

                const output = [];

                const blocks =
                    Array.from(
                        document.querySelectorAll(
                            `#DisplayActiveCharacter ${selector} .skillBlock`
                        )
                    );

                for (
                    const block of blocks
                ) {

                    const link =
                        block.querySelector(
                            "a"
                        );

                    const headers =
                        Array.from(
                            block.querySelectorAll(
                                ".skillHeader"
                            )
                        )
                            .map(
                                element =>
                                    clean(
                                        element.textContent
                                    )
                            );

                    const description =
                        clean(
                            block.querySelector(
                                ".skillText"
                            )?.textContent
                        );

                    if (
                        !headers.length
                    ) {
                        continue;
                    }

                    let wikiUrl = "";

                    if (link) {

                        const href =
                            link.getAttribute(
                                "href"
                            );

                        if (href) {

                            try {

                                wikiUrl =
                                    new URL(
                                        href,
                                        window.location.href
                                    ).href;

                            } catch {

                                wikiUrl =
                                    href;
                            }
                        }
                    }

                    output.push({

                        name:
                            headers[0],

                        magnitude:
                            headers
                                .slice(1)
                                .join(" "),

                        description:
                            description,

                        wikiUrl:
                            wikiUrl,

                        type:
                            type,
                    });
                }

                return output;
            },
            {
                selector,
                type,
            }
        );

    return removeDuplicates(
        results
    );
}
/*
==========================================================
GENERIC SECTION
==========================================================
*/

async function scrapeNamedSection(
    characterPage,
    sectionName
) {

    const sections =
        await findSectionContent(
            characterPage,
            sectionName
        );

    const results = [];

    for (
        const section of sections
    ) {

        for (
            const row of section.rows
        ) {

            if (!row.length) {
                continue;
            }

            results.push({

                name:
                    row[0],

                magnitude:
                    row.find(
                        value =>
                            /magnitude|rank/i
                                .test(value)
                    ) || "",

                description:
                    row.slice(1).join(" "),

                wikiUrl: "",
            });
        }

        for (
            const link of section.links
        ) {

            if (!link.text) {
                continue;
            }

            if (
                results.some(
                    item =>
                        item.name ===
                        link.text
                )
            ) {
                continue;
            }

            results.push({

                name:
                    link.text,

                magnitude: "",

                description:
                    section.text,

                wikiUrl:
                    link.href || "",
            });
        }
    }

    return removeDuplicates(
        results
    );
}


/*
==========================================================
BACKGROUND
==========================================================
*/

async function scrapeBackground(
    characterPage
) {

    const sections =
        await findSectionContent(
            characterPage,
            "Background"
        );

    return sections
        .map(
            section =>
                section.text
        )
        .filter(Boolean)
        .join("\n\n");
}


/*
==========================================================
REMOVE DUPLICATES
==========================================================
*/

function removeDuplicates(
    items
) {

    const seen =
        new Set();

    return items.filter(
        item => {

            const key =
                JSON.stringify(
                    item
                );

            if (
                seen.has(key)
            ) {
                return false;
            }

            seen.add(key);

            return true;
        }
    );
}


/*
==========================================================
SCRAPE CHARACTER
==========================================================
*/

async function scrapeCharacter(
    character,
    characterPage
) {

    console.log(
        `[Empire Companion] Opening ${character.name}...`
    );

    await characterPage.goto(
    character.url,
        {
            waitUntil:
                "domcontentloaded",

            timeout: 30000,
        }
    );

    await characterPage.waitForTimeout(
        1000
    );
const debugHtml =
    await characterPage.content();

fs.writeFileSync(
    path.join(
        SESSION_DIR,
        `debug-${character.name.replace(/[^a-z0-9]/gi, "_")}.html`
    ),
    debugHtml,
    "utf8"
);

console.log(
    `[Empire Companion] Saved debug HTML for ${character.name}`
);
    const actualUrl =
        characterPage.url();

    if (
        actualUrl.includes(
            "/account/login"
        )
    ) {

        throw new Error(
            "PD session expired while loading character."
        );
    }

    console.log(
        `[Empire Companion] Scraping ${character.name}...`
    );

    const details =
        await scrapeDetails(
            characterPage
        );

    const skills =
        await scrapeSkills(
            characterPage
        );

    const bondedItems =
        await scrapeBondedItems(
            characterPage
        );

    const ribbons =
        await scrapeRibbons(
            characterPage
        );

    const rituals =
        await scrapeRituals(
            characterPage
        );

    const spells =
        await scrapeSpells(
            characterPage
        );

    const background =
        await scrapeBackground(
            characterPage
        );

    console.log(
        `[Empire Companion] ${character.name}:`,
        `${Object.keys(details).length} details,`,
        `${skills.length} skills,`,
        `${bondedItems.length} bonded items,`,
        `${ribbons.length} ribbons,`,
        `${rituals.length} rituals,`,
        `${spells.length} spells,`,
        `${background ? "background found" : "no background"}`
    );

    return {

        name:
            character.name,

        details,

        bondedItems,

        skills,

        ribbons,

        rituals,

        spells,

        background,

        sourceUrl:
            character.url,

        updatedAt:
            new Date().toISOString(),
    };
}

app.get(
    "/api/debug/click-character",
    async (req, res) => {

        try {

            const loggedIn =
                await checkPDLogin();

            if (!loggedIn) {

                return res.status(401).json({
                    success: false,
                    error: "Not logged into Profound Decisions."
                });
            }

            const currentPage =
                await getPage();

            await currentPage.goto(
                PD_CHARACTERS_URL,
                {
                    waitUntil: "domcontentloaded",
                    timeout: 30000
                }
            );

            await currentPage.waitForTimeout(1000);

            const characterLinks =
                currentPage.locator(
                    "a[href*='characterLink']"
                );

            const count =
                await characterLinks.count();

            console.log(
                `[Empire Companion] Character links found: ${count}`
            );

            if (!count) {

                return res.status(404).json({
                    success: false,
                    error: "No character links found."
                });
            }

            const firstName =
                (
                    await characterLinks
                        .nth(0)
                        .textContent()
                )
                    ?.replace(/\s+/g, " ")
                    .trim();

            console.log(
                `[Empire Companion] Clicking: ${firstName}`
            );

            await characterLinks
                .nth(0)
                .click();

            await currentPage.waitForTimeout(1000);

            console.log(
                "[Empire Companion] After click:",
                currentPage.url()
            );

            const html =
                await currentPage.content();

            if (!fs.existsSync(SESSION_DIR)) {
                fs.mkdirSync(
                    SESSION_DIR,
                    {
                        recursive: true
                    }
                );
            }

            fs.writeFileSync(
                path.join(
                    SESSION_DIR,
                    "debug-clicked-character.html"
                ),
                html,
                "utf8"
            );

            res.json({

                success: true,

                character:
                    firstName,

                url:
                    currentPage.url(),

                saved:
                    path.join(
                        SESSION_DIR,
                        "debug-clicked-character.html"
                    )
            });

        } catch (error) {

            console.error(
                "[Empire Companion] Debug click failed:",
                error
            );

            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
);
/*
==========================================================
API: CHARACTERS
==========================================================
*/

app.get(
    "/api/characters",
    async (req, res) => {

        try {

            const loggedIn =
                await checkPDLogin();

            if (!loggedIn) {

                return res.status(401).json({

                    success: false,

                    error:
                        "Not logged into Profound Decisions.",

                    loggedIn: false,
                });
            }

            const characterLinks =
                await getCharacterLinks();

            console.log(
                `[Empire Companion] Found ${characterLinks.length} characters.`
            );

            const ctx =
                await getBrowserContext();

            const characterPage =
                await ctx.newPage();

            const characters = [];

            for (
                const character
                of characterLinks
            ) {

                try {

                    const fullCharacter =
                        await scrapeCharacter(
                            character,
                            characterPage
                        );

                    characters.push(
                        fullCharacter
                    );

                    console.log(
                        `[Empire Companion] ✓ ${character.name}`
                    );

                } catch (error) {

                    console.error(
                        `[Empire Companion] Failed to scrape ${character.name}:`,
                        error.message
                    );

                    characters.push({

                        name:
                            character.name,

                        details: {},

                        bondedItems: [],

                        skills: [],

                        ribbons: [],

                        rituals: [],

                        spells: [],

                        background: "",

                        sourceUrl:
                            character.url,

                        updatedAt:
                            new Date().toISOString(),
                    });
                }
            }

            await characterPage.close();

            await saveSession();

            res.json({

                success: true,

                loggedIn: true,

                characters,

                updatedAt:
                    new Date().toISOString(),
            });

        } catch (error) {

            console.error(
                "[Empire Companion] Character fetch failed:",
                error
            );

            res.status(500).json({

                success: false,

                error:
                    error.message,
            });
        }
    }
);
/*
==========================================================
PD LOGIN + IMPORT
==========================================================
*/

app.post(
    "/api/pd/login",
    async (req, res) => {

        try {

            /*
            --------------------------------------------------
            The current backend uses the existing Playwright
            session rather than sending the PD password
            through to Profound Decisions.
            --------------------------------------------------
            */

            const loggedIn =
                await checkPDLogin();

            if (!loggedIn) {

                /*
                Start the normal PD login process.
                This opens the Playwright browser.
                */

                await startLogin();

                return res.json({

                    success: false,

                    loginRequired: true,

                    error:
                        "Please log into Profound Decisions in the browser window that opened.",

                });
            }

            /*
            --------------------------------------------------
            Already logged in.
            Import the characters.
            --------------------------------------------------
            */

            const characterLinks =
                await getCharacterLinks();

            const ctx =
                await getBrowserContext();

            const characterPage =
                await ctx.newPage();

            const characters = [];

            for (
                const character
                of characterLinks
            ) {

                try {

                    const fullCharacter =
                        await scrapeCharacter(
                            character,
                            characterPage
                        );

                    characters.push(
                        fullCharacter
                    );

                    console.log(
                        `[Empire Companion] ✓ ${character.name}`
                    );

                } catch (error) {

                    console.error(
                        `[Empire Companion] Failed to scrape ${character.name}:`,
                        error.message
                    );

                    characters.push({

                        name:
                            character.name,

                        details: {},

                        bondedItems: [],

                        skills: [],

                        ribbons: [],

                        rituals: [],

                        spells: [],

                        background: "",

                        sourceUrl:
                            character.url,

                        updatedAt:
                            new Date().toISOString(),

                    });
                }
            }

            await characterPage.close();

            await saveSession();

            res.json({

                success: true,

                loggedIn: true,

                characters,

                updatedAt:
                    new Date().toISOString(),

            });

        } catch (error) {

            console.error(
                "[Empire Companion] PD login/import failed:",
                error
            );

            res.status(500).json({

                success: false,

                error:
                    error.message,

            });
        }
    }
);

/*
==========================================================
AUTH STATUS
==========================================================
*/

app.get(
    "/api/auth/status",
    async (req, res) => {

        try {

            const loggedIn =
                await checkPDLogin();

            res.json({

                success: true,

                loggedIn,

                loginInProgress,
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({

                success: false,

                loggedIn: false,

                error:
                    error.message,
            });
        }
    }
);


/*
==========================================================
START LOGIN
==========================================================
*/

app.get(
    "/api/auth/login",
    async (req, res) => {

        if (loginInProgress) {

            return res.json({

                success: true,

                message:
                    "Login already in progress.",
            });
        }

        startLogin();

        res.json({

            success: true,

            message:
                "PD login browser opened.",
        });
    }
);


/*
==========================================================
LOGOUT
==========================================================
*/

app.post(
    "/api/auth/logout",
    async (req, res) => {

        try {

            if (context) {

                await context.clearCookies();
            }

            if (
                fs.existsSync(
                    STORAGE_FILE
                )
            ) {

                fs.unlinkSync(
                    STORAGE_FILE
                );
            }

            res.json({

                success: true,

                loggedIn: false,
            });

        } catch (error) {

            res.status(500).json({

                success: false,

                error:
                    error.message,
            });
        }
    }
);


/*
==========================================================
DEBUG CHARACTER
==========================================================
*/

app.get(
    "/api/debug/character",
    async (req, res) => {

        try {

            const loggedIn =
                await checkPDLogin();

            if (!loggedIn) {

                return res.status(401).json({

                    success: false,

                    error:
                        "Not logged into Profound Decisions.",
                });
            }

            const characterLinks =
                await getCharacterLinks();

            if (
                !characterLinks.length
            ) {

                return res.status(404).json({

                    success: false,

                    error:
                        "No characters found.",
                });
            }

            const ctx =
                await getBrowserContext();

            const debugPage =
                await ctx.newPage();

            await debugPage.goto(
                characterLinks[0].url,
                {
                    waitUntil:
                        "domcontentloaded",

                    timeout: 30000,
                }
            );

            await debugPage.waitForTimeout(
                1000
            );

            const html =
                await debugPage.content();

            await debugPage.close();

            res.setHeader(
                "Content-Type",
                "text/html; charset=utf-8"
            );

            res.send(html);

        } catch (error) {

            console.error(error);

            res.status(500).json({

                success: false,

                error:
                    error.message,
            });
        }
    }
);


/*
==========================================================
HEALTH
==========================================================
*/

app.get(
    "/api/health",
    (req, res) => {

        res.json({

            success: true,

            message:
                "Empire Companion backend is running.",

            pdSession:
                Boolean(context),

            loginInProgress,
        });
    }
);


/*
==========================================================
START SERVER
==========================================================
*/

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log("");

        console.log(
            "========================================"
        );

        console.log(
            " Empire Companion Backend"
        );

        console.log(
            "========================================"
        );

        console.log(
            `Running on http://localhost:${PORT}`
        );

        console.log("");

        console.log(
            "PD session directory:"
        );

        console.log(
            SESSION_DIR
        );

        console.log("");
    }
);
