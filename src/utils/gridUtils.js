/*
    Space checks
*/
export const checkAbove = (x, y, types) => y - 1 > 0 && types.includes(grid[x][y - 1])
export const checkAboveLeft = (x, y, types) => y - 1 > 0 && x - 1 >= leftWall && types.includes(grid[x-1][y-1])
export const checkAboveRight = (x, y, types) => y - 1 > 0 && x + 1 < rightWall && types.includes(grid[x+1][y-1])
export const checkBottom = (x, y, types) => y + 1 <= floor && types.includes(grid[x][y + 1])
export const checkBottomLeft = (x, y, types) => x - 1 >= leftWall && types.includes(grid[x-1][y+1])
export const checkBottomRight = (x, y, types) => x + 1 < rightWall && types.includes(grid[x+1][y+1])
export const checkLeft = (x, y, types) => x - 1 >= leftWall && types.includes(grid[x-1][y])
export const checkRight = (x, y, types) => x + 1 < rightWall && types.includes(grid[x+1][y])

export const checkNeighbours = (x, y, types) => {
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