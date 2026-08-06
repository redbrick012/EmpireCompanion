const Importer = {

    async importFile(file) {

        try {

            const text = await file.text();

            const character = Parser.parse(text);

            alert(JSON.stringify(character.details, null, 2));

            console.log(character);

        } catch (e) {

            console.error(e);

            alert(e.message);

        }

    }

};
