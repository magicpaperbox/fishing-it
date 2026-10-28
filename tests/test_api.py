import pytest
from app import create_app


def test_import_flashcards(tmp_path, monkeypatch):
    monkeypatch.setenv("DATABASE_PATH", str(tmp_path / "test.sqlite"))
    app = create_app()
    app.config["TESTING"] = True
    client = app.test_client()

    response = client.post("import_flashcards",
                           json={
                               "name": "Python",
                               "flashcards": [
                                   {"category": "Podstawy",
                                    "question": "Czym jest lista?",
                                    "answer": "Kolekcją elementów.",
                                    }
                               ]
                           })
    assert response.status_code == 201


def test_incorrect_data_type(tmp_path, monkeypatch):
    monkeypatch.setenv("DATABASE_PATH", str(tmp_path / "test.sqlite"))
    app = create_app()
    client = app.test_client()
    response = client.post("import_flashcards",
                           json={"name": "Python",
                                 "flashcards": "flashcards"})
    assert response.status_code == 400

def test_import_duplicate_deck_name(tmp_path, monkeypatch):
    monkeypatch.setenv("DATABASE_PATH", str(tmp_path / "test.sqlite"))
    app = create_app()
    app.config["TESTING"] = True
    client = app.test_client()
    deck_data = {
        "name": "Python",
        "flashcards": [
            {
                "category": "Podstawy",
                "question": "Czym jest lista?",
                "answer": "Kolekcją elementów.",
            }
        ],
    }

    first_response = client.post("import_flashcards", json=deck_data)
    assert first_response.status_code == 201

    second_response = client.post("import_flashcards", json=deck_data)
    assert second_response.status_code == 409
    assert second_response.get_json()["error"] == "deck name already exists"


def test_import_missing_flashcards(tmp_path, monkeypatch):
    monkeypatch.setenv("DATABASE_PATH", str(tmp_path / "test.sqlite"))
    app = create_app()
    app.config["TESTING"] = True
    client = app.test_client()
    response = client.post("import_flashcards",
                           json={"name": "Python",
                                 })
    assert response.status_code == 400


def test_import_missing_name(tmp_path, monkeypatch):
    monkeypatch.setenv("DATABASE_PATH", str(tmp_path / "test.sqlite"))
    app = create_app()
    app.config["TESTING"] = True
    client = app.test_client()
    response = client.post("import_flashcards",
                           json={
                               "flashcards":[
                                   {
                                       "category": "Podstawy",
                                       "question": "Czym jest lista?",
                                       "answer": "Kolekcją elementów."
                                   }
                               ]

                           })
    assert response.status_code == 400

@pytest.mark.parametrize("invalid_name", [100, " ", ["name", "another name"]])
def test_import_invalid_name(tmp_path, monkeypatch, invalid_name):
    monkeypatch.setenv("DATABASE_PATH", str(tmp_path / "test.sqlite"))
    app = create_app()
    app.config["TESTING"] = True
    client = app.test_client()
    response = client.post("import_flashcards",
                           json={"name": invalid_name,
                               "flashcards":[
                                   {
                                       "category": "Podstawy",
                                       "question": "Czym jest lista?",
                                       "answer": "Kolekcją elementów."
                                   }
                               ]

                           })
    assert response.status_code == 400

@pytest.mark.parametrize("missing_field", ["category", "question", "answer"])
def test_import_missing_field(tmp_path, monkeypatch, missing_field):
    flashcard_data = {
        "category": "Podstawy",
        "question": "Czym jest lista?",
        "answer": "Kolekcją elementów.",
    }
    del flashcard_data[missing_field]

    monkeypatch.setenv("DATABASE_PATH", str(tmp_path / "test.sqlite"))
    app = create_app()
    app.config["TESTING"] = True
    client = app.test_client()
    response = client.post("import_flashcards",
                           json={
                               "name": "Python",
                               "flashcards": [flashcard_data]})
    assert response.status_code == 400
    assert response.get_json()["error"] == f"Missing flashcard {missing_field}."
