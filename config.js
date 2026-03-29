// Die Basiseinstellungen
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.height = 800;
canvas.width = 800;

const rows = 40;
const cols = 40;
const cellWidth = 800 / cols;
const cellHeight = 800 / rows;

let = appleSpawnTimer = 0;
let score = 0;
let highscore = localStorage.getItem('snakeHighscore') || 0;
let direction = "RIGHT";
let isPaused = false;
let speed = 150;

let snake = [{ x: 7, y: 7 }];
let food = { x: 5, y: 5 };
let foodColor = '#EE0000';

document.addEventListener('DOMContentLoaded', () => {
    const hsDisplay = document.getElementById('highscore-display');
    if (hsDisplay) {
        hsDisplay.innerText = "Best: " + highscore;
    }
});

function showHighscoreOverlay(finalScore) {
    isPaused = true;
    const overlay = document.getElementById('highscore-overlay');
    const scoreTextElement = document.getElementById('final-score-text');

    if (scoreTextElement) {
        scoreTextElement.innerText = "Du hast " + finalScore + " Punkte erreicht!";
    }

    scoreTextElement.style.animationDuration = (finalScore >= 110) ? "1s" : "2s";

    if (overlay) {
        overlay.style.display = 'flex';
        setTimeout(() => overlay.classList.add('visible'), 10);
    }
}

function resetGameAfterHighscore() {
    const overlay = document.getElementById('highscore-overlay');
    if (overlay) {
        overlay.classList.remove('visible');
        setTimeout(() => {
            overlay.style.display = 'none';
            isPaused = false;
            quickReset();
        }, 500);
    } else {
        isPaused = false;
        quickReset();
    }
}

function quickReset() {
    score = 0;
    const scoreElement = document.getElementById('score-display');
    if (scoreElement) scoreElement.innerText = "Score: " + score;

    canvas.style.borderColor = 'mediumblue';
    canvas.style.boxShadow = '0 0 20px rgba(0, 0, 255, 0.3)';
    document.body.style.backgroundColor = '#080808';
    canvas.style.backgroundColor = '#080808';

    snake = [{ x: 7, y: 7 }];
    direction = "RIGHT";
    placeFood();
}