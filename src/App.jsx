import {
    useState,
    useEffect,
    useMemo
} from "react";
import "./App.css";

const API_URL = "http://localhost:3001";
const USER_ID_KEY = "empire_companion_user_id";
const SESSION_KEY = "empire_companion_session_id";

function getSessionId() {

    let sessionId =
        localStorage.getItem(SESSION_KEY);

    if (!sessionId) {

        sessionId =
            crypto.randomUUID();

        localStorage.setItem(
            SESSION_KEY,
            sessionId
        );
    }

    return sessionId;
}
const STORAGE_KEY = "empire_companion_characters";

const emptyData = {
    characters: [],
    updatedAt: null,
};

/*
==========================================================
CHARACTER CLEANUP
==========================================================
*/

function cleanCharacter(character) {
    return {
        name: character?.name || "Unknown Character",

        details:
            character?.details &&
                typeof character.details === "object"
                ? character.details
                : {},

        bondedItems: Array.isArray(character?.bondedItems)
            ? character.bondedItems
            : [],

        skills: Array.isArray(character?.skills)
            ? character.skills
            : [],

        ribbons: Array.isArray(character?.ribbons)
            ? character.ribbons
            : [],

        rituals: Array.isArray(character?.rituals)
            ? character.rituals
            : [],

        spells: Array.isArray(character?.spells)
            ? character.spells
            : [],

        background:
            typeof character?.background === "string"
                ? character.background
                : "",

        sourceUrl:
            typeof character?.sourceUrl === "string"
                ? character.sourceUrl
                : "",

        updatedAt: character?.updatedAt || null,
    };
}

/*
==========================================================
LOCAL CACHE
==========================================================
*/

function getCachedCharacters() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);

        if (!raw) {
            return emptyData;
        }

        const parsed = JSON.parse(raw);

        if (
            !parsed ||
            !Array.isArray(parsed.characters)
        ) {
            return emptyData;
        }

        return {
            ...parsed,
            characters: parsed.characters.map(
                cleanCharacter
            ),
        };

    } catch (error) {

        console.error(
            "Failed to load cached characters:",
            error
        );

        return emptyData;
    }
}

function saveCachedCharacters(data) {
    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(data)
        );

    } catch (error) {

        console.error(
            "Failed to save character cache:",
            error
        );
    }
}

/*
==========================================================
DETAIL CARD
==========================================================
*/

function DetailCard({ label, value }) {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return null;
    }

    return (
        <div className="detail-card">

            <div className="detail-label">
                {label}
            </div>

            <div className="detail-value">
                {value}
            </div>

        </div>
    );
}

/*
==========================================================
SECTION
==========================================================
*/

function Section({ title, count, children }) {

    return (
        <section className="character-section">

            <div className="section-heading">

                <h2>{title}</h2>

                {typeof count === "number" && (
                    <span className="section-count">
                        {count}
                    </span>
                )}

            </div>

            {children}

        </section>
    );
}

/*
==========================================================
EMPTY STATE
==========================================================
*/

function EmptyState({ onRefresh, loading }) {

    return (
        <div className="empty-state">

            <div className="empty-icon">
                ⚔️
            </div>

            <h2>
                No characters synced yet
            </h2>

            <p>
                Connect to your Empire Companion
                server to load your Profound
                Decisions characters.
            </p>

            <button
                className="primary-button"
                onClick={onRefresh}
                disabled={loading}
            >
                {loading
                    ? "Connecting..."
                    : "Connect to Empire"}
            </button>

        </div>
    );
}

/*
==========================================================
CHARACTER LIST
==========================================================
*/

function CharacterList({
    characters,
    selected,
    onSelect,
}) {

    return (
        <aside className="character-list">

            <div className="character-list-header">

                <span>
                    Characters
                </span>

                <span className="character-count">
                    {characters.length}
                </span>

            </div>

            <div className="character-list-items">

                {characters.map(
                    (character, index) => {

                        const active =
                            selected?.name ===
                            character.name;

                        const details =
                            character.details || {};

                        return (
                            <button
                                key={`${character.name}-${index}`}
                                className={
                                    active
                                        ? "character-list-item active"
                                        : "character-list-item"
                                }
                                onClick={() =>
                                    onSelect(character)
                                }
                            >

                                <div className="character-avatar">
                                    {character.name
                                        ?.charAt(0)
                                        ?.toUpperCase() || "?"}
                                </div>

                                <div className="character-list-info">

                                    <strong>
                                        {character.name}
                                    </strong>

                                    <span>

                                        {details.Nation ||
                                            "Empire"}

                                        {details.Lineage
                                            ? ` • ${details.Lineage}`
                                            : ""}

                                    </span>

                                </div>

                            </button>
                        );
                    }
                )}

            </div>

        </aside>
    );
}

