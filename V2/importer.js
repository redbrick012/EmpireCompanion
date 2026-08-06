const Importer = {

    async importFile(file) {

        alert("1. File selected: " + file.name);

        try {

            const text = await file.text();

            alert("2. File read (" + text.length + " characters)");

            const data = Parser.parse(text);

            alert("3. Parser finished");

            console.log(data);

            App.characterImported(data);

            alert("4. Character imported");

        }
        catch (e) {

            console.error(e);

            alert(
                "ERROR:\n\n" +
                e.message +
                "\n\n" +
                e.stack
            );

        }

    }

};
