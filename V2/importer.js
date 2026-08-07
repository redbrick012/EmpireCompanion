/*
==========================================
Empire Companion
Importer
==========================================
*/

const Importer = {

    async importFile(file) {

        try {

            const text = await file.text();

            const character = Parser.parse(text);
            console.log(character);
alert(JSON.stringify(character.details, null, 2));

            // Save character locally
            Storage.saveCharacter(character);

            // Tell the app we've imported a character
            App.characterImported(character);

            console.log(character);

        } catch (error) {

            console.error(error);

            alert(
                "Import failed.\n\n" +
                error.message
            );

        }

    }

};
