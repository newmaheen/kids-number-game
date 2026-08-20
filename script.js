// ==========================================
// KIDS NUMBER GAME
// Number + Addition + Subtraction
// English + Bangla
// ==========================================


// ==========================================
// VARIABLES
// ==========================================

let correctAnswer = 0;

let score = 0;
let streak = 0;
let level = 1;

let gameMode = "number";
let currentLanguage = "en";

let currentBanglaAudio = null;

let answerLocked = false;

let questionVoiceTimer = null;
let nextQuestionTimer = null;

let voiceSession = 0;


// Level unlock save থাকবে browser-এ
let unlockedLevel =
    Number(localStorage.getItem("unlockedLevel")) || 1;


// Level popup
let popupPreviousLevel = 1;
let popupNextLevel = 2;


// Repeat voice-এর জন্য
let lastVoiceType = "";
let lastVoiceData = null;


// ==========================================
// BANGLA NUMBER
// 25 → ২৫
// ==========================================

function toBanglaNumber(number) {

    const banglaDigits = [
        "০", "১", "২", "৩", "৪",
        "৫", "৬", "৭", "৮", "৯"
    ];

    return number
        .toString()
        .replace(/\d/g, function (digit) {
            return banglaDigits[digit];
        });
}


// ==========================================
// DISPLAY NUMBER
// ==========================================

function displayNumber(number) {

    if (currentLanguage === "bn") {
        return toBanglaNumber(number);
    }

    return number;
}


// ==========================================
// UPDATE STATS
// ==========================================

function updateStats() {

    document.getElementById("score").innerText =
        displayNumber(score);

    document.getElementById("streak").innerText =
        displayNumber(streak);

    document.getElementById("level").innerText =
        displayNumber(level);
}


// ==========================================
// CLEAR TIMERS
// ==========================================

function clearGameTimers() {

    if (questionVoiceTimer) {

        clearTimeout(questionVoiceTimer);

        questionVoiceTimer = null;
    }


    if (nextQuestionTimer) {

        clearTimeout(nextQuestionTimer);

        nextQuestionTimer = null;
    }
}


// ==========================================
// STOP ALL VOICE
// ==========================================

function stopAllVoice() {

    // পুরনো callbacks invalid
    voiceSession++;

    // English TTS বন্ধ
    window.speechSynthesis.cancel();


    // Bangla MP3 বন্ধ
    if (currentBanglaAudio) {

        currentBanglaAudio.onended = null;
        currentBanglaAudio.onerror = null;

        currentBanglaAudio.pause();
        currentBanglaAudio.currentTime = 0;

        currentBanglaAudio = null;
    }
}


// ==========================================
// PLAY BANGLA MP3
// ==========================================

function playBanglaAudio(fileName, onEnd = null) {

    stopAllVoice();

    const mySession = voiceSession;

    const audio =
        new Audio("audio/bn/" + fileName);

    currentBanglaAudio = audio;


    let finished = false;


    function finishAudio() {

        if (finished) {
            return;
        }

        finished = true;


        // পুরনো audio callback হলে ignore
        if (mySession !== voiceSession) {
            return;
        }


        currentBanglaAudio = null;


        if (onEnd) {
            onEnd();
        }
    }


    audio.onended = function () {

        finishAudio();
    };


    audio.onerror = function () {

        console.error(
            "Bangla audio load error:",
            fileName
        );

        finishAudio();
    };


    audio.play().catch(function (error) {

        console.error(
            "Bangla audio play error:",
            fileName,
            error
        );

        finishAudio();
    });
}


// ==========================================
// ENGLISH VOICE
// ==========================================

function speak(message, onEnd = null) {

    stopAllVoice();

    const mySession = voiceSession;


    const speech =
        new SpeechSynthesisUtterance(message);


    speech.lang = "en-US";

    speech.rate = 0.75;

    speech.pitch = 1;

    speech.volume = 1;


    let finished = false;


    function finishSpeech() {

        if (finished) {
            return;
        }

        finished = true;


        if (mySession !== voiceSession) {
            return;
        }


        if (onEnd) {
            onEnd();
        }
    }


    speech.onend = function () {

        finishSpeech();
    };


    speech.onerror = function () {

        finishSpeech();
    };


    window.speechSynthesis.speak(speech);
}


