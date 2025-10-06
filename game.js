const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Game settings
const PADDLE_WIDTH = 15;
const PADDLE_HEIGHT = 100;
const BALL_RADIUS = 10;
const PLAYER_X = 20;
const AI_X = canvas.width - PADDLE_WIDTH - 20;
const PADDLE_SPEED = 8;

// Score
let scores = [0, 0, 0, 0]; // [Links, Rechts, Oben, Unten]
let mode = null;

// Paddle positions
let playerY = canvas.height / 2 - PADDLE_HEIGHT / 2;
let rightY = canvas.height / 2 - PADDLE_HEIGHT / 2;
let topX = canvas.width / 2 - PADDLE_HEIGHT / 2;
let bottomX = canvas.width / 2 - PADDLE_HEIGHT / 2;

// Ball
let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    vx: 10 * (Math.random() > 0.5 ? 1 : -1),
    vy: 7 * (Math.random() > 0.5 ? 1 : -1),
    active: true
};

// Powerup list
let powerups = [];
const powerupTypes = [
    { type: "bigPaddle", color: "lime", effect: (side) => changePaddleSize(side, 1.5) },
    { type: "smallPaddle", color: "red", effect: (side) => changePaddleSize(side, 0.7) },
    { type: "fastBall", color: "orange", effect: () => changeBallSpeed(1.5) },
    { type: "slowBall", color: "cyan", effect: () => changeBallSpeed(0.7) },
    { type: "extraPoint", color: "yellow", effect: (side) => { scores[side]++; } }
];
let paddleSizes = [1, 1, 1, 1]; // Multiplier for paddle size

function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
}

function resetBall(loser) {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.vx = 10 * (Math.random() > 0.5 ? 1 : -1);
    ball.vy = 7 * (Math.random() > 0.5 ? 1 : -1);
    ball.active = true;
    if (typeof loser === 'number') scores[loser]++;
}

function manualResetBall() {
    resetBall(); // Kein Punktezuwachs
}

function changePaddleSize(side, mul) {
    paddleSizes[side] = mul;
    setTimeout(() => {
        paddleSizes[side] = 1;
    }, 7000); // Powerup hält 7 Sekunden
}

function changeBallSpeed(mul) {
    ball.vx *= mul;
    ball.vy *= mul;
    setTimeout(() => {
        ball.vx /= mul;
        ball.vy /= mul;
    }, 5000); // Powerup hält 5 Sekunden
}

function spawnPowerup() {
    if (!ball.active) return; // Keine Powerups wenn Ball nicht unterwegs
    if (Math.random() < 0.008) { // Chance pro Frame
        let typeObj = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
        powerups.push({
            x: Math.random() * (canvas.width - 30) + 15,
            y: Math.random() * (canvas.height - 30) + 15,
            radius: 16,
            color: typeObj.color,
            type: typeObj.type
        });
    }
}

function checkPowerupCollision() {
    for (let i = powerups.length - 1; i >= 0; i--) {
        let p = powerups[i];
        let dist = Math.hypot(ball.x - p.x, ball.y - p.y);
        if (dist < BALL_RADIUS + p.radius) {
            let idx = getBallSide(); // Für paddle powerups und extraPoint
            let typeObj = powerupTypes.find(obj => obj.type === p.type);
            if (typeObj) {
                if (["bigPaddle", "smallPaddle", "extraPoint"].includes(p.type)) {
                    typeObj.effect(idx);
                } else {
                    typeObj.effect();
                }
            }
            powerups.splice(i, 1);
        }
    }
}

function getBallSide() {
    // 0: links, 1: rechts, 2: oben, 3: unten
    // Wer ist dem Ball am nächsten?
    let dists = [
        Math.abs(ball.x - PLAYER_X),
        Math.abs(ball.x - AI_X),
        Math.abs(ball.y),
        Math.abs(ball.y - canvas.height)
    ];
    let minDist = Math.min(...dists);
    return dists.indexOf(minDist);
}

