let currentIndex = 0;
const categoryElement = document.querySelector("#category");
const questionElement = document.querySelector("#question");
const answerElement = document.querySelector("#answer");

const showAnswerButton = document.querySelector("#show-answer");
const nextCardButton = document.querySelector("#next-card");
const knownButton = document.querySelector("#known");
const unknownButton = document.querySelector("#unknown");
const restartButton = document.querySelector("#restart");
const resetCardsButton = document.querySelector("#reset-cards");

const cardElement = document.querySelector(".card");
const summaryElement = document.querySelector("#summary");
const knownCountElement = document.querySelector("#known-count");
const unknownCountElement = document.querySelector("#unknown-count");
const notDoneCountElement = document.querySelector("#not-done-count");

const summaryChartElement = document.querySelector("#summary-chart");

let knownCards = flashcards.filter(card => card.status === "known").length;
let unknownCards = flashcards.filter(card => card.status === "unknown").length;
let notDoneCards = flashcards.filter(card => card.status !== "known" && card.status !== "unknown").length
let currentFlashcards = flashcards;

function showCard() {
    const card = currentFlashcards[currentIndex];

    categoryElement.textContent = card.category;
    questionElement.textContent = card.question;
    answerElement.textContent = card.answer;

    answerElement.classList.add("hidden");
}

function showSummary() {
    const knownCount = knownCards;
    const unknownCount = unknownCards;
    const notDoneCount = notDoneCards;

    cardElement.classList.add("hidden");
    showAnswerButton.classList.add("hidden");
    nextCardButton.classList.add("hidden");
    knownButton.classList.add("hidden");
    unknownButton.classList.add("hidden");

    const total = knownCount + unknownCount + notDoneCount;
    const knownPercent = knownCount / total * 100;
    const unknownPercent = unknownCount / total * 100;
    summaryChartElement.style.background = `
        conic-gradient(
            #B2FF66 0% ${knownPercent}%,
            #FF6666 ${knownPercent}% ${knownPercent + unknownPercent}%,
            #c9b6c1 ${knownPercent + unknownPercent}% 100%
        )`;

    knownCountElement.textContent = `Umiem: ${knownCount}`;
    unknownCountElement.textContent = `Nie umiem: ${unknownCount}`;
    notDoneCountElement.textContent = `Nie przerobione: ${notDoneCount}`;

    if (unknownCount === 0){
        restartButton.classList.add("hidden");
    } else {
        restartButton.classList.remove("hidden");
    }

    summaryElement.classList.remove("hidden");

}

function updateStatus(cardId, status) {
    fetch(`/flashcards/${cardId}/status`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            status: status
        })
    });
}

showAnswerButton.addEventListener("click", function () {
    answerElement.classList.toggle("hidden");
})

nextCardButton.addEventListener("click", function () {
    currentIndex++;
    if (currentIndex >= currentFlashcards.length) {
        showSummary();
        return;
    }
    showCard();
});

function updateCounters(previousStatus, newStatus){
    if (previousStatus === newStatus){
        return;
    }
    if (previousStatus === "known"){
        knownCards--;
    }

    if (previousStatus === "unknown"){
        unknownCards--;
    }

    if (newStatus === "known"){
        knownCards++;
    }

    if (newStatus === "unknown"){
        unknownCards++;
    }
}

function answerCard(status) {
    const card = currentFlashcards[currentIndex];
    const previousStatus = card.status;
    card.status = status;
    updateCounters(previousStatus, status);
    updateStatus(card.id, status);

    if (status === "known") {
        cardElement.classList.add("known-effect");
    } else {
        cardElement.classList.add("unknown-effect");
    }

    setTimeout(function () {
        cardElement.classList.remove("known-effect");
        cardElement.classList.remove("unknown-effect");

        currentIndex++;
        if (currentIndex >= currentFlashcards.length) {
            showSummary();
            return;
        }

        showCard();
    }, 500);

}

function startStudy(mode){
    currentIndex = 0;

    if (mode === "unknown") {
        currentFlashcards = flashcards.filter(card => card.status === "unknown");
    } else {
        currentFlashcards = flashcards;
    }

    if (currentFlashcards.length === 0){
        showSummary();
        return;
    }

    summaryElement.classList.add("hidden");
    cardElement.classList.remove("hidden");
    showAnswerButton.classList.remove("hidden");
    nextCardButton.classList.remove("hidden");
    knownButton.classList.remove("hidden");
    unknownButton.classList.remove("hidden");

    showCard();
}

restartButton.addEventListener("click", function () {
    startStudy("unknown");
});

resetCardsButton.addEventListener("click", function (){
    flashcards.forEach(function (card){
        card.status = "new";
        updateStatus(card.id, "new");
    });

     knownCards = 0;
    unknownCards = 0;
    currentFlashcards = flashcards;
    currentIndex = 0;

    summaryElement.classList.add("hidden");
    cardElement.classList.remove("hidden");
    showAnswerButton.classList.remove("hidden");
    nextCardButton.classList.remove("hidden");
    knownButton.classList.remove("hidden");
    unknownButton.classList.remove("hidden");

    showCard();
})

knownButton.addEventListener("click", function () {
    answerCard("known");
});

unknownButton.addEventListener("click", function () {
    answerCard("unknown");
});

showCard();