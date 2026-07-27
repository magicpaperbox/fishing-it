# Notatki z nauki

## Flask: zwracanie słownika z endpointu

W Pythonie `{}` tworzy słownik, czyli `dict`.

Słownik przechowuje dane jako pary klucz-wartość:

```python
{"message": "Deck progress reset."}
```

W tym przykładzie:

- `"message"` to klucz
- `"Deck progress reset."` to wartość

We Flasku jest wygodna rzecz: jeśli endpoint zwróci słownik, Flask automatycznie zamieni go na JSON.

Czyli taka odpowiedź w Pythonie:

```python
return {"message": "Deck progress reset."}
```

zostanie wysłana do przeglądarki jako JSON:

```json
{
  "message": "Deck progress reset."
}
```

To jest przydatne, bo JavaScript łatwo czyta JSON, na przykład funkcją `response.json()`.

## Resetowanie progresu decka

Stary pomysł na reset był taki:

```text
jedna fiszka = jeden request
```

Czyli jeśli deck miał 100 fiszek, JavaScript wysyłałby 100 requestów.

Lepszy pomysł na reset jest taki:

```text
jeden deck = jeden request
```

Backend może zresetować wszystkie fiszki w jednym decku jednym zapytaniem SQL:

```sql
UPDATE flashcards
SET status = ?
WHERE deck_id = ?
```

Najważniejsza część to `WHERE deck_id = ?`.

To znaczy: zaktualizuj wszystkie wiersze z tabeli `flashcards`, których `deck_id` pasuje do wybranego decka.

To różni się od:

```sql
WHERE id = ?
```

bo `id` wskazuje jedną konkretną fiszkę, a `deck_id` może wskazywać wiele fiszek należących do jednego decka.

## Małe funkcje, które tylko zwracają wywołanie innej funkcji

Czasem funkcja wygląda prawie niepotrzebnie, bo jedyne, co robi, to zwraca wywołanie innej funkcji.

Przykład:

```js
function resetDeckProgress(deckId) {
    return fetch(`/decks/${deckId}/reset_progress`, {
        method: "PATCH"
    });
}
```

Ta funkcja nie istnieje po to, żeby kod był krótszy.

Ona istnieje po to, żeby nadać nazwę temu, co kod oznacza.

Bez tej funkcji kod mówi:

```js
fetch(`/decks/${deckId}/reset_progress`, {
    method: "PATCH"
});
```

To opisuje szczegół techniczny: wyślij request `PATCH` pod ten adres.

Z funkcją kod może powiedzieć:

```js
resetDeckProgress(deckId);
```

To opisuje akcję w aplikacji: zresetuj progres tego decka.

To jest przydatne, bo kod czyta się łatwiej, kiedy funkcje na wyższym poziomie mówią, co się dzieje, a nie tylko jak technicznie jest to zrobione.

To jest też przydatne na przyszłość: jeśli później dodamy obsługę błędów w `resetDeckProgress()`, na przykład sprawdzanie `response.ok`, to zmiana będzie w jednym miejscu.

## JavaScript: `fetch()`, `Promise` i `.then()`

Funkcja `fetch()` wysyła request HTTP z JavaScriptu.

`fetch()` nie zwraca od razu końcowych danych z serwera. Zamiast tego zwraca `Promise`.

`Promise` oznacza: ta operacja właśnie trwa i zakończy się później, sukcesem albo błędem.

Ponieważ `resetDeckProgress()` zwraca `fetch()`, to `resetDeckProgress()` też zwraca `Promise`:

```js
function resetDeckProgress(deckId) {
    return fetch(`/decks/${deckId}/reset_progress`, {
        method: "PATCH"
    });
}
```

Jeśli wywołamy tę funkcję tak:

```js
resetDeckProgress(deckId);
```

to request się rozpocznie, ale JavaScript nie poczeka na jego zakończenie przed przejściem do następnej linii.

Żeby zrobić coś po zakończeniu requestu, możemy użyć funkcji `.then()`:

```js
resetDeckProgress(deckId).then(function () {
    // Ten kod wykona się po udanym zakończeniu requestu.
});
```

Ważne: `.then()` nie zastępuje `addEventListener()`.

`addEventListener()` odpowiada na pytanie: kiedy ten kod ma się uruchomić?

Przykład: uruchom ten kod, kiedy użytkowniczka kliknie przycisk resetowania.

```js
resetProgressButton.addEventListener("click", function () {
    // Kod startujący po kliknięciu jest tutaj.
});
```

`.then()` odpowiada na inne pytanie: co ma się stać po zakończeniu operacji asynchronicznej?

Dlatego dla przycisku resetowania struktura jest taka:

```js
resetProgressButton.addEventListener("click", function () {
    resetDeckProgress(deckId).then(function () {
        flashcards.forEach(function (card) {
            card.status = "not_started";
        });

        masteredCards = 0;
        needsPracticeCards = 0;
        notStartedCards = flashcards.length;

        startStudy();
    });
});
```

Kolejność jest taka:

```text
użytkowniczka klika przycisk
-> addEventListener uruchamia swoją funkcję
-> resetDeckProgress(deckId) wysyła request
-> .then(...) czeka na zakończenie requestu
-> lokalne dane fiszek i UI są aktualizowane
```