// Auswahl-Overlay
function drawModeSelection() {
    ctx.fillStyle = "rgba(0,0,0,0.85)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Spielmodus wählen:", canvas.width / 2, canvas.height / 2 - 40);
    ctx.fillText("1: 2 Spieler (links/rechts)", canvas.width / 2, canvas.height / 2);
    ctx.fillText("2: 4 Spieler (links: Mensch, Rest: Computer)", canvas.width / 2, canvas.height / 2 + 40);
    ctx.font = "20px Arial";
    ctx.fillText("Touch funktioniert auch!", canvas.width / 2, canvas.height / 2 + 90);
}

document.addEventListener('keydown', function(e) {
    if (!mode) {
        if (e.key === '1') mode = 2;
        else if (e.key === '2') mode = 4;
    }
});

canvas.addEventListener('mousemove', function(e) {
    let rect = canvas.getBoundingClientRect();
    let mouseY = e.clientY - rect.top;
    playerY = mouseY - PADDLE_HEIGHT * paddleSizes[0] / 2;
    playerY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT * paddleSizes[0], playerY));
});

canvas.addEventListener('touchmove', function(e) {
    e.preventDefault();
    const touch = e.touches[0];
    let rect = canvas.getBoundingClientRect();
    let x = touch.clientX - rect.left;
    let y = touch.clientY - rect.top;
    if (x < canvas.width / 4) {
        playerY = y - PADDLE_HEIGHT * paddleSizes[0] / 2;
        playerY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT * paddleSizes[0], playerY));
    }
}, { passive: false });

// Button Bereich für Ball zurücksetzen
const buttonRect = {x: canvas.width/2 - 60, y: canvas.height - 50, w: 120, h: 35};
canvas.addEventListener('click', function(e) {
    let rect = canvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    if (
        x >= buttonRect.x && x <= buttonRect.x + buttonRect.w &&
        y >= buttonRect.y && y <= buttonRect.y + buttonRect.h
    ) {
        manualResetBall();
    }
});

function moveRightAI() {
    let center = rightY + PADDLE_HEIGHT * paddleSizes[1] / 2;
    if (center < ball.y - 20) rightY += PADDLE_SPEED;
    else if (center > ball.y + 20) rightY -= PADDLE_SPEED;
    rightY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT * paddleSizes[1], rightY));
}

function moveTopAI() {
    let center = topX + PADDLE_HEIGHT * paddleSizes[2] / 2;
    if (center < ball.x - 20) topX += PADDLE_SPEED;
    else if (center > ball.x + 20) topX -= PADDLE_SPEED;
    topX = Math.max(0, Math.min(canvas.width - PADDLE_HEIGHT * paddleSizes[2], topX));
}

function moveBottomAI() {
    let center = bottomX + PADDLE_HEIGHT * paddleSizes[3] / 2;
    if (center < ball.x - 20) bottomX += PADDLE_SPEED;
    else if (center > ball.x + 20) bottomX -= PADDLE_SPEED;
    bottomX = Math.max(0, Math.min(canvas.width - PADDLE_HEIGHT * paddleSizes[3], bottomX));
}

function collisionBallPaddle(x, y, paddleX, paddleY, vertical, sizeIdx) {
    let paddleSize = paddleSizes[sizeIdx];
    if (vertical) {
        return (
            x - BALL_RADIUS < paddleX + PADDLE_WIDTH &&
            x + BALL_RADIUS > paddleX &&
            y + BALL_RADIUS > paddleY &&
            y - BALL_RADIUS < paddleY + PADDLE_HEIGHT * paddleSize
        );
    } else {
        return (
            y - BALL_RADIUS < paddleY + PADDLE_WIDTH &&
            y + BALL_RADIUS > paddleY &&
            x + BALL_RADIUS > paddleX &&
            x - BALL_RADIUS < paddleX + PADDLE_HEIGHT * paddleSize
        );
    }
}

