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
    // DER TÜRSTEHER
    if (!window.gameStarted || isPaused) return;

    isChangingDirection = false;

    let head = { x: snake[0].x, y: snake[0].y };

    // BEWEGUNG
    if (direction === "LEFT") head.x--;
    if (direction === "RIGHT") head.x++;
    if (direction === "UP") head.y--;
    if (direction === "DOWN") head.y++;

    // KOLLISION (Wand & Körper)
    if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows ||
        snake.some(part => part.x === head.x && part.y === head.y)) {

        let savedHighscore = parseInt(localStorage.getItem('snakeHighscore')) || 0;

        if (score > savedHighscore) {
            highscore = score;
            localStorage.setItem('snakeHighscore', score);

            const hsDisplay = document.getElementById('highscore-display');
            if (hsDisplay) {
                hsDisplay.innerText = "Best: " + score;
            }
        }
        showHighscoreOverlay(score);
        return;
    }

    // BEWEGUNG & ESSEN
    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score++;
        document.getElementById('score-display').innerText = "Score: " + score;

        // WIN-CONDITION BEI 170 PUNKTEN
        if (score >= 170) {
            showHighscoreOverlay(score);
            return;
        }

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

    // FARB-LOGIK (Blinken & Phantom)
    if (appleSpawnTimer > 0) {
        ctx.fillStyle = "#FFFFFF"; // Weißes Blinken beim Erscheinen
        appleSpawnTimer--;
    } else {
        ctx.fillStyle = (score >= 150) ? `rgba(238, 0, 0, ${phantomAlpha})` : foodColor;
    }

    // PIXEL-HERZFORM ZEICHNEN
    ctx.fillRect(x + 1, y + 1, w - 2, h / 2);
    ctx.fillRect(x + 2, y + h / 2, w - 4, h / 4);
    ctx.fillRect(x + 3, y + (3 * h / 4), w - 6, h / 4);

    ctx.fillStyle = "#080808";
    const kerbSize = w * 0.2;
    ctx.fillRect(x + (w / 2) - (kerbSize / 2), y + 1, kerbSize, h * 0.2);

    // DER LICHTREFLEX 
    if (appleSpawnTimer <= 0) {
        const reflexAlpha = (score >= 150) ? (phantomAlpha * 0.7) : 0.7;
        ctx.fillStyle = `rgba(255, 255, 255, ${reflexAlpha})`;
        const reflexSize = w * 0.15;
        ctx.fillRect(x + (w * 0.25), y + (h * 0.25), reflexSize, reflexSize);
    }
    ctx.restore();
}

