from pathlib import Path

from flask import Flask

from api import main_api
from db import init_app, init_db

if __name__ == '__main__':
    BASE_DIR = Path(__file__).parent.parent
    app = Flask(__name__, template_folder=BASE_DIR / "templates", static_folder=BASE_DIR / "static")
    app.config["DATABASE_PATH"] = BASE_DIR / "flashcards.sqlite"

    init_app(app)

    app.register_blueprint(main_api)

    with app.app_context():
        init_db()

    app.run(debug=True)