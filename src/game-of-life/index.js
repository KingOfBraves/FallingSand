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

const width = canvas.width / BLOCK_SIZE;
const height = canvas.height / BLOCK_SIZE;

const floor = height - 1;
const leftWall = 0;
const rightWall = width - 1;

let timeToLive = timeRange ? timeRange.value : 500;

/**
 * Types
 * 2 = fire
 * 1 = sand
 */
const ERASE = 0;
const SAND = 1;
let type = SAND;

let start = false;

let lastUpdate = Date.now();


const setType = (t) => type = t;
const setSand = () => setType(SAND);
const setFire = () => setType(FIRE);
const setConcrete = () => setType(CONCRETE);
const setErase = () => setType(ERASE);

const create2DArray = (width, height) => {
    const arr = new Array(width);
    for (let i = 0; i < height; i++) {
        arr[i] = new Array(height);
    }
    console.debug(`New array created with width: ${arr.length} height: ${arr[0].length}`)
    return arr;
}

let grid = create2DArray(width, height);

const checkXWithinGrid = (x) => x > 0 && x < width;
const checkYWithinGrid = (y) => y > 0 && y < height;

/*
    Space checks
*/
const checkAbove = (x, y, types) => y - 1 > 0 && types.includes(grid[x][y - 1])
const checkAboveLeft = (x, y, types) => y - 1 > 0 && x - 1 >= leftWall && types.includes(grid[x-1][y-1])
const checkAboveRight = (x, y, types) => y - 1 > 0 && x + 1 < rightWall && types.includes(grid[x+1][y-1])
const checkBottom = (x, y, types) => y + 1 <= floor && types.includes(grid[x][y + 1])
const checkBottomLeft = (x, y, types) => x - 1 >= leftWall && types.includes(grid[x-1][y+1])
const checkBottomRight = (x, y, types) => x + 1 < rightWall && types.includes(grid[x+1][y+1])
const checkLeft = (x, y, types) => x - 1 >= leftWall && types.includes(grid[x-1][y])
const checkRight = (x, y, types) => x + 1 < rightWall && types.includes(grid[x+1][y])

const checkNeighbours = (x, y, types) => {
    let total = 0;
    if (checkAbove(x, y, types)) {
        total += 1;
    }
    if (checkAboveLeft(x, y, types)) {
        total += 1;
    }
    if (checkAboveRight(x, y, types)) {
        total += 1;
    }
    if (checkBottom(x, y, types)) {
        total += 1;
    }
    if (checkBottomLeft(x, y, types)) {
        total += 1;
    }
    if (checkBottomRight(x, y, types)) {
        total += 1;
    }
    if (checkLeft(x, y, types)) {
        total += 1;
    }
    if (checkRight(x, y, types)) {
        total += 1;
    }
    return total;
}

const setGrid = (grid, x, y, type) => {
    if (checkXWithinGrid(x) && checkYWithinGrid(y)) {
        try {
            grid[x][y] = type;
        } catch (e) {
            console.error('error inserting at ', x, y, e)
        }
    } 
}

// 0 = fall, 1 == stay, 2 == destroy
const updateSand = (grid, newGrid, x, y) => {
    const total = checkNeighbours(x, y, [SAND]);
    if (total < 2 || total > 3) {
        setGrid(newGrid, x, y, 0)
        return
    }
    setGrid(newGrid, x, y, 1)
}

const updateEmpty = (grid, newGrid, x, y) => {
    const total = checkNeighbours(x, y, [SAND]);
    if (total === 3) {
        setGrid(newGrid, x, y, 1)
    }
}   

const updateGrid = () => {
    const newGrid = create2DArray(width, height);
    for (x = 0; x < grid.length; x++) {
        for (y = 0; y < grid[x].length; y++) {
            switch (grid[x][y]) {
                case 1:
                    updateSand(grid, newGrid, x, y);
                    break;
                default:
                    updateEmpty(grid, newGrid, x, y);
                    break;
            }

        }
    }
    return newGrid;
}

const drawSand = (ctx, x, y, type) => {
    ctx.fillStyle = "Black";
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

const draw = (ctx, grid) => {
    for (x = 0; x < grid.length; x++) {
        for (y = 0; y < grid[x].length; y++) {
            switch (grid[x][y]) {
                case 1:
                    drawSand(ctx, x, y);
                    break;
            }
        }
    }
}
const deltaTime = () => {
    return Date.now() - lastUpdate;
}
/**
 * Main animation handler
 */
const anim = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (start && deltaTime() > timeToLive) {
        grid = updateGrid();    
        lastUpdate = Date.now();
    }
    draw(ctx, grid)

    window.requestAnimationFrame(anim);
}

/**
 * Spawn Handlers
 */
let spawnX;
let spawnY;
let spawner = null;

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    e.preventDefault();
    console.log()
    spawnX = ((e.clientX - rect.left) / BLOCK_SIZE) | 0;
    spawnY = ((e.clientY - rect.top) / BLOCK_SIZE) | 0;
    console.log(e.clientX, e.clientY, spawnX, spawnY, rect)
    setGrid(grid, spawnX, spawnY, type);
    spawner = setInterval(() => {
        setGrid(grid, spawnX, spawnY, type);
    }, 10);
})

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    spawnX = ((e.clientX - rect.left) / BLOCK_SIZE) | 0;
    spawnY = ((e.clientY - rect.top) / BLOCK_SIZE) | 0;
})

canvas.addEventListener('mouseup', (e) => {
    clearInterval(spawner);
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