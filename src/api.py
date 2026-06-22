from flask import render_template, Blueprint, redirect, abort, request
from db import get_db

main_api = Blueprint('main', __name__, url_prefix="/")


@main_api.route('/')
def index():
    db = get_db()
    decks = db.execute("""
    SELECT id, name
    FROM decks
    """).fetchall()

    decks = [dict(deck) for deck in decks]
    return render_template("index.html", decks=decks)

@main_api.route('/decks/<int:deck_id>')
def show_deck(deck_id):
    db = get_db()
    rows = db.execute("""
    SELECT id, deck_id, category, question, answer, status
    FROM flashcards
    WHERE deck_id = ?
    """, (deck_id,)).fetchall()
    flashcards = [dict(row) for row in rows]

    return render_template("deck.html", flashcards=flashcards)


@main_api.route('/import_flashcards', methods=['POST'])
def import_flashcards():
    data = request.get_json()
    flashcards = data["flashcards"]
    if not isinstance(flashcards, list):
        raise TypeError('flashcards must be a list')

    db = get_db()

    cursor = db.execute("""
        INSERT INTO decks (name)
        VALUES (?)
    """, (data["name"],))

    deck_id = cursor.lastrowid
    for flashcard in flashcards:
        db.execute("""
            INSERT INTO flashcards (deck_id, category, question, answer, status)
            VALUES (?, ?, ?, ?, ?)
        """, (
            deck_id,
            flashcard["category"],
            flashcard["question"],
            flashcard["answer"],
            "new"
        ))

    db.commit()
    return {
        "message": f"Dodano {len(flashcards)} fiszek.",
        "deck_id": deck_id,
        "count": len(flashcards)
    }, 201

@main_api.route('/decks/<int:deck_id>/flashcards', methods=['POST'])
def add_flashcard(deck_id):
    flashcard = request.get_json()
    db = get_db()
    cursor = db.execute("""
            INSERT INTO flashcards (deck_id, category, question, answer, status)
            VALUES (?, ?, ?, ?, ?)
        """, (
            deck_id,
            flashcard["category"],
            flashcard["question"],
            flashcard["answer"],
            "new"
        ))

    db.commit()

    return {
        "id": cursor.lastrowid,
        "deck_id": deck_id,
        "category": flashcard["category"],
        "question": flashcard["question"],
        "answer": flashcard["answer"],
        "status": "new"
    }, 201

@main_api.route('/flashcards/<int:flashcard_id>/status', methods=['PATCH'])
def update_flashcard(flashcard_id):
    data = request.get_json()
    status = data["status"]

    if status not in ["new", "known", "unknown"]:
        raise TypeError('unsupported flashcard status')

    db = get_db()
    db.execute("""
    UPDATE flashcards
    SET status = ?
    WHERE id = ?
    """, (status, flashcard_id))
    db.commit()

    return {
        "id": flashcard_id,
        "status": status
    }
