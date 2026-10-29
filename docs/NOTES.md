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

## JavaScript: kopiowanie tablicy przez spread operator

W JavaScripcie zapis z trzema kropkami, na przykład `[...cards]`, nazywa się spread operator.

Jeśli `cards` jest tablicą, to:

```js
const shuffledCards = [...cards];
```

tworzy nową tablicę z tymi samymi elementami.

To jest przydatne, kiedy chcemy coś zmienić w kolejności elementów, ale nie chcemy ruszać oryginalnej tablicy.

Przykład:

```js
const cards = ["A", "B", "C"];
const copiedCards = [...cards];

copiedCards.reverse();
```

Po takim kodzie:

```js
cards; // ["A", "B", "C"]
copiedCards; // ["C", "B", "A"]
```

`reverse()` zmieniło kolejność tylko w `copiedCards`, bo `copiedCards` jest osobną tablicą.

W fiszkach to ma znaczenie, bo możemy wymieszać kopię listy fiszek dla aktualnej sesji, a oryginalne `flashcards` zostawić w spokoju.

## JavaScript: losowe mieszanie tablicy algorytmem Fisher-Yates

Do mieszania fiszek można użyć algorytmu Fisher-Yates.

Pomysł jest taki:

```text
Nie losujemy całej tablicy naraz.
Ustawiamy losowo jedno miejsce po drugim, zaczynając od końca tablicy.
```

Przykład tablicy:

```text
indeksy: 0  1  2  3  4
fiszki:  A  B  C  D  E
```

Pętla zaczyna od ostatniego indeksu:

```js
for (let i = shuffledCards.length - 1; i > 0; i--) {

}
```

Jeśli tablica ma 5 elementów, ostatni indeks to `4`, bo indeksy zaczynają się od `0`:

```text
0, 1, 2, 3, 4
```

W pierwszym obrocie pętli `i = 4`.

Algorytm mówi wtedy:

```text
Na miejsce 4 wybierz losową fiszkę z miejsc 0, 1, 2, 3, 4.
```

Potem miejsce `4` uznajemy za ustawione i już go nie ruszamy.

W kolejnym obrocie pętli `i = 3`.

Algorytm mówi wtedy:

```text
Na miejsce 3 wybierz losową fiszkę z miejsc 0, 1, 2, 3.
Miejsca 4 już nie ruszaj.
```

I tak dalej, aż do początku tablicy.

### `Math.random()`

`Math.random()` zwraca losową liczbę od `0` do prawie `1`.

Przykłady możliwych wyników:

```text
0.12
0.3847
0.91
```

Ważne: `Math.random()` nigdy nie zwraca dokładnie `1`.

### `Math.floor()`

`Math.floor()` ucina część po przecinku.

Przykłady:

```js
Math.floor(3.8); // 3
Math.floor(0.6); // 0
Math.floor(4.01); // 4
```

### Dlaczego `i + 1`

W kodzie do losowania indeksu używamy:

```js
const randomIndex = Math.floor(Math.random() * (i + 1));
```

`i` jest największym dozwolonym indeksem, a nie liczbą elementów.

Jeśli `i = 4`, to chcemy losować z indeksów:

```text
0, 1, 2, 3, 4
```

To jest 5 możliwych indeksów.

Dlatego mnożymy przez `i + 1`, czyli przez `5`.

Przykład:

```text
Math.random() = 0.72
0.72 * 5 = 3.6
Math.floor(3.6) = 3
```

Wylosowany indeks to `3`.

Gdyby użyć tylko `i`:

```js
Math.floor(Math.random() * i)
```

to przy `i = 4` losowalibyśmy tylko:

```text
0, 1, 2, 3
```

Indeks `4` nigdy by wtedy nie wypadł.

Krótko:

```text
i = ostatni indeks
i + 1 = liczba elementów od 0 do i
```

### Zamiana elementów miejscami

Kiedy mamy już `i` i `randomIndex`, zamieniamy dwie fiszki miejscami.

Przykład:

```text
tablica:      A  B  C  D  E
indeksy:      0  1  2  3  4

i = 4
randomIndex = 1
```

Zamieniamy element pod indeksem `4` z elementem pod indeksem `1`.

Czyli zamieniamy `E` z `B`:

```text
przed: A  B  C  D  E
po:    A  E  C  D  B
```

W kodzie potrzebujemy zmiennej tymczasowej, żeby nie zgubić jednej fiszki podczas nadpisywania:

```js
const temporaryCard = shuffledCards[i];
shuffledCards[i] = shuffledCards[randomIndex];
shuffledCards[randomIndex] = temporaryCard;
```

Kolejność jest taka:

```text
1. Zapamiętaj fiszkę z miejsca i w temporaryCard.
2. W miejsce i włóż fiszkę z randomIndex.
3. W miejsce randomIndex włóż fiszkę zapamiętaną w temporaryCard.
```

Cała funkcja będzie miała taki ogólny kształt:

```js
function shuffleCards(cards) {
    const shuffledCards = [...cards];

    for (let i = shuffledCards.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));

        const temporaryCard = shuffledCards[i];
        shuffledCards[i] = shuffledCards[randomIndex];
        shuffledCards[randomIndex] = temporaryCard;
    }

    return shuffledCards;
}
```
