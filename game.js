const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Game settings (schneller)
const PADDLE_WIDTH = 15;
const PADDLE_HEIGHT = 100;
const BALL_RADIUS = 10;
const PLAYER_X = 20;
const AI_X = canvas.width - PADDLE_WIDTH - 20;
const PADDLE_SPEED = 8; // schneller

// Score
let scores = [0, 0, 0, 0]; // [Links, Rechts, Oben, Unten]
let mode = null;

// Paddle positions
let playerY = canvas.height / 2 - PADDLE_HEIGHT / 2;
let aiY = canvas.height / 2 - PADDLE_HEIGHT / 2;
let topX = canvas.width / 2 - PADDLE_HEIGHT / 2;
let bottomX = canvas.width / 2 - PADDLE_HEIGHT / 2;

// Ball
let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    vx: 10 * (Math.random() > 0.5 ? 1 : -1), // schneller
    vy: 7 * (Math.random() > 0.5 ? 1 : -1)
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
    ball.vx = 10 * (Math.random() > 0.5 ? 1 : -1);
    ball.vy = 7 * (Math.random() > 0.5 ? 1 : -1);
    if (typeof loser === 'number') scores[loser]++;
}

function moveAI() {
    let center = aiY + PADDLE_HEIGHT / 2;
    if (center < ball.y - 20) aiY += PADDLE_SPEED;
    else if (center > ball.y + 20) aiY -= PADDLE_SPEED;
    aiY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, aiY));
}

function moveTopAI() {
    let center = topX + PADDLE_HEIGHT / 2;
    if (center < ball.x - 20) topX += PADDLE_SPEED;
    else if (center > ball.x + 20) topX -= PADDLE_SPEED;
    topX = Math.max(0, Math.min(canvas.width - PADDLE_HEIGHT, topX));
}

function moveBottomAI() {
    let center = bottomX + PADDLE_HEIGHT / 2;
    if (center < ball.x - 20) bottomX += PADDLE_SPEED;
    else if (center > ball.x + 20) bottomX -= PADDLE_SPEED;
    bottomX = Math.max(0, Math.min(canvas.width - PADDLE_HEIGHT, bottomX));
}

// Auswahl-Overlay
function drawModeSelection() {
    ctx.fillStyle = "rgba(0,0,0,0.85)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Spielmodus wählen:", canvas.width / 2, canvas.height / 2 - 40);
    ctx.fillText("1: 2 Spieler (klassisch)", canvas.width / 2, canvas.height / 2);
    ctx.fillText("2: 4 Spieler (an jeder Ecke)", canvas.width / 2, canvas.height / 2 + 40);
}

document.addEventListener('keydown', function(e) {
    if (!mode) {
        if (e.key === '1') {
            mode = 2;
        } else if (e.key === '2') {
            mode = 4;
        }
    }
});

// Maussteuerung für linkes Paddle
canvas.addEventListener('mousemove', function(e) {
    let rect = canvas.getBoundingClientRect();
    let mouseY = e.clientY - rect.top;
    playerY = mouseY - PADDLE_HEIGHT / 2;
    playerY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, playerY));
});

// Maussteuerung für oben/unten Paddle (nur 4-Spieler-Modus)
canvas.addEventListener('mousemove', function(e) {
    if (mode === 4) {
        let rect = canvas.getBoundingClientRect();
        let mouseX = e.clientX - rect.left;
        topX = mouseX - PADDLE_HEIGHT / 2;
        bottomX = mouseX - PADDLE_HEIGHT / 2;
        topX = Math.max(0, Math.min(canvas.width - PADDLE_HEIGHT, topX));
        bottomX = Math.max(0, Math.min(canvas.width - PADDLE_HEIGHT, bottomX));
    }
});

