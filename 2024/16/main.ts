const input = await Deno.readTextFile(new URL("./input.txt", import.meta.url));

type Direction = {
    rowDelta: number;
    colDelta: number;
};

type Position = {
    row: number;
    col: number;
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

const solveMaze = (grid: string[][]): { part1: number; part2: number } => {
    const height = grid.length;
    const width = grid[0].length;
    
    const directions: Direction[] = [
        { rowDelta: 0, colDelta: 1 },  // East
        { rowDelta: 1, colDelta: 0 },  // South
        { rowDelta: 0, colDelta: -1 }, // West
        { rowDelta: -1, colDelta: 0 }  // North
    ];
    
    const { start, end } = findStartAndEnd(grid);
    
    const INFINITY = Number.POSITIVE_INFINITY;
    const distances: number[][][] = Array.from({ length: height }, () =>
        Array.from({ length: width }, () => Array(4).fill(INFINITY))
    );
    
    distances[start.row][start.col][0] = 0; // start facing East
    
    // Use a binary heap for the priority queue
    class PriorityQueue {
        private heap: [number, number, number, number][] = [];
        
        push(item: [number, number, number, number]): void {
            this.heap.push(item);
            this.bubbleUp(this.heap.length - 1);
        }
        
        pop(): [number, number, number, number] | undefined {
            if (this.heap.length === 0) return undefined;
            const top = this.heap[0];
            const bottom = this.heap.pop()!;
            if (this.heap.length > 0) {
                this.heap[0] = bottom;
                this.bubbleDown(0);
            }
            return top;
        }
        
        private bubbleUp(index: number): void {
            while (index > 0) {
                const parentIndex = Math.floor((index - 1) / 2);
                if (this.heap[parentIndex][0] <= this.heap[index][0]) break;
                [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
                index = parentIndex;
            }
        }
        
        private bubbleDown(index: number): void {
            while (true) {
                let smallest = index;
                const left = 2 * index + 1;
                const right = 2 * index + 2;
                if (left < this.heap.length && this.heap[left][0] < this.heap[smallest][0]) smallest = left;
                if (right < this.heap.length && this.heap[right][0] < this.heap[smallest][0]) smallest = right;
                if (smallest === index) break;
                [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
                index = smallest;
            }
        }
        
        get length(): number {
            return this.heap.length;
        }
    }
    
    const priorityQueue = new PriorityQueue();
    priorityQueue.push([0, start.row, start.col, 0]);
    
    function updateDistance(cost: number, row: number, col: number, direction: number) {
        if (cost < distances[row][col][direction]) {
            distances[row][col][direction] = cost;
            priorityQueue.push([cost, row, col, direction]);
        }
    }
    
    // Dijkstra's algorithm with modifications for turning costs
    while (priorityQueue.length > 0) {
        const [currentCost, row, col, direction] = priorityQueue.pop()!;
        if (distances[row][col][direction] < currentCost) continue;
        
        // Move forward
        const nextRow = row + directions[direction].rowDelta;
        const nextCol = col + directions[direction].colDelta;
        if (nextRow >= 0 && nextRow < height && nextCol >= 0 && nextCol < width && grid[nextRow][nextCol] !== '#') {
            updateDistance(currentCost + 1, nextRow, nextCol, direction);
        }
        
        // Turn left (cost: 1000)
        const leftDirection = (direction + 3) % 4;
        updateDistance(currentCost + 1000, row, col, leftDirection);
        
        // Turn right (cost: 1000)
        const rightDirection = (direction + 1) % 4;
        updateDistance(currentCost + 1000, row, col, rightDirection);
    }
    
    // Find the best cost to reach the end
    let bestCost = INFINITY;
    for (let direction = 0; direction < 4; direction++) {
        if (distances[end.row][end.col][direction] < bestCost) {
            bestCost = distances[end.row][end.col][direction];
        }
    }
    
    // Backtrack to find the optimal path
    const isOnBestPath: boolean[][][] = Array.from({ length: height }, () =>
        Array.from({ length: width }, () => Array(4).fill(false))
    );
    
    const pathQueue: [number, number, number][] = [];
    for (let direction = 0; direction < 4; direction++) {
        if (distances[end.row][end.col][direction] === bestCost) {
            isOnBestPath[end.row][end.col][direction] = true;
            pathQueue.push([end.row, end.col, direction]);
        }
    }
    
    while (pathQueue.length > 0) {
        const [row, col, direction] = pathQueue.shift()!;
        const currentDistance = distances[row][col][direction];
        
        // Check previous position
        const prevRow = row - directions[direction].rowDelta;
        const prevCol = col - directions[direction].colDelta;
        if (prevRow >= 0 && prevRow < height && prevCol >= 0 && prevCol < width && grid[prevRow][prevCol] !== '#') {
            if (distances[prevRow][prevCol][direction] === currentDistance - 1 && !isOnBestPath[prevRow][prevCol][direction]) {
                isOnBestPath[prevRow][prevCol][direction] = true;
                pathQueue.push([prevRow, prevCol, direction]);
            }
        }
        
        // Check left turn
        const fromLeftDirection = (direction + 1) % 4;
        if (distances[row][col][fromLeftDirection] === currentDistance - 1000 && !isOnBestPath[row][col][fromLeftDirection]) {
            isOnBestPath[row][col][fromLeftDirection] = true;
            pathQueue.push([row, col, fromLeftDirection]);
        }
        
        // Check right turn
        const fromRightDirection = (direction + 3) % 4;
        if (distances[row][col][fromRightDirection] === currentDistance - 1000 && !isOnBestPath[row][col][fromRightDirection]) {
            isOnBestPath[row][col][fromRightDirection] = true;
            pathQueue.push([row, col, fromRightDirection]);
        }
    }
    
    // Count unique tiles on the optimal path
    const optimalTiles = new Set<string>();
    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            for (let direction = 0; direction < 4; direction++) {
                if (isOnBestPath[row][col][direction]) {
                    if (grid[row][col] !== '#') {
                        optimalTiles.add(`${row},${col}`);
                    }
                    break;
                }
            }
        }
    }
    
    return { part1: bestCost, part2: optimalTiles.size };
}

const pt1 = (input: string): number => {
    const grid = parseInput(input);
    return solveMaze(grid).part1;
};

const pt2 = (input: string): number => {
    const grid = parseInput(input);
    return solveMaze(grid).part2;
};

if (import.meta.main) {
    console.log("Answer (P1):", pt1(input));
    console.log("Answer (P2):", pt2(input));
}
