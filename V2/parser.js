/*
==========================================
Empire Companion
Parser V2
==========================================
*/

const Parser = {

    parse(fileText) {

        let html = fileText;

        // Handle .mht/.mhtml
        if (fileText.includes("Content-Type: text/html")) {

            const start = fileText.indexOf("<!DOCTYPE html");

            if (start > -1) {
                html = fileText.substring(start);
            }

        }

        const doc = new DOMParser().parseFromString(html, "text/html");

        const character = CharacterModel.create();

        character.imported = new Date().toISOString();

        this.parseDetails(doc, character);

        // These are empty for now
        character.skills = [];
        character.spells = [];
        character.rituals = [];
        character.ribbons = [];
        character.bondedItems = [];
        character.background = "";

        console.log(character);

        return character;

    },

    parseDetails(doc, character) {

        // Get every table row on the page
        const rows = [...doc.querySelectorAll("tr")];

        rows.forEach(row => {

            const cells = row.querySelectorAll("td");

            if (cells.length < 2) return;

            const label = this.clean(cells[0].textContent);
            const value = this.clean(cells[1].textContent);

            switch(label){

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

        // Character name
        const h1 = doc.querySelector("h1");

        if(h1){

            character.details.name = this.clean(h1.textContent);

        }

    },

    clean(text){

        if(!text) return "";

        return text
            .replace(/\s+/g," ")
            .replace(/\u00a0/g," ")
            .trim();

    }

};
