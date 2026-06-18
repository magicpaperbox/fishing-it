let currentIndex = 0;
const categoryElement = document.querySelector("#category");
const questionElement = document.querySelector("#question");
const answerElement = document.querySelector("#answer");

const showAnswerButton = document.querySelector("#show-answer");
const nextCardButton = document.querySelector("#next-card");
const knownButton = document.querySelector("#known");
const unknownButton = document.querySelector("#unknown");

let knownCards = [];
let unknownCards = [];

function showCard(){
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

showAnswerButton.addEventListener("click", function (){
    answerElement.classList.toggle("hidden");
})

nextCardButton.addEventListener("click", function (){
    currentIndex++;
    if (currentIndex >= flashcards.length){
        currentIndex = 0;
    }
    showCard();
});

knownButton.addEventListener("click", function (){
    const card = flashcards[currentIndex];
    card.status = "known";
    updateStatus(card.id, "known");
});

unknownButton.addEventListener("click", function () {
    const card = flashcards[currentIndex];
    card.status = "unknown";
    updateStatus(card.id, "unknown");
});

showCard();