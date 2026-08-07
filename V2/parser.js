const Parser = {

    parse(html) {

        const doc = new DOMParser().parseFromString(html, "text/html");

        const character = {
            details: {},
            skills: [],
            rituals: [],
            spells: [],
            ribbons: [],
            bondedItems: [],
            notes: ""
        };

        // Character name
        const h1 = doc.querySelector("#DisplayActiveCharacter h1");
        if (h1) character.details.name = h1.textContent.trim();

        // Details table
        doc.querySelectorAll("table.viewerTable tr").forEach(row => {
            const cells = row.querySelectorAll("th,td");
            if (cells.length < 2) return;

            const key = cells[0].textContent.trim().replace(/:$/,"");
            const value = cells[1].textContent.trim();

            switch (key) {
                case "CID": character.details.cid = value; break;
                case "Nation": character.details.nation = value; break;
                case "Lineage": character.details.lineage = value; break;
                case "Archetype": character.details.archetype = value; break;
                case "Virtue": character.details.virtue = value; break;
                case "Banner": character.details.banner = value; break;
                case "Territory": character.details.territory = value; break;
                case "Resource": character.details.resource = value; break;
                case "Status": character.details.status = value; break;
                case "Level": character.details.level = value; break;
                case "Coven": character.details.coven = value; break;
                case "Sect": character.details.sect = value; break;
                case "Points Spent": character.details.pointsSpent = value; break;
            }
        });

        const spellNames = [
            "Create Bond","Detect Magic","Heal","Operate Portal"
        ];

        doc.querySelectorAll(".skillBlock").forEach(block => {
            const text = block.textContent.replace(/\s+/g," ").trim();
            const lower = text.toLowerCase();

            if (!text) return;

            if (lower.includes("expires just before") ||
                lower.includes("(jewellery)") ||
                lower.includes("(weapon)") ||
                lower.includes("(armour)") ||
                lower.includes("(trinket)")) {
                character.bondedItems.push(text);
            }
            else if (lower.includes("magnitude") && lower.includes("realm")) {
                character.rituals.push(text);
            }
            else if (spellNames.some(s => text.startsWith(s))) {
                character.spells.push(text);
            }
            else {
                character.skills.push(text);
            }
        });

        return character;
    }

};
