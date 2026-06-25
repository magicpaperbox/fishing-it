from dataclasses import dataclass
from enum import StrEnum

class FlashcardStatus(StrEnum):
    NEW = "new"
    KNOWN = "known"
    UNKNOWN = "unknown"

@dataclass(frozen=True)
class Deck:
    id : int | None
    name : str

@dataclass(frozen=True)
class Flashcard:
    id : int | None
    deck_id: int
    category : str
    question : str
    answer : str
    status : FlashcardStatus = FlashcardStatus.NEW

def normalize_deck_name(deck_name: str) -> str:
    deck_name = deck_name.strip()
    if not deck_name:
        raise ValueError("deck_name cannot be empty")
    return deck_name