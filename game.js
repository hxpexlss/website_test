const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Game settings
const PADDLE_WIDTH = 15;
const PADDLE_HEIGHT = 100;
const BALL_RADIUS = 10;
const PLAYER_X = 20;
const AI_X = canvas.width - PADDLE_WIDTH - 20;

let playerY = canvas.height / 2 - PADDLE_HEIGHT / 2;
let aiY = canvas.height / 2 - PADDLE_HEIGHT / 2;

let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    vx: 6 * (Math.random() > 0.5 ? 1 : -1),
    vy: 4 * (Math.random() > 0.5 ? 1 : -1)
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

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.vx = 6 * (Math.random() > 0.5 ? 1 : -1);
    ball.vy = 4 * (Math.random() > 0.5 ? 1 : -1);
}

function moveAI() {
    // Basic AI: follow the ball with a small delay
    let center = aiY + PADDLE_HEIGHT / 2;
    if (center < ball.y - 20) aiY += 5;
    else if (center > ball.y + 20) aiY -= 5;

    // Clamp AI paddle within canvas
    aiY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, aiY));
}

canvas.addEventListener('mousemove', function(e) {
    // Mouse Y relative to canvas
    let rect = canvas.getBoundingClientRect();
    let mouseY = e.clientY - rect.top;
    playerY = mouseY - PADDLE_HEIGHT / 2;

    // Clamp paddle within canvas
    playerY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, playerY));
});

function collision(x, y, paddleX, paddleY) {
    return (
        x - BALL_RADIUS < paddleX + PADDLE_WIDTH &&
        x + BALL_RADIUS > paddleX &&
        y + BALL_RADIUS > paddleY &&
        y - BALL_RADIUS < paddleY + PADDLE_HEIGHT
    );
}

function update() {
    // Move ball
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Top and bottom wall collision
    if (ball.y - BALL_RADIUS < 0 || ball.y + BALL_RADIUS > canvas.height) {
        ball.vy *= -1;
    }

    // Left paddle collision
    if (collision(ball.x, ball.y, PLAYER_X, playerY)) {
        ball.vx = Math.abs(ball.vx);
        // Add some effect based on hit position
        let delta = ball.y - (playerY + PADDLE_HEIGHT / 2);
        ball.vy = delta * 0.2;
    }

    // Right paddle (AI) collision
    if (collision(ball.x, ball.y, AI_X, aiY)) {
        ball.vx = -Math.abs(ball.vx);
        let delta = ball.y - (aiY + PADDLE_HEIGHT / 2);
        ball.vy = delta * 0.2;
    }

    // Score (ball out of bounds)
    if (ball.x < 0 || ball.x > canvas.width) {
        resetBall();
    }

    moveAI();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw paddles
    drawRect(PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT, '#fff');
    drawRect(AI_X, aiY, PADDLE_WIDTH, PADDLE_HEIGHT, '#fff');

    // Draw ball
    drawCircle(ball.x, ball.y, BALL_RADIUS, '#fff');
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
