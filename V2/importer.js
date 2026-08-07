const Importer = {

    async importFile(file) {

        try {

            const text = await file.text();

            const character = Parser.parse(text);

            App.characterImported(character);

        } catch (error) {

            console.error(error);

            alert(
                "Import failed\n\n" +
                error.message
            );

        }

    }

};
