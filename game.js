const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Game settings
let PADDLE_WIDTH = 15;
let PADDLE_HEIGHT = 100;
let BALL_RADIUS = 10;
let PLAYER_X = 20;
let AI_X = canvas.width - PADDLE_WIDTH - 20;
let PADDLE_SPEED = 8;
let BALL_SPEED = 10;

// Score
let scores = [0, 0, 0, 0]; // [Links, Rechts, Oben, Unten]
let mode = null; // 2, 4, or 'challenge'
let challengeType = null;

// Paddle positions
let playerY = canvas.height / 2 - PADDLE_HEIGHT / 2;
let rightY = canvas.height / 2 - PADDLE_HEIGHT / 2;
let topX = canvas.width / 2 - PADDLE_HEIGHT / 2;
let bottomX = canvas.width / 2 - PADDLE_HEIGHT / 2;

// Ball
let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    vx: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
    vy: BALL_SPEED * 0.7 * (Math.random() > 0.5 ? 1 : -1),
    active: true
};

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
    ball.vx = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
    ball.vy = BALL_SPEED * 0.7 * (Math.random() > 0.5 ? 1 : -1);
    ball.active = true;
    if (typeof loser === 'number') scores[loser]++;
}

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
function manualResetBall() {
    resetBall(); // Kein Punktezuwachs
}

function drawModeSelection() {
    ctx.fillStyle = "rgba(0,0,0,0.85)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Spielmodus wählen:", canvas.width / 2, canvas.height / 2 - 60);
    ctx.fillText("1: 2 Spieler (links/rechts)", canvas.width / 2, canvas.height / 2 - 20);
    ctx.fillText("2: 4 Spieler (links: Mensch, Rest: Computer)", canvas.width / 2, canvas.height / 2 + 20);
    ctx.fillText("3: Challenge-Modus", canvas.width / 2, canvas.height / 2 + 60);
    ctx.font = "20px Arial";
    ctx.fillText("Touch funktioniert auch!", canvas.width / 2, canvas.height / 2 + 110);
}

function drawChallengeSelection() {
    ctx.fillStyle = "rgba(0,0,0,0.85)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "28px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Wähle eine Challenge:", canvas.width / 2, canvas.height / 2 - 80);
    ctx.fillText("1: Kleine Paddles", canvas.width / 2, canvas.height / 2 - 40);
    ctx.fillText("2: Schneller Ball", canvas.width / 2, canvas.height / 2);
    ctx.fillText("3: Kein Ballverlust erlaubt", canvas.width / 2, canvas.height / 2 + 40);
    ctx.fillText("4: Extra starke KI", canvas.width / 2, canvas.height / 2 + 80);
}

document.addEventListener('keydown', function(e) {
    if (!mode) {
        if (e.key === '1') mode = 2;
        else if (e.key === '2') mode = 4;
        else if (e.key === '3') mode = 'challenge';
    } else if (mode === 'challenge' && !challengeType) {
        if (e.key === '1') challengeType = 'smallpaddle';
        else if (e.key === '2') challengeType = 'fastball';
        else if (e.key === '3') challengeType = 'suddendeath';
        else if (e.key === '4') challengeType = 'strongki';
        if (challengeType) applyChallengeSettings();
    }
});

// Challenge Einstellungen anwenden
function applyChallengeSettings() {
    // Standardwerte
    PADDLE_HEIGHT = 100;
    BALL_SPEED = 10;
    PADDLE_SPEED = 8;
    scores = [0,0,0,0];
    resetBall();
    if (challengeType === 'smallpaddle') {
        PADDLE_HEIGHT = 50;
    }
    if (challengeType === 'fastball') {
        BALL_SPEED = 18;
    }
    if (challengeType === 'strongki') {
        PADDLE_SPEED = 16;
    }
}
// Maus-/Touchsteuerung für linkes Paddle
canvas.addEventListener('mousemove', function(e) {
    let rect = canvas.getBoundingClientRect();
    let mouseY = e.clientY - rect.top;
    playerY = mouseY - PADDLE_HEIGHT / 2;
    playerY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, playerY));
});
canvas.addEventListener('touchmove', function(e) {
    e.preventDefault();
    const touch = e.touches[0];
    let rect = canvas.getBoundingClientRect();
    let x = touch.clientX - rect.left;
    let y = touch.clientY - rect.top;
    if (x < canvas.width / 4) {
        playerY = y - PADDLE_HEIGHT / 2;
        playerY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, playerY));
    }
}, { passive: false });

