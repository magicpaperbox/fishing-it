# Monkeypatch — notatka z nauki

## Co to jest?

**Monkeypatching to podmienianie zachowania lub ustawień programu podczas jego działania, bez edytowania oryginalnych plików źródłowych.**

Możemy na przykład:

- zastąpić funkcję inną funkcją;
- zmienić atrybut obiektu;
- zmienić wartość w słowniku;
- ustawić zmienną środowiskową, np. ścieżkę do bazy danych.

W Pythonie nazwy mogą wskazywać na różne obiekty w trakcie działania programu. Dlatego możemy sprawić, że program przy następnym wywołaniu użyje innej funkcji.

## Obrazowo: trzy szybkie kroki

Podmianę funkcji można sobie wyobrazić tak:

1. Główny program działa sobie normalnie.
2. Twój miniprogram wchodzi do pamięci komputera i mówi: *"Od teraz, kiedy ktoś wywoła funkcję X, nie uruchamiajcie starego kodu. Uruchomcie MÓJ kod"*.
3. Główny program daje się nabrać i wykonuje instrukcje z Twojego miniprogramu.

To obrazowe uproszczenie: „miniprogramem” może być zwykła funkcja zastępcza. Podmieniamy odwołanie do funkcji, więc kolejne wywołanie korzysta z nowej wersji. Program wykonuje po prostu kod, na który wskazuje używana nazwa.

## Porównanie do kodów w grze

Wyobraź sobie grę, w której upadek z wysokości zabiera bohaterowi 50 punktów życia.

1. **Oryginalna zasada:** przy upadku gra wywołuje funkcję odejmującą 50 punktów życia.
2. **Podmiana podczas gry:** zastępujemy tę funkcję inną, która przy upadku nie odejmuje żadnych punktów życia.
3. **Efekt:** bohater przeżywa upadek bez obrażeń. Gra korzysta z podmienionego zachowania, a oryginalne pliki gry na dysku pozostają bez zmian.
4. **Ponowne uruchomienie:** jeśli uruchomimy grę bez ponownego wykonania podmiany, wraca oryginalna zasada i upadek znów zabiera życie.

To porównanie przypomina działanie niektórych trainerów, które zmieniają zachowanie uruchomionej gry. Same kody w grach mogą być zrealizowane na różne sposoby — ta analogia pokazuje przede wszystkim **zmianę zachowania działającego programu bez edycji jego oryginalnych plików**.

W testach podobnie przygotowujemy konkretne warunki: na przykład podmieniamy funkcję pobierającą dane z internetu na taką, która od razu zwraca ustaloną odpowiedź.

## Prosty przykład: podmiana funkcji

```python
def powitanie():
    return "Cześć!"


def inne_powitanie():
    return "Hej!"


print(powitanie())  # Cześć!

powitanie = inne_powitanie

print(powitanie())  # Hej!
```

Najważniejsza linijka:

```python
powitanie = inne_powitanie
```

Nie ma tutaj nawiasów po `inne_powitanie`, więc nie wywołujemy tej funkcji. Przypisujemy sam obiekt funkcji do nazwy `powitanie`.

Od tej chwili `powitanie()` uruchamia funkcję zwracającą `"Hej!"`. Oryginalna funkcja nie została przepisana — zmieniło się to, na co wskazuje nazwa.

Ten przykład pokazuje mechanizm podmiany. W praktyce monkeypatching często polega na podmianie funkcji należącej do innego modułu albo klasy.

## Plik na dysku a działający program

| Edycja kodu źródłowego | Monkeypatching |
| --- | --- |
| Zmieniamy treść pliku i zapisujemy ją na dysku. | Podmieniamy obiekt lub ustawienie podczas działania programu. |
| Zapisana zmiana będzie dostępna przy kolejnym uruchomieniu. | Sama podmiana nie edytuje pliku zawierającego oryginalną funkcję. |

Kod wykonujący podmianę może być zapisany w pliku testu. Gdy uruchomimy ten test ponownie, ponownie wykona podmianę.

Określenie „zmiana w RAM-ie” pomaga odróżnić działający program od plików na dysku. W Pythonie zwykle korzystamy ze zwykłych przypisań i operacji na obiektach — nie potrzebujemy osobnego narzędzia ingerującego w pamięć innego procesu.

## Po co używamy tego w testach?

Chcemy przygotować konkretne warunki i sprawdzić reakcję aplikacji.

Przykłady:

- Funkcję pobierającą pogodę zastępujemy funkcją zwracającą ustaloną pogodę. Test nie zależy wtedy od zewnętrznego serwera.
- Funkcję wykonującą połączenie zastępujemy taką, która zgłasza błąd. Możemy sprawdzić obsługę braku połączenia.
- Ustawiamy aplikacji ścieżkę do testowej bazy danych.

Podmiana dotyczy wskazanego elementu programu. Nie odłącza internetu w całym komputerze ani nie zmienia globalnie zachowania systemu operacyjnego.

## `monkeypatch` w pytest

