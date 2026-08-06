/*
==========================================
Empire Companion
Parser V2
==========================================
*/

const Parser = {

    parse(fileText) {

        let html = fileText;

        // Extract HTML from MHT
        const start = fileText.indexOf("<!DOCTYPE html");

        if (start > -1) {
            html = fileText.substring(start);
        }

        const doc = new DOMParser().parseFromString(html, "text/html");

        const character = CharacterModel.create();

        character.imported = new Date().toISOString();

 this.parseDetails(doc, character);

character.spells = this.parseBlocks(
    doc.querySelector(".spellList")
);

character.rituals = this.parseBlocks(
    doc.querySelector(".ritualList")
);

character.skills = this.parseBlocks(
    doc.querySelector(".skillList")
);

return character;

    },

    parseDetails(doc, character) {

        // Character name
        const name = doc.querySelector("h1");

        if (name) {
            character.details.name = this.clean(name.textContent);
        }

        // Details table
        const table = doc.querySelector("table.viewerTable");

        if (!table) {
            alert("Character table not found.");
            return;
        }

        table.querySelectorAll("tr").forEach(row => {

            const cells = row.querySelectorAll("td");

            if (cells.length !== 2) return;

            const label = this.clean(cells[0].textContent);
            const value = this.clean(cells[1].textContent);

            switch (label) {

                case "CID":
                    character.details.cid = value;
                    break;

                case "Nation":
                    character.details.nation = value;
                    break;

                case "Lineage":
                    character.details.lineage = value;
                    break;

                case "Archetype":
                    character.details.archetype = value;
                    break;

                case "Virtue":
                    character.details.virtue = value;
                    break;

                case "Banner":
                    character.details.banner = value;
                    break;

                case "Coven":
                    character.details.coven = value;
                    break;

                case "Sect":
                    character.details.sect = value;
                    break;

                case "Territory":
                    character.details.territory = value;
                    break;

                case "Resource":
                    character.details.resource = value;
                    break;

                case "Level":
                    character.details.level = value;
                    break;

                case "Status":
                    character.details.status = value;
                    break;

                case "Points Spent":
                    character.details.pointsSpent = value;
                    break;

            }

        });

    },
parseBlocks(container) {

    const list = [];

    if (!container) return list;

    container.querySelectorAll(".skillBlock").forEach(block => {

        list.push({

            title: this.clean(
                block.querySelector(".skillHeader")?.textContent
            ),

            description: this.clean(
                block.querySelector(".skillText")?.textContent
            )

        });

    });

    return list;

},
    clean(text) {

        if (!text) return "";

        return text
            .replace(/\u00a0/g, " ")
            .replace(/\s+/g, " ")
            .trim();

    }

};
