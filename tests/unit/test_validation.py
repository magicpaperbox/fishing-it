import pytest

from api import validate_flashcard


@pytest.mark.parametrize("invalid_name", [100, " ", ["name", "another name"]])
def test_import_invalid_name(invalid_name):
    data = {
        "name": invalid_name,
        "flashcards": [
            {
                "category": "Podstawy",
                "question": "Czym jest lista?",
                "answer": "Kolekcją elementów.",
            }
        ],
    }

    body, status_code = validate_flashcard(data)

    assert status_code == 400
    assert "error" in body