Pytest udostępnia wbudowaną fixture o nazwie `monkeypatch`. Fixture to obiekt lub dane, które pytest przygotowuje i przekazuje do testu.

```python
def test_przykladowy(monkeypatch):
    monkeypatch.setenv("TRYB", "testowy")
```

Wpisujemy `monkeypatch` jako argument funkcji testowej. Pytest sam dostarcza odpowiedni obiekt.

Przydatne metody:

| Metoda | Co robi? |
| --- | --- |
| `monkeypatch.setattr(obiekt, "atrybut", wartosc)` | Podmienia atrybut, np. funkcję w module. |
| `monkeypatch.setitem(slownik, klucz, wartosc)` | Ustawia wartość w słowniku. |
| `monkeypatch.setenv("NAZWA", "wartosc")` | Ustawia zmienną środowiskową bieżącego procesu. |
| `monkeypatch.delenv("NAZWA", raising=False)` | Usuwa zmienną środowiskową, jeśli istnieje. |

Po zakończeniu zwykłego testu pytest automatycznie cofa podmiany wykonane za pomocą tej fixture, także gdy test zakończy się błędem.

Ręczne przypisanie, takie jak `powitanie = inne_powitanie`, nie ma automatycznego przywracania poprzedniej wartości.

## Nasz przykład w FishingIT

```python
from app import create_app


def test_import_flashcards(tmp_path, monkeypatch):
    monkeypatch.setenv("DATABASE_PATH", str(tmp_path / "test.sqlite"))

    app = create_app()
    app.config["TESTING"] = True
    client = app.test_client()

    response = client.post(
        "/import_flashcards",
        json={
            "name": "Python",
            "flashcards": [
                {
                    "category": "Podstawy",
                    "question": "Czym jest lista?",
                    "answer": "Kolekcją elementów.",
                }
            ],
        },
    )

    assert response.status_code == 201
```

Kluczowa linijka:

```python
monkeypatch.setenv("DATABASE_PATH", str(tmp_path / "test.sqlite"))
```

Krok po kroku:

1. Pytest przygotowuje tymczasowy folder `tmp_path` oraz fixture `monkeypatch`.
2. `tmp_path / "test.sqlite"` tworzy ścieżkę do pliku bazy w tym folderze. Operator `/` łączy tutaj fragmenty ścieżki.
3. `str(...)` zamienia ścieżkę na tekst wymagany przez zmienną środowiskową.
4. `setenv` ustawia `DATABASE_PATH` na tę ścieżkę.
5. `create_app()` odczytuje zmienną i inicjalizuje prawdziwą bazę SQLite w podanym miejscu.
6. Żądanie importu zapisuje dane w tej testowej bazie.
7. Po teście pytest przywraca poprzednią wartość `DATABASE_PATH`. Jeżeli wcześniej zmiennej nie było, usuwa ją.

**Kolejność ma znaczenie:** ustawiamy `DATABASE_PATH` przed `create_app()`, ponieważ aplikacja odczytuje tę zmienną podczas tworzenia.

W tym teście podmieniamy ustawienie ścieżki. Zapis do bazy nadal naprawdę się odbywa.

## Flask: dlaczego test zgłasza wyjątek po włączeniu `TESTING`?

```python
app.config["TESTING"] = True
```

Ta linia włącza tryb testowy Flaska. Przy domyślnych pozostałych ustawieniach nieobsłużone wyjątki z aplikacji są wtedy przekazywane do pytesta.

W naszym przypadku endpoint próbował wykonać:

```python
flashcards = data["flashcards"]
```

Jednak test wysyłał taki JSON:

```python
json={
    "category": "Podstawy",
    "question": "Czym jest lista?",
}
```

Brakuje w nim klucza `"flashcards"`. Odczyt nieistniejącego klucza przez `data["flashcards"]` powoduje wyjątek:

```text
KeyError: 'flashcards'
```

| Ustawienia aplikacji | Co dzieje się z tym nieobsłużonym wyjątkiem? |
| --- | --- |
| Zwykły tryb, bez debugowania i propagowania wyjątków | Flask zapisuje błąd w logu i zwraca odpowiedź HTTP 500. |
| `TESTING = True`, bez dodatkowych zmian obsługi wyjątków | Wyjątek dociera do pytesta, który pokazuje `KeyError`. |

Tryb testowy nie tworzy tego błędu. Pozwala zobaczyć bezpośrednio problem istniejący w aplikacji.

### Dlaczego test nie dochodzi do `assert`?

```python
response = client.post("/import_flashcards", json=dane)
assert response.status_code == 400
```

Python musi najpierw zakończyć wywołanie `client.post(...)`, żeby przypisać jego wynik do `response`.

Jeżeli to wywołanie zgłosi nieobsłużony wyjątek, wykonanie testu zostaje przerwane w pierwszej linijce. Druga linijka, czyli `assert`, nie zostaje wykonana.

Są więc dwa różne sposoby niepowodzenia testu:

