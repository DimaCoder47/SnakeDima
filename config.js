// Die Basiseinstellungen
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 1200;

const rows = 30;
const cols = 20;
const cellWidth = canvas.width / cols;
const cellHeight = canvas.height / rows;

let appleSpawnTimer = 0;
let score = 0;

let highscore = parseInt(localStorage.getItem('snakeHighscore')) || 0;

let direction = "RIGHT";
let isPaused = false;
let isChangingDirection = false;
let speed = 180;
let gameTimeout;

let snake = [{ x: 7, y: 7 }];
let food = { x: 5, y: 5 };
const foodColor = '#EE0000';

document.addEventListener('DOMContentLoaded', () => {
    const hsDisplay = document.getElementById('highscore-display');
    if (hsDisplay) {
        hsDisplay.innerText = "Best: " + highscore;
    }
});
