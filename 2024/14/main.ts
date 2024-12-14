const input = await Deno.readTextFile(new URL("./input.txt", import.meta.url));

interface Robot {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const parseInput = (input: string): Robot[] => {
  return input.trim().split('\n').map(line => {
    const [pos, vel] = line.split(' ');
    const [x, y] = pos.slice(2).split(',').map(Number);
    const [vx, vy] = vel.slice(2).split(',').map(Number);
    return { x, y, vx, vy };
  });
};

const simulate = (robots: Robot[], width: number, height: number): Robot[] => {
  return robots.map(robot => ({
    x: ((robot.x + robot.vx) + width * 1000000) % width,
    y: ((robot.y + robot.vy) + height * 1000000) % height,
    vx: robot.vx,
    vy: robot.vy
  }));
};

const robotsInQuadrants = (robots: Robot[], width: number, height: number): [number, number, number, number] => {
  const midX = Math.floor(width / 2);
  const midY = Math.floor(height / 2);
  const counts: [number, number, number, number] = [0, 0, 0, 0];

  for (const robot of robots) {
    if (robot.x === midX || robot.y === midY) continue;
    const quadIndex = (robot.x < midX ? 0 : 1) + (robot.y < midY ? 0 : 2);
    counts[quadIndex]++;
  }

  return counts;
};

const calculateDensity = (robots: Robot[]): number => {
  let totalDistance = 0;
  let pairCount = 0;

  for (let i = 0; i < robots.length; i++) {
    for (let j = i + 1; j < robots.length; j++) {
      const dx = robots[i].x - robots[j].x;
      const dy = robots[i].y - robots[j].y;
      totalDistance += Math.sqrt(dx * dx + dy * dy);
      pairCount++;
    }
  }

  return totalDistance / pairCount;
};

export const solvePart1 = (input: string): number => {
  const robots = parseInput(input);
  const width = 101;
  const height = 103;
  
  let currentState = robots;
  for (let i = 0; i < 100; i++) {
    currentState = simulate(currentState, width, height);
  }

  const [q1, q2, q3, q4] = robotsInQuadrants(currentState, width, height);
  return q1 * q2 * q3 * q4;
};

export const solvePart2 = (input: string): number => {
  const robots = parseInput(input);
  const width = 101;
  const height = 103;
  
  let minDensity = Infinity;
  let minDensityTime = 0;
  let currentState = robots;

  for (let t = 0; t < 20000; t++) {
    const density = calculateDensity(currentState);
    if (density < minDensity) {
      minDensity = density;
      minDensityTime = t;
    }
    currentState = simulate(currentState, width, height);
  }

  return minDensityTime;
};

const visualizePattern = (robots: Robot[], width: number, height: number): string => {
  const grid = Array.from({ length: height }, () => Array(width).fill('.'));
  
  for (const robot of robots) {
    const x = Math.floor(robot.x);
    const y = Math.floor(robot.y);
    if (x >= 0 && x < width && y >= 0 && y < height) {
      grid[y][x] = '#';
    }
  }
  
  return grid.map(row => row.join('')).join('\n');
};

async function solvePuzzle() {
  console.log("Answer (P1):", solvePart1(input));
  
  // For Part 2, first get the time
  const messageTime = solvePart2(input);
  
  // Then simulate up to that time to show the message
  const robots = parseInput(input);
  let currentState = robots;
  for (let t = 0; t < messageTime; t++) {
    currentState = simulate(currentState, 101, 103);
  }
  
  console.log("Answer (P2):");
  console.log(visualizePattern(currentState, 101, 103));
}

if (import.meta.main) {
  solvePuzzle();
}