- Aplikacja zwróciła odpowiedź, ale miała ona niewłaściwy kod — nie przechodzi asercja.
- Podczas obsługi żądania pojawił się nieobsłużony wyjątek — test zatrzymuje się, zanim sprawdzi kod odpowiedzi.

### Dlaczego oczekujemy 400, a nie 500?

- **201 — Created:** aplikacja utworzyła zestaw.
- **400 — Bad Request:** aplikacja odrzuciła nieprawidłowe dane wejściowe.
- **500 — Internal Server Error:** podczas obsługi żądania wystąpił nieobsłużony błąd serwera.

W teście odrzucania danych bez wymaganego pola zostawiamy:

```python
assert response.status_code == 400
```

Test opisuje oczekiwane zachowanie aplikacji. Zmiana oczekiwania na 500 tylko po to, żeby test przeszedł, utrwaliłaby obecny błąd obsługi danych.

## Walidacja przed odczytaniem wymaganego pola

Na początku endpointu importu, przed `flashcards = data["flashcards"]`, możemy sprawdzić dane:

```python
data = request.get_json()

if not isinstance(data, dict) or "flashcards" not in data:
    return {"error": "Missing flashcards field."}, 400

flashcards = data["flashcards"]
```

Jak działa warunek:

1. `isinstance(data, dict)` sprawdza, czy dane są słownikiem.
2. `not` odwraca wynik — pierwsza część warunku jest prawdziwa, jeśli dane nie są słownikiem.
3. `"flashcards" not in data` sprawdza, czy brakuje wymaganego klucza.
4. `or` oznacza, że wystarczy spełnienie jednego z tych warunków.
5. Jeśli pierwsza część jest prawdziwa, Python nie sprawdza drugiej części. To nazywa się krótkim spięciem i pozwala bezpiecznie obsłużyć np. `data = None`.
6. `return` kończy obsługę żądania i zwraca JSON z komunikatem oraz kodem 400.

To sprawdzenie obsługuje nieprawidłowy typ danych na najwyższym poziomie i brak pola `flashcards`. Kolejne reguły walidacji muszą osobno sprawdzać nazwę zestawu, typ pola `flashcards` oraz zawartość fiszek. Walidację wszystkich fiszek warto wykonać przed zapisem, żeby odrzucenie importu nie zostawiało części zestawu w bazie.

## Jak rozdzielić drugi i trzeci test?

Każdy test powinien przygotować dane pozwalające dotrzeć do sprawdzenia konkretnego błędu.

### Drugi test: brak listy fiszek

Czytelne dane dla tego przypadku to:

```python
json={
    "name": "Python",
}
```

Nazwa zestawu jest podana, ale brakuje pola `flashcards`. Oczekujemy HTTP 400. Test może nazywać się `test_import_missing_flashcards`.

### Trzeci test: brak wymaganego pola wewnątrz fiszki

Zachowujemy poprawną strukturę zestawu, a błąd umieszczamy w jednej fiszce:

```python
json={
    "name": "Python",
    "flashcards": [
        {
            "category": "Podstawy",
            "question": "Czym jest lista?",
            "answers": "2",
        }
    ],
}
```

Celowo używamy `answers` zamiast wymaganego `answer`. Ten test sprawdza brak pola `answer`, niezależnie od obecności dodatkowego pola `answers`. Może nazywać się `test_import_missing_answer`.

Aplikacja może już odczytać `name` i `flashcards`, a następnie dotrzeć do pojedynczej fiszki. Bez walidacji jej pól zgłosi `KeyError: 'answer'` przy próbie odczytu `flashcard_data["answer"]`.

Oczekiwaniem nadal jest HTTP 400. Przejście drugiego testu nie oznacza jeszcze, że trzeci również przejdzie — sprawdzają różne poziomy danych.

## Czy to „miniprogram w programie”?

Możemy napisać małą funkcję zastępczą i użyć jej do podmiany innej funkcji. Jednak samo monkeypatching jest techniką, a fixture `monkeypatch` jest narzędziem do wykonywania takich podmian.

W naszym teście nie tworzymy funkcji zastępczej. Wystarcza zmiana jednej zmiennej środowiskowej.

Monkeypatching i mockowanie są powiązane, ale nie oznaczają dokładnie tego samego. Monkeypatching opisuje sposób podmiany. Mock to obiekt zastępujący zależność, który może np. zapamiętywać, jak został wywołany. Do podmiany możemy użyć także zwykłej funkcji.

## O czym pamiętać?

- Podmiana działa tam, gdzie program odczytuje zmieniony obiekt lub ustawienie. Wartość odczytana i zapamiętana wcześniej może pozostać bez zmian.
- Automatyczne cofnięcie podmiany przez pytest nie cofa wszystkich skutków testu. Nie usuwa samo z siebie zapisanych rekordów ani utworzonych plików. Dlatego używamy osobnej bazy w `tmp_path`.
- Poza testami monkeypatching bywa używany do obchodzenia błędów bibliotek. Takie podmiany mogą utrudniać diagnozowanie problemów i przestać działać po aktualizacji biblioteki.
