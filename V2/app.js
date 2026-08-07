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

        const current = Storage.getCurrentCharacter();

        if (current) {

            this.characterImported(current);

        }

    },

    characterImported(character) {

        // Switch pages
        document.querySelectorAll(".page").forEach(page => {
            page.classList.remove("active");
        });

        document.getElementById("homePage").classList.add("active");

        const d = character.details;

        // Header
        document.getElementById("characterName").textContent =
            d.name || "Unknown Character";

        document.getElementById("charName").textContent =
            d.name || "Unknown Character";

        document.getElementById("charNation").textContent =
            d.nation || "";

        document.getElementById("characterSummary").textContent =
            `${d.nation || ""} • ${d.lineage || ""} • ${d.archetype || ""}`;

        // Detail tiles
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
                el.textContent = d[id] || "";
            }

        });

        // Skills
        document.getElementById("skillsList").innerHTML =
            character.skills
                .map(skill => `
                    <div class="detail-row">
                        <span>${skill}</span>
                    </div>
                `)
                .join("");

        // Rituals
        document.getElementById("ritualsList").innerHTML =
            character.rituals
                .map(ritual => `
                    <div class="detail-row">
                        <span>${ritual}</span>
                    </div>
                `)
                .join("");

        // Spells
        document.getElementById("spellsList").innerHTML =
            character.spells
                .map(spell => `
                    <div class="detail-row">
                        <span>${spell}</span>
                    </div>
                `)
                .join("");

        // Bonded Items
        document.getElementById("bondedList").innerHTML =
            character.bondedItems
                .map(item => `
                    <div class="detail-row">
                        <span>${item}</span>
                    </div>
                `)
                .join("");

        this.renderCharacters();

    },

    renderCharacters() {

        const list = document.getElementById("characterList");

        if (!list) return;

        list.innerHTML = "";

        const current = Storage.getCurrentCharacter();

        Storage.getCharacters().forEach(character => {

            const row = document.createElement("div");

            row.className = "detail-row";

            row.innerHTML = `
                <span>
                    <strong>${character.details.name || "Unknown"}</strong><br>
                    ${character.details.nation || ""}
                </span>

                <div>

                    <button class="switchButton">
                        Open
                    </button>

                    <button class="deleteButton">
                        🗑
                    </button>

                </div>
            `;

            row.querySelector(".switchButton").onclick = () => {

                Storage.setCurrentCharacter(
                    character.details.cid
                );

                this.characterImported(character);

            };

            row.querySelector(".deleteButton").onclick = () => {

                if (!confirm(`Delete ${character.details.name}?`))
                    return;

                Storage.deleteCharacter(character.details.cid);

                const next = Storage.getCurrentCharacter();

                if (next) {

                    this.characterImported(next);

                } else {

                    location.reload();

                }

            };

            if (
                current &&
                current.details.cid === character.details.cid
            ) {

                row.style.background = "#253221";

            }

            list.appendChild(row);

        });

    }

};

document.addEventListener("DOMContentLoaded", () => {
    App.init();
});
