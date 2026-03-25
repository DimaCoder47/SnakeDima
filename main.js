    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');


    canvas.width = 800; 
    canvas.height = 800;

    let rows = 40; 
    let cols = 40;
    let cellWidth = canvas.width / cols;
    let cellHeight = canvas.height / rows;

    let snake = [{ x: 10, y: 15 }];
    let food = { x: 5, y: 5 };
    let foodColor = '#EE0000';
    let direction = "LEFT";
    let foodCollected = false;

    let score = 0;
    let highscore = localStorage.getItem('snakeHighscore') || 0;

    document.addEventListener('DOMContentLoaded', () => {
        const hsDisplay = document.getElementById('highscore-display');
        if (hsDisplay) {
            hsDisplay.innerText = "Best: " + highscore;
        }
    })

    let startX, startY;

    function placeFood() {
        food = {
            x: Math.floor(Math.random() * cols),
            y: Math.floor(Math.random() * rows)
        };
    }

    document.addEventListener('touchstart', e => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    }, false);

    document.addEventListener('touchend', e => {
        if (!startX || !startY) return;

        let endX = e.changedTouches[0].clientX;
        let endY = e.changedTouches[0].clientY;

        let diffX = startX - endX;
        let diffY = startY - endY;

        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX > 50 && direction !== "RIGHT") direction = "LEFT";
            else if (diffX < -50 && direction !== "LEFT") direction = "RIGHT";
        } else {
            if (diffY > 50 && direction !== "DOWN") direction = "UP";
            else if (diffY < -50 && direction !== "UP") direction = "DOWN";
        }
        startX = null;
        startY = null;
    }, false);

    document.addEventListener('keydown', e => {
        // 1. Verhindert das Scrollen der Seite im Browser
        if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight", " "].indexOf(e.key) > -1) {
            e.preventDefault();
        }

        // 2. Steuerung (Genau deine Variablen!)
        if(e.keyCode == 37 && direction !== "RIGHT") {
            direction = "LEFT";
        }
        if(e.keyCode == 38 && direction !== "DOWN") {
            direction = "UP";
        }
        if(e.keyCode == 39 && direction !== "LEFT") {
            direction = "RIGHT";
        }
        if(e.keyCode == 40 && direction !== "UP") {
            direction = "DOWN";
        }
    });

function gameLoop() {
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
                alert("Neuer Rekord! " + highscore);
            } else {
                alert("Game Over! Dein Score: " + score);
            }
        
        score = 0;
        const scoreElement = document.getElementById('score-display');
        if(scoreElement) {
            scoreElement.innerText = "Score: " + score;
        }
        location.reload();
        
        return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score++;
        const scoreElement = document.getElementById('score-display');
        if(scoreElement) {
            scoreElement.innerText = "Score: " + score;
        }        
        foodColor = 'white';
        setTimeout(() => {
            foodColor = '#EE0000';
        }, 100);

        placeFood();
    } else {
        snake.pop();
    }
}

    function draw() {
        ctx.fillStyle = '#080808';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = foodColor;
        ctx.fillRect(food.x * cellWidth, food.y * cellHeight, cellWidth - 1, cellHeight - 1);

        let snakeColor = '#32CD32'; // Start-Grün
        if (score >= 10) snakeColor = '#00FF00'; // Helleres Neongrün
        if (score >= 20) snakeColor = '#00FFFF'; // Türkis
        if (score >= 30) snakeColor = '#FFFF00'; // Gelb
        if (score >= 40) snakeColor = '#FF00FF'; // Lila
        if (score >= 50) snakeColor = 'white';   // Weiß (Legenden-Modus)

        ctx.fillStyle = snakeColor;
        snake.forEach(part => {
        ctx.fillRect(part.x * cellWidth, part.y * cellHeight, cellWidth - 1, cellHeight - 1);
        });

        ctx.fillStyle = "#32CD32";
        ctx.font = "30px Arial";
        ctx.textAlign = "right";

        requestAnimationFrame(draw);
    }

// Variablen für die Berührungsposition
let touchStartX = 0;
let touchStartY = 0;

// 1. Start der Berührung merken
document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, false);

// 2. Ende der Berührung auswerten (Wisch-Richtung)
document.addEventListener('touchend', (e) => {
    let touchEndX = e.changedTouches[0].screenX;
    let touchEndY = e.changedTouches[0].screenY;
    handleSwipe(touchStartX, touchStartY, touchEndX, touchEndY);
}, false);

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

// Verhindert, dass das Handy beim Wischen die Seite hoch/runter scrollt
document.addEventListener('touchmove', (e) => {
    e.preventDefault();
}, { passive: false });

    setInterval(gameLoop, 150);
    draw();
    placeFood();
