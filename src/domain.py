from flask import Flask, render_template
import sqlite3

flashcards = [
    {
        "question": "Co robi querySelector?",
        "answer": "Wybiera pierwszy element HTML pasujący do selektora CSS.",
        "category": "JavaScript DOM"
    },
    {
        "question": "Do czego służy Flask?",
        "answer": "Do tworzenia backendu i obsługi tras w Pythonie.",
        "category": "Backend"
    },
    {
        "question": "Co to jest SQLite?",
        "answer": "Lekka baza danych zapisywana w pliku.",
        "category": "Baza danych"
    }
]

