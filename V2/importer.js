const Importer = {

    async importFile(file){

        try{

            const text = await file.text();

            const character = Parser.parse(text);

            Storage.saveCharacter(character);

            App.characterImported(character);

            alert(
                "Imported " +
                character.details.name
            );

        }

        catch(error){

            console.error(error);

            alert(error.message);

        }

    }

};
