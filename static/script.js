let currentIndex = 0;
const categoryElement = document.querySelector("#category");
const questionElement = document.querySelector("#question");
const answerElement = document.querySelector("#answer");

const showAnswerButton = document.querySelector("#show-answer");
const nextCardButton = document.querySelector("#next-card");
const masteredButton = document.querySelector("#mastered");
const needsPracticeButton = document.querySelector("#needs-practice");
const continueStudyButton = document.querySelector("#continue-study");
const resetProgressButton = document.querySelector("#reset-progress");

const cardElement = document.querySelector(".card");
const summaryElement = document.querySelector("#summary");
const masteredCountElement = document.querySelector("#mastered-count");
const needsPracticeCountElement = document.querySelector("#needs-practice-count");
const notDoneCountElement = document.querySelector("#not-done-count");

const summaryChartElement = document.querySelector("#summary-chart");

let masteredCards = flashcards.filter(card => card.status === "mastered").length;
let needsPracticeCards = flashcards.filter(card => card.status === "needs_practice").length;
let notStartedCards = flashcards.filter(card => card.status === "not_started").length
let currentFlashcards = flashcards;

function showCard() {
    const card = currentFlashcards[currentIndex];

    categoryElement.textContent = card.category;
    questionElement.textContent = card.question;
    answerElement.textContent = card.answer;

    answerElement.classList.add("hidden");
}

function showSummary() {
    const masteredCount = masteredCards;
    const needsPracticeCount = needsPracticeCards;
    const notStartedCount = notStartedCards;

    cardElement.classList.add("hidden");
    showAnswerButton.classList.add("hidden");
    nextCardButton.classList.add("hidden");
    masteredButton.classList.add("hidden");
    needsPracticeButton.classList.add("hidden");

    const total = masteredCount + needsPracticeCount + notStartedCount;
    const masteredPercent = masteredCount / total * 100;
    const needsPracticePercent = needsPracticeCount / total * 100;
    summaryChartElement.style.background = `
        conic-gradient(
            #B2FF66 0% ${masteredPercent}%,
            #FF6666 ${masteredPercent}% ${masteredPercent + needsPracticePercent}%,
            #c9b6c1 ${masteredPercent + needsPracticePercent}% 100%
        )`;

    masteredCountElement.textContent = `Umiem: ${masteredCount}`;
    needsPracticeCountElement.textContent = `Nie umiem: ${needsPracticeCount}`;
    notDoneCountElement.textContent = `Nie przerobione: ${notStartedCount}`;

    if (needsPracticeCount === 0 && notStartedCount === 0) {
        continueStudyButton.classList.add("hidden");
    } else {
        continueStudyButton.classList.remove("hidden");
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

function moveToNextCard() {
    currentIndex++;
    if (currentIndex >= currentFlashcards.length) {
        showSummary();
        return;
    }
    showCard();
}

nextCardButton.addEventListener("click", function () {
    moveToNextCard();
});

function updateCounters(previousStatus, newStatus) {
    if (previousStatus === newStatus) {
        return;
    }
    if (previousStatus === "mastered") {
        masteredCards--;
    }

    if (previousStatus === "needs_practice") {
        needsPracticeCards--;
    }

    if (previousStatus === "not_started") {
        notStartedCards--;
    }

    if (newStatus === "mastered") {
        masteredCards++;
    }

    if (newStatus === "needs_practice") {
        needsPracticeCards++;
    }

    if (newStatus === "not_started") {
        notStartedCards++;
    }
}

function answerCard(status) {
    const card = currentFlashcards[currentIndex];
    const previousStatus = card.status;
    card.status = status;
    updateCounters(previousStatus, status);
    updateStatus(card.id, status);

    if (status === "mastered") {
        cardElement.classList.add("mastered-effect");
    } else {
        cardElement.classList.add("needs-practice-effect");
    }

    setTimeout(function () {
        cardElement.classList.remove("mastered-effect");
        cardElement.classList.remove("needs-practice-effect");
        moveToNextCard();
    }, 500);

}

function startStudy(mode) {
    currentIndex = 0;

    if (mode === "not_mastered") {
        currentFlashcards = flashcards.filter(card => card.status !== "mastered");
    } else {
        currentFlashcards = flashcards;
    }

    if (currentFlashcards.length === 0) {
        showSummary();
        return;
    }

    summaryElement.classList.add("hidden");
    cardElement.classList.remove("hidden");
    showAnswerButton.classList.remove("hidden");
    nextCardButton.classList.remove("hidden");
    masteredButton.classList.remove("hidden");
    needsPracticeButton.classList.remove("hidden");

    showCard();
}

continueStudyButton.addEventListener("click", function () {
    startStudy("not_mastered");
});

resetProgressButton.addEventListener("click", function () {
    flashcards.forEach(function (card) {
        card.status = "not_started";
        updateStatus(card.id, "not_started");
    });

    masteredCards = 0;
    needsPracticeCards = 0;
    notStartedCards = flashcards.length;

    startStudy();
})

masteredButton.addEventListener("click", function () {
    answerCard("mastered");
});

needsPracticeButton.addEventListener("click", function () {
    answerCard("needs_practice");
});

startStudy();
