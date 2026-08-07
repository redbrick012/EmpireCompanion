const App = {

    init() {

        this.fileInput = document.getElementById("characterFile");

        document.getElementById("importButton")?.addEventListener("click", () => {
            this.fileInput.click();
        });

        document.getElementById("importAnother")?.addEventListener("click", () => {
            this.fileInput.click();
        });

        this.fileInput.addEventListener("change", async (e) => {

            const file = e.target.files[0];
            if (!file) return;

            await Importer.importFile(file);

            e.target.value = "";

            this.loadCurrentCharacter();

        });

        this.loadCurrentCharacter();

    },

    loadCurrentCharacter() {

        const character = Storage.getCurrentCharacter();

        if (!character) {

            this.showWelcome();

            return;

        }

        this.showCharacter(character);

    },

    showWelcome() {

        document.getElementById("welcomePage").classList.add("active");
        document.getElementById("homePage").classList.remove("active");

    },

    showCharacter(character) {

        document.getElementById("welcomePage").classList.remove("active");
        document.getElementById("homePage").classList.add("active");

        const d = character.details;

        document.getElementById("characterName").textContent =
            d.name || "Unknown";

        document.getElementById("charName").textContent =
            d.name || "Unknown";

        document.getElementById("charNation").textContent =
            d.nation || "";

        document.getElementById("characterSummary").textContent =
            `${d.nation || ""} • ${d.lineage || ""} • ${d.archetype || ""}`;

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
            "level",
            "coven",
            "sect",
            "pointsSpent"
        ].forEach(id => {

            const el = document.getElementById(id);

            if (el) {

                el.textContent = d[id] || "";

            }

        });

        this.renderList(
            "skillsList",
            character.skills
        );

        this.renderList(
            "ritualsList",
            character.rituals
        );

        this.renderList(
            "spellsList",
            character.spells
        );

        this.renderList(
            "bondedList",
            character.bondedItems
        );

        this.renderCharacterList();

    },

    renderList(elementId, items) {

        const
