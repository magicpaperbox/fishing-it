from domain import Deck, Flashcard, FlashcardStatus, normalize_deck_name


class FlashcardRepository:
    def __init__(self, db):
        self._db = db

    def get_all_decks(self) -> list[Deck]:
        rows = self._db.execute("""
        SELECT id, name 
        FROM decks
        """).fetchall()

        return [
            Deck(id=row["id"], name=row["name"])
            for row in rows
        ]

    def get_by_deck(self, deck_id: int) -> list[Flashcard]:
        rows = self._db.execute("""
        SELECT id, deck_id, category, question, answer, status 
        FROM flashcards
        WHERE deck_id = ?
        """, (deck_id,)).fetchall()

        return [
            Flashcard(
                id=row["id"],
                deck_id=row["deck_id"],
                category=row["category"],
                question=row["question"],
                answer=row["answer"],
                status=FlashcardStatus(row["status"]),
            )
            for row in rows
        ]

    def check_if_deck_exists_by_name(self, name: str) -> bool:
        name = normalize_deck_name(name)
        row = self._db.execute("""
        SELECT id
        FROM decks
        WHERE lower(trim(name)) = lower(?)
        """, (name,)).fetchone()

        return row is not None

    def add_deck(self, deck: Deck) -> Deck:
        if deck.id is not None:
            raise ValueError("Cannot add deck with id")

        cursor = self._db.execute("""
            INSERT INTO decks (name)
            VALUES (?)
        """, (deck.name,))

        self._db.commit()
        return Deck(id=cursor.lastrowid, name=deck.name)

    def add_flashcard(self, deck_id: int, flashcard: Flashcard) -> Flashcard:
        cursor = self._db.execute("""
                    INSERT INTO flashcards (deck_id, category, question, answer, status)
                    VALUES (?, ?, ?, ?, ?)
                """, (
            deck_id,
            flashcard.category,
            flashcard.question,
            flashcard.answer,
            flashcard.status.value,
        ))

        self._db.commit()

        return Flashcard(
            id=cursor.lastrowid,
            deck_id=deck_id,
            category=flashcard.category,
            question=flashcard.question,
            answer=flashcard.answer,
            status=flashcard.status,
        )

    def update_flashcard_status(self, flashcard_id: int, status: FlashcardStatus) -> None:
        self._db.execute("""
            UPDATE flashcards
            SET status = ?
            WHERE id = ?
            """, (status.value, flashcard_id))
        self._db.commit()

    def delete_deck(self, deck_id: int) -> None:
        self._db.execute("""
        DELETE FROM decks
        WHERE id = ?
        """, (deck_id,))
        self._db.commit()
