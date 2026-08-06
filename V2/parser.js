
/*
==========================================
Empire Companion V2
Profound Decisions Parser
Version 1
==========================================
*/

const Parser = {

    parse(fileText) {

        // Handle .mht files by extracting the HTML part
        let html = fileText;

        if (fileText.includes("Content-Type: text/html")) {

            const start =
                fileText.indexOf("<!DOCTYPE html");

            if (start > -1) {
                html = fileText.substring(start);
            }

        }

        const doc =
            new DOMParser()
                .parseFromString(
                    html,
                    "text/html"
                );

        return {

            meta: {
                imported: new Date().toISOString(),
                source: "Profound Decisions"
            },

            character: this.parseCharacter(doc),

            skills: this.parseSkills(doc),

            rituals: this.parseRituals(doc),

            spells: this.parseSpells(doc),

            ribbons: this.parseRibbons(doc),

            bondedItems: this.parseBondedItems(doc),

            background: this.parseBackground(doc)

        };

    },

    /* --------------------------
       CHARACTER DETAILS
    -------------------------- */

    parseCharacter(doc) {

        const result = {};

        result.name =
            this.text(
                doc.querySelector(
                    "#DisplayActiveCharacter h1"
                )
            );

        const table =
            doc.querySelector(
                "#DisplayActiveCharacter table.viewerTable"
            );

        if (!table)
            return result;

        table
            .querySelectorAll("tr")
            .forEach(row => {

                const cells =
                    row.querySelectorAll("td");

                if (cells.length < 2)
                    return;

                const key =
                    this.text(cells[0]);

                const value =
                    this.text(cells[1]);

                if (key)
                    result[key] = value;

            });

        return result;

    },

    /* --------------------------
       SKILLS
    -------------------------- */

    parseSkills(doc) {

        return this.parseBlocks(
            doc,
            "wikiSkillDetails"
        );

    },

    /* --------------------------
       SPELLS
    -------------------------- */

    parseSpells(doc) {

        return this.parseSection(
            doc,
            "Spells"
        );

    },

    /* --------------------------
       RITUALS
    -------------------------- */

    parseRituals(doc) {

        return this.parseSection(
            doc,
            "Rituals"
        );

    },

    /* --------------------------
       RIBBONS
    -------------------------- */

    parseRibbons(doc) {

        const output = [];

        doc
            .querySelectorAll("table")
            .forEach(table => {

                const header =
                    table.textContent;

                if (!header.includes("Ribbon"))
                    return;

                table
                    .querySelectorAll("tbody tr")
                    .forEach(row => {

                        const cells =
                            [...row.querySelectorAll("td")]
                                .map(td =>
                                    this.text(td)
                                );

                        if (cells.length) {

                            output.push(cells);

                        }

                    });

            });

        return output;

    },

    /* --------------------------
       BONDED ITEMS
    -------------------------- */

    parseBondedItems(doc) {

        return this.parseSection(
            doc,
            "Bonded Items"
        );

    },

    /* --------------------------
       BACKGROUND
    -------------------------- */

    parseBackground(doc) {

        const panels =
            [...doc.querySelectorAll(".TabPanel")];

        for (const panel of panels) {

            if (
                panel.textContent.includes(
                    "Background"
                )
            ) {

                return panel.innerText.trim();

            }

        }

        return "";

    },

    /* --------------------------
       Generic parser
    -------------------------- */

    parseSection(doc, title) {

        const result = [];

        const panels =
            [...doc.querySelectorAll(".TabPanel")];

        for (const panel of panels) {

            if (
                !panel.innerText.includes(title)
            ) {
                continue;
            }

            panel
                .querySelectorAll(".skillBlock")
                .forEach(block => {

                    result.push({

                        title:
                            this.text(
                                block.querySelector(
                                    ".skillHeader"
                                )
                            ),

                        description:
                            this.text(
                                block.querySelector(
                                    ".skillText"
                                )
                            )

                    });

                });

        }

        return result;

    },

    parseBlocks(doc, className) {

        const output = [];

        doc
            .querySelectorAll(
                "." + className + " .skillBlock"
            )
            .forEach(block => {

                output.push({

                    title:
                        this.text(
                            block.querySelector(
                                ".skillHeader"
                            )
                        ),

                    description:
                        this.text(
                            block.querySelector(
                                ".skillText"
                            )
                        )

                });

            });

        return output;

    },

    text(node) {

        if (!node)
            return "";

        return node.textContent
            .replace(/\s+/g, " ")
            .trim();

    }

};
