const App = {

    init() {

        const button = document.getElementById("importButton");
        const fileInput = document.getElementById("characterFile");

        button.addEventListener("click", () => {
            fileInput.click();
        });

        fileInput.addEventListener("change", async (e) => {

            const file = e.target.files[0];
            if (!file) return;

            await Importer.importFile(file);

            fileInput.value = "";

        });

        const saved = Storage.getCharacter();

        if (saved) {
            this.characterImported(saved);
        }

    },

    characterImported(character) {

       const d = character.details;

document.getElementById("characterName").textContent = d.name || "";
document.getElementById("characterSummary").textContent =
`${d.nation} • ${d.lineage} • ${d.archetype}`;

document.getElementById("charName").textContent = d.name || "";
document.getElementById("charNation").textContent = d.nation || "";

[
"cid",
"nation",
"lineage",
"archetype",
"virtue",
"banner",
"territory",
"resource",
"status",
"level"
].forEach(id => {

    const el = document.getElementById(id);

    if (el)
        el.textContent = d[id] ?? "";

}); 


    }

};

document.addEventListener("DOMContentLoaded", () => {
    App.init();
});
