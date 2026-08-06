/*
==========================================
Empire Companion V2
Storage Manager
==========================================
*/

const Storage = {

    KEY: "empire-companion-v2",

    saveCharacter(character) {

        try {

            localStorage.setItem(
                this.KEY,
                JSON.stringify(character)
            );

            console.log(
                "Character saved."
            );

            return true;

        } catch (error) {

            console.error(
                "Could not save character.",
                error
            );

            return false;

        }

    },

    getCharacter() {

        try {

            const data =
                localStorage.getItem(
                    this.KEY
                );

            if (!data)
                return null;

            return JSON.parse(data);

        } catch (error) {

            console.error(
                "Could not load character.",
                error
            );

            return null;

        }

    },

    deleteCharacter() {

        localStorage.removeItem(
            this.KEY
        );

    },

    hasCharacter() {

        return (
            this.getCharacter() !== null
        );

    }

};
