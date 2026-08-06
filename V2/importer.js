const Importer = {

    async importFile(file) {

        const text = await file.text();

        const character = Parser.parse(text);

        alert(JSON.stringify(character.details, null, 2));

    }

};