// ==========================================
// NEXT QUESTION
// Feedback শেষ → gap → নতুন question
// ==========================================

function nextQuestionAfterVoice() {

    if (nextQuestionTimer) {

        clearTimeout(nextQuestionTimer);
    }


    nextQuestionTimer =
        setTimeout(function () {

            generateQuestion();

        }, 1300);
}


// ==========================================
// GET LEVEL RANGE
// ==========================================

function getMaxNumber() {

    if (level === 1) {

        return 10;

    } else if (level === 2) {

        return 20;

    } else {

        return 50;
    }
}


// ==========================================
// SHUFFLE
// ==========================================

function shuffleArray(array) {

    return array.sort(function () {

        return Math.random() - 0.5;
    });
}


// ==========================================
// CREATE ANSWER OPTIONS
// ==========================================

function createOptions(answer, maxPossibleAnswer) {

    const options = [answer];


    while (options.length < 4) {

        // Correct answer-এর কাছাকাছি wrong answer
        let difference =
            Math.floor(Math.random() * 9) - 4;


        if (difference === 0) {
            continue;
        }


        let wrongAnswer =
            answer + difference;


        if (wrongAnswer < 0) {
            continue;
        }


        if (wrongAnswer > maxPossibleAnswer) {
            continue;
        }


        if (!options.includes(wrongAnswer)) {

            options.push(wrongAnswer);
        }
    }


    return shuffleArray(options);
}


// ==========================================
// SHOW OPTIONS
// ==========================================

function showOptions(options) {

    const buttons =
        document.querySelectorAll(
            ".options button"
        );


    buttons.forEach(function (button, index) {

        // নতুন question → button enable
        button.disabled = false;


        button.classList.remove(
            "correct-answer"
        );


        button.classList.remove(
            "wrong-answer"
        );


        button.innerText =
            displayNumber(
                options[index]
            );


        button.onclick = function () {

            checkAnswer(
                options[index],
                button
            );
        };
    });
}


// ==========================================
// DISABLE ALL ANSWERS
// ==========================================

function disableOptionButtons() {

    const buttons =
        document.querySelectorAll(
            ".options button"
        );


    buttons.forEach(function (button) {

        button.disabled = true;
    });
}


// ==========================================
// NUMBER QUESTION
// ==========================================

function generateNumberQuestion() {

    const maxNumber =
        getMaxNumber();


    const questionNumber =
        Math.floor(
            Math.random() * maxNumber
        ) + 1;


    correctAnswer =
        questionNumber;


    // Repeat-এর জন্য save
    lastVoiceType = "number";

    lastVoiceData =
        questionNumber;


    document.getElementById(
        "question"
    ).innerText =
        displayNumber(questionNumber);


    if (currentLanguage === "bn") {

        document.getElementById(
            "question-text"
        ).innerText =
            "এটি কোন সংখ্যা?";

    } else {

        document.getElementById(
            "question-text"
        ).innerText =
            "Which number is this?";
    }


    const options =
        createOptions(
            correctAnswer,
            maxNumber
        );


    showOptions(options);


    // Question voice
    questionVoiceTimer =
        setTimeout(function () {

            if (currentLanguage === "bn") {

                playBanglaAudio(
                    "number/" +
                    questionNumber +
                    ".mp3"
                );

            } else {

                speak(
                    "Can you find number " +
                    questionNumber +
                    "?"
                );
            }

        }, 800);
}


// ==========================================
// ADDITION QUESTION
// ==========================================

