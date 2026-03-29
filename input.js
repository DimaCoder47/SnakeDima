// --- Die "Ohren" ---

// Zentrale Funktion für ALLE Richtungsänderungen
function handleDirectionInput(newDir) {
    if (isPaused || isChangingDirection) return;

    if (newDir === "UP" && direction !== "DOWN") direction = "UP";
    else if (newDir === "DOWN" && direction !== "UP") direction = "DOWN";
    else if (newDir === "LEFT" && direction !== "RIGHT") direction = "LEFT";
    else if (newDir === "RIGHT" && direction !== "LEFT") direction = "RIGHT";
    else return;

    isChangingDirection = true;
}

// Tastatur (PC)
document.addEventListener('keydown', e => {
    const key = e.key; 
    const lowerKey = key.toLowerCase();

    const gameKeys = ["arrowup", "arrowdown", "arrowleft", "arrowright", " ", "w", "a", "s", "d"];
    if (gameKeys.includes(lowerKey)) e.preventDefault();

    if (lowerKey === " " || lowerKey === "p") {
        togglePause();
        return;
    }

    // Richtungs-Eingabe (Pfeiltasten oder WASD)
    if (key === "ArrowLeft" || lowerKey === "a") handleDirectionInput("LEFT");
    else if (key === "ArrowUp" || lowerKey === "w") handleDirectionInput("UP");
    else if (key === "ArrowRight" || lowerKey === "d") handleDirectionInput("RIGHT");
    else if (key === "ArrowDown" || lowerKey === "s") handleDirectionInput("DOWN");
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
    let diffX = touchEndX - touchStartX;
    let diffY = touchEndY - touchStartY;
    const threshold = 30;

    // Richtung berechnen
    if (Math.abs(diffX) > Math.abs(diffY)) {
            if (Math.abs(diffX) > threshold) handleDirectionInput(diffX > 0 ? "RIGHT" : "LEFT");
        } else {
            if (Math.abs(diffY) > threshold) handleDirectionInput(diffY > 0 ? "DOWN" : "UP");
        }
    }, { passive: true });

// BUTTONS (TOUCH-INTERFACE)
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
        { id: 'up-btn', action: () => handleDirectionInput('UP') },
        { id: 'down-btn', action: () => handleDirectionInput('DOWN') },
        { id: 'left-btn', action: () => handleDirectionInput('LEFT') },
        { id: 'right-btn', action: () => handleDirectionInput('RIGHT') },
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
