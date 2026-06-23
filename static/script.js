let currentIndex = 0;
const categoryElement = document.querySelector("#category");
const questionElement = document.querySelector("#question");
const answerElement = document.querySelector("#answer");

const showAnswerButton = document.querySelector("#show-answer");
const nextCardButton = document.querySelector("#next-card");
const knownButton = document.querySelector("#known");
const unknownButton = document.querySelector("#unknown");
const cardElement = document.querySelector(".card");

let knownCards = [];
let unknownCards = [];

function showCard() {
    const card = flashcards[currentIndex];

    categoryElement.textContent = card.category;
    questionElement.textContent = card.question;
    answerElement.textContent = card.answer;

    answerElement.classList.add("hidden");
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
    if (currentIndex >= flashcards.length) {
        currentIndex = 0;
    }
    showCard();
});

function answerCard(status) {
    const card = flashcards[currentIndex];
    card.status = status;
    updateStatus(card.id, status);

    if (status === "known") {
        cardElement.classList.add("known-effect");
    } else {
        cardElement.classList.add("unknown-effect")
    }

    setTimeout(function () {
        cardElement.classList.remove("known-effect");
        cardElement.classList.remove("unknown-effect");

        currentIndex++;
        if (currentIndex >= flashcards.length) {
            currentIndex = 0;
        }
        showCard();
    }, 500);


}

knownButton.addEventListener("click", function () {
    answerCard("known");
});

unknownButton.addEventListener("click", function () {
    answerCard("unknown");
});

showCard();