function generateAdditionQuestion() {

    let maxSum;


    // Level 1 → answer সর্বোচ্চ 10
    // Level 2 → answer সর্বোচ্চ 20
    // Level 3 → answer সর্বোচ্চ 50

    if (level === 1) {

        maxSum = 10;

    } else if (level === 2) {

        maxSum = 20;

    } else {

        maxSum = 50;
    }


    // প্রথম সংখ্যা
    const number1 =
        Math.floor(
            Math.random() * (maxSum - 1)
        ) + 1;


    // দ্বিতীয় সংখ্যা এমন হবে
    // যেন answer maxSum-এর বেশি না হয়
    const maxNumber2 =
        maxSum - number1;


    const number2 =
        Math.floor(
            Math.random() * maxNumber2
        ) + 1;


    correctAnswer =
        number1 + number2;


    // Repeat-এর জন্য save
    lastVoiceType =
        "addition";


    lastVoiceData = {

        number1: number1,

        number2: number2
    };


    // Question
    document.getElementById(
        "question"
    ).innerText =

        displayNumber(number1) +
        " + " +
        displayNumber(number2) +
        " = ?";


    if (currentLanguage === "bn") {

        document.getElementById(
            "question-text"
        ).innerText =
            "যোগফল কত?";

    } else {

        document.getElementById(
            "question-text"
        ).innerText =
            "What is the answer?";
    }


    const options =
        createOptions(
            correctAnswer,
            maxSum
        );


    showOptions(options);


    // ======================================
    // ADDITION QUESTION VOICE
    // ======================================

    questionVoiceTimer =
        setTimeout(function () {

            if (currentLanguage === "bn") {

                // যেমন:
                // তিন যোগ পাঁচ সমান কত?
                playBanglaAudio(
                    "add/" +
                    number1 +
                    "_" +
                    number2 +
                    ".mp3"
                );

            } else {

                speak(
                    "What is " +
                    number1 +
                    " plus " +
                    number2 +
                    "?"
                );
            }

        }, 800);
}


// ==========================================
// SUBTRACTION QUESTION
// ==========================================

function generateSubtractionQuestion() {

    const maxNumber =
        getMaxNumber();


    let number1 =
        Math.floor(
            Math.random() * maxNumber
        ) + 1;


    let number2 =
        Math.floor(
            Math.random() * maxNumber
        ) + 1;


    // Negative answer আটকানো
    if (number2 > number1) {

        const temp =
            number1;

        number1 =
            number2;

        number2 =
            temp;
    }


    correctAnswer =
        number1 - number2;


    // Repeat-এর জন্য save
    lastVoiceType =
        "subtraction";


    lastVoiceData = {

        number1: number1,

        number2: number2
    };


    document.getElementById(
        "question"
    ).innerText =

        displayNumber(number1) +
        " - " +
        displayNumber(number2) +
        " = ?";


    if (currentLanguage === "bn") {

        document.getElementById(
            "question-text"
        ).innerText =
            "বিয়োগফল কত?";

    } else {

        document.getElementById(
            "question-text"
        ).innerText =
            "What is the answer?";
    }


    const options =
        createOptions(
            correctAnswer,
            maxNumber
        );


    showOptions(options);


    // ======================================
    // SUBTRACTION QUESTION VOICE
    // ======================================

    questionVoiceTimer =
        setTimeout(function () {

            if (currentLanguage === "bn") {

                // যেমন:
                // নয় বিয়োগ চার সমান কত?
                playBanglaAudio(
                    "sub/" +
                    number1 +
                    "_" +
                    number2 +
                    ".mp3"
                );

            } else {

                speak(
                    "What is " +
                    number1 +
                    " minus " +
                    number2 +
                    "?"
                );
            }

        }, 800);
}


// ==========================================
// MAIN QUESTION GENERATOR
// ==========================================

function generateQuestion() {

    clearGameTimers();

    stopAllVoice();

    answerLocked =
        false;


    document.getElementById(
        "result"
    ).innerText = "";


    if (gameMode === "addition") {

        generateAdditionQuestion();

    } else if (
        gameMode === "subtraction"
    ) {

        generateSubtractionQuestion();

    } else {

        generateNumberQuestion();
    }
}


// ==========================================
// RANDOM BANGLA CORRECT FEEDBACK
// ==========================================

function playRandomCorrectFeedback() {

    const correctAudios = [

        "correct1.mp3",
        "correct2.mp3",
        "correct3.mp3",
        "correct4.mp3",
        "correct5.mp3",
        "correct6.mp3"

    ];


    const randomIndex =
        Math.floor(
            Math.random() *
            correctAudios.length
        );


    playBanglaAudio(
        correctAudios[randomIndex],
        nextQuestionAfterVoice
    );
}


// ==========================================
// NORMAL CORRECT FEEDBACK
// ==========================================

