const input = await Deno.readTextFile(new URL("./input.txt", import.meta.url));

type Point = { x: number; y: number };
type Antenna = Point & { frequency: string };

const parseInput = (input: string): string[][] => {
    return input.trim().split('\n').map(line => line.split(''));
};

const findAntennas = (grid: string[][]): Antenna[] => {
    const antennas: Antenna[] = [];
    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[y].length; x++) {
            if (grid[y][x] !== '.' && grid[y][x] !== ' ') {
                antennas.push({ x, y, frequency: grid[y][x] });
            }
        }
    }
    return antennas;
};

const groupAntennasByFrequency = (antennas: Antenna[]): Map<string, Antenna[]> => {
    const groups = new Map<string, Antenna[]>();
    for (const antenna of antennas) {
        if (!groups.has(antenna.frequency)) {
            groups.set(antenna.frequency, []);
        }
        groups.get(antenna.frequency)!.push(antenna);
    }
    return groups;
};

const isCollinear = (p1: Point, p2: Point, p3: Point): boolean => {
    const area = p1.x * (p2.y - p3.y) + 
                p2.x * (p3.y - p1.y) + 
                p3.x * (p1.y - p2.y);
    return Math.abs(area) < 0.0001;
};

const findAntinodes = (antennas: Antenna[], gridWidth: number, gridHeight: number, useDistanceRule: boolean): Set<string> => {
    const antinodes = new Set<string>();
    
    for (let x = 0; x < gridWidth; x++) {
        for (let y = 0; y < gridHeight; y++) {
            const point = { x, y };
            
            for (let i = 0; i < antennas.length; i++) {
                for (let j = i + 1; j < antennas.length; j++) {
                    if (isCollinear(point, antennas[i], antennas[j])) {
                        if (!useDistanceRule || checkDistanceRule(point, antennas[i], antennas[j])) {
                            antinodes.add(`${x},${y}`);
                        }
                    }
                }
            }
        }
    }
    
    if (!useDistanceRule && antennas.length > 1) {
        for (const antenna of antennas) {
            antinodes.add(`${antenna.x},${antenna.y}`);
        }
    }
    
    return antinodes;
};

const checkDistanceRule = (point: Point, a1: Point, a2: Point): boolean => {
    const d1 = Math.sqrt(Math.pow(point.x - a1.x, 2) + Math.pow(point.y - a1.y, 2));
    const d2 = Math.sqrt(Math.pow(point.x - a2.x, 2) + Math.pow(point.y - a2.y, 2));
    return Math.abs(d1 * 2 - d2) < 0.0001 || Math.abs(d2 * 2 - d1) < 0.0001;
};

const countAntinodes = (grid: string[][], useDistanceRule: boolean): number => {
    const antennas = findAntennas(grid);
    const groups = groupAntennasByFrequency(antennas);
    const allAntinodes = new Set<string>();

    for (const [_, group] of groups.entries()) {
        if (group.length >= 2) {
            const groupAntinodes = findAntinodes(group, grid[0].length, grid.length, useDistanceRule);
            for (const antinode of groupAntinodes) {
                allAntinodes.add(antinode);
            }
        }
    }

    return allAntinodes.size;
};

const pt1 = (input: string): number => {
    const grid = parseInput(input);
    return countAntinodes(grid, true);
};

const pt2 = (input: string): number => {
    const grid = parseInput(input);
    return countAntinodes(grid, false);
};

if (import.meta.main) {
    console.log("Answer (P1):", pt1(input));
    console.log("Answer (P2):", pt2(input));
}
