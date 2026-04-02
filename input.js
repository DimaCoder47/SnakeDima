// --- Die "Ohren" ---

// Zentrale Funktion für ALLE Richtungsänderungen
function handleDirectionInput(newDir) {
    if (isPaused || isChangingDirection) return;

    const opposites = { 'UP': 'DOWN', 'DOWN': 'UP', 'LEFT': 'RIGHT', 'RIGHT': 'LEFT' };
    
    // Verhindert 180-Grad-Wenden
    if (newDir !== opposites[direction]) {
        direction = newDir;
        isChangingDirection = true;
    }
}

// Tastatur (PC)
document.addEventListener('keydown', e => {
    const key = e.key.toLowerCase();
    
    // Key-Mapping für schnellen Zugriff
    const controls = {
        'w': 'UP', 'arrowup': 'UP',
        's': 'DOWN', 'arrowdown': 'DOWN',
        'a': 'LEFT', 'arrowleft': 'LEFT',
        'd': 'RIGHT', 'arrowright': 'RIGHT'
    };

    if (key === " " || key === "p") {
        e.preventDefault();
        togglePause();
    } else if (controls[key]) {
        e.preventDefault();
        handleDirectionInput(controls[key]);
    }
});

// Handy (Swipe-Steuerung)
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

document.addEventListener('touchend', e => {
    const diffX = e.changedTouches[0].screenX - touchStartX;
    const diffY = e.changedTouches[0].screenY - touchStartY;
    const threshold = 30;

    if (Math.max(Math.abs(diffX), Math.abs(diffY)) > threshold) {
        if (Math.abs(diffX) > Math.abs(diffY)) {
            handleDirectionInput(diffX > 0 ? "RIGHT" : "LEFT");
        } else {
            handleDirectionInput(diffY > 0 ? "DOWN" : "UP");
        }
    }
}, { passive: true });

// --- Klick-Elemente (Buttons & Pause) ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Pause Button
    const pauseBtn = document.getElementById('pause-btn');
    if (pauseBtn) {
        const handlePause = (e) => { e.preventDefault(); togglePause(); };
        pauseBtn.addEventListener('click', handlePause);
        pauseBtn.addEventListener('touchstart', handlePause, { passive: false });
    }

    // 2. Richtungs-Buttons
    const buttonMap = {
        'up-btn': 'UP', 'down-btn': 'DOWN',
        'left-btn': 'LEFT', 'right-btn': 'RIGHT'
    };

    Object.entries(buttonMap).forEach(([id, dir]) => {
        const btn = document.getElementById(id);
        if (btn) {
            const handleBtn = (e) => {
                e.preventDefault();
                handleDirectionInput(dir);
            };
            btn.addEventListener('touchstart', handleBtn, { passive: false });
            btn.addEventListener('click', handleBtn);
        }
    });
});
