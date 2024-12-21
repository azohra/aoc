const input = await Deno.readTextFile(new URL("./input.txt", import.meta.url));

type Coordinate = [number, number];
type CellSet = Coordinate[];
type Region = {
    plant: string;
    cells: CellSet;
    area: number;
    perimeter: number;
    sides: number;
};

const parseInput = (input: string): string[][] => {
    return input.trim().split('\n').map(row => row.split(''));
};

const search = (
    data: (string | null)[][],
    x: number,
    y: number,
    plant: string,
    acc: CellSet = []
): CellSet => {
    if (data[y]?.[x] !== plant) {
        return acc;
    }

    data[y][x] = null;
    acc.push([x, y]);

    search(data, x + 1, y, plant, acc);
    search(data, x - 1, y, plant, acc);
    search(data, x, y + 1, plant, acc);
    search(data, x, y - 1, plant, acc);

    return acc;
};

const hasTopFence = ([x, y]: Coordinate, cells: CellSet): boolean =>
    !cells.some(([cx, cy]) => cx === x && cy === y - 1);

const hasBottomFence = ([x, y]: Coordinate, cells: CellSet): boolean =>
    !cells.some(([cx, cy]) => cx === x && cy === y + 1);

const hasLeftFence = ([x, y]: Coordinate, cells: CellSet): boolean =>
    !cells.some(([cx, cy]) => cx === x - 1 && cy === y);

const hasRightFence = ([x, y]: Coordinate, cells: CellSet): boolean =>
    !cells.some(([cx, cy]) => cx === x + 1 && cy === y);

const getPerimeter = (cells: CellSet): number =>
    cells.reduce(
        (sum, cell) =>
            sum +
            Number(hasTopFence(cell, cells)) +
            Number(hasBottomFence(cell, cells)) +
            Number(hasLeftFence(cell, cells)) +
            Number(hasRightFence(cell, cells)),
        0
    );

const getSides = (cells: CellSet): number => {
    const sides: Record<string, Record<number, Set<number>>> = {
        lefts: {},
        rights: {},
        tops: {},
        bottoms: {},
    };

    for (const [x, y] of cells) {
        if (hasTopFence([x, y], cells)) {
            sides.tops[y] ??= new Set();
            sides.tops[y].add(x);
        }

        if (hasBottomFence([x, y], cells)) {
            sides.bottoms[y + 1] ??= new Set();
            sides.bottoms[y + 1].add(x);
        }

        if (hasLeftFence([x, y], cells)) {
            sides.lefts[x] ??= new Set();
            sides.lefts[x].add(y);
        }

        if (hasRightFence([x, y], cells)) {
            sides.rights[x + 1] ??= new Set();
            sides.rights[x + 1].add(y);
        }
    }

    let result = 0;

    for (const orientations of Object.values(sides)) {
        for (const positions of Object.values(orientations)) {
            ++result;

            if (positions.size < 2) {
                continue;
            }

            const sortedPositions = [...positions].sort((a, b) => a - b);

            for (let i = 1; i < sortedPositions.length; ++i) {
                if (sortedPositions[i] - sortedPositions[i - 1] > 1) {
                    ++result;
                }
            }
        }
    }

    return result;
};

const findRegions = (data: (string | null)[][]): Region[] => {
    const regions: Region[] = [];

    while (data.some(row => row.some(cell => cell !== null))) {
        const y = data.findIndex(row => row.some(cell => cell !== null));
        const x = data[y].findIndex(cell => cell !== null);
        const plant = data[y][x] as string;
        const cells = search(data, x, y, plant);

        regions.push({
            plant,
            cells,
            area: cells.length,
            perimeter: getPerimeter(cells),
            sides: getSides(cells),
        });
    }

    return regions;
};

const pt1 = (input: string): number => {
    const data = parseInput(input);
    const dataCopy = data.map(row => [...row]);
    const regions = findRegions(dataCopy);
    return regions.reduce((sum, region) => sum + region.area * region.perimeter, 0);
};

const pt2 = (input: string): number => {
    const data = parseInput(input);
    const dataCopy = data.map(row => [...row]);
    const regions = findRegions(dataCopy);
    return regions.reduce((sum, region) => sum + region.area * region.sides, 0);
};

if (import.meta.main) {
    console.log("Answer (P1):", pt1(input));
    console.log("Answer (P2):", pt2(input));
}
