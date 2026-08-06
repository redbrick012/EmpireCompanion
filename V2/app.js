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

    refresh(){

    if(!this.character) return;

    const d = this.character.details;

    document.getElementById("characterName").textContent =
        d.name;

    document.getElementById("characterSummary").textContent =
        `${d.nation} • ${d.lineage}`;

    document.getElementById("charName").textContent =
        d.name;

    document.getElementById("charNation").textContent =
        `${d.nation} • ${d.lineage}`;

    document.getElementById("cid").textContent =
        d.cid;

    document.getElementById("nation").textContent =
        d.nation;

    document.getElementById("lineage").textContent =
        d.lineage;

    document.getElementById("archetype").textContent =
        d.archetype;

    document.getElementById("banner").textContent =
        d.banner;

    document.getElementById("territory").textContent =
        d.territory;

    document.getElementById("resource").textContent =
        d.resource;

    document.getElementById("status").textContent =
        d.status;

    }

};

document.addEventListener("DOMContentLoaded", () => {

    App.init();

});
