CREATE TABLE IF NOT EXISTS decks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_decks_name_unique
ON decks (lower(trim(name)));

CREATE TABLE IF NOT EXISTS flashcards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    deck_id INTEGER NOT NULL,
    category TEXT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'not_started',
    FOREIGN KEY (deck_id) REFERENCES decks (id) ON DELETE CASCADE
);

UPDATE flashcards SET status = 'not_started' WHERE status = 'new';
UPDATE flashcards SET status = 'needs_practice' WHERE status = 'unknown';
UPDATE flashcards SET status = 'not_started' WHERE status = 'known';