// --- Die "Ohren" ---

// Die Richtungshilfe
function setDirection(newDir) {
    if (newDir === "UP" && direction !== "DOWN") direction = "UP";
    if (newDir === "DOWN" && direction !== "UP") direction = "DOWN";
    if (newDir === "LEFT" && direction !== "RIGHT") direction = "LEFT";
    if (newDir === "RIGHT" && direction !== "LEFT") direction = "RIGHT";
}

// Tastatur (PC)
document.addEventListener('keydown', e => {
    // 1. SCROLLEN VERHINDERN
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault();
    }

    if (e.key === " " || e.key === "p" || e.key === "P") {
        togglePause();
        return;
    }
    if (isPaused) return;

    if (e.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
    if (e.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
    if (e.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
    if (e.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
});

// Handy (Swipe-Steuerung)
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

document.addEventListener('touchend', (e) => {
    let touchEndX = e.changedTouches[0].screenX;
    let touchEndY = e.changedTouches[0].screenY;
    const threshold = 30;

    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (Math.abs(diffX) > threshold) setDirection(diffX > 0 ? "RIGHT" : "LEFT");
    } else {
        if (Math.abs(diffY) > threshold) setDirection(diffY > 0 ? "DOWN" : "UP");
    }
}, { passive: true });

// Verhindert Browser-Scrollen beim Spielen
document.addEventListener('touchmove', (e) => {
    e.preventDefault();
}, { passive: false });

// 5. UI-HILFSFUNKTIONEN
function toggleControls() {
    const controls = document.getElementById('controls');
    const toggleBtn = document.getElementById('toggle-ui-btn');
    if (!controls || !toggleBtn) return;

    const isHidden = controls.classList.toggle('hidden');
    toggleBtn.textContent = isHidden ? "○ ○ ○" : "● ● ●";
    toggleBtn.style.opacity = isHidden ? "0.2" : "0.4";
}

document.addEventListener('DOMContentLoaded', () => {
    const buttonConfigs = [
        { id: 'up-btn', action: () => setDirection('UP') },
        { id: 'down-btn', action: () => setDirection('DOWN') },
        { id: 'left-btn', action: () => setDirection('LEFT') },
        { id: 'right-btn', action: () => setDirection('RIGHT') },
        { id: 'pause-btn', action: () => togglePause() },
        { id: 'toggle-ui-btn', action: () => toggleControls() }
    ];

    buttonConfigs.forEach(cfg => {
        const el = document.getElementById(cfg.id);
        if (el) {
            el.addEventListener('pointerdown', (e) => {
                e.preventDefault();
                cfg.action();
            });
        }
    });
});

// --- Hilfs-Funktionen (Werkzeuge) ---
// Swipe

function handleSwipe(startX, startY, endX, endY) {
    const diffX = endX - startX;
    const diffY = endY - startY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 30) setDirection("RIGHT");
        else if (diffX < -30) setDirection("LEFT");
    } else {
        if (diffY > 30) setDirection("DOWN");
        else if (diffY < -30) setDirection("UP");
    }
}