// KI für rechtes Paddle
function moveRightAI() {
    let center = rightY + PADDLE_HEIGHT / 2;
    if (center < ball.y - 20) rightY += PADDLE_SPEED;
    else if (center > ball.y + 20) rightY -= PADDLE_SPEED;
    rightY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, rightY));
}
// KI für oben Paddle
function moveTopAI() {
    let center = topX + PADDLE_HEIGHT / 2;
    if (center < ball.x - 20) topX += PADDLE_SPEED;
    else if (center > ball.x + 20) topX -= PADDLE_SPEED;
    topX = Math.max(0, Math.min(canvas.width - PADDLE_HEIGHT, topX));
}
// KI für unten Paddle
function moveBottomAI() {
    let center = bottomX + PADDLE_HEIGHT / 2;
    if (center < ball.x - 20) bottomX += PADDLE_SPEED;
    else if (center > ball.x + 20) bottomX -= PADDLE_SPEED;
    bottomX = Math.max(0, Math.min(canvas.width - PADDLE_HEIGHT, bottomX));
}

function collisionBallPaddle(x, y, paddleX, paddleY, vertical) {
    if (vertical) {
        return (
            x - BALL_RADIUS < paddleX + PADDLE_WIDTH &&
            x + BALL_RADIUS > paddleX &&
            y + BALL_RADIUS > paddleY &&
            y - BALL_RADIUS < paddleY + PADDLE_HEIGHT
        );
    } else {
        return (
            y - BALL_RADIUS < paddleY + PADDLE_WIDTH &&
            y + BALL_RADIUS > paddleY &&
            x + BALL_RADIUS > paddleX &&
            x - BALL_RADIUS < paddleX + PADDLE_HEIGHT
        );
    }
}

let gameOver = false;

function update() {
    if (!ball.active || gameOver) return;
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Klassisch & Challenge: 2-Spieler
    if (mode === 2 || (mode === 'challenge' && challengeType)) {
        if (ball.y - BALL_RADIUS < 0 || ball.y + BALL_RADIUS > canvas.height) ball.vy *= -1;
        if (collisionBallPaddle(ball.x, ball.y, PLAYER_X, playerY, true)) {
            ball.vx = Math.abs(ball.vx);
            let delta = ball.y - (playerY + PADDLE_HEIGHT / 2);
            ball.vy = delta * 0.3;
        }
        if (collisionBallPaddle(ball.x, ball.y, AI_X, rightY, true)) {
            ball.vx = -Math.abs(ball.vx);
            let delta = ball.y - (rightY + PADDLE_HEIGHT / 2);
            ball.vy = delta * 0.3;
        }
        if (ball.x < 0) {
            ball.active = false; resetBall(0);
            if (mode === 'challenge' && challengeType === 'suddendeath') gameOver = true;
        }
        if (ball.x > canvas.width) {
            ball.active = false; resetBall(1);
            if (mode === 'challenge' && challengeType === 'suddendeath') gameOver = true;
        }
        moveRightAI();
    }

    // Vier-Spieler-Modus
    if (mode === 4) {
        if (collisionBallPaddle(ball.x, ball.y, PLAYER_X, playerY, true)) {
            ball.vx = Math.abs(ball.vx);
            let delta = ball.y - (playerY + PADDLE_HEIGHT / 2);
            ball.vy = delta * 0.3;
        }
        if (collisionBallPaddle(ball.x, ball.y, AI_X, rightY, true)) {
            ball.vx = -Math.abs(ball.vx);
            let delta = ball.y - (rightY + PADDLE_HEIGHT / 2);
            ball.vy = delta * 0.3;
        }
        if (collisionBallPaddle(ball.x, ball.y, topX, 0, false)) {
            ball.vy = Math.abs(ball.vy);
            let delta = ball.x - (topX + PADDLE_HEIGHT / 2);
            ball.vx = delta * 0.3;
        }
        if (collisionBallPaddle(ball.x, ball.y, bottomX, canvas.height - PADDLE_WIDTH, false)) {
            ball.vy = -Math.abs(ball.vy);
            let delta = ball.x - (bottomX + PADDLE_HEIGHT / 2);
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
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw paddles
    drawRect(PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT, '#fff');
    drawRect(AI_X, rightY, PADDLE_WIDTH, PADDLE_HEIGHT, '#fff');
    if (mode === 4) {
        drawRect(topX, 0, PADDLE_HEIGHT, PADDLE_WIDTH, '#fff');
        drawRect(bottomX, canvas.height - PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_WIDTH, '#fff');
    }

    // Draw ball
    if (ball.active) drawCircle(ball.x, ball.y, BALL_RADIUS, '#fff');

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

    // Challenge-Auswahl
    if (mode === 'challenge' && !challengeType) drawChallengeSelection();

    // Game Over
    if (gameOver) {
        ctx.fillStyle = "rgba(0,0,0,0.8)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#fff";
        ctx.font = "40px Arial";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER!", canvas.width / 2, canvas.height / 2);
        ctx.font = "24px Arial";
        ctx.fillText("Drücke F5 für ein neues Spiel.", canvas.width / 2, canvas.height / 2 + 40);
    }
}

function gameLoop() {
    if (!mode) {
        drawModeSelection();
    } else if (mode === 'challenge' && !challengeType) {
        drawChallengeSelection();
    } else {
        update();
        draw();
    }
    requestAnimationFrame(gameLoop);
}

gameLoop();
