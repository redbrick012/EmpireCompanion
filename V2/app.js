const App = {

    init() {

        document
            .getElementById("importButton")
            .addEventListener("click", () => {

                document
                    .getElementById("characterFile")
                    .click();

            });

        document
            .getElementById("characterFile")
            .addEventListener("change", async (e) => {

                const file = e.target.files[0];

                if (!file) return;

                await Importer.importFile(file);

                e.target.value = "";

            });

        const character = Storage.getCharacter();

        if (character) {

            this.characterImported(character);

        }

    },

    characterImported(character) {

        document
            .getElementById("welcomePage")
            .classList.remove("active");

        document
            .getElementById("homePage")
            .classList.add("active");

        const d = character.details;

        document.getElementById("characterName").textContent = d.name || "Unknown";
        document.getElementById("characterSummary").textContent =
            `${d.nation || ""} ${d.lineage || ""} ${d.archetype || ""}`.trim();

        document.getElementById("charName").textContent = d.name || "";
        document.getElementById("charNation").textContent = d.nation || "";

        document.getElementById("cid").textContent = d.cid || "";
        document.getElementById("nation").textContent = d.nation || "";
        document.getElementById("lineage").textContent = d.lineage || "";
        document.getElementById("archetype").textContent = d.archetype || "";
        document.getElementById("banner").textContent = d.banner || "";
        document.getElementById("territory").textContent = d.territory || "";
        document.getElementById("resource").textContent = d.resource || "";
        document.getElementById("status").textContent = d.status || "";

    }

};

document.addEventListener("DOMContentLoaded", () => {
    App.init();
});
