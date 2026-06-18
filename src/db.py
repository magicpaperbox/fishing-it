import sqlite3
from flask import g, current_app


def get_db():
    if 'db' not in g:
        db_path = current_app.config.get('DATABASE_PATH')
        g.db = sqlite3.connect(
            db_path,
            detect_types=sqlite3.PARSE_DECLTYPES
        )
        g.db.execute("PRAGMA foreign_keys = ON")
        g.db.row_factory = sqlite3.Row

    return g.db

def close_db(e=None):
    db = g.pop('db', None)

    if db is not None:
        db.close()

def init_db():
    db = get_db()
    with current_app.open_resource('schema.sql', mode='r') as f:
        db.executescript(f.read())
    db.commit()

def init_app(app):
    app.teardown_appcontext(close_db)