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
    knownCards.push(flashcards[currentIndex]);
});

unknownButton.addEventListener("click", function () {
    unknownCards.push(flashcards[currentIndex]);
});

showCard();