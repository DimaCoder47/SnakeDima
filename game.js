// Das "Herz & Auge"

function placeFood() {
    let overlapping = true;
    while (overlapping) {
        food = {
            x: Math.floor(Math.random() * cols),
            y: Math.floor(Math.random() * rows)
        };
        appleSpawnTimer = 10;
        overlapping = snake.some(part => part.x === food.x && part.y === food.y);
    }
}

function gameLoop() {
    // 1. DER TÜRSTEHER
    if (isPaused) return;

    isChangingDirection = false;

    let head = { x: snake[0].x, y: snake[0].y };

    // 2. BEWEGUNG
    if (direction === "LEFT") head.x--;
    if (direction === "RIGHT") head.x++;
    if (direction === "UP") head.y--;
    if (direction === "DOWN") head.y++;

    // 3. KOLLISION (Wand & Körper)
    if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows ||
        snake.some(part => part.x === head.x && part.y === head.y)) {
        if (score > highscore) {
            highscore = score;
            localStorage.setItem('snakeHighscore', highscore);
            document.getElementById('highscore-display').innerText = "Best: " + highscore;
            showHighscoreOverlay(score);
        } else {
            quickReset();
        }
        return;
    }

    // 4. BEWEGUNG & ESSEN
    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score++;
        document.getElementById('score-display').innerText = "Score: " + score;
        placeFood();
    } else {
        snake.pop();
    }

    gameTimeout = setTimeout(gameLoop, speed);
}

function drawFood() {
    const x = food.x * cellWidth;
    const y = food.y * cellHeight;
    const w = cellWidth;
    const h = cellHeight;
    
    ctx.save();

    // --- 1. FARB-LOGIK (Blinken & Phantom) ---
    if (appleSpawnTimer > 0) {
        ctx.fillStyle = "#FFFFFF"; // Weißes Blinken beim Erscheinen
        appleSpawnTimer--;
    } else {
        // Wenn Score > 150, wird der Apfel leicht durchsichtig (Phantom)
        ctx.fillStyle = (score >= 150) ? `rgba(238, 0, 0, ${phantomAlpha})` : foodColor;
    }

    // --- 2. DIE PIXEL-HERZFORM ZEICHNEN ---
    
    // Die Basis (Ein breites Rechteck für die oberen Rundungen)
    ctx.fillRect(x + 1, y + 1, w - 2, h / 2); // Obere Hälfte fast voll

    // Der untere Teil, der schmaler wird
    ctx.fillRect(x + 2, y + h / 2, w - 4, h / 4); // Etwas schmaler
    ctx.fillRect(x + 3, y + (3 * h / 4), w - 6, h / 4); // Ganz schmal (Spitze)

    // --- 3. DIE EINKERBUNG OBEN (Um "N/H" Look zu vermeiden) ---
    // Wir färben nur oben in der Mitte ein kleines Quadrat schwarz
    ctx.fillStyle = "#080808"; // Hintergrundfarbe
    const kerbSize = w * 0.2; // Größe der Einkerbung (20% der Zellbreite)
    ctx.fillRect(x + (w / 2) - (kerbSize / 2), y + 1, kerbSize, h * 0.2);

    // --- 4. DER LICHTREFLEX ---
    if (appleSpawnTimer <= 0) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)"; // Halbtransparentes Weiß
        const reflexSize = w * 0.15; // Reflexgröße relativ zur Zelle
        // Ein Punkt oben links
        ctx.fillRect(x + (w * 0.25), y + (h * 0.25), reflexSize, reflexSize);
    }

    ctx.restore();
}

