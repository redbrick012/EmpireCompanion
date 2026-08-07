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

        // Parse all skill blocks
let section = "";

doc.querySelectorAll("h2, h3, .skillBlock").forEach(node => {

    if (node.matches("h2,h3")) {
        section = node.textContent.trim();
        return;
    }

    const text = node.textContent.trim();

    switch (section) {

        case "Bonded Items":
            character.bondedItems.push(text);
            break;

        case "Rituals":
            character.rituals.push(text);
            break;

        case "Spells":
            character.spells.push(text);
            break;

        default:
            character.skills.push(text);
            break;
    }

});

        alert(
    `Skills: ${character.skills.length}
Rituals: ${character.rituals.length}
Spells: ${character.spells.length}
Bonded: ${character.bondedItems.length}`
);
 return character;

    }       

};
