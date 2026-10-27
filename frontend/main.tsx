import {createRoot} from "react-dom/client";
import {useState} from "react";
import type {ChangeEvent} from "react";

type Deck = {
    id: number;
    name: string;
};

type DeckSearchProps = {
    decks: Deck[]
}

function DeckSearch(props: DeckSearchProps) {
    const [query, setQuery] = useState("");

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        setQuery(event.target.value)
    }

    const filteredDecks = searchTextInDeckName();
    const deckItems = filteredDecks.map(deck =>
        (
            <li key={deck.id} className="deck-list-item">
                <a className="deck-link" href={`/decks/${deck.id}`}>
                    <span className="deck-card-icon" aria-hidden="true">{deck.name[0].toUpperCase()}</span>
                    <span className="deck-name">{deck.name}
                        </span>
                </a>
                <form onSubmit={(event) => {
                    if (!window.confirm("Czy na pewno chcesz usunąć ten zestaw?")) {
                        event.preventDefault();
                    }
                }} className="delete-deck-form" method="post" action={`/decks/${deck.id}/delete`}>
                    <button type="submit" className="delete-deck-button" aria-label="Usuń zestaw"
                            title="Usuń zestaw">
                        <svg className="delete-deck-icon" aria-hidden="true" viewBox="0 0 24 24" focusable="false">
                            <path d="M3 6h18"></path>
                            <path d="M8 6V4h8v2"></path>
                            <path d="M6 6l1 15h10l1-15"></path>
                            <path d="M10 11v6"></path>
                            <path d="M14 11v6"></path>
                        </svg>
                    </button>
                </form>
            </li>
        )
    );

    return (<div className="deck-search">
        <label className="deck-search-label" htmlFor="deck-search-input">Znajdź swój zestaw</label>
        <div className="deck-search-field">
            <svg className="deck-search-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <circle cx="10.5" cy="10.5" r="6.5"/>
                <path d="m16 16 4 4"/>
            </svg>
            <input id="deck-search-input" className="deck-search-input" type="search" onChange={handleChange}
                   placeholder="Wpisz nazwę zestawu…" value={query}/>
        </div>
        <p className="deck-search-results" role="status">Liczba znalezionych zestawów: <strong>{filteredDecks.length}</strong></p>
        {filteredDecks.length === 0 && <div className="deck-search-empty">
            <p className="deck-search-empty-title">Nie znaleziono zestawów</p>
            <p>Spróbuj innej nazwy lub skróć wpisaną frazę.</p>
        </div>}
        <ul className="deck-list">{deckItems}</ul>
    </div>);

    function searchTextInDeckName() {
        const lowerCaseQuery: string = query.toLowerCase().trim()
        let goodDecks: Deck[] = []
        for (const deck of props.decks) {
            const deckNameLowerCase = deck.name.toLowerCase()
            if (deckNameLowerCase.includes(lowerCaseQuery)) {
                goodDecks.push(deck)
            }
        }
        return goodDecks;
    }
}

const container = document.getElementById("deck-search-root");
const decksDataElement = document.getElementById("decks-data")

if (container !== null && decksDataElement !== null) {
    const decksText = decksDataElement.textContent
    if (decksText !== null) {
        const decks = JSON.parse(decksText);
        const root = createRoot(container);
        root.render(<DeckSearch decks={decks}/>);
    }


}
