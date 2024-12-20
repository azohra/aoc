const input = await Deno.readTextFile(new URL("./input.txt", import.meta.url));

type Grid = string[][];

const parseInput = (input: string): Grid => {
    return input.trim().split("\n").map(line => line.split(""));
};

const findXMAS = (grid: Grid): number => {
    const directions = [
        [0, 1],   // right
        [1, 0],   // down
        [1, 1],   // diagonal down-right
        [-1, 1],  // diagonal up-right
        [0, -1],  // left
        [-1, 0],  // up
        [-1, -1], // diagonal up-left
        [1, -1]   // diagonal down-left
    ];

    let count = 0;
    const word = "XMAS";

    for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[0].length; col++) {
            for (const [dx, dy] of directions) {
                let match = true;
                for (let i = 0; i < word.length; i++) {
                    const newRow = row + i * dx;
                    const newCol = col + i * dy;
                    if (
                        newRow < 0 || newRow >= grid.length ||
                        newCol < 0 || newCol >= grid[0].length ||
                        grid[newRow][newCol] !== word[i]
                    ) {
                        match = false;
                        break;
                    }
                }
                if (match) count++;
            }
        }
    }

    return count;
};

const checkMAS = (grid: Grid, startRow: number, startCol: number, dx: number, dy: number): boolean => {
    const forward = ['M', 'A', 'S'];
    const backward = ['S', 'A', 'M'];
    let isForward = true;
    let isBackward = true;
    
    for (let i = 0; i < 3; i++) {
        const row = startRow + (i * dx);
        const col = startCol + (i * dy);
        
        if (row < 0 || row >= grid.length || col < 0 || col >= grid[0].length) {
            return false;
        }
        
        const char = grid[row][col];
        if (char !== forward[i]) isForward = false;
        if (char !== backward[i]) isBackward = false;
        
        if (!isForward && !isBackward) return false;
    }
    
    return isForward || isBackward;
};

const findXMASPatterns = (grid: Grid): number => {
    let count = 0;
    const rows = grid.length;
    const cols = grid[0].length;

    for (let row = 1; row < rows - 1; row++) {
        for (let col = 1; col < cols - 1; col++) {
            if (grid[row][col] !== 'A') continue;

            const directions = [
                [[-1, -1], [1, 1], [-1, 1], [1, -1]]
            ];

            for (const [topLeft, bottomRight, topRight, bottomLeft] of directions) {
                if (checkMAS(grid, row + topLeft[0], col + topLeft[1], 
                           (bottomRight[0] - topLeft[0])/2, 
                           (bottomRight[1] - topLeft[1])/2)) {
                    if (checkMAS(grid, row + topRight[0], col + topRight[1],
                               (bottomLeft[0] - topRight[0])/2,
                               (bottomLeft[1] - topRight[1])/2)) {
                        count++;
                    }
                }
            }
        }
    }
    
    return count;
};

const pt1 = (input: string): number => {
    const grid = parseInput(input);
    return findXMAS(grid);
};

const pt2 = (input: string): number => {
    const grid = parseInput(input);
    return findXMASPatterns(grid);
};

if (import.meta.main) {
    console.log("Answer (P1):", pt1(input));
    console.log("Answer (P2):", pt2(input));
}
