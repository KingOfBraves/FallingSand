/**
 * Conways game of life
 * uses the following rules
 *  1) Any live cell with fewer than two live neighbors dies, as if by underpopulation.
 *  2) Any live cell with two or three live neighbors lives on to the next generation.
 *  3) Any live cell with more than three live neighbors dies, as if by overpopulation.
 *  4) Any dead cell with exactly three live neighbors becomes a live cell, as if by reproduction.
 *
 * Modified version of my falling sand game
 */

// Size of our sand
const BLOCK_SIZE = 5;

const canvas = document.getElementById("sandCanvas")
const ctx = canvas.getContext("2d");
const timeRange = document.getElementById("timeRange");

const width = canvas.width;
const height = canvas.height;

const floor = height - 1;
const leftWall = 0;
const rightWall = width - 1;

let timeToLive = timeRange ? timeRange.value : 500;
let ballRadius = 10;

let deltaTime = 0;
let mouseDown = false;
let ball = { x: width/2, y: height/2, radius: ballRadius, velocity: { x: 10, y: -5}, mass: 5};
const gravity = {x: 1, y: 9.81};
const maxSpeed = {x: 20, y: 20};

/**
 * Types
 * 2 = fire
 * 1 = sand
 */

let start = false;

let lastUpdate = Date.now();

const resetBall = () => {
    ball.x = width / 2;
    ball.y = height / 2;
}

const create2DArray = (width, height) => {
    const arr = new Array(width);
    for (let i = 0; i < height; i++) {
        arr[i] = new Array(height);
    }
    console.debug(`New array created with width: ${arr.length} height: ${arr[0].length}`)
    return arr;
}

let grid = create2DArray(width, height);

const calculateDeltaTime = () => {
    const update = Date.now()
    const deltaTime = update - lastUpdate;
    lastUpdate = update;
    return deltaTime / 1000;
}

const drawBall = (ctx) => {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
    ctx.fillStyle = "black";
    ctx.fill();
}

// v = u + at
// v = vel + acc(deltaTime())
const calculateVelocity = (vel, acc) => {
    return vel + (acc * (deltaTime));
}

const checkCollisionWithWall = ({x, y, velocity, radius}) => {
    let updated = {x, y, velocity, radius};
    if (x < 0 + radius) {
        updated.x = 0 + radius;
        updated.velocity.x = (velocity.x * -1) / 1.1;
    } else if (x >  width - radius) {
        updated.x = width - radius;
        updated.velocity.x = (velocity.x * -1) / 1.1;
    }

    if (y < 0 + radius) {
        updated.y = 0 + radius;
        updated.velocity.y = (velocity.y * -1) / 1.1;
    } else if (y > height - radius) {
        updated.y = height - radius;
        updated.velocity.y = (velocity.y * -1) / 1.1;
    }
    return updated;
}


const checkBounds = (x, y) => {}

const updateBall = () => {
    if (mouseDown) {
        ball = checkCollisionWithWall(ball);
        return;
    }
    if (ball.velocity.x > -.05 && ball.velocity.x < .05) {
        ball.velocity.x = 0;
    } else if (ball.velocity.x < 0) {
        if (Math.abs(ball.velocity.x) < maxSpeed.x && ball.y == height - ball.radius) {
            ball.velocity.x = calculateVelocity(ball.velocity.x, 2);
        }
        ball.x = ball.x + ball.velocity.x;
    } else if (ball.velocity.x > 0) {
        if (Math.abs(ball.velocity.x) < maxSpeed.x && ball.y == height - ball.radius) { 
            ball.velocity.x = calculateVelocity(ball.velocity.x, -2);
        }
        ball.x = ball.x + ball.velocity.x;
    }
    if ( ball.velocity.y > -maxSpeed.y) {
        ball.velocity.y = calculateVelocity(ball.velocity.y, -9.81);
    }
    if (ball.velocity.y < .3 && ball.velocity.y > 0 ) {
        ball.velocity.y = ball.velocity.y * -1;
    }
    ball.y = ball.y - (ball.velocity.y);

    // check for collisions
    ball = checkCollisionWithWall(ball);
}

/**
 * Main animation handler
 */
const anim = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    deltaTime = calculateDeltaTime();
    updateBall();
    drawBall(ctx, grid)

    window.requestAnimationFrame(anim);
}
/**
 * Spawn Handlers
 */
let spawnX;
let spawnY;
let prevX;
let prevY;
let mouseVelocity = {x: 0, y: 0}
let spawner = null;
let lastMove = 0;
let currentMove = 0;

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    lastMove = Date.now() / 1000;
    e.preventDefault();
    spawnX = (e.clientX - rect.left) | 0;
    spawnY = (e.clientY - rect.top) | 0;
    ball.x = spawnX;
    ball.y = spawnY;
    ball.velocity.x = 0;
    ball.velocity.y = 0;
    mouseDown = true;
})

canvas.addEventListener('mousemove', (e) => {
    if (mouseDown) {
        const rect = canvas.getBoundingClientRect();
        prevX = spawnX;
        prevY = spawnY;
        spawnX = (e.clientX - rect.left) | 0;
        spawnY = (e.clientY - rect.top) | 0;
        ball.x = spawnX;
        ball.y = spawnY;

        lastMove = currentMove;
        currentMove = Date.now() / 1000;
    }
})

canvas.addEventListener('mouseup', (e) => {
    const rect = canvas.getBoundingClientRect();

    mouseDown = false;
    const mouseUpTime = Date.now() / 1000;
    const mouseUpX = (e.clientX - rect.left) | 0
    const mouseUpY = (e.clientY - rect.top) | 0
    console.log(spawnX - prevX, lastMove, currentMove)
    ball.velocity.x = (((spawnX - prevX) / 100) / ((currentMove - lastMove)));
    ball.velocity.y = (((spawnY - prevY) / 100 )/ ((currentMove - lastMove))) * -1;

})

/**
 * Key handlers for changing types
 */

addEventListener('keydown', (e) => {
    switch (e.key) {
        case 's':
        case 'S':
            startOrStop();
            break;
    }
})

window.requestAnimationFrame(anim)
const startLife = () => start = true;
const stopLife = () => start = false;

const startOrStop = () => start = !start;

const setTime = (v) => {
    timeToLive = v;
}

const reset = () => grid = create2DArray(width, height);