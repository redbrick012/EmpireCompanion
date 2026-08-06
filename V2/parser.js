/*
==========================================
Empire Companion
Parser V2
==========================================
*/

parse(fileText) {

    let html = fileText;

    // Extract HTML from MHT
    const start = fileText.indexOf("<!DOCTYPE html");

    if (start > -1) {
        html = fileText.substring(start);
    }

    console.log(html.substring(0,200));

    const doc = new DOMParser().parseFromString(html, "text/html");

    const character = CharacterModel.create();

    character.imported = new Date().toISOString();

    // Debug
    alert("Page title: " + doc.title);

    this.parseDetails(doc, character);

    return character;

}

    parseDetails(doc, character) {

    // Character name
    const title = doc.querySelector("h2");

    if (title) {
        character.details.name = this.clean(title.textContent);
    }

    // Character details table
    const table = doc.querySelector("table.viewerTable.Left");

    if (!table) {
        alert("viewerTable not found");
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

    clean(text){

        if(!text) return "";

        return text
            .replace(/\s+/g," ")
            .replace(/\u00a0/g," ")
            .trim();

    }

};
