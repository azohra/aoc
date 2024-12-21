const input = await Deno.readTextFile(new URL("./input.txt", import.meta.url));

type Robot = {
  x: number;
  y: number;
  vx: number;
  vy: number;
};

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

const simulateSteps = (robots: Robot[], width: number, height: number, steps: number): Robot[] => {
  let currentState = robots;
  for (let i = 0; i < steps; i++) {
    currentState = simulate(currentState, width, height);
  }
  return currentState;
};

const findMinDensityTime = (robots: Robot[], width: number, height: number, maxTime: number): number => {
  let minDensity = Infinity;
  let minDensityTime = 0;
  let currentState = robots;

  for (let t = 0; t < maxTime; t++) {
    const density = calculateDensity(currentState);
    if (density < minDensity) {
      minDensity = density;
      minDensityTime = t;
    }
    currentState = simulate(currentState, width, height);
  }

  return minDensityTime;
};

const pt1 = (input: string): number => {
  const robots = parseInput(input);
  const width = 101;
  const height = 103;
  const finalState = simulateSteps(robots, width, height, 100);
  const [q1, q2, q3, q4] = robotsInQuadrants(finalState, width, height);
  return q1 * q2 * q3 * q4;
};

const pt2 = (input: string): number => {
  const robots = parseInput(input);
  const width = 101;
  const height = 103;
  return findMinDensityTime(robots, width, height, 20000);
};

if (import.meta.main) {
  console.log("Answer (P1):", pt1(input));
  console.log("Answer (P2):", pt2(input));
}