function normalCorrectFeedback() {

    const result =
        document.getElementById(
            "result"
        );


    result.style.color =
        "green";


    if (currentLanguage === "bn") {

        result.innerText =
            "🎉 সঠিক উত্তর!";


        // random encouragement
        playRandomCorrectFeedback();

    } else {

        result.innerText =
            "🎉 Correct!";


        const messages = [

            "Correct! Great job! Keep going!",

            "Excellent! That is the right answer!",

            "Wonderful! Keep up the good work!",

            "Amazing! You got it right!"

        ];


        const randomMessage =
            messages[
                Math.floor(
                    Math.random() *
                    messages.length
                )
            ];


        speak(
            randomMessage,
            nextQuestionAfterVoice
        );
    }
}


// ==========================================
// SPECIAL FEEDBACK
// ==========================================

function specialFeedback(
    banglaText,
    englishText,
    banglaAudio,
    englishVoice
) {

    const result =
        document.getElementById(
            "result"
        );


    result.style.color =
        "green";


    if (currentLanguage === "bn") {

        result.innerText =
            banglaText;


        playBanglaAudio(
            banglaAudio,
            nextQuestionAfterVoice
        );

    } else {

        result.innerText =
            englishText;


        speak(
            englishVoice,
            nextQuestionAfterVoice
        );
    }
}


// ==========================================
// CHECK ANSWER
// ==========================================

function checkAnswer(
    selectedAnswer,
    clickedButton
) {

    // Locked থাকলে click ignore
    if (answerLocked) {

        return;
    }


    // Question voice timer pending থাকলে বন্ধ
    if (questionVoiceTimer) {

        clearTimeout(
            questionVoiceTimer
        );

        questionVoiceTimer = null;
    }


    const result =
        document.getElementById(
            "result"
        );


    // ======================================
    // CORRECT
    // ======================================

    if (
        selectedAnswer ===
        correctAnswer
    ) {

        answerLocked =
            true;


        stopAllVoice();


        // Next question না আসা পর্যন্ত
        // আর answer click করা যাবে না
        disableOptionButtons();


        clickedButton.classList.add(
            "correct-answer"
        );


        launchConfetti();


        score++;

        streak++;


        updateStats();


        // ==================================
        // LEVEL 2 UNLOCK
        // ==================================

        if (
            score === 5 &&
            level === 1
        ) {

            unlockedLevel =
                Math.max(
                    unlockedLevel,
                    2
                );


            localStorage.setItem(
                "unlockedLevel",
                unlockedLevel
            );


            updateLevelButtons();


            if (
                currentLanguage === "bn"
            ) {

                result.innerText =
                    "🎉 লেভেল ২ আনলক হয়েছে!";


                playBanglaAudio(
                    "level2.mp3",
                    function () {

                        setTimeout(
                            function () {

                                showLevelUnlockPopup(
                                    1,
                                    2
                                );

                            },
                            1000
                        );
                    }
                );

            } else {

                result.innerText =
                    "🎉 Level 2 Unlocked!";


                speak(
                    "Great job! Level two is unlocked!",
                    function () {

                        setTimeout(
                            function () {

                                showLevelUnlockPopup(
                                    1,
                                    2
                                );

                            },
                            1000
                        );
                    }
                );
            }


            return;
        }


        // ==================================
        // LEVEL 3 UNLOCK
        // Level 2-এ 5 correct
        // ==================================

        if (
            score === 5 &&
            level === 2
        ) {

            unlockedLevel =
                3;


            localStorage.setItem(
                "unlockedLevel",
                unlockedLevel
            );


            updateLevelButtons();


            if (
                currentLanguage === "bn"
            ) {

                result.innerText =
                    "🚀 লেভেল ৩ আনলক হয়েছে!";


                playBanglaAudio(
                    "level3.mp3",
                    function () {

                        setTimeout(
                            function () {

                                showLevelUnlockPopup(
                                    2,
                                    3
                                );

                            },
                            1000
                        );
                    }
                );

            } else {

                result.innerText =
                    "🚀 Level 3 Unlocked!";


                speak(
                    "Excellent! Level three is unlocked!",
                    function () {

                        setTimeout(
                            function () {

                                showLevelUnlockPopup(
                                    2,
                                    3
                                );

                            },
                            1000
                        );
                    }
                );
            }


            return;
        }


        // ==================================
        // STREAK 3
        // ==================================

        if (streak === 3) {

            specialFeedback(
                "🔥 দারুণ!",
                "🔥 Amazing!",
                "amazing.mp3",
                "Amazing! Three in a row!"
            );


            return;
        }


        // ==================================
        // STREAK 5
        // ==================================

        if (streak === 5) {

            specialFeedback(
                "⭐ সুপার স্টার!",
                "⭐ Super Star!",
                "superstar.mp3",
                "Super Star! Five in a row!"
            );


            return;
        }


        // ==================================
        // STREAK 10
        // ==================================

        if (streak === 10) {

            specialFeedback(
                "🏆 নাম্বার চ্যাম্পিয়ন!",
                "🏆 Number Champion!",
                "champion.mp3",
                "Excellent! You are a number champion!"
            );


            return;
        }


        // Normal correct
        normalCorrectFeedback();
    }


    // ======================================
    // WRONG
    // ======================================

    else {

        answerLocked =
            true;


        stopAllVoice();


        clickedButton.classList.add(
            "wrong-answer"
        );


        streak = 0;


        updateStats();


        result.style.color =
            "red";


        if (
            currentLanguage === "bn"
        ) {

            result.innerText =
                "❌ উত্তরটি সঠিক হয়নি";


            playBanglaAudio(
                "wrong.mp3",
                function () {

                    setTimeout(
                        function () {

                            answerLocked =
                                false;

                        },
                        350
                    );
                }
            );

        } else {

            result.innerText =
                "❌ Try Again!";


            speak(
                "That is not quite right. Please try again.",
                function () {

                    setTimeout(
                        function () {

                            answerLocked =
                                false;

                        },
                        350
                    );
                }
            );
        }


        setTimeout(function () {

            clickedButton.classList.remove(
                "wrong-answer"
            );

        }, 500);
    }
}