function draw() {
    const time = Date.now() / 200;
    const pulseValue = (Math.sin(time) + 1) / 2;
    let bgColor = '#080808';
    let isPhantom = false;
    let phantomAlpha = 1.0;

    // HINTERGRUND-LOGIK
    if (score >= 140 && score < 145) {
        let colorValue = Math.floor(8 * pulseValue);
        bgColor = `rgb(${colorValue}, ${colorValue}, ${colorValue})`;
    } else if (score >= 145) {
        bgColor = '#000000';
    }

    // Hintergrund zeichnen
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    canvas.style.backgroundColor = bgColor;

    // RASTER zeichnen 
    let gridAlpha = 0;

    if (score < 120) {
        gridAlpha = 1.0;
    } else if (score >= 120 && score <= 124) {
        gridAlpha = pulseValue;
    }

    if (gridAlpha > 0) {
        ctx.strokeStyle = `rgba(68, 68, 68, ${gridAlpha})`;
        ctx.lineWidth = 0.5;
        for (let x = 0; x <= cols; x++) {
            ctx.beginPath(); ctx.moveTo(x * cellWidth, 0); ctx.lineTo(x * cellWidth, canvas.height); ctx.stroke();
        }
        for (let y = 0; y <= rows; y++) {
            ctx.beginPath(); ctx.moveTo(0, y * cellHeight); ctx.lineTo(canvas.width, y * cellHeight); ctx.stroke();
        }
    }

    // BORDER & Canvas Effekte
    if (score >= 130 && score < 135) {
        canvas.style.borderColor = `rgba(0, 0, 205, ${pulseValue})`;
        canvas.style.boxShadow = `0 0 20px rgba(0, 0, 255, ${pulseValue * 0.3})`;
    } else if (score >= 135) {
        canvas.style.borderColor = 'transparent';
        canvas.style.boxShadow = 'none';
    } else {
        canvas.style.borderColor = 'mediumblue';
        canvas.style.boxShadow = '0 0 20px rgba(0, 0, 255, 0.3)';
    }

    // PHANTOM & FARBEN BERECHNEN
    if (score >= 120) {
        phantomAlpha = 0.1 + (pulseValue * 0.7);
        isPhantom = true;
    } else if (score >= 105) {
        phantomAlpha = 0.8;
        isPhantom = true;
    }

    // Apfel
    drawFood();

    // SCHLANGE 
    let sC = getSnakeColor(score, pulseValue);

    snake.forEach((part, index) => {
        const isHead = index === 0;
        const x = part.x * cellWidth;
        const y = part.y * cellHeight;
        const radius = cellWidth / 2;

        // 1. PFAD DEFINIEREN
        ctx.beginPath();
        if (isHead) {
            let radii = [0, 0, 0, 0];
            if (direction === "RIGHT") radii = [0, radius, radius, 0];
            else if (direction === "LEFT") radii = [radius, 0, 0, radius];
            else if (direction === "UP") radii = [radius, radius, 0, 0];
            else if (direction === "DOWN") radii = [0, 0, radius, radius];

            ctx.roundRect(x, y, cellWidth, cellHeight, radii);
        } else {
            ctx.rect(x, y, cellWidth, cellHeight);
        }

        ctx.fillStyle = sC;
        ctx.fill();

        // Phantom-Rahmen
        if (isPhantom) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${phantomAlpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        //  AUGEN
        if (isHead) {
            drawEyes(ctx, x, y, cellWidth, cellHeight, direction, score);
        }
    });

    requestAnimationFrame(draw);
}

// Hilfsfunktion
function drawEyes(ctx, x, y, size, height, dir, score) {
    const eyeSize = size * 0.12;
    const offset = size * 0.25;
    let e1X, e1Y, e2X, e2Y;

    let eyeColor = "white";
    if (score < 50 || (score >= 80 && score <= 104)) {
        eyeColor = "#080808";
    } else if (score >= 105 && score < 110) {
        let r = 200 + ((score - 105) * 11);
        let gb = Math.max(0, 50 - ((score - 105) * 10));
        eyeColor = `rgb(${r}, ${gb}, ${gb})`;
    } else if (score >= 110) {
        eyeColor = "#FF0000";
    }

    ctx.fillStyle = eyeColor;

    if (dir === "RIGHT") {
        e1X = e2X = x + size * 0.7;
        e1Y = y + offset; e2Y = y + height - offset;
    } else if (dir === "LEFT") {
        e1X = e2X = x + size * 0.3;
        e1Y = y + offset; e2Y = y + height - offset;
    } else if (dir === "UP") {
        e1Y = e2Y = y + height * 0.3;
        e1X = x + offset; e2X = x + size - offset;
    } else { // DOWN
        e1Y = e2Y = y + height * 0.7;
        e1X = x + offset; e2X = x + size - offset;
    }

    ctx.beginPath();
    ctx.arc(e1X, e1Y, eyeSize, 0, Math.PI * 2);
    ctx.arc(e2X, e2Y, eyeSize, 0, Math.PI * 2);
    ctx.fill();
}


function getSnakeColor(currentScore, pulse) {
    if (currentScore >= 110) return '#080808';
    if (currentScore >= 105) {
        let darkness = 255 - ((currentScore - 104) * 50);
        return `rgb(${darkness}, ${darkness}, ${darkness})`;
    }
    if (currentScore >= 100) return '#FFFFFF';
    if (currentScore >= 95 && currentScore < 100 && pulse > 0.5) return '#FFFFFF';
    if (currentScore >= 90) return '#E5E4E2';
    if (currentScore >= 85 && currentScore < 90 && pulse > 0.5) return '#E5E4E2';
    if (currentScore >= 80) return '#FFD700';
    if (currentScore >= 70) return '#FF3300';
    if (currentScore >= 60) return '#FF00FF';
    if (currentScore >= 50) return '#7A2EFE';
    if (currentScore >= 40) return '#0099FF';
    if (currentScore >= 30) return '#00FFFF';
    if (currentScore >= 20) return '#00FF99';
    if (currentScore >= 10) return '#00FF00';

    return '#32CD32';
}

// --- SPIEL-STEUERUNG ---
function togglePause() {
    isPaused = !isPaused;
    const btn = document.getElementById('pause-btn');
    if (btn) {
        btn.textContent = isPaused ? "▶" : "II";
        btn.style.borderColor = isPaused ? "#EE0000" : "mediumblue";
    } 
    clearTimeout(gameTimeout);
    
    if (!isPaused) {
        gameLoop();
    }
}

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
            quickReset();
        }, 500);
    } else {
        quickReset();
    }
}

function quickReset() {
    score = 0;
    direction = "RIGHT";
    isPaused = false;
    isChangingDirection = false;
    snake = [{ x: 7, y: 7 }];
    
    document.getElementById('score-display').innerText = "Score: 0";
    
    canvas.style.borderColor = 'mediumblue';
    canvas.style.boxShadow = '0 0 20px rgba(0, 0, 255, 0.3)';
    document.body.style.backgroundColor = '#080808';
    
    // 4. Neustart
    placeFood();
    clearTimeout(gameTimeout);
    gameLoop();
}

// INITIALER START 
quickReset();
draw();
