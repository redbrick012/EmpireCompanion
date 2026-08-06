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

    console.log(saved);

    if (!saved || !saved.details) {

        this.showWelcome();

        return;

    }

    this.character = saved;

    this.showHome();

}

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

    if (!this.character.details) {
        alert("Character has no details!");
        return;
    }

    const d = this.character.details;

    const set = (id, value) => {
        const el = document.getElementById(id);

        if (!el) {
            console.error("Missing element:", id);
            return;
        }

        el.textContent = value || "";
    };

    set("characterName", d.name);
    set("characterSummary", `${d.nation || ""} • ${d.lineage || ""}`);

    set("charName", d.name);
    set("charNation", `${d.nation || ""} • ${d.lineage || ""}`);

    set("cid", d.cid);
    set("nation", d.nation);
    set("lineage", d.lineage);
    set("archetype", d.archetype);
    set("banner", d.banner);
    set("territory", d.territory);
    set("resource", d.resource);
    set("status", d.status);

 }

document.addEventListener("DOMContentLoaded", () => {

    App.init();

});