function collisionBallPaddle(x, y, paddleX, paddleY, vertical) {
    if (vertical) {
        return (
            x - BALL_RADIUS < paddleX + PADDLE_WIDTH &&
            x + BALL_RADIUS > paddleX &&
            y + BALL_RADIUS > paddleY &&
            y - BALL_RADIUS < paddleY + PADDLE_HEIGHT
        );
    } else {
        // horizontal paddle (oben/unten)
        return (
            y - BALL_RADIUS < paddleY + PADDLE_WIDTH &&
            y + BALL_RADIUS > paddleY &&
            x + BALL_RADIUS > paddleX &&
            x - BALL_RADIUS < paddleX + PADDLE_HEIGHT
        );
    }
}

function update() {
    // Move ball
    ball.x += ball.vx;
    ball.y += ball.vy;

    // 2 Spieler Modus
    if (mode === 2) {
        // Wände oben/unten
        if (ball.y - BALL_RADIUS < 0 || ball.y + BALL_RADIUS > canvas.height) {
            ball.vy *= -1;
        }
        // Linkes Paddle
        if (collisionBallPaddle(ball.x, ball.y, PLAYER_X, playerY, true)) {
            ball.vx = Math.abs(ball.vx);
            let delta = ball.y - (playerY + PADDLE_HEIGHT / 2);
            ball.vy = delta * 0.3;
        }
        // rechtes Paddle
        if (collisionBallPaddle(ball.x, ball.y, AI_X, aiY, true)) {
            ball.vx = -Math.abs(ball.vx);
            let delta = ball.y - (aiY + PADDLE_HEIGHT / 2);
            ball.vy = delta * 0.3;
        }
        // Punkt für Gegner/Spieler
        if (ball.x < 0) resetBall(0); // Links verliert
        if (ball.x > canvas.width) resetBall(1); // Rechts verliert
        moveAI();
    }

    // 4 Spieler Modus
    if (mode === 4) {
        // Linkes Paddle
        if (collisionBallPaddle(ball.x, ball.y, PLAYER_X, playerY, true)) {
            ball.vx = Math.abs(ball.vx);
            let delta = ball.y - (playerY + PADDLE_HEIGHT / 2);
            ball.vy = delta * 0.3;
        }
        // rechtes Paddle
        if (collisionBallPaddle(ball.x, ball.y, AI_X, aiY, true)) {
            ball.vx = -Math.abs(ball.vx);
            let delta = ball.y - (aiY + PADDLE_HEIGHT / 2);
            ball.vy = delta * 0.3;
        }
        // oben Paddle
        if (collisionBallPaddle(ball.x, ball.y, topX, 0, false)) {
            ball.vy = Math.abs(ball.vy);
            let delta = ball.x - (topX + PADDLE_HEIGHT / 2);
            ball.vx = delta * 0.3;
        }
        // unten Paddle
        if (collisionBallPaddle(ball.x, ball.y, bottomX, canvas.height - PADDLE_WIDTH, false)) {
            ball.vy = -Math.abs(ball.vy);
            let delta = ball.x - (bottomX + PADDLE_HEIGHT / 2);
            ball.vx = delta * 0.3;
        }
        // Score
        if (ball.x < 0) resetBall(0); // Links verliert
        if (ball.x > canvas.width) resetBall(1); // Rechts verliert
        if (ball.y < 0) resetBall(2); // Oben verliert
        if (ball.y > canvas.height) resetBall(3); // Unten verliert
        moveAI();
        moveTopAI();
        moveBottomAI();
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw paddles
    drawRect(PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT, '#fff');
    drawRect(AI_X, aiY, PADDLE_WIDTH, PADDLE_HEIGHT, '#fff');
    if (mode === 4) {
        drawRect(topX, 0, PADDLE_HEIGHT, PADDLE_WIDTH, '#fff');
        drawRect(bottomX, canvas.height - PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_WIDTH, '#fff');
    }

    // Draw ball
    drawCircle(ball.x, ball.y, BALL_RADIUS, '#fff');

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
