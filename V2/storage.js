const Storage = {

    CHARACTERS_KEY: "empire.characters",
    CURRENT_KEY: "empire.current",

    getCharacters() {

        return JSON.parse(
            localStorage.getItem(this.CHARACTERS_KEY) || "[]"
        );

    },

    getCharacter(cid) {

        return this.getCharacters().find(
            c => c.details.cid === cid
        );

    },

    getCurrentCharacter() {

        const cid = localStorage.getItem(this.CURRENT_KEY);

        if (!cid) return null;

        return this.getCharacter(cid);

    },

    setCurrentCharacter(cid) {

        localStorage.setItem(this.CURRENT_KEY, cid);

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

        const characters = this.getCharacters().filter(
            c => c.details.cid !== cid
        );

        localStorage.setItem(
            this.CHARACTERS_KEY,
            JSON.stringify(characters)
        );

        const current = localStorage.getItem(this.CURRENT_KEY);

        if (current === cid) {

            if (characters.length) {

                this.setCurrentCharacter(
                    characters[0].details.cid
                );

            } else {

                localStorage.removeItem(this.CURRENT_KEY);

            }

        }

    },

    clearCharacters() {

        localStorage.removeItem(this.CHARACTERS_KEY);
        localStorage.removeItem(this.CURRENT_KEY);

    }

};