function draw() {
    if (!window.gameStarted) {
            requestAnimationFrame(draw); 
            return; 
    }

    const currentTime = Date.now();
    const time = currentTime / 200;
    const pulseValue = (Math.sin(time) + 1) / 2;

    let bgColor = '#080808';
    let isPhantom = false;
    let showStroke = false;
    let phantomAlpha = 1.0;
    let currentGapsActive = false;

    // Phantom & Rahmen Logik (Ab 105 / 120)
    if (score >= 105) {
        isPhantom = true;
        if (score < 120) {
            phantomAlpha = 0.8;
            showStroke = true;
        } else {
            phantomAlpha = 0.1 + (pulseValue * 0.7);
            showStroke = false;
        }
    }

    // Raster ausblenden (Score 120-124)
    let gridAlpha = (score < 120) ? 1.0 : (score <= 124 ? pulseValue : 0);

    // Start Border Animation (150-170)
    if (score >= 150) {
        let progress = Math.min((score - 150) / 20, 1.0);
        let angle1 = (currentTime / 20) % 360;
        let mainAlpha = 0.05 + (0.95 * progress);
        let baseAlpha = 0.01 + (0.19 * progress);
        let greenValue = Math.floor(100 + (155 * progress));
        let tailWidth = 5 + (25 * progress);
        let limeColor = `rgba(0, ${greenValue}, 0, ${mainAlpha})`;
        let darkBase = `rgba(0, 40, 0, ${baseAlpha})`;
        let peakStart = 10;
        let peakEnd = peakStart + (tailWidth / 2);
        let fadeEnd = peakEnd + tailWidth;

        canvas.style.borderImageSource = `conic-gradient(from ${angle1}deg, 
        ${darkBase} 0%, 
        ${limeColor} ${peakStart}%, 
        ${limeColor} ${peakEnd}%, 
        ${darkBase} ${fadeEnd}%,
        ${darkBase} 50%,
        ${limeColor} ${50 + peakStart}%,
        ${limeColor} ${50 + peakEnd}%,
        ${darkBase} ${50 + fadeEnd}%,
        ${darkBase} 100%)`;

        canvas.style.borderImageSlice = "1";
        canvas.style.borderWidth = "6px";
        canvas.style.borderStyle = "solid";
        canvas.style.boxShadow = "none";
        currentGapsActive = true;
    }
    // ENDE Border Animation (150-170)

    else if (score >= 135 && score < 149) {
        canvas.style.borderImageSource = "none";
        canvas.style.borderColor = 'transparent';
        canvas.style.boxShadow = `none`;
    }
    else if (score >= 130 && score < 135) {
        let strength = Math.max(0, 1 - (score - 130) / 5);
        let finalAlpha = pulseValue * strength;
        canvas.style.borderImageSource = "none";
        canvas.style.borderColor = `rgba(0, 0, 205, ${finalAlpha})`;
        canvas.style.boxShadow = `0 0 20px rgba(0, 0, 255, ${finalAlpha * 0.3})`;
    }
    else if (score < 130) {
        canvas.style.borderImageSource = "none";
        canvas.style.borderColor = 'mediumblue';
        canvas.style.boxShadow = '0 0 20px rgba(0, 0, 255, 0.3)';
    }

    // HINTERGRUNDFARBE LOGIK (Inkl. Pulsieren 140-145)
    if (score >= 145) {
        bgColor = '#000000';
    } else if (score >= 140 && score < 145) {
        let baseGray = Math.max(0, 8 - (score - 140) * 1.6);

        let pulseIntensity = Math.max(0, 1 - (score - 140) / 5);
        let pulseEffect = (pulseValue * 4) * pulseIntensity;

        let finalGray = Math.floor(baseGray + pulseEffect);

        bgColor = `rgb(${finalGray}, ${finalGray}, ${finalGray})`;
    }
    else {
        bgColor = '#080808';
    }

    // Hintergrund zeichnen
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    canvas.style.backgroundColor = bgColor;

    // RASTER zeichnen 
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

    // Apfel zeichnen
    drawFood();

    // SCHLANGE FARB-LOGIK
    let sC;
    let currentStrokeAlpha = 0;

    if (score >= 120) {
        sC = bgColor;
        currentStrokeAlpha = pulseValue * 0.8;
        showStroke = true;
    }
    else {
        sC = getSnakeColor(score, pulseValue);
        currentStrokeAlpha = 0.8;
    }

    const isGlitchPhase = (score >= 150 && (currentTime - glitchStartTime) < 10000);

    snake.forEach((part, index) => {
        if ((currentGapsActive || isGlitchPhase) && index % 2 !== 0) {
            return;
        }

        const isHead = index === 0;
        const x = part.x * cellWidth;
        const y = part.y * cellHeight;
        const radius = cellWidth / 2;

        // Pfad für Segment
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

        // Füllung (mit Phantom-Transparenz)
        ctx.save();
        if (isPhantom) ctx.globalAlpha = phantomAlpha;
        ctx.fillStyle = sC;
        ctx.fill();
        ctx.restore();

        // Weißer Rahmen (nur bis Score 119 sichtbar)
        if (showStroke || (score >= 120)) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${currentStrokeAlpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // AUGEN
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

    // Position je nach Richtung
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

// SPIEL-STEUERUNG
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
    clearTimeout(gameTimeout);

    const overlay = document.getElementById('highscore-overlay');
    const titleElement = document.querySelector('#highscore-overlay h1');
    const scoreTextElement = document.getElementById('final-score-text');

    if (titleElement) {
        if (finalScore >= highscore) {
            titleElement.innerText = "NEUER REKORD!";
        } else {
            titleElement.innerText = "GAME OVER";
        }

        if (finalScore >= 170) {
            titleElement.innerText = "LIMIT ERREICHT!";
        }
    }

    if (scoreTextElement) {
        scoreTextElement.innerText = finalScore + " Punkte";
        scoreTextElement.style.animationDuration = (finalScore >= 170) ? "1s" : "2s";
    }

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
    direction = "DOWN";
    isPaused = false;
    isChangingDirection = false;
    snake = [{ x: 2, y: 2 }];

    highscore = parseInt(localStorage.getItem('snakeHighscore')) || 0;
    const hsDisplay = document.getElementById('highscore-display');
    if (hsDisplay) {
        hsDisplay.innerText = "Best: " + highscore;
    }

    document.getElementById('score-display').innerText = "Score: 0";

    canvas.style.borderColor = 'mediumblue';
    canvas.style.boxShadow = '0 0 20px rgba(0, 0, 255, 0.3)';
    document.body.style.backgroundColor = '#080808';

    // Neustart
    placeFood();
    clearTimeout(gameTimeout);
    gameLoop();
}

// Der Play-Button
document.getElementById('play-button').addEventListener('click', () => {
    const startScreen = document.getElementById('start-screen');
    
    startScreen.classList.add('hidden');
    
    setTimeout(() => {
        window.gameStarted = true; 
        isPaused = false;
        
        quickReset(); 
        
    }, 400); 
});

// INITIALER START
draw();

function updateSystemBar() {
    // 1. Uhrzeit & Datum
    const now = new Date();
    const dateStr = now.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    const dateTimeElement = document.getElementById('date-time');
    if (dateTimeElement) dateTimeElement.innerText = `${dateStr} | ${timeStr}`;

    // 2. Akku-Stand (Battery API)
    if (navigator.getBattery) {
        navigator.getBattery().then(battery => {
            const updateBattery = () => {
                const battElement = document.getElementById('battery-status');
                if (battElement) battElement.innerText = `BAT: ${Math.round(battery.level * 100)}%`;
            };
            updateBattery();
            battery.addEventListener('levelchange', updateBattery);
        });
    }
}

// Alle 10 Sekunden aktualisieren (reicht für die Uhrzeit)
setInterval(updateSystemBar, 10000);
updateSystemBar(); // Einmal sofort beim Start

// In deiner JS-Funktion animateStartScreenBorder:
function animateStartScreen() {
    const startScreen = document.getElementById('start-screen');
    
    // Nur animieren, wenn der Start-Screen auch sichtbar ist
    if (!startScreen || startScreen.classList.contains('hidden')) {
        requestAnimationFrame(animateStartScreen);
        return;
    }

    const time = Date.now();
    const angle = (time / 20) % 360; // Geschwindigkeit der Drehung

    // Die Farben in deinem neuen Electric Cyan Look
    const deepBlue = "#001a33"; 
    const electricCyan = "#00d4ff";

    startScreen.style.borderImageSource = `conic-gradient(from ${angle}deg, 
        ${deepBlue} 0%, 
        ${electricCyan} 5%, 
        ${electricCyan} 10%, 
        ${deepBlue} 20%, 
        ${deepBlue} 50%, 
        ${electricCyan} 55%, 
        ${electricCyan} 60%, 
        ${deepBlue} 70%, 
        ${deepBlue} 100%)`;

    requestAnimationFrame(animateStartScreen);
}

// Den Motor starten
animateStartScreen();