/*
==========================================================
CHARACTER DETAIL
==========================================================
*/

function CharacterDetail({ character }) {

    const details =
        character.details || {};

    const detailFields = [
        ["Nation", details.Nation],
        ["Lineage", details.Lineage],
        ["Archetype", details.Archetype],
        ["Level", details.Level],
        ["Points Spent", details["Points Spent"]],
        ["Coven", details.Coven],
        ["Banner", details.Banner],
        ["Territory", details.Territory],
        ["Resource", details.Resource],
        ["Status", details.Status],
        ["Virtue", details.Virtue],
        ["Sect", details.Sect],
    ];

    return (
        <main className="character-detail">

            <header className="character-header">

                <div className="character-header-main">

                    <div className="large-character-avatar">
                        {character.name
                            ?.charAt(0)
                            ?.toUpperCase() || "?"}
                    </div>

                    <div>

                        <div className="character-kicker">
                            EMPIRE CHARACTER
                        </div>

                        <h1>
                            {character.name}
                        </h1>

                        <div className="character-subtitle">

                            {details.Nation ||
                                "Unknown Nation"}

                            {details.Lineage &&
                                ` • ${details.Lineage}`}

                            {details.Archetype &&
                                ` • ${details.Archetype}`}

                        </div>

                    </div>

                </div>

                <div className="character-header-badges">

                    {details.Status && (
                        <span className="badge">
                            {details.Status}
                        </span>
                    )}

                    {details.Level && (
                        <span className="badge">
                            Level {details.Level}
                        </span>
                    )}

                </div>

            </header>

            <div className="details-grid">

                {detailFields.map(
                    ([label, value]) => (
                        <DetailCard
                            key={label}
                            label={label}
                            value={value}
                        />
                    )
                )}

            </div>

            {character.bondedItems.length > 0 && (

                <Section
                    title="Bonded Items"
                    count={
                        character.bondedItems.length
                    }
                >

                    <div className="item-grid">

                        {character.bondedItems.map(
                            (item, index) => (

                                <article
                                    className="content-card"
                                    key={`${item.id || item.name}-${index}`}
                                >

                                    <div className="card-icon">
                                        💍
                                    </div>

                                    <div className="card-content">

                                        <h3>
                                            {item.name}
                                        </h3>

                                        {item.type && (
                                            <div className="card-meta">
                                                {item.type}
                                            </div>
                                        )}

                                        {item.id && (
                                            <div className="card-meta">
                                                ID: {item.id}
                                            </div>
                                        )}

                                        {item.expiry && (
                                            <div className="expiry">
                                                {item.expiry}
                                            </div>
                                        )}

                                        {item.description && (
                                            <p>
                                                {item.description}
                                            </p>
                                        )}

                                    </div>

                                </article>

                            )
                        )}

                    </div>

                </Section>

            )}

            {character.skills.length > 0 && (

                <Section
                    title="Skills"
                    count={character.skills.length}
                >

                    <div className="item-grid">

                        {character.skills.map(
                            (skill, index) => (

                                <article
                                    className="content-card"
                                    key={`${skill.name}-${index}`}
                                >

                                    <div className="card-icon">
                                        ⚔️
                                    </div>

                                    <div className="card-content">

                                        <h3>
                                            {skill.name}
                                        </h3>

                                        {skill.description && (
                                            <p>
                                                {skill.description}
                                            </p>
                                        )}

                                        {skill.wikiUrl && (
                                            <a
                                                href={skill.wikiUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="wiki-link"
                                            >
                                                View wiki ↗
                                            </a>
                                        )}

                                    </div>

                                </article>

                            )
                        )}

                    </div>

                </Section>

            )}

            {character.spells.length > 0 && (

                <Section
                    title="Spells"
                    count={character.spells.length}
                >

                    <div className="item-grid">

                        {character.spells.map(
                            (spell, index) => (

                                <article
                                    className="content-card"
                                    key={`${spell.name}-${index}`}
                                >

                                    <div className="card-icon">
                                        ✨
                                    </div>

                                    <div className="card-content">

                                        <h3>
                                            {spell.name}
                                        </h3>

                                        {spell.description && (
                                            <p>
                                                {spell.description}
                                            </p>
                                        )}

                                        {spell.wikiUrl && (
                                            <a
                                                href={spell.wikiUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="wiki-link"
                                            >
                                                View wiki ↗
                                            </a>
                                        )}

                                    </div>

                                </article>

                            )
                        )}

                    </div>

                </Section>

            )}

            {character.rituals.length > 0 && (

                <Section
                    title="Rituals"
                    count={character.rituals.length}
                >

                    <div className="item-grid">

                        {character.rituals.map(
                            (ritual, index) => (

                                <article
                                    className="content-card"
                                    key={`${ritual.name}-${index}`}
                                >

                                    <div className="card-icon">
                                        🌿
                                    </div>

                                    <div className="card-content">

                                        <h3>
                                            {ritual.name}
                                        </h3>

                                        {ritual.magnitude && (
                                            <div className="magnitude">
                                                {ritual.magnitude}
                                            </div>
                                        )}

                                        {ritual.description && (
                                            <p>
                                                {ritual.description}
                                            </p>
                                        )}

                                        {ritual.wikiUrl && (
                                            <a
                                                href={ritual.wikiUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="wiki-link"
                                            >
                                                View wiki ↗
                                            </a>
                                        )}

                                    </div>

                                </article>

                            )
                        )}

                    </div>

                </Section>

            )}

            {character.ribbons.length > 0 && (

                <Section
                    title="Ribbons"
                    count={character.ribbons.length}
                >

                    <div className="ribbon-list">

                        {character.ribbons.map(
                            (ribbon, index) => (

                                <article
                                    className="ribbon-card"
                                    key={`${ribbon.ribbon}-${index}`}
                                >

                                    <div className="ribbon-icon">
                                        🏅
                                    </div>

                                    <div>

                                        <h3>
                                            {ribbon.ribbon}
                                        </h3>

                                        {ribbon.item && (
                                            <div className="card-meta">
                                                {ribbon.item}
                                            </div>
                                        )}

                                        <div className="card-meta">

                                            {ribbon.type}

                                            {ribbon.slot &&
                                                ` • ${ribbon.slot}`}

                                        </div>

                                    </div>

                                </article>

                            )
                        )}

                    </div>

                </Section>

            )}

            {character.background && (

                <Section title="Background">

                    <article className="background-card">

                        <p>
                            {character.background}
                        </p>

                    </article>

                </Section>

            )}

            <footer className="character-footer">

                {character.updatedAt && (

                    <span>

                        Last synced{" "}

                        {new Date(
                            character.updatedAt
                        ).toLocaleString()}

                    </span>

                )}

                {character.sourceUrl && (

                    <a
                        href={character.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                    >
                        Open in Profound Decisions ↗
                    </a>

                )}

            </footer>

        </main>
    );
}

/*
==========================================================
APP
==========================================================
*/

export default function App() {

    const [data, setData] =
        useState(getCachedCharacters);

    const [selectedName, setSelectedName] =
        useState(null);

    const [loading, setLoading] =
        useState(false);

    const [connected, setConnected] =
        useState(false);

    const [error, setError] =
        useState(null);

    const [
        mobileCharactersOpen,
        setMobileCharactersOpen,
    ] = useState(false);

    const [userId, setUserId] = useState(
        () => localStorage.getItem(USER_ID_KEY)
    );
    const [pdUsername, setPdUsername] = useState("");
    const [pdPassword, setPdPassword] = useState("");
    const characters =
        data.characters || [];

    useEffect(() => {

        async function initialiseUser() {

            try {

                const existingUserId =
                    localStorage.getItem(
                        USER_ID_KEY
                    );

                const response =
                    await fetch(
                        `${API_URL}/api/auth/session`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                Accept:
                                    "application/json",
                            },

                            body: JSON.stringify({
                                userId:
                                    Number(userId),
                            }),
                        }
                    );

                const result =
                    await response.json();

                if (!result.success) {
                    throw new Error(
                        result.error ||
                        "Could not initialise user."
                    );
                }

                localStorage.setItem(
                    USER_ID_KEY,
                    String(result.userId)
                );

                setUserId(
                    result.userId
                );

            } catch (error) {

                console.error(
                    "Failed to initialise user:",
                    error
                );

            }

        }

        initialiseUser();

    }, []);

    /*
    ======================================================
    PD SYNC
    ======================================================
    */

    async function handlePDSync() {

        try {

            if (!userId) {
                throw new Error(
                    "No user session is available yet."
                );
            }

            if (!pdUsername || !pdPassword) {
                throw new Error(
                    "Please enter your Profound Decisions username and password."
                );
            }

            setLoading(true);
            setError(null);

            console.log(
                "[Empire Companion] Starting mobile PD login..."
            );

            const response =
                await fetch(
                    `${API_URL}/api/pd/login`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Accept:
                                "application/json",
                        },

                        body: JSON.stringify({
                            userId:
                                Number(userId),

                            username:
                                pdUsername,

                            password:
                                pdPassword,
                        }),
                    }
                );

            const result =
                await response.json();

            console.log(
                "[Empire Companion] Mobile PD login response:",
                result
            );

            if (!response.ok || !result.success) {

                throw new Error(
                    result.error ||
                    "Profound Decisions login failed."
                );
            }

            /*
            ==============================================
            LOGIN + IMPORT SUCCESSFUL
            ==============================================
            */

            console.log(
                "[Empire Companion] PD login successful. Loading characters..."
            );

            await loadFromBackend();

            /*
            Clear the password from the UI after
            successful authentication.
            */

            setPdPassword("");

        } catch (err) {

            console.error(
                "[Empire Companion] PD login failed:",
                err
            );

            setError(
                err?.message ||
                "Could not log into Profound Decisions."
            );

        } finally {

            setLoading(false);
        }
    }
    /*
    ======================================================
    LOAD FROM BACKEND
    ======================================================
    */
    async function loadFromBackend() {

        try {

            if (!userId) {

                throw new Error(
                    "No user session is available yet."
                );

            }

            setLoading(true);
            setError(null);

            const response =
                await fetch(
                    `${API_URL}/api/characters?userId=${encodeURIComponent(userId)}`,
                    {
                        method: "GET",

                        headers: {
                            Accept:
                                "application/json",
                        },
                    }
                );

            let result;

            try {

                result =
                    await response.json();

            } catch {

                throw new Error(
                    `Server returned HTTP ${response.status} with an invalid response.`
                );

            }

            /*
            ==================================================
            BACKEND RETURNED AN ERROR
            ==================================================
            */

            if (!response.ok) {

                throw new Error(
                    result?.error ||
                    `Server returned HTTP ${response.status}`
                );

            }

            /*
            ==================================================
            VALID CHARACTER DATA
            ==================================================
            */

            if (
                !Array.isArray(
                    result?.characters
                )
            ) {

                throw new Error(
                    "Server response did not contain a characters array."
                );

            }

            const cleanData = {

                characters:
                    result.characters.map(
                        cleanCharacter
                    ),

                updatedAt:
                    result.updatedAt ||
                    new Date().toISOString(),

            };

            /*
            ==================================================
            SAVE LOCALLY TOO
            ==================================================
            */

            saveCachedCharacters(
                cleanData
            );

            setData(
                cleanData
            );

            setConnected(true);


            /*
            ==================================================
            SELECT FIRST CHARACTER
            ==================================================
            */

            if (
                cleanData.characters.length > 0
            ) {

                setSelectedName(
                    current =>
                        current &&
                            cleanData.characters.some(
                                character =>
                                    character.name === current
                            )
                            ? current
                            : cleanData.characters[0].name
                );

            } else {

                setSelectedName(null);

            }

            /*
            ==================================================
            TELL US WHETHER DATA IS CACHED
            ==================================================
            */

            if (result.cached) {

                console.log(
                    "[Empire Companion] Loaded characters from server cache."
                );

            } else {

                console.log(
                    "[Empire Companion] Loaded fresh characters from PD."
                );

            }

        } catch (err) {

            console.error(
                "[Empire Companion] Failed to load characters:",
                err
            );

            setConnected(false);

            setError(
                err?.message ||
                "Could not load character data."
            );

        } finally {

            setLoading(false);

        }
    }
    /*
    ======================================================
    SELECTED CHARACTER
    ======================================================
    */

    const selectedCharacter =
        useMemo(() => {

            if (!characters.length) {
                return null;
            }

            return (
                characters.find(
                    character =>
                        character.name ===
                        selectedName
                ) ||
                characters[0]
            );

        }, [
            characters,
            selectedName,
        ]);

    /*
    ======================================================
    SELECT CHARACTER
    ======================================================
    */

    function handleSelect(character) {

        setSelectedName(
            character.name
        );

        setMobileCharactersOpen(
            false
        );

    }

    /*
    ======================================================
    CLEAR CACHE
    ======================================================
    */

    function handleClear() {

        if (
            !window.confirm(
                "Remove the locally cached character data?"
            )
        ) {
            return;
        }

        localStorage.removeItem(
            STORAGE_KEY
        );

        setData(
            emptyData
        );

        setSelectedName(null);

        setConnected(false);

        setError(null);

    }

    /*
    ======================================================
    UI
    ======================================================
    */

    return (
        <div className="app">

            <header className="app-header">

                <div className="app-brand">

                    <div className="app-logo">
                        ⚔️
                    </div>

                    <div>

                        <h1>
                            Empire Companion
                        </h1>

                        <span>
                            Your Empire character reference
                        </span>

                    </div>

                </div>

                <div className="app-actions">

                    <span
                        className={
                            connected
                                ? "connection-status connected"
                                : "connection-status"
                        }
                    >

                        {connected
                            ? "🟢 Connected"
                            : "🔴 Offline"}

                    </span>

                    <button
                        className="secondary-button"
                        onClick={
                            handlePDSync
                        }
                        disabled={loading}
                    >

                        {loading
                            ? "⟳ Syncing..."
                            : "🔄 Sync from PD"}

                    </button>

                    {characters.length > 0 && (

                        <button
                            className="danger-button"
                            onClick={
                                handleClear
                            }
                        >
                            Clear
                        </button>

                    )}

                </div>

            </header>

           

            {error && (

                <div className="connection-warning">

                    ⚠️ {error}

                    {characters.length > 0 &&
                        " Showing cached data."}

                </div>

            )}
            {characters.length === 0 && (
                <div className="pd-login-panel">

                    <h2>Log in to Profound Decisions</h2>

                    <p>
                        Enter your Profound Decisions account details
                        to import your Empire characters.
                    </p>

                    <input
                        type="text"
                        placeholder="Profound Decisions username"
                        value={pdUsername}
                        onChange={(event) =>
                            setPdUsername(event.target.value)
                        }
                        autoComplete="username"
                    />

                    <input
                        type="password"
                        placeholder="Profound Decisions password"
                        value={pdPassword}
                        onChange={(event) =>
                            setPdPassword(event.target.value)
                        }
                        autoComplete="current-password"
                    />

                    <button
                        className="primary-button"
                        onClick={handlePDSync}
                        disabled={
                            loading ||
                            !pdUsername ||
                            !pdPassword
                        }
                    >
                        {loading
                            ? "Logging in..."
                            : "Log in & Import Characters"}
                    </button>

                </div>
            )}
            <div className="character-navigation">

    <div className="mobile-character-bar">
        <label htmlFor="mobile-character-select">
            Character
        </label>

        <select
            id="mobile-character-select"
            value={selectedCharacter?.name || ""}
            onChange={(event) => {
                const character =
                    characters.find(
                        (item) =>
                            item.name ===
                            event.target.value
                    );

                if (character) {
                    handleSelect(character);
                }
            }}
        >
            <option value="" disabled>
                Select a character
            </option>

            {characters.map(
                (character, index) => (
                    <option
                        key={`${character.name}-${index}`}
                        value={character.name}
                    >
                        {character.name}
                    </option>
                )
            )}
        </select>
    </div>

    <div className="desktop-character-list">
        <CharacterList
            characters={characters}
            selected={selectedCharacter}
            onSelect={handleSelect}
        />
    </div>

</div>
                {selectedCharacter ? (

                    <CharacterDetail
                        character={
                            selectedCharacter
                        }
                    />

                ) : (

                    <EmptyState
                        onRefresh={
                            handlePDSync
                        }
                        loading={
                            loading
                        }
                    />

                )}


            <div className="app-footer">

                {data.updatedAt && (

                    <span>

                        Data updated{" "}

                        {new Date(
                            data.updatedAt
                        ).toLocaleString()}

                    </span>

                )}

                <span>

                    {characters.length} character
                    {characters.length === 1
                        ? ""
                        : "s"} stored

                </span>

            </div>

        </div>
    );
}