// ==========================================
// CHANGE LANGUAGE
// ==========================================

function changeLanguage(language) {

    currentLanguage =
        language;


    clearGameTimers();

    stopAllVoice();


    const englishBtn =
        document.getElementById(
            "english-btn"
        );


    const banglaBtn =
        document.getElementById(
            "bangla-btn"
        );


    // ======================================
    // BANGLA
    // ======================================

    if (language === "bn") {

        document.body.classList.add(
            "bangla-mode"
        );


        document.getElementById(
            "start-title"
        ).innerText =
            "🎮 শিশুদের সংখ্যা খেলা";


        document.getElementById(
            "start-subtitle"
        ).innerText =
            "১ থেকে ৫০ পর্যন্ত সংখ্যা শেখো";


        document.getElementById(
            "start-btn"
        ).innerText =
            "▶ খেলা শুরু করো";


        document.getElementById(
            "game-title"
        ).innerText =
            "🎮 শিশুদের সংখ্যা খেলা";


        document.getElementById(
            "score-label"
        ).innerText =
            "স্কোর";


        document.getElementById(
            "streak-label"
        ).innerText =
            "স্ট্রিক";


        document.getElementById(
            "level-label"
        ).innerText =
            "লেভেল";


        document.getElementById(
            "home-btn"
        ).innerText =
            "🏠 হোম";


        document.getElementById(
            "restart-btn"
        ).innerText =
            "🔄 আবার শুরু";


        document.getElementById(
            "repeat-voice-btn"
        ).innerText =
            "🔊 আবার শোনো";


        document.getElementById(
            "number-mode"
        ).innerText =
            "🔢 সংখ্যা";


        document.getElementById(
            "addition-mode"
        ).innerText =
            "➕ যোগ";


        document.getElementById(
            "subtraction-mode"
        ).innerText =
            "➖ বিয়োগ";


        const chooseLevel =
            document.getElementById(
                "choose-level-text"
            );


        if (chooseLevel) {

            chooseLevel.innerText =
                "🎯 লেভেল নির্বাচন করো";
        }


        banglaBtn.classList.add(
            "active-language"
        );


        englishBtn.classList.remove(
            "active-language"
        );
    }


    // ======================================
    // ENGLISH
    // ======================================

    else {

        document.body.classList.remove(
            "bangla-mode"
        );


        document.getElementById(
            "start-title"
        ).innerText =
            "🎮 Kids Number Game";


        document.getElementById(
            "start-subtitle"
        ).innerText =
            "Learn Numbers from 1 to 50";


        document.getElementById(
            "start-btn"
        ).innerText =
            "▶ Start Game";


        document.getElementById(
            "game-title"
        ).innerText =
            "🎮 Kids Number Game";


        document.getElementById(
            "score-label"
        ).innerText =
            "Score";


        document.getElementById(
            "streak-label"
        ).innerText =
            "Streak";


        document.getElementById(
            "level-label"
        ).innerText =
            "Level";


        document.getElementById(
            "home-btn"
        ).innerText =
            "🏠 Home";


        document.getElementById(
            "restart-btn"
        ).innerText =
            "🔄 Restart";


        document.getElementById(
            "repeat-voice-btn"
        ).innerText =
            "🔊 Repeat";


        document.getElementById(
            "number-mode"
        ).innerText =
            "🔢 Number";


        document.getElementById(
            "addition-mode"
        ).innerText =
            "➕ Addition";


        document.getElementById(
            "subtraction-mode"
        ).innerText =
            "➖ Subtraction";


        const chooseLevel =
            document.getElementById(
                "choose-level-text"
            );


        if (chooseLevel) {

            chooseLevel.innerText =
                "🎯 Choose Level";
        }


        englishBtn.classList.add(
            "active-language"
        );


        banglaBtn.classList.remove(
            "active-language"
        );
    }


    updateStats();

    updateLevelButtons();
}


