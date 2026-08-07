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

        // Read every viewer table
        doc.querySelectorAll("table.viewerTable").forEach(table => {

            table.querySelectorAll("tr").forEach(row => {

                const cells = row.querySelectorAll("th,td");

                if (cells.length < 2) return;

                const key = cells[0].textContent.trim().replace(/:$/, "");
                const value = cells[1].textContent.trim();

                switch (key) {

                    case "CID":
                        character.details.cid = value;
                        break;

                    case "Name":
                        character.details.name = value;
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

                    case "Territory":
                        character.details.territory = value;
                        break;

                    case "Resource":
                        character.details.resource = value;
                        break;

                    case "Status":
                        character.details.status = value;
                        break;

                    case "Level":
                        character.details.level = value;
                        break;
                }

            });

        });

        // Skills
        doc.querySelectorAll(".skill, .characterSkill").forEach(skill => {
            character.skills.push({
                name: skill.textContent.trim()
            });
        });

        // Rituals
        doc.querySelectorAll(".ritual").forEach(ritual => {
            character.rituals.push({
                name: ritual.textContent.trim()
            });
        });

        // Spells
        doc.querySelectorAll(".spell").forEach(spell => {
            character.spells.push({
                name: spell.textContent.trim()
            });
        });

        // Background
        const bg = [...doc.querySelectorAll("h2,h3")]
            .find(h => h.textContent.includes("Background"));

        if (bg) {
            let text = "";
            let node = bg.nextElementSibling;

            while (node && !/^H[23]$/.test(node.tagName)) {
                text += node.textContent + "\n";
                node = node.nextElementSibling;
            }

            character.details.background = text.trim();
        }

        return character;

    }

};
