from dataclasses import dataclass
from enum import StrEnum


class FlashcardStatus(StrEnum):
    NOT_STARTED = "not_started"
    MASTERED = "mastered"
    NEEDS_PRACTICE = "needs_practice"


@dataclass(frozen=True)
class Deck:
    id: int | None
    name: str


@dataclass(frozen=True)
class Flashcard:
    id: int | None
    deck_id: int
    category: str
    question: str
    answer: str
    status: FlashcardStatus = FlashcardStatus.NOT_STARTED


def normalize_deck_name(deck_name: str) -> str:
    deck_name = deck_name.strip()
    if not deck_name:
        raise ValueError("deck_name cannot be empty")
    return deck_name
