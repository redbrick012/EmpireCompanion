const Importer = {

    async importFile(file) {

        const text = await file.text();

        const character = Parser.parse(text);

        alert(
            "Imported " +
            character.details.name +
            "\n\n" +
            "Skills: " + character.skills.length +
            "\nSpells: " + character.spells.length +
            "\nRituals: " + character.rituals.length
        );

        console.log(character);

    }

};
