import pytest

from domain import normalize_deck_name


def test_normalize_deck_name_removes_whitespaces():
    result = normalize_deck_name(" Python ")
    assert result == "Python"


def test_normalize_deck_name_rejects_whitespaces():
    with pytest.raises(ValueError):
        normalize_deck_name("  ")
