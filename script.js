const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// Paddle settings
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const PADDLE_GAP = 10;

// Ball settings
const BALL_RADIUS = 10;

// Player paddle (left)
const player = {
    x: PADDLE_GAP,
    y: HEIGHT / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    color: '#0ff'
};

// AI paddle (right)
const ai = {
    x: WIDTH - PADDLE_GAP - PADDLE_WIDTH,
    y: HEIGHT / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    color: '#f0f'
};

// Ball
const ball = {
    x: WIDTH / 2,
    y: HEIGHT / 2,
    radius: BALL_RADIUS,
    speed: 5,
    velocityX: 5,
    velocityY: 5,
    color: '#fff'
};

// Utility functions
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

function drawNet() {
    ctx.strokeStyle = '#fff';
    ctx.setLineDash([6, 10]);
    ctx.beginPath();
    ctx.moveTo(WIDTH / 2, 0);
    ctx.lineTo(WIDTH / 2, HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);
}

function resetBall() {
    ball.x = WIDTH / 2;
    ball.y = HEIGHT / 2;
    // Randomize direction
    ball.velocityX = ball.speed * (Math.random() > 0.5 ? 1 : -1);
    ball.velocityY = ball.speed * (Math.random() > 0.5 ? 1 : -1);
}

// Mouse control for player paddle
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    player.y = mouseY - player.height / 2;

    // Prevent paddle from going out of bounds
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > HEIGHT) player.y = HEIGHT - player.height;
});

// AI movement
function updateAI() {
    // Simple AI: move paddle center towards ball's y position
    const aiCenter = ai.y + ai.height / 2;
    if (ball.y < aiCenter - 10) {
        ai.y -= 4;
    } else if (ball.y > aiCenter + 10) {
        ai.y += 4;
    }
    // Prevent paddle from going out of bounds
    if (ai.y < 0) ai.y = 0;
    if (ai.y + ai.height > HEIGHT) ai.y = HEIGHT - ai.height;
}

// Collision detection
function collision(b, p) {
    return (
        b.x - b.radius < p.x + p.width &&
        b.x + b.radius > p.x &&
        b.y - b.radius < p.y + p.height &&
        b.y + b.radius > p.y
    );
}

// Main update function
function update() {
    // Move ball
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    // Wall collision
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > HEIGHT) {
        ball.velocityY = -ball.velocityY;
    }

    // Paddle collision
    let paddle = (ball.x < WIDTH / 2) ? player : ai;
    if (collision(ball, paddle)) {
        // Calculate angle
        let collidePoint = ball.y - (paddle.y + paddle.height / 2);
        collidePoint = collidePoint / (paddle.height / 2);

        // Calculate angle in radians (max 45deg)
        let angleRad = (Math.PI / 4) * collidePoint;

        // Direction of ball when hit
        let direction = (ball.x < WIDTH / 2) ? 1 : -1;
        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);

        // Increase speed slightly
        ball.speed += 0.2;
    }

    // Left or right wall (score)
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > WIDTH) {
        resetBall();
        ball.speed = 5;
    }

    updateAI();
}

// Draw everything
function render() {
    // Clear
    drawRect(0, 0, WIDTH, HEIGHT, '#111');
    drawNet();

    // Draw paddles and ball
    drawRect(player.x, player.y, player.width, player.height, player.color);
    drawRect(ai.x, ai.y, ai.width, ai.height, ai.color);
    drawCircle(ball.x, ball.y, ball.radius, ball.color);
}

// Main game loop
function game() {
    update();
    render();
    requestAnimationFrame(game);
}

game();
