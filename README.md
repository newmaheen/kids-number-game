# 🎮 Kids Number Game

An interactive bilingual educational game designed to help children learn numbers and basic mathematics in a fun and engaging way.

The game supports both **English and Bengali (বাংলা)** and includes voice-based questions, encouraging audio feedback, multiple game modes, levels, scoring, streaks, and animations.

## ✨ Features

- 🌐 English and Bengali language support
- 🔢 Number recognition game
- ➕ Addition practice
- ➖ Subtraction practice
- 🔊 Bengali MP3 voice guidance
- 🗣️ English text-to-speech support
- 🔁 Repeat question voice button
- 🎯 Multiple difficulty levels
- 🔓 Level unlocking system
- 💾 Unlocked levels saved using Local Storage
- ⭐ Score tracking
- 🔥 Correct-answer streak system
- 🎉 Confetti animation for correct answers
- 🏆 Special achievements for streaks
- 🔊 Random encouraging Bengali voice feedback
- ❌ Friendly feedback for incorrect answers
- 🔒 Answer locking to prevent multiple clicks before the next question
- 🏠 Home and Restart controls

## 🎮 Game Modes

### 🔢 Number Recognition

Children listen to a number and select the correct answer.

Example:

> "Can you find number 7?"

Bengali voice support is also available.

### ➕ Addition

Children solve simple addition problems.

Example:

```text
3 + 5 = ?
In Bengali mode, the game provides Bengali audio instructions for the math question.

➖ Subtraction

Children can also practice basic subtraction problems.

Example:

9 - 4 = ?
🎯 Level System

The game includes multiple difficulty levels.

Level 1: Smaller numbers for beginners
Level 2: Intermediate number range
Level 3: Larger numbers and increased difficulty

New levels are unlocked as the player progresses.

Unlocked levels are stored in the browser using localStorage, allowing players to return to previously unlocked levels.

🔊 Audio System

The project uses two different voice systems:

Bengali

Pre-generated Bengali MP3 files are used for:

Number questions
Addition questions
Subtraction questions
Correct-answer encouragement
Wrong-answer feedback
Streak achievements
Level unlock announcements

Bengali audio files were generated using Python and Edge TTS.

English

English voice feedback uses the browser's Web Speech API.

🛠️ Technologies Used
HTML5
CSS3
JavaScript
Python
Edge TTS
Web Speech API
Local Storage
Git & GitHub
📁 Project Structure
kids-number-game/
│
├── index.html
├── style.css
├── script.js
├── generate_bangla_audio.py
│
├── audio/
│   └── bn/
│       ├── number/
│       ├── add/
│       ├── sub/
│       ├── correct1.mp3
│       ├── correct2.mp3
│       ├── correct3.mp3
│       ├── correct4.mp3
│       ├── correct5.mp3
│       ├── correct6.mp3
│       ├── wrong.mp3
│       ├── amazing.mp3
│       ├── superstar.mp3
│       ├── champion.mp3
│       ├── level2.mp3
│       └── level3.mp3
│
└── README.md
🚀 Running the Project

Clone the repository:

git clone https://github.com/newmaheen/kids-number-game.git

Open the project folder:

cd kids-number-game

Start a local server:

python -m http.server 8000

Then open:

http://localhost:8000

in your browser.

🎯 Project Goal

The goal of this project is to make early mathematics practice more interactive and enjoyable for children, especially Bengali-speaking learners.

The project combines visual learning, audio guidance, game progression, and positive reinforcement to create a simple educational experience.

🔮 Future Improvements

Possible future features include:

❤️ Lives system
📊 Level progress bar
🏅 Stars and rewards
👦 Player profiles
📱 Improved mobile interface
🎨 Additional child-friendly themes
🔢 More mathematics game modes
📈 Learning progress tracking
👨‍💻 Author

Maheen Absar

Built as an educational web game using HTML, CSS, JavaScript and Python-generated Bengali voice audio.