// ==========================================
// SET ACTIVE MODE
// ==========================================

function setActiveMode(mode) {

    gameMode =
        mode;


    const numberBtn =
        document.getElementById(
            "number-mode"
        );


    const additionBtn =
        document.getElementById(
            "addition-mode"
        );


    const subtractionBtn =
        document.getElementById(
            "subtraction-mode"
        );


    numberBtn.classList.remove(
        "active-mode"
    );


    additionBtn.classList.remove(
        "active-mode"
    );


    subtractionBtn.classList.remove(
        "active-mode"
    );


    if (mode === "number") {

        numberBtn.classList.add(
            "active-mode"
        );

    } else if (
        mode === "addition"
    ) {

        additionBtn.classList.add(
            "active-mode"
        );

    } else {

        subtractionBtn.classList.add(
            "active-mode"
        );
    }
}


// ==========================================
// CONFETTI
// ==========================================

function launchConfetti() {

    const container =
        document.getElementById(
            "confetti-container"
        );


    const colors = [

        "#ff4757",
        "#ffa502",
        "#2ed573",
        "#1e90ff",
        "#a55eea",
        "#ff6b81"

    ];


    for (
        let i = 0;
        i < 50;
        i++
    ) {

        const confetti =
            document.createElement(
                "div"
            );


        confetti.classList.add(
            "confetti"
        );


        confetti.style.left =
            Math.random() *
            100 +
            "vw";


        confetti.style.backgroundColor =
            colors[
                Math.floor(
                    Math.random() *
                    colors.length
                )
            ];


        confetti.style.animationDelay =
            Math.random() *
            0.5 +
            "s";


        container.appendChild(
            confetti
        );


        setTimeout(function () {

            confetti.remove();

        }, 2500);
    }
}


// ==========================================
// RESET GAME
// ==========================================

function resetGame() {

    clearGameTimers();

    stopAllVoice();


    score = 0;

    streak = 0;

    correctAnswer = 0;

    answerLocked = false;


    lastVoiceType = "";

    lastVoiceData = null;


    updateStats();


    document.getElementById(
        "result"
    ).innerText = "";
}


// ==========================================
// UPDATE LEVEL BUTTONS
// ==========================================

