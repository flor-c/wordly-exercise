const letters = document.querySelectorAll(".letter-box");
const loadingDiv = document.querySelector(".info-bar");
const ANSWER_LENGTH = 5;
const ROUNDS = 6;

async function init() {

    let currentGuess = "";
    let currentRow = 0;
    let isLoading = true;

    const res = await fetch("https://words.dev-apis.com/word-of-the-day");
    const resObj = await res.json();
    const word = resObj.word.toUpperCase();
    const wordParts = word.split("");
    let done = false;
    isLoading = false;
    setLoading(isLoading);

    console.log(word);

    // user adds a letter to the current guess
    function addLetter(letter) {
        if(currentGuess.length < ANSWER_LENGTH) {
            //add letter to te end
            currentGuess += letter;
        } else {
            //replace the last letter
            currentGuess = currentGuess.substring(0, currentGuess.length - 1) + letter;
        }

        letters[currentRow * ANSWER_LENGTH + currentGuess.length -1].innerText = letter;
    }

    async function guess() {
        if (currentGuess.length !== ANSWER_LENGTH) {
            //do nothing
            return;
        }

        // check the API to see if it's a valid word
        isLoading = true;
        setLoading(true);
        const res = await fetch("https://words.dev-apis.com/validate-word", {
            method: "POST",
            body: JSON.stringify({ word: currentGuess}),
        });

        const resObj = await res.json();
        const validWord = resObj.validWord;
        // another way to write this ^ => const { validWord } = resObj;

        isLoading = false;
        setLoading(false);

        if (!validWord) {
            markInvalidWord();
            return;
        }


        // mark as correct, close or wrong
        const guessParts = currentGuess.split("");
        const map = makeMap(wordParts);

        // first pass just finds correct letters, so we can mark those as correct first
        for (let i = 0; i < ANSWER_LENGTH; i++) {
            if (guessParts[i] === wordParts[i]) {
                // mark as correct
                letters[currentRow * ANSWER_LENGTH + i].classList.add("correct");
                map[guessParts[i]]--;
            }
        }

        // second pass finds close and wrong letters. We use the map to make sure we mark the correct amount of close letters
        for (let i = 0; i < ANSWER_LENGTH; i++ ) {
            if (guessParts[i] === wordParts[i]) {
                // do nothing, done on previous for loop
            } else if (wordParts.includes(guessParts[i]) && map[guessParts[i]] > 0) {
                letters[currentRow * ANSWER_LENGTH + i].classList.add("close");
                map[guessParts[i]]--;
            } else {
                letters[currentRow * ANSWER_LENGTH + i].classList.add("wrong");
            }
        }

        currentRow++;

        // win or lose

        if (currentGuess === word) {
            // win
            alert("You win!");
            done = true;
            return;
        } else if (currentRow === ROUNDS) {
            alert(`You lose, the word was ${word}`);
            done = true;
        }

        currentGuess = "";

    }

    function backspace() {
        currentGuess = currentGuess.substring(0, currentGuess.length - 1);
        letters[currentRow * ANSWER_LENGTH + currentGuess.length].innerText = "";
    }

    function markInvalidWord () {
        //alert("Not a valid word")

        for (let i = 0; i < ANSWER_LENGTH; i++) {
            letters[currentRow * ANSWER_LENGTH + i].classList.remove("invalid");

            setTimeout(
                function () { letters[currentRow * ANSWER_LENGTH + i].classList.add("invalid");},
                10);
        }

    }

    document.addEventListener("keydown", function handleKeyPress (event) {
        if (done || isLoading) {
            // do nothing
            return;
        }

        const action = event.key;

        if (action === "Enter") {
            guess();
        } else if (action === "Backspace") {
            backspace();
        } else if (isLetter(action)) {
            addLetter(action.toUpperCase())
        } else {
            // do nothing
        }
    });
}

function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter);
}

function setLoading(isLoading) {
    loadingDiv.classList.toggle("hidden", !isLoading);
}

// takes an array of letters (like ['E', 'L', 'I', 'T', 'E']) and creates
// an object out of it (like {E: 2, L: 1, T: 1}) so we can use that to
// make sure we get the correct amount of letters marked close instead
// of just wrong or correct
function makeMap (array) {
    const obj = {};
    for (let i = 0; i < array.length; i++) {
        const letter = array[i]
        if (obj[letter]) {
            obj[letter]++;
        } else {
            obj[letter] = 1;
        }
    }

    return obj;
}

init();