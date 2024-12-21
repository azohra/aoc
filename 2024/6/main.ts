const input = await Deno.readTextFile(new URL("./input.txt", import.meta.url));

type Position = [number, number];
type Direction = 'up' | 'right' | 'down' | 'left';

const parseInput = (input: string): string[][] => input.trim().split('\n').map(line => line.split(''));

const findGuardStart = (grid: string[][]): Position => {
    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[y].length; x++) {
            if (grid[y][x] === '^') return [x, y];
        }
    }
    throw new Error('Guard start position not found');
};

const moveGuard = (pos: Position, dir: Direction): Position => {
    const [x, y] = pos;
    const moves: Record<Direction, Position> = {
        'up': [x, y - 1],
        'right': [x + 1, y],
        'down': [x, y + 1],
        'left': [x - 1, y]
    };
    return moves[dir];
};

const turnRight = (dir: Direction): Direction => {
    const directions: Direction[] = ['up', 'right', 'down', 'left'];
    return directions[(directions.indexOf(dir) + 1) % 4];
};

const isOutOfBounds = (pos: Position, grid: string[][]): boolean => {
    const [x, y] = pos;
    return x < 0 || y < 0 || y >= grid.length || x >= grid[0].length;
};

const simulateGuardMovement = (grid: string[][], startPos: Position, countVisits: boolean): number => {
    let pos = startPos;
    let dir: Direction = 'up';
    const visited = new Set<string>();
    visited.add(pos.join(','));

    while (true) {
        const nextPos = moveGuard(pos, dir);
        if (isOutOfBounds(nextPos, grid)) {
            break;
        }
        if (grid[nextPos[1]][nextPos[0]] === '#') {
            dir = turnRight(dir);
        } else {
            pos = nextPos;
            if (countVisits) visited.add(pos.join(','));
        }
    }

    return visited.size;
};

const pt1 = (input: string): number => {
    const grid = parseInput(input);
    const startPos = findGuardStart(grid);
    return simulateGuardMovement(grid, startPos, true);
};

const findLoop = (grid: string[][], startPos: Position): boolean => {
    let pos = startPos;
    let dir: Direction = 'up';
    const visited = new Map<string, Set<Direction>>();
    const path = new Set<string>();
    
    while (true) {
        const posKey = pos.join(',');
        path.add(posKey);
        
        if (!visited.has(posKey)) {
            visited.set(posKey, new Set());
        }
        const dirSet = visited.get(posKey)!;
        
        if (dirSet.has(dir)) {
            return path.size >= 3;
        }
        dirSet.add(dir);
        
        const nextPos = moveGuard(pos, dir);
        if (isOutOfBounds(nextPos, grid)) {
            return false;
        }
        
        if (grid[nextPos[1]][nextPos[0]] === '#') {
            dir = turnRight(dir);
        } else {
            pos = nextPos;
        }
    }
};

const pt2 = (input: string): number => {
    const grid = parseInput(input);
    const startPos = findGuardStart(grid);
    let loopCount = 0;

    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[0].length; x++) {
            if (grid[y][x] !== '.' || (x === startPos[0] && y === startPos[1])) {
                continue;
            }

            const modifiedGrid = grid.map(row => [...row]);
            modifiedGrid[y][x] = '#';

            if (findLoop(modifiedGrid, startPos)) {
                loopCount++;
            }
        }
    }

    return loopCount;
};

if (import.meta.main) {
    console.log("Answer (P1):", pt1(input));
    console.log("Answer (P2):", pt2(input));
}
