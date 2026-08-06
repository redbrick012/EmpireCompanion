
/*
==========================================
Empire Companion V2
Importer
==========================================
*/

const Importer = {

    async importFile(file) {

        try {

            console.log(
                "Reading",
                file.name
            );

            const text =
                await file.text();

            const data =
                Parser.parse(text);

            if (
                !data ||
                !data.character ||
                !data.character.name
            ) {

                throw new Error(
                    "This doesn't appear to be a valid Profound Decisions character."
                );

            }

            App.characterImported(data.character);

            alert(
                "Character imported successfully!\n\n" +
                data.character.name
            );

            console.log(data);

        }

        catch(error){

            console.error(error);

            alert(
                "Import failed.\n\n" +
                error.message
            );

        }

    }

};
