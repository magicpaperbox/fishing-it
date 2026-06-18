from pathlib import Path

from flask import Flask

from api import main_api
from db import init_app, init_db

BASE_DIR = Path(__file__).resolve().parent.parent
app = Flask(__name__, template_folder="../templates", static_folder="../static")
app.config["DATABASE_PATH"] = BASE_DIR / "flashcards.sqlite"

init_app(app)

app.register_blueprint(main_api)

if __name__ == '__main__':
    with app.app_context():
        init_db()

    app.run(debug=True)