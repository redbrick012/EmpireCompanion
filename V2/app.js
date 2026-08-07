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

        const saved = Storage.getCurrentCharacter();

        if (saved) {
            this.characterImported(saved);
        }

    },
characterImported(character) {

    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    document.getElementById("homePage").classList.add("active");


    const d = character.details;
alert("4 - " + JSON.stringify(d));
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

        if (el) {
            el.textContent = d[id] ?? "";
        }
document.getElementById("skillsList").innerHTML =
    character.skills
        .map(skill => `<div class="detail-row"><span>${skill}</span></div>`)
        .join("");

document.getElementById("ritualsList").innerHTML =
    character.rituals
        .map(ritual => `<div class="detail-row"><span>${ritual}</span></div>`)
        .join("");

document.getElementById("spellsList").innerHTML =
    character.spells
        .map(spell => `<div class="detail-row"><span>${spell}</span></div>`)
        .join("");

document.getElementById("bondedList").innerHTML =
    character.bondedItems
        .map(item => `<div class="detail-row"><span>${item}</span></div>`)
        .join("");
    });

    }
App.renderCharacters();
};

document.addEventListener("DOMContentLoaded", () => {
    App.init();
});