function updateLevelButtons() {

    const level1Btn =
        document.getElementById(
            "level1-btn"
        );


    const level2Btn =
        document.getElementById(
            "level2-btn"
        );


    const level3Btn =
        document.getElementById(
            "level3-btn"
        );


    // যদি HTML-এ level selector না থাকে
    if (
        !level1Btn ||
        !level2Btn ||
        !level3Btn
    ) {
        return;
    }


    level1Btn.disabled =
        false;


    // Level 2
    if (unlockedLevel >= 2) {

        level2Btn.disabled =
            false;


        level2Btn.innerText =
            currentLanguage === "bn"
                ? "লেভেল ২"
                : "Level 2";

    } else {

        level2Btn.disabled =
            true;


        level2Btn.innerText =
            currentLanguage === "bn"
                ? "🔒 লেভেল ২"
                : "🔒 Level 2";
    }


    // Level 3
    if (unlockedLevel >= 3) {

        level3Btn.disabled =
            false;


        level3Btn.innerText =
            currentLanguage === "bn"
                ? "লেভেল ৩"
                : "Level 3";

    } else {

        level3Btn.disabled =
            true;


        level3Btn.innerText =
            currentLanguage === "bn"
                ? "🔒 লেভেল ৩"
                : "🔒 Level 3";
    }


    level1Btn.classList.remove(
        "active-level"
    );


    level2Btn.classList.remove(
        "active-level"
    );


    level3Btn.classList.remove(
        "active-level"
    );


    const activeButton =
        document.getElementById(
            "level" +
            level +
            "-btn"
        );


    if (activeButton) {

        activeButton.classList.add(
            "active-level"
        );
    }
}


// ==========================================
// LEVEL UNLOCK POPUP
// ==========================================

function showLevelUnlockPopup(
    oldLevel,
    newLevel
) {

    popupPreviousLevel =
        oldLevel;


    popupNextLevel =
        newLevel;


    const popup =
        document.getElementById(
            "level-popup"
        );


    if (!popup) {

        level = newLevel;

        score = 0;

        streak = 0;

        updateStats();

        generateQuestion();

        return;
    }


    if (currentLanguage === "bn") {

        document.getElementById(
            "popup-title"
        ).innerText =

            "🎉 লেভেল " +
            toBanglaNumber(
                newLevel
            ) +
            " আনলক হয়েছে!";


        document.getElementById(
            "popup-message"
        ).innerText =

            "দারুণ! তুমি নতুন লেভেল আনলক করেছো। চাইলে নতুন লেভেল শুরু করতে পারো অথবা আগের লেভেল আবার অনুশীলন করতে পারো।";


        document.getElementById(
            "next-level-btn"
        ).innerText =

            "▶ লেভেল " +
            toBanglaNumber(
                newLevel
            ) +
            " শুরু করো";


        document.getElementById(
            "repeat-level-btn"
        ).innerText =

            "🔄 লেভেল " +
            toBanglaNumber(
                oldLevel
            ) +
            " আবার খেলো";

    } else {

        document.getElementById(
            "popup-title"
        ).innerText =

            "🎉 Level " +
            newLevel +
            " Unlocked!";


        document.getElementById(
            "popup-message"
        ).innerText =

            "Great job! You unlocked a new level. Start the new level or practice the previous level again.";


        document.getElementById(
            "next-level-btn"
        ).innerText =

            "▶ Start Level " +
            newLevel;


        document.getElementById(
            "repeat-level-btn"
        ).innerText =

            "🔄 Play Level " +
            oldLevel +
            " Again";
    }


    popup.style.display =
        "flex";
}


// ==========================================
// START GAME
// ==========================================

document.getElementById(
    "start-btn"
).addEventListener(
    "click",
    function () {

        resetGame();


        document.getElementById(
            "start-screen"
        ).style.display =
            "none";


        document.getElementById(
            "game-container"
        ).style.display =
            "block";


        generateQuestion();
    }
);


// ==========================================
// RESTART GAME
// ==========================================

document.getElementById(
    "restart-btn"
).addEventListener(
    "click",
    function () {

        resetGame();

        generateQuestion();
    }
);


// ==========================================
// HOME
// ==========================================

document.getElementById(
    "home-btn"
).addEventListener(
    "click",
    function () {

        resetGame();


        document.getElementById(
            "game-container"
        ).style.display =
            "none";


        document.getElementById(
            "start-screen"
        ).style.display =
            "block";
    }
);


// ==========================================
// LANGUAGE BUTTONS
// ==========================================

document.getElementById(
    "english-btn"
).addEventListener(
    "click",
    function () {

        changeLanguage("en");
    }
);


document.getElementById(
    "bangla-btn"
).addEventListener(
    "click",
    function () {

        changeLanguage("bn");
    }
);


// ==========================================
// MODE BUTTONS
// ==========================================

document.getElementById(
    "number-mode"
).addEventListener(
    "click",
    function () {

        setActiveMode(
            "number"
        );
    }
);


