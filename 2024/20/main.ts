const input = await Deno.readTextFile(new URL("./input.txt", import.meta.url));

type Position = {
    row: number;
    col: number;
};

type Direction = {
    rowDelta: number;
    colDelta: number;
};

const parseInput = (input: string): string[][] => {
    return input.trim().split('\n').map(line => line.split(''));
};

const findStartAndEnd = (grid: string[][]): { start: Position; end: Position } => {
    const start: Position = { row: -1, col: -1 };
    const end: Position = { row: -1, col: -1 };

    for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
            if (grid[row][col] === 'S') {
                start.row = row;
                start.col = col;
            } else if (grid[row][col] === 'E') {
                end.row = row;
                end.col = col;
            }
            
            if (start.row !== -1 && end.row !== -1) {
                return { start, end };
            }
        }
    }
    
    throw new Error("Start or end position not found in the grid");
}

const bfs = (grid: string[][], start: Position): number[][] => {
    const height = grid.length;
    const width = grid[0].length;
    const dis: number[][] = Array.from({ length: height }, () => 
        Array(width).fill(Infinity));
    const queue: [number, number, number][] = [[start.row, start.col, 0]];
    dis[start.row][start.col] = 0;
    const directions: Direction[] = [
        { rowDelta: 1, colDelta: 0 },
        { rowDelta: -1, colDelta: 0 },
        { rowDelta: 0, colDelta: 1 },
        { rowDelta: 0, colDelta: -1 }
    ];

    while (queue.length > 0) {
        const [row, col, d] = queue.shift()!;
        if (d > dis[row][col]) continue;

        for (const { rowDelta, colDelta } of directions) {
            const newRow = row + rowDelta;
            const newCol = col + colDelta;
            if (newRow >= 0 && newRow < height && newCol >= 0 && newCol < width && 
                grid[newRow][newCol] !== '#' && d + 1 < dis[newRow][newCol]) {
                dis[newRow][newCol] = d + 1;
                queue.push([newRow, newCol, d + 1]);
            }
        }
    }
    return dis;
}

const findCheats = (grid: string[][], start: Position, end: Position, maxCheatLength: number): number => {
    const fromStart = bfs(grid, start);
    const fromEnd = bfs(grid, end);
    const height = grid.length;
    const width = grid[0].length;
    const normalTime = fromStart[end.row][end.col];
    const seen = new Set<string>();
    let count = 0;

    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            if (fromStart[row][col] === Infinity) continue;
            
            for (let cheatRow = 0; cheatRow < height; cheatRow++) {
                for (let cheatCol = 0; cheatCol < width; cheatCol++) {
                    if (fromEnd[cheatRow][cheatCol] === Infinity) continue;
                    
                    const cheatDist = Math.abs(row - cheatRow) + Math.abs(col - cheatCol);
                    if (cheatDist > 0 && cheatDist <= maxCheatLength) {
                        const totalTime = fromStart[row][col] + cheatDist + fromEnd[cheatRow][cheatCol];
                        const saved = normalTime - totalTime;
                        
                        if (saved >= 100) {
                            const key = `${row},${col}-${cheatRow},${cheatCol}`;
                            if (!seen.has(key)) {
                                seen.add(key);
                                count++;
                            }
                        }
                    }
                }
            }
        }
    }

    return count;
}

const pt1 = (input: string): number => {
    const grid = parseInput(input);
    const { start, end } = findStartAndEnd(grid);
    return findCheats(grid, start, end, 2);  // 2-step cheats
};

const pt2 = (input: string): number => {
    const grid = parseInput(input);
    const { start, end } = findStartAndEnd(grid);
    return findCheats(grid, start, end, 20);  // up to 20-step cheats
};

if (import.meta.main) {
    console.log("Answer (P1):", pt1(input));
    console.log("Answer (P2):", pt2(input));
}
