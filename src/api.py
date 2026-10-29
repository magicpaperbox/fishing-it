from flask import render_template, Blueprint, request, redirect, url_for
from db import get_db
from domain import Flashcard, FlashcardStatus, Deck, normalize_deck_name
from repository import FlashcardRepository

main_api = Blueprint("main", __name__, url_prefix="/")


def get_flashcards_repo():
    return FlashcardRepository(get_db())


@main_api.route("/")
def index():
    repo = get_flashcards_repo()
    decks = repo.get_all_decks()
    decks_json = [deck_to_json(deck) for deck in decks]

    return render_template("index.html", decks=decks, decks_json=decks_json)


def deck_to_json(deck):
    return {
        "id": deck.id,
        "name": deck.name,
    }


def flashcard_to_json(flashcard):
    return {
        "id": flashcard.id,
        "deck_id": flashcard.deck_id,
        "category": flashcard.category,
        "question": flashcard.question,
        "answer": flashcard.answer,
        "status": flashcard.status.value,
    }


@main_api.route("/decks/<int:deck_id>")
def show_deck(deck_id):
    repo = get_flashcards_repo()
    flashcards = repo.get_by_deck(deck_id)
    flashcards_json = [flashcard_to_json(flashcard) for flashcard in flashcards]

    return render_template("deck.html", flashcards=flashcards_json, deck_id=deck_id)


@main_api.route("/import_flashcards", methods=["POST"])
def import_flashcards():
    data = request.get_json()

    validation_error = validate_flashcard(data)
    if validation_error is not None:
        return validation_error

    flashcards = data["flashcards"]
    name = data["name"].strip()

    repo = get_flashcards_repo()
    existing_deck = repo.check_if_deck_exists_by_name(name)

    if existing_deck:
        return {"error": "deck name already exists"}, 409

    deck = repo.add_deck(Deck(id=None, name=normalize_deck_name(name)))
    for flashcard_data in flashcards:
        flashcard = Flashcard(
            id=None,
            deck_id=deck.id,
            category=flashcard_data["category"],
            question=flashcard_data["question"],
            answer=flashcard_data["answer"],
        )
        repo.add_flashcard(deck.id, flashcard)

    return {
        "message": f"Dodano {len(flashcards)} fiszek.",
        "deck_id": deck.id,
        "count": len(flashcards),
    }, 201


@main_api.route("/decks/<int:deck_id>/flashcards", methods=["POST"])
def add_flashcard(deck_id):
    data = request.get_json()
    flashcard = Flashcard(
        id=None,
        deck_id=deck_id,
        category=data["category"],
        question=data["question"],
        answer=data["answer"],
    )
    repo = get_flashcards_repo()
    saved_flashcard = repo.add_flashcard(deck_id, flashcard)

    return flashcard_to_json(saved_flashcard), 201


@main_api.route("/flashcards/<int:flashcard_id>/status", methods=["PATCH"])
def update_flashcard(flashcard_id):
    data = request.get_json()
    status = data["status"]

    if status not in ["not_started", "mastered", "needs_practice"]:
        raise TypeError("unsupported flashcard status")

    status = FlashcardStatus(status)
    repo = get_flashcards_repo()
    repo.update_flashcard_status(flashcard_id, status)

    return {"id": flashcard_id, "status": status}


@main_api.route("/decks/<int:deck_id>/reset_progress", methods=["PATCH"])
def reset_deck_progress(deck_id: int):
    repo = get_flashcards_repo()
    repo.reset_deck_progress(deck_id)
    return {"message": "Deck progress reset.", "deck_id": deck_id}


@main_api.route("/decks/<int:deck_id>/delete", methods=["POST"])
def delete_deck(deck_id: int):
    repo = get_flashcards_repo()
    repo.delete_deck(deck_id)
    return redirect(url_for("main.index"))


def validate_flashcard(data):
    if not isinstance(data, dict) or "flashcards" not in data:
        return {"error": "Missing flashcards field."}, 400
    if "name" not in data:
        return {"error": "Missing name field."}, 400
    if not isinstance(data["name"], str):
        return {"error": "Incorrect name type."}, 400
    try:
        normalize_deck_name(data["name"])
    except ValueError as e:
        return {"error": str(e)}, 400

    flashcards = data["flashcards"]

    if not isinstance(flashcards, list):
        return {"error": "flashcards must be a list"}, 400

    for flashcard_data in flashcards:
        if not isinstance(flashcard_data, dict):
            return {"error": "flashcards must be a dictionary"}, 400
        if "category" not in flashcard_data:
            return {"error": "Missing flashcard category."}, 400
        if "question" not in flashcard_data:
            return {"error": "Missing flashcard question."}, 400
        if "answer" not in flashcard_data:
            return {"error": "Missing flashcard answer."}, 400
    return None
