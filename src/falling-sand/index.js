// Size of our sand
const BLOCK_SIZE = 2;

const canvas = document.getElementById("sandCanvas")
const ctx = canvas.getContext("2d");

const width = canvas.width / BLOCK_SIZE;
const height = canvas.height / BLOCK_SIZE;

const floor = height - 1;
const leftWall = 0;
const rightWall = width - 1;
/**
 * Types
 * 2 = fire
 * 1 = sand
 */
const ERASE = 0;
const SAND = 1;
const FIRE = 2;
const CONCRETE = 3;
let type = SAND;


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
grid[0][0] = 1;

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
const setGrid = (grid, x, y, type, allowFlip) => {
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
    if (checkNeighbours(x, y, [FIRE]) > 0) {
        setGrid(newGrid, x, y, FIRE);
    } else if (y + 1 > floor) {
        setGrid(newGrid, x, y, SAND);
    } else if (checkBottom(x, y, [SAND, CONCRETE])) {
        if (!checkBottomLeft(x, y, [SAND, CONCRETE])) {
            setGrid(newGrid, x-1, y+1, SAND);
        } else if (!checkBottomRight(x, y, [SAND, CONCRETE])) {
            setGrid(newGrid, x+1, y+1, SAND);
        }
        else {
            setGrid(newGrid, x, y, SAND);
        }
    } else {
        setGrid(newGrid, x, y+1, SAND)
    }
}

const updateFire = (grid, newGrid, x, y) => {
    if (checkLeft(x, y, [SAND])) {
        newGrid[x-1][y] = FIRE;
    }
    if (checkRight(x, y, [SAND])) {
        newGrid[x+1][y] = FIRE;
    }
    if (y + 1 < floor) {
        newGrid[x][y+1] = FIRE;
    }
}

const updateConcrete = (grid, newGrid, x, y) => {
    setGrid(newGrid, x, y, CONCRETE);
}

const updateGrid = () => {
    const newGrid = create2DArray(width, height);
    for (x = 0; x < grid.length; x++) {
        for (y = 0; y < grid[x].length; y++) {
            switch (grid[x][y]) {
                case SAND:
                    updateSand(grid, newGrid, x, y);
                    break;
                case FIRE:
                    updateFire(grid, newGrid, x, y);
                    break;
                case CONCRETE:
                    updateConcrete(grid, newGrid, x, y);
                    break;
                default:
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

const drawFire = (ctx, x, y, type) => {
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

const drawConcrete = (ctx, x, y, type) => {
    ctx.fillStyle = "green";
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

const draw = (ctx, grid) => {
    for (x = 0; x < grid.length; x++) {
        for (y = 0; y < grid[x].length; y++) {
            switch (grid[x][y]) {
                case 1:
                    drawSand(ctx, x, y);
                    break;
                case 2:
                    drawFire(ctx, x, y);
                    break;
                case CONCRETE:
                    drawConcrete(ctx, x, y);
                    break;
                default:
                    break;
            }
        }
    }
}

/**
 * Main animation handler
 */
const anim = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    grid = updateGrid();    
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
        case 'f':
        case 'F':
            setFire();
            break;
        case 's':
        case 'S':
            setSand();
            break;
        case 'c':
        case 'C':
            setType(CONCRETE);
            break;
        case 'e':
        case 'E':
            setType(ERASE);
            break;
    }
})

window.requestAnimationFrame(anim);