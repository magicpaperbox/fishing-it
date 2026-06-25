from domain import Deck, Flashcard, FlashcardStatus, normalize_deck_name


class FlashcardRepository:
    def __init__(self, db):
        self.db = db

    def list_decks(self) -> list[Deck]:
        rows = self.db.execute("""
        SELECT id, name 
        FROM decks
        """).fetchall()

        return [
            Deck(id=row["id"], name=row["name"])
            for row in rows
        ]

    def get_flashcards_by_deck(self, deck_id: int) -> list[Flashcard]:
        rows = self.db.execute("""
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
        row = self.db.execute("""
        SELECT id
        FROM decks
        WHERE lower(trim(name)) = lower(?)
        """, (name,)).fetchone()

        return row is not None

    def create_deck(self, name: str) -> Deck:
        name = normalize_deck_name(name)
        cursor = self.db.execute("""
            INSERT INTO decks (name)
            VALUES (?)
        """, (name,))

        self.db.commit()
        return Deck(id=cursor.lastrowid, name=name)


    def add_flashcard(self, deck_id: int, flashcard: Flashcard) -> Flashcard:
        cursor = self.db.execute("""
                    INSERT INTO flashcards (deck_id, category, question, answer, status)
                    VALUES (?, ?, ?, ?, ?)
                """, (
            deck_id,
            flashcard.category,
            flashcard.question,
            flashcard.answer,
            flashcard.status.value,
        ))

        self.db.commit()

        return Flashcard(
            id=cursor.lastrowid,
            deck_id=deck_id,
            category=flashcard.category,
            question=flashcard.question,
            answer=flashcard.answer,
            status=flashcard.status,
        )

    def update_flashcard_status(self, flashcard_id, status: FlashcardStatus) -> None:
        self.db.execute("""
            UPDATE flashcards
            SET status = ?
            WHERE id = ?
            """, (status.value, flashcard_id))
        self.db.commit()
