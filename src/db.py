import sqlite3
from flask import g, current_app

def create_database():
    conn = sqlite3.connect('fishing.db')
