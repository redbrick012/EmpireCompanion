const text = await file.text();

const character = Parser.parse(text);

Storage.saveCharacter(character);

App.loadCharacter(character);
