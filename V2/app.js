const App = {

    init() {
        this.fileInput = document.getElementById("characterFile");

const button = document.getElementById("importButton");
const fileInput = document.getElementById("characterFile");

alert("Button exists: " + !!button);
alert("File input exists: " + !!fileInput);

button.addEventListener("click", () => {
    alert("Button pressed");
    fileInput.click();
});
        document.getElementById("importAnother")?.addEventListener("click", () => this.fileInput.click());

        this.fileInput.addEventListener("change", async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            await Importer.importFile(file);
            e.target.value = "";
        });

        this.loadCurrentCharacter();
    },

    loadCurrentCharacter() {
        const character = Storage.getCurrentCharacter();

        if (!character) {
            document.getElementById("welcomePage")?.classList.add("active");
            document.getElementById("homePage")?.classList.remove("active");
            return;
        }

        this.showCharacter(character);
    },

    showCharacter(character) {

        document.getElementById("welcomePage")?.classList.remove("active");
        document.getElementById("homePage")?.classList.add("active");

        const d = character.details;

        const set = (id,val)=>{
            const el=document.getElementById(id);
            if(el) el.textContent=val||"";
        };

        set("characterName", d.name || "Unknown");
        set("charName", d.name || "Unknown");
        set("charNation", d.nation);
        set("characterSummary", `${d.nation||""} • ${d.lineage||""} • ${d.archetype||""}`);

        ["cid","nation","lineage","archetype","virtue","banner","territory","resource","status","level","coven","sect","pointsSpent"]
        .forEach(id=>set(id,d[id]));

        this.renderList("skillsList", character.skills);
        this.renderList("ritualsList", character.rituals);
        this.renderList("spellsList", character.spells);
        this.renderList("bondedList", character.bondedItems);

        this.renderCharacterList();
    },

    renderList(id, items){
        const c=document.getElementById(id);
        if(!c) return;
        c.innerHTML="";
        (items||[]).forEach(item=>{
            const div=document.createElement("div");
            div.className="detail-row";
            div.innerHTML=`<span>${item}</span>`;
            c.appendChild(div);
        });
    },

    renderCharacterList(){
        const list=document.getElementById("characterList");
        if(!list) return;

        list.innerHTML="";

        const current=Storage.getCurrentCharacter();

        Storage.getCharacters().forEach(character=>{

            const row=document.createElement("div");
            row.className="detail-row";

            row.innerHTML=`
                <div>
                    <strong>${character.details.name||"Unknown"}</strong><br>
                    <small>${character.details.nation||""}</small>
                </div>
                <div>
                    <button class="open-btn">Open</button>
                    <button class="delete-btn">🗑</button>
                </div>`;

            row.querySelector(".open-btn").onclick=()=>{
                Storage.setCurrentCharacter(character.details.cid);
                this.loadCurrentCharacter();
            };

            row.querySelector(".delete-btn").onclick=()=>{
                if(!confirm(`Delete ${character.details.name}?`)) return;
                Storage.deleteCharacter(character.details.cid);
                this.loadCurrentCharacter();
            };

            if(current && current.details.cid===character.details.cid){
                row.style.background="#24331f";
            }

            list.appendChild(row);
        });
    },

    characterImported(character){
        Storage.saveCharacter(character);
        this.loadCurrentCharacter();
    }

};

document.addEventListener("DOMContentLoaded",()=>App.init());
