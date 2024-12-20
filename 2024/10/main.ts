const input = await Deno.readTextFile(new URL("./input.txt", import.meta.url));

type Grid = number[][];
type Position = [number, number];

const parseInput = (input: string): Grid => {
    return input.trim().split('\n').map(line => line.split('').map(Number));
};

const findTrailheads = (grid: Grid): Position[] => {
    const trailheads: Position[] = [];
    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[y].length; x++) {
            if (grid[y][x] === 0) {
                trailheads.push([y, x]);
            }
        }
    }
    return trailheads;
};

const calculateTrailheadScore = (grid: Grid, start: Position): number => {
    const visited = new Set<string>();
    const queue: [number, number, number][] = [[start[0], start[1], 0]];
    let score = 0;

    while (queue.length > 0) {
        const [y, x, height] = queue.shift()!;
        const key = `${y},${x}`;

        if (visited.has(key)) continue;
        visited.add(key);

        if (height === 9) {
            score++;
            continue;
        }

        const directions: Position[] = [[0, 1], [1, 0], [0, -1], [-1, 0]];
        for (const [dy, dx] of directions) {
            const newY = y + dy;
            const newX = x + dx;
            if (
                newY >= 0 && newY < grid.length &&
                newX >= 0 && newX < grid[0].length &&
                grid[newY][newX] === height + 1
            ) {
                queue.push([newY, newX, height + 1]);
            }
        }
    }

    return score;
};

const calculateTrailheadRating = (grid: Grid, start: Position): number => {
    const cache = new Map<string, number>();

    function dfs(y: number, x: number, height: number): number {
        if (y < 0 || y >= grid.length || x < 0 || x >= grid[0].length || grid[y][x] !== height) {
            return 0;
        }

        if (height === 9) {
            return 1;
        }

        const key = `${y},${x},${height}`;
        if (cache.has(key)) {
            return cache.get(key)!;
        }

        let count = 0;
        const directions: Position[] = [[0, 1], [1, 0], [0, -1], [-1, 0]];
        for (const [dy, dx] of directions) {
            count += dfs(y + dy, x + dx, height + 1);
        }

        cache.set(key, count);
        return count;
    }

    return dfs(start[0], start[1], 0);
};

const pt1 = (input: string): number => {
    const grid = parseInput(input);
    const trailheads = findTrailheads(grid);
    return trailheads.reduce((sum, trailhead) => 
        sum + calculateTrailheadScore(grid, trailhead), 0);
};

const pt2 = (input: string): number => {
    const grid = parseInput(input);
    const trailheads = findTrailheads(grid);
    return trailheads.reduce((sum, trailhead) => 
        sum + calculateTrailheadRating(grid, trailhead), 0);
};

if (import.meta.main) {
    console.log("Answer (P1):", pt1(input));
    console.log("Answer (P2):", pt2(input));
}