document.getElementById(
    "addition-mode"
).addEventListener(
    "click",
    function () {

        setActiveMode(
            "addition"
        );
    }
);


document.getElementById(
    "subtraction-mode"
).addEventListener(
    "click",
    function () {

        setActiveMode(
            "subtraction"
        );
    }
);


// ==========================================
// LEVEL SELECT BUTTONS
// ==========================================

const level1Button =
    document.getElementById(
        "level1-btn"
    );


if (level1Button) {

    level1Button.addEventListener(
        "click",
        function () {

            level = 1;

            updateLevelButtons();
        }
    );
}


const level2Button =
    document.getElementById(
        "level2-btn"
    );


if (level2Button) {

    level2Button.addEventListener(
        "click",
        function () {

            if (
                unlockedLevel >= 2
            ) {

                level = 2;

                updateLevelButtons();
            }
        }
    );
}


const level3Button =
    document.getElementById(
        "level3-btn"
    );


if (level3Button) {

    level3Button.addEventListener(
        "click",
        function () {

            if (
                unlockedLevel >= 3
            ) {

                level = 3;

                updateLevelButtons();
            }
        }
    );
}


// ==========================================
// LEVEL POPUP BUTTONS
// ==========================================

const nextLevelButton =
    document.getElementById(
        "next-level-btn"
    );


if (nextLevelButton) {

    nextLevelButton.addEventListener(
        "click",
        function () {

            document.getElementById(
                "level-popup"
            ).style.display =
                "none";


            level =
                popupNextLevel;


            score = 0;

            streak = 0;


            updateStats();

            updateLevelButtons();


            generateQuestion();
        }
    );
}


const repeatLevelButton =
    document.getElementById(
        "repeat-level-btn"
    );


if (repeatLevelButton) {

    repeatLevelButton.addEventListener(
        "click",
        function () {

            document.getElementById(
                "level-popup"
            ).style.display =
                "none";


            level =
                popupPreviousLevel;


            score = 0;

            streak = 0;


            updateStats();

            updateLevelButtons();


            generateQuestion();
        }
    );
}


// ==========================================
// REPEAT VOICE
// ==========================================

document.getElementById(
    "repeat-voice-btn"
).addEventListener(
    "click",
    function () {

        // Correct answer হওয়ার পর
        // repeat করা যাবে না
        if (answerLocked) {

            return;
        }


        // Pending automatic voice বন্ধ
        if (questionVoiceTimer) {

            clearTimeout(
                questionVoiceTimer
            );

            questionVoiceTimer =
                null;
        }


        stopAllVoice();


        // ==================================
        // NUMBER
        // ==================================

        if (
            lastVoiceType === "number" &&
            lastVoiceData !== null
        ) {

            if (
                currentLanguage === "bn"
            ) {

                playBanglaAudio(
                    "number/" +
                    lastVoiceData +
                    ".mp3"
                );

            } else {

                speak(
                    "Can you find number " +
                    lastVoiceData +
                    "?"
                );
            }
        }


        // ==================================
        // ADDITION
        // ==================================

        else if (
            lastVoiceType ===
            "addition"
        ) {

            if (
                currentLanguage === "bn"
            ) {

                playBanglaAudio(
                    "add/" +
                    lastVoiceData.number1 +
                    "_" +
                    lastVoiceData.number2 +
                    ".mp3"
                );

            } else {

                speak(
                    "What is " +
                    lastVoiceData.number1 +
                    " plus " +
                    lastVoiceData.number2 +
                    "?"
                );
            }
        }


        // ==================================
        // SUBTRACTION
        // ==================================

        else if (
            lastVoiceType ===
            "subtraction"
        ) {

            if (
                currentLanguage === "bn"
            ) {

                playBanglaAudio(
                    "sub/" +
                    lastVoiceData.number1 +
                    "_" +
                    lastVoiceData.number2 +
                    ".mp3"
                );

            } else {

                speak(
                    "What is " +
                    lastVoiceData.number1 +
                    " minus " +
                    lastVoiceData.number2 +
                    "?"
                );
            }
        }
    }
);


// ==========================================
// INITIAL
// ==========================================

updateStats();

setActiveMode("number");

updateLevelButtons();

changeLanguage("en");