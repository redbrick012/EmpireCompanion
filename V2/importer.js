const Importer = {

    async importFile(file) {

        try {

            const text = await file.text();

            console.log(text);

            alert(
                "File loaded.\n\n" +
                text.substring(0,500)
            );

        }
        catch(error){

            alert(error.message);

        }

    }

};
