let currentIndex = 0;
const categoryElement = document.querySelector("#category");
const questionElement = document.querySelector("#question");
const answerElement = document.querySelector("#answer");

const studyStartElement = document.querySelector("#study-start");
const startFromScratchButton = document.querySelector("#start-from-scratch");
const resumeStudyButton = document.querySelector("#resume-study");
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
const studyProgressElement = document.querySelector("#study-progress");

const summaryChartElement = document.querySelector("#summary-chart");

let masteredCards = flashcards.filter(card => card.status === "mastered").length;
let needsPracticeCards = flashcards.filter(card => card.status === "needs_practice").length;
let notStartedCards = flashcards.filter(card => card.status === "not_started").length
let currentFlashcards = flashcards;

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function getCodeLanguageClass(language) {
    const normalizedLanguage = language.trim().split(/\s+/)[0].toLowerCase();

    if (!normalizedLanguage.match(/^[a-z0-9_-]+$/)) {
        return "";
    }

    return ` class="language-${normalizedLanguage}"`;
}

function renderInlineMarkdown(text) {
    const codeTokens = [];
    let html = escapeHtml(text).replace(/`([^`\n]+)`/g, function (_, code) {
        const tokenIndex = codeTokens.length;
        codeTokens.push(`<code>${code}</code>`);
        return `\u0000${tokenIndex}\u0000`;
    });

    html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/__([^_]+)__/g, "<strong>$1</strong>");
    html = html.replace(/\*([^*\n]+)\*/g, "<em>$1</em>");
    html = html.replace(/_([^_\n]+)_/g, "<em>$1</em>");

    return html.replace(/\u0000(\d+)\u0000/g, function (_, tokenIndex) {
        return codeTokens[Number(tokenIndex)];
    });
}

function isListItem(line) {
    return line.match(/^[-*]\s+/) || line.match(/^\d+\.\s+/);
}

function renderMarkdownList(lines, startIndex, ordered) {
    const items = [];
    const listItemPattern = ordered ? /^\d+\.\s+(.*)$/ : /^[-*]\s+(.*)$/;
    let index = startIndex;

    while (index < lines.length) {
        const match = lines[index].trim().match(listItemPattern);

        if (!match) {
            break;
        }

        items.push(`<li>${renderInlineMarkdown(match[1])}</li>`);
        index++;
    }

    const tagName = ordered ? "ol" : "ul";
    return {
        html: `<${tagName}>${items.join("")}</${tagName}>`,
        nextIndex: index,
    };
}

function renderMarkdown(markdown) {
    const lines = String(markdown ?? "").replaceAll("\r\n", "\n").replaceAll("\r", "\n").split("\n");
    const blocks = [];
    let index = 0;

    while (index < lines.length) {
        const line = lines[index];
        const trimmedLine = line.trim();

        if (trimmedLine === "") {
            index++;
            continue;
        }

        if (trimmedLine.startsWith("```")) {
            const language = trimmedLine.slice(3);
            const codeLines = [];
            index++;

            while (index < lines.length && !lines[index].trim().startsWith("```")) {
                codeLines.push(lines[index]);
                index++;
            }

            if (index < lines.length) {
                index++;
            }

            blocks.push(`<pre><code${getCodeLanguageClass(language)}>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
            continue;
        }

        const headingMatch = trimmedLine.match(/^(#{1,3})\s+(.*)$/);

        if (headingMatch) {
            const headingLevel = Number(headingMatch[1].length) + 2;
            blocks.push(`<h${headingLevel}>${renderInlineMarkdown(headingMatch[2])}</h${headingLevel}>`);
            index++;
            continue;
        }

        if (trimmedLine.match(/^[-*]\s+/)) {
            const list = renderMarkdownList(lines, index, false);
            blocks.push(list.html);
            index = list.nextIndex;
            continue;
        }

        if (trimmedLine.match(/^\d+\.\s+/)) {
            const list = renderMarkdownList(lines, index, true);
            blocks.push(list.html);
            index = list.nextIndex;
            continue;
        }

        const paragraphLines = [];

        while (index < lines.length) {
            const currentLine = lines[index];
            const currentTrimmedLine = currentLine.trim();

            if (
                currentTrimmedLine === "" ||
                currentTrimmedLine.startsWith("```") ||
                currentTrimmedLine.match(/^(#{1,3})\s+/) ||
                isListItem(currentTrimmedLine)
            ) {
                break;
            }

            paragraphLines.push(currentLine);
            index++;
        }

        blocks.push(`<p>${paragraphLines.map(renderInlineMarkdown).join("<br>")}</p>`);
    }

    return blocks.join("");
}

function setMarkdownContent(element, markdown) {
    element.innerHTML = renderMarkdown(markdown);
}

function showCard() {
    const card = currentFlashcards[currentIndex];
    studyProgressElement.textContent = `${currentIndex + 1} z ${currentFlashcards.length}`
    categoryElement.textContent = card.category;
    setMarkdownContent(questionElement, card.question);
    setMarkdownContent(answerElement, card.answer);

    answerElement.classList.add("hidden");
}

function showSummary() {
    const masteredCount = masteredCards;
    const needsPracticeCount = needsPracticeCards;
    const notStartedCount = notStartedCards;

    studyProgressElement.classList.add("hidden");
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

function resetDeckProgress(deckId) {
    return fetch(`/decks/${deckId}/reset_progress`, {
        method: "PATCH"
    });
}

function startStudyFromScratch() {
    resetDeckProgress(deckId).then(function () {
        flashcards.forEach(function (card) {
            card.status = "not_started";
        });

        masteredCards = 0;
        needsPracticeCards = 0;
        notStartedCards = flashcards.length;

        startStudy();
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
    studyStartElement.classList.add("hidden");
    studyProgressElement.classList.remove("hidden");
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
    startStudyFromScratch();
});

masteredButton.addEventListener("click", function () {
    answerCard("mastered");
});

needsPracticeButton.addEventListener("click", function () {
    answerCard("needs_practice");
});

resumeStudyButton.addEventListener("click", function () {
    startStudy("not_mastered");
});

startFromScratchButton.addEventListener("click", function () {
    startStudyFromScratch();
});
