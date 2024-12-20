const input = await Deno.readTextFile(new URL("./input.txt", import.meta.url));

type Point = [number, number];

class Queue<T> {
  private items: T[] = [];
  
  enqueue(item: T): void {
    this.items.push(item);
  }
  
  dequeue(): T | undefined {
    return this.items.shift();
  }
  
  get size(): number {
    return this.items.length;
  }
}

const shortestPath = (start: Point, end: Point, corrupted: Set<string>): number => {
  const queue = new Queue<[Point, number]>();
  queue.enqueue([start, 0]);
  const visited = new Set<string>();

  const directions: Point[] = [[0, 1], [1, 0], [0, -1], [-1, 0]];

  while (queue.size > 0) {
    const [[x, y], steps] = queue.dequeue()!;

    if (x === end[0] && y === end[1]) {
      return steps;
    }

    const key = `${x},${y}`;
    if (visited.has(key)) continue;
    visited.add(key);

    for (const [dx, dy] of directions) {
      const nx = x + dx;
      const ny = y + dy;
      const newKey = `${nx},${ny}`;

      if (nx < 0 || ny < 0 || nx > 70 || ny > 70 || corrupted.has(newKey)) continue;

      queue.enqueue([[nx, ny], steps + 1]);
    }
  }

  return -1;
}

const pt1 = (input: string): number => {
  const corrupted = new Set<string>();
  const lines = input.trim().split("\n");
  
  for (let i = 0; i < Math.min(1024, lines.length); i++) {
    corrupted.add(lines[i]);
  }

  const start: Point = [0, 0];
  const end: Point = [70, 70];
  
  return shortestPath(start, end, corrupted);
};

const pt2 = (input: string): string => {
  const lines = input.trim().split("\n");
  const start: Point = [0, 0];
  const end: Point = [70, 70];
  
  for (let i = 0; i < lines.length; i++) {
    const corrupted = new Set<string>(lines.slice(0, i + 1));
    
    if (shortestPath(start, end, corrupted) === -1) {
      return lines[i];
    }
  }

  return "No solution found";
};

if (import.meta.main) {
  console.log("Answer (P1):", pt1(input));
  console.log("Answer (P2):", pt2(input));
}
