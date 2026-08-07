const Storage = {

    CHARACTERS_KEY: "empire.characters",
    CURRENT_KEY: "empire.current",

    getCharacters() {
        return JSON.parse(localStorage.getItem(this.CHARACTERS_KEY) || "[]");
    },

    saveCharacter(character) {

        const characters = this.getCharacters();

        const index = characters.findIndex(
            c => c.details.cid === character.details.cid
        );

        if (index >= 0) {
            characters[index] = character;
        } else {
            characters.push(character);
        }

        localStorage.setItem(
            this.CHARACTERS_KEY,
            JSON.stringify(characters)
        );

        this.setCurrentCharacter(character.details.cid);
    },

    deleteCharacter(cid) {

        let characters = this.getCharacters();

        characters = characters.filter(
            c => c.details.cid !== cid
        );

        localStorage.setItem(
            this.CHARACTERS_KEY,
            JSON.stringify(characters)
        );

        if (this.getCurrentCharacter()?.details.cid === cid) {

            if (characters.length) {

                this.setCurrentCharacter(characters[0].details.cid);

            } else {

                localStorage.removeItem(this.CURRENT_KEY);

            }

        }

    },

    getCurrentCharacter() {

        const cid = localStorage.getItem(this.CURRENT_KEY);

        return this.getCharacters().find(
            c => c.details.cid === cid
        );

    },

    setCurrentCharacter(cid) {

        localStorage.setItem(
            this.CURRENT_KEY,
            cid
        );

    }

};
