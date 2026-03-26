// Zuerst alles definieren, was das Spiel braucht (Canvas, Score, Schlange).
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 800; 
canvas.height = 800;

let rows = 40; 
let cols = 40;
let cellWidth = canvas.width / cols;
let cellHeight = canvas.height / rows;

let isPaused = false;

let snake = [{ x: 7, y: 7 }];
let food = { x: 5, y: 5 };
let foodColor = '#EE0000';
let direction = "RIGHT";
let foodCollected = false;
let score = 0;
let highscore = localStorage.getItem('snakeHighscore') || 0;

document.addEventListener('DOMContentLoaded', () => {
    const hsDisplay = document.getElementById('highscore-display');
    if (hsDisplay) {
        hsDisplay.innerText = "Best: " + highscore;
    }
});

// Die "Ohren" des Programms. Sie sollten früh bereit sein, um Eingaben abzufangen.
//Tastatur
document.addEventListener('keydown', e => {
    if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight", " "].indexOf(e.key) > -1) {
            e.preventDefault();
        }
        if(e.keyCode == 37 && direction !== "RIGHT") direction = "LEFT";
        if(e.keyCode == 38 && direction !== "DOWN") direction = "UP";
        if(e.keyCode == 39 && direction !== "LEFT") direction = "RIGHT";
        if(e.keyCode == 40 && direction !== "UP") direction = "DOWN";
    });  
    
//Handy
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, false);

document.addEventListener('touchend', (e) => {
    let touchEndX = e.changedTouches[0].screenX;
    let touchEndY = e.changedTouches[0].screenY;
    handleSwipe(touchStartX, touchStartY, touchEndX, touchEndY);
}, false);

// Verhindert, dass das Handy beim Wischen die Seite hoch/runter scrollt
document.addEventListener('touchmove', (e) => {e.preventDefault();
},
{ passive: false });

// Hilfs-Funktionen (Werkzeuge)
function handleSwipe(startX, startY, endX, endY) {
    const diffX = endX - startX;
    const diffY = endY - startY;

    // Prüfen, ob horizontaler oder vertikaler Wisch stärker war
    if (Math.abs(diffX) > Math.abs(diffY)) {
        // Horizontaler Wisch
        if (diffX > 30 && direction !== "LEFT") direction = "RIGHT";
        else if (diffX < -30 && direction !== "RIGHT") direction = "LEFT";
    } else {
        // Vertikaler Wisch
        if (diffY > 30 && direction !== "UP") direction = "DOWN";
        else if (diffY < -30 && direction !== "DOWN") direction = "UP";
    }
}

function placeFood() {
    let overlapping = true;
    while (overlapping) {
        food = {
            x: Math.floor(Math.random() * cols),
            y: Math.floor(Math.random() * rows)
        };
        overlapping = snake.some(part => part.x === food.x && part.y === food.y);
        }
}

function showHighscoreOverlay(finalScore) {
    isPaused = true;
    document.getElementById('final-score-text').innerText = "Du hast " + finalScore + " Punkte erreicht!";
    document.getElementById('highscore-overlay').style.display = 'flex';
}

function resetGameAfterHighscore() {
    isPaused = false;
    document.getElementById('highscore-overlay').style.display = 'none';
    quickReset();
}

function quickReset() {
    score = 0;
    const scoreElement = document.getElementById('score-display');
    if(scoreElement) scoreElement.innerText = "Score: " + score;
    snake = [{ x: 7, y: 7 }]; 
    direction = "RIGHT";
    placeFood();
}

// Das Gehirn des Spiels. (gameLoop)
function gameLoop() {
    if (isPaused) return;
    let head = { x: snake[0].x, y: snake[0].y };

    if (direction === "LEFT") head.x--;
    if (direction === "RIGHT") head.x++;
    if (direction === "UP") head.y--;
    if (direction === "DOWN") head.y++;

    if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows || 
        snake.some(part => part.x === head.x && part.y === head.y)) {
        if (score > highscore) {
            highscore = score;
            localStorage.setItem('snakeHighscore', highscore);
            document.getElementById('highscore-display').innerText = "Best: " + highscore;
            showHighscoreOverlay(score);
            return;
        } else {
            quickReset();
            return;
        }
    }

    if (head.x === food.x && head.y === food.y) {
        score++;
        const scoreElement = document.getElementById('score-display');
        if(scoreElement) scoreElement.innerText = "Score: " + score;
        foodColor = 'white';
        setTimeout(() => { foodColor = '#EE0000'; }, 100);
        placeFood();
        snake.unshift(head);
    } else {
        snake.unshift(head);
        snake.pop();
        }
}

// Das Auge des Spiels. (draw)
function draw() {
    ctx.fillStyle = '#080808';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#444444';
    ctx.lineWidth = 0.5;

    // Vertikale Linien (Spalten)
    for (let x = 0; x <= cols; x++) {
        ctx.beginPath();
        ctx.moveTo(x * cellWidth, 0);
        ctx.lineTo(x * cellWidth, canvas.height);
        ctx.stroke();
    }

    // Horizontale Linien (Zeilen)
    for (let y = 0; y <= rows; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * cellHeight);
        ctx.lineTo(canvas.width, y * cellHeight);
        ctx.stroke();
    }

    ctx.fillStyle = foodColor;
    ctx.fillRect(food.x * cellWidth, food.y * cellHeight, cellWidth, cellHeight);

// sC = snakeColor
    let sC = '#32CD32';
    if (score >= 10)  sC = '#00FF00'; // 10: Bright Neon Green
    if (score >= 20)  sC = '#00FF99'; // 20: Spring Green (leichter Blaustich)
    if (score >= 30)  sC = '#00FFFF'; // 30: Cyan (Eis-Modus)
    if (score >= 40)  sC = '#0099FF'; // 40: Sky Blue
    if (score >= 50)  sC = '#7A2EFE'; // 50: Deep Purple (Magie-Modus)
    if (score >= 60)  sC = '#FF00FF'; // 60: Magenta / Pink
    if (score >= 70)  sC = '#FF3300'; // 70: Lava Red
    if (score >= 80)  sC = '#FFD700'; // 80: Gold (Pro-Status)
    if (score >= 90)  sC = '#E5E4E2'; // 90: Platin (Kurz vor der Legende)
    if (score >= 100) sC = '#FFFFFF'; // 100: White (DER LEGENDEN-MODUS)

    // NEU: Der Phantom-Modus ab 110
    let isPhantom = false;
    if (score >= 110) {
        sC = '#080808'; // Gleiches Schwarz wie der Hintergrund
        isPhantom = true;
    }

    ctx.fillStyle = sC;
    snake.forEach(part => {
        ctx.fillRect(part.x * cellWidth, part.y * cellHeight, cellWidth, cellHeight);
        
        // Wenn Phantom-Modus aktiv, zeichne nur einen dünnen weißen Umriss
        if (isPhantom) {
            ctx.strokeStyle = "rgba(255, 255, 255, 0.8)"; // Zartes Weiß/Grau
            ctx.lineWidth = 1;
            ctx.strokeRect(part.x * cellWidth, part.y * cellHeight, cellWidth, cellHeight);
        }
    });

    requestAnimationFrame(draw);
}

// Der Start-Schuss (setInterval / requestAnimationFrame)
placeFood();
setInterval(gameLoop, 150);
draw();
