const Importer = {

    async importFile(file){

        const text = await file.text();

        const character = Parser.parse(text);

        console.log(character);

        alert(JSON.stringify(character.details, null, 2));

    }

};