function update() {
    if (!ball.active) return;

    ball.x += ball.vx;
    ball.y += ball.vy;

    if (mode === 2) {
        if (ball.y - BALL_RADIUS < 0 || ball.y + BALL_RADIUS > canvas.height) ball.vy *= -1;
        if (collisionBallPaddle(ball.x, ball.y, PLAYER_X, playerY, true, 0)) {
            ball.vx = Math.abs(ball.vx);
            let delta = ball.y - (playerY + PADDLE_HEIGHT * paddleSizes[0] / 2);
            ball.vy = delta * 0.3;
        }
        if (collisionBallPaddle(ball.x, ball.y, AI_X, rightY, true, 1)) {
            ball.vx = -Math.abs(ball.vx);
            let delta = ball.y - (rightY + PADDLE_HEIGHT * paddleSizes[1] / 2);
            ball.vy = delta * 0.3;
        }
        if (ball.x < 0) { ball.active = false; resetBall(0); }
        if (ball.x > canvas.width) { ball.active = false; resetBall(1); }
        moveRightAI();
    }

    if (mode === 4) {
        if (collisionBallPaddle(ball.x, ball.y, PLAYER_X, playerY, true, 0)) {
            ball.vx = Math.abs(ball.vx);
            let delta = ball.y - (playerY + PADDLE_HEIGHT * paddleSizes[0] / 2);
            ball.vy = delta * 0.3;
        }
        if (collisionBallPaddle(ball.x, ball.y, AI_X, rightY, true, 1)) {
            ball.vx = -Math.abs(ball.vx);
            let delta = ball.y - (rightY + PADDLE_HEIGHT * paddleSizes[1] / 2);
            ball.vy = delta * 0.3;
        }
        if (collisionBallPaddle(ball.x, ball.y, topX, 0, false, 2)) {
            ball.vy = Math.abs(ball.vy);
            let delta = ball.x - (topX + PADDLE_HEIGHT * paddleSizes[2] / 2);
            ball.vx = delta * 0.3;
        }
        if (collisionBallPaddle(ball.x, ball.y, bottomX, canvas.height - PADDLE_WIDTH, false, 3)) {
            ball.vy = -Math.abs(ball.vy);
            let delta = ball.x - (bottomX + PADDLE_HEIGHT * paddleSizes[3] / 2);
            ball.vx = delta * 0.3;
        }
        if (ball.x < 0) { ball.active = false; resetBall(0); }
        if (ball.x > canvas.width) { ball.active = false; resetBall(1); }
        if (ball.y < 0) { ball.active = false; resetBall(2); }
        if (ball.y > canvas.height) { ball.active = false; resetBall(3); }
        moveRightAI();
        moveTopAI();
        moveBottomAI();
    }
    spawnPowerup();
    checkPowerupCollision();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw paddles
    drawRect(PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT * paddleSizes[0], '#fff');
    drawRect(AI_X, rightY, PADDLE_WIDTH, PADDLE_HEIGHT * paddleSizes[1], '#fff');
    if (mode === 4) {
        drawRect(topX, 0, PADDLE_HEIGHT * paddleSizes[2], PADDLE_WIDTH, '#fff');
        drawRect(bottomX, canvas.height - PADDLE_WIDTH, PADDLE_HEIGHT * paddleSizes[3], PADDLE_WIDTH, '#fff');
    }

    // Draw ball
    if (ball.active) drawCircle(ball.x, ball.y, BALL_RADIUS, '#fff');

    // Draw powerups
    for (let p of powerups) {
        drawCircle(p.x, p.y, p.radius, p.color);
        ctx.font = "14px Arial";
        ctx.fillStyle = "#000";
        ctx.textAlign = "center";
        ctx.fillText(p.type, p.x, p.y+5);
    }

    // Draw scores
    ctx.font = "24px Arial";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "left";
    ctx.fillText("Links: " + scores[0], 30, 30);
    ctx.textAlign = "right";
    ctx.fillText("Rechts: " + scores[1], canvas.width - 30, 30);
    if (mode === 4) {
        ctx.textAlign = "center";
        ctx.fillText("Oben: " + scores[2], canvas.width / 2, 30);
        ctx.fillText("Unten: " + scores[3], canvas.width / 2, canvas.height - 10);
    }

    // Draw Ball-Reset-Button
    ctx.fillStyle = "#444";
    ctx.fillRect(buttonRect.x, buttonRect.y, buttonRect.w, buttonRect.h);
    ctx.font = "20px Arial";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText("Ball zurück!", buttonRect.x + buttonRect.w / 2, buttonRect.y + buttonRect.h / 2 + 6);
}

function gameLoop() {
    if (!mode) {
        drawModeSelection();
    } else {
        update();
        draw();
    }
    requestAnimationFrame(gameLoop);
}

gameLoop();
