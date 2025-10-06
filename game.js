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

// Maussteuerung für linkes Paddle
canvas.addEventListener('mousemove', function(e) {
    let rect = canvas.getBoundingClientRect();
    let mouseY = e.clientY - rect.top;
    playerY = mouseY - PADDLE_HEIGHT / 2;
    playerY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, playerY));
});

// TOUCH Steuerung für linkes Paddle
canvas.addEventListener('touchmove', function(e) {
    e.preventDefault();
    const touches = e.touches;
    for (let i = 0; i < touches.length; i++) {
        let touch = touches[i];
        let rect = canvas.getBoundingClientRect();
        let x = touch.clientX - rect.left;
        let y = touch.clientY - rect.top;
        // Links (linke Hälfte)
        if (x < canvas.width / 4) {
            playerY = y - PADDLE_HEIGHT / 2;
            playerY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, playerY));
        }
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

function update() {
    ball.x += ball.vx;
    ball.y += ball.vy;

    if (mode === 2) {
        // Wände oben/unten
        if (ball.y - BALL_RADIUS < 0 || ball.y + BALL_RADIUS > canvas.height) ball.vy *= -1;

        // Linkes Paddle
        if (collisionBallPaddle(ball.x, ball.y, PLAYER_X, playerY, true)) {
            ball.vx = Math.abs(ball.vx);
            let delta = ball.y - (playerY + PADDLE_HEIGHT / 2);
            ball.vy = delta * 0.3;
        }
        // rechtes Paddle (KI oder Spieler)
        if (collisionBallPaddle(ball.x, ball.y, AI_X, rightY, true)) {
            ball.vx = -Math.abs(ball.vx);
            let delta = ball.y - (rightY + PADDLE_HEIGHT / 2);
            ball.vy = delta * 0.3;
        }

        // Score
        if (ball.x < 0) resetBall(0);
        if (ball.x > canvas.width) resetBall(1);

        // KI
        moveRightAI();
    }

    if (mode === 4) {
        // Linkes Paddle (Spieler)
        if (collisionBallPaddle(ball.x, ball.y, PLAYER_X, playerY, true)) {
            ball.vx = Math.abs(ball.vx);
            let delta = ball.y - (playerY + PADDLE_HEIGHT / 2);
            ball.vy = delta * 0.3;
        }
        // rechtes Paddle (KI)
        if (collisionBallPaddle(ball.x, ball.y, AI_X, rightY, true)) {
            ball.vx = -Math.abs(ball.vx);
            let delta = ball.y - (rightY + PADDLE_HEIGHT / 2);
            ball.vy = delta * 0.3;
        }
        // oben Paddle (KI)
        if (collisionBallPaddle(ball.x, ball.y, topX, 0, false)) {
            ball.vy = Math.abs(ball.vy);
            let delta = ball.x - (topX + PADDLE_HEIGHT / 2);
            ball.vx = delta * 0.3;
        }
        // unten Paddle (KI)
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

        // KI
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
