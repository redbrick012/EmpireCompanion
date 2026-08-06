/*
==========================================
Empire Companion
App Controller
==========================================
*/

const App = {

    character: null,

    init() {

        this.bindEvents();

        this.loadCharacter();

    },

    bindEvents() {

        const importButton = document.getElementById("importButton");
        const fileInput = document.getElementById("characterFile");

        importButton.addEventListener("click", () => {

            fileInput.click();

        });

        fileInput.addEventListener("change", async (event) => {

            if (!event.target.files.length) return;

            await Importer.importFile(event.target.files[0]);

        });

    },

    loadCharacter() {

        const saved = Storage.getCharacter();

        if (!saved) {

            this.showWelcome();

            return;

        }

        this.character = saved;

        this.showHome();

    },

    characterImported(character) {

        this.character = character;

        Storage.saveCharacter(character);

        this.showHome();

    },

    showWelcome() {

        document.getElementById("welcomePage").classList.add("active");
        document.getElementById("homePage").classList.remove("active");

    },

    showHome() {

        document.getElementById("welcomePage").classList.remove("active");
        document.getElementById("homePage").classList.add("active");

        this.refresh();

    },

    refresh() {

        if (!this.character) return;

        document.getElementById("characterName").textContent =
            this.character.details.name || "Unknown Character";

        document.getElementById("characterSummary").textContent =
            [
                this.character.details.nation,
                this.character.details.lineage
            ]
            .filter(Boolean)
            .join(" • ");

    }

};

document.addEventListener("DOMContentLoaded", () => {

    App.init();

});
