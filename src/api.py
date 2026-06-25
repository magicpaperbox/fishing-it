from flask import render_template, Blueprint, redirect, abort, request
from db import get_db
from domain import Flashcard, FlashcardStatus
from repository import FlashcardRepository

main_api = Blueprint('main', __name__, url_prefix="/")


@main_api.route('/')
def index():
    repo = FlashcardRepository(get_db())
    decks = repo.list_decks()

    return render_template("index.html", decks=decks)

@main_api.route('/decks/<int:deck_id>')
def show_deck(deck_id):
    repo = FlashcardRepository(get_db())
    flashcards = repo.get_flashcards_by_deck(deck_id)
    flashcards_json = [
        {
            "id": flashcard.id,
            "deck_id": flashcard.deck_id,
            "category": flashcard.category,
            "question": flashcard.question,
            "answer": flashcard.answer,
            "status": flashcard.status.value,
        }
        for flashcard in flashcards
    ]

    return render_template("deck.html", flashcards=flashcards_json)


@main_api.route('/import_flashcards', methods=['POST'])
def import_flashcards():
    data = request.get_json()

    repo = FlashcardRepository(get_db())

    flashcards = data["flashcards"]
    if not isinstance(flashcards, list):
        raise TypeError('flashcards must be a list')


    name = data["name"].strip()
    existing_deck = repo.check_if_deck_exists_by_name(name)

    if existing_deck:
        return {"error": "deck name already exists"}, 409

    deck = repo.create_deck(name)
    deck_id = deck.id

    for flashcard_data in flashcards:
        flashcard = Flashcard(
            id=None,
            deck_id=deck_id,
            category=flashcard_data["category"],
            question=flashcard_data["question"],
            answer=flashcard_data["answer"],
        )
        repo.add_flashcard(deck_id, flashcard)

    return {
        "message": f"Dodano {len(flashcards)} fiszek.",
        "deck_id": deck_id,
        "count": len(flashcards)
    }, 201

@main_api.route('/decks/<int:deck_id>/flashcards', methods=['POST'])
def add_flashcard(deck_id):
    data = request.get_json()
    flashcard = Flashcard(
        id=None,
        deck_id=deck_id,
        category=data["category"],
        question=data["question"],
        answer=data["answer"],
    )
    repo = FlashcardRepository(get_db())
    saved_flashcard = repo.add_flashcard(deck_id, flashcard)

    return {
        "id": saved_flashcard.id,
        "deck_id": saved_flashcard.deck_id,
        "category": saved_flashcard.category,
        "question": saved_flashcard.question,
        "answer": saved_flashcard.answer,
        "status": saved_flashcard.status.value
    }, 201

@main_api.route('/flashcards/<int:flashcard_id>/status', methods=['PATCH'])
def update_flashcard(flashcard_id):
    data = request.get_json()
    status = data["status"]

    if status not in ["new", "known", "unknown"]:
        raise TypeError('unsupported flashcard status')

    status = FlashcardStatus(status)
    repo = FlashcardRepository(get_db())
    repo.update_flashcard_status(flashcard_id, status)


    return {
        "id": flashcard_id,
        "status": status
    }
