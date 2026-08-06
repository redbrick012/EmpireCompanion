
/*
==========================================
Empire Companion V2
Application Controller
==========================================
*/

const App = {

    character: null,

    init() {

        console.log("Empire Companion v2");

        this.bindEvents();

        this.loadCharacter();

    },

    bindEvents() {

        document
            .getElementById("importButton")
            .addEventListener(
                "click",
                () => {

                    document
                        .getElementById("characterFile")
                        .click();

                });

        document
            .getElementById("characterFile")
            .addEventListener(
                "change",
                event => {

                    if (!event.target.files.length)
                        return;

                    Importer.importFile(
                        event.target.files[0]
                    );

                });

    },

    loadCharacter() {

        const saved =
            Storage.getCharacter();

        if (!saved) {

            this.showWelcome();

            return;

        }

        this.character = saved;

        this.showHome();

    },

    showWelcome() {

        document
            .getElementById("welcomePage")
            .classList.add("active");

        document
            .getElementById("homePage")
            .classList.remove("active");

    },

    showHome() {

        document
            .getElementById("welcomePage")
            .classList.remove("active");

        document
            .getElementById("homePage")
            .classList.add("active");

        this.refresh();

    },

    refresh() {

        if (!this.character)
            return;

        document
            .getElementById("characterName")
            .textContent =
                this.character.name;

        document
            .getElementById("characterSummary")
            .textContent =
                `${this.character.nation} • ${this.character.lineage}`;

    },

    characterImported(character) {

        this.character = character;

        Storage.saveCharacter(character);

        this.showHome();

    }

};

document.addEventListener(
    "DOMContentLoaded",
    () => App.init()
);
