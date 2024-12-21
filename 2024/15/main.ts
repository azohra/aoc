const input = await Deno.readTextFile(new URL("./input.txt", import.meta.url));

type Coordinates = [number, number];
type WarehouseGrid = ('@' | '.' | '#' | 'O')[][];
type WideWarehouseGrid = ('@' | '.' | '#' | '[' | ']')[][];
type Direction = '^' | 'v' | '<' | '>';

const parseInput = (input: string): [WarehouseGrid, Direction[]] => {
  const [mapData, movementData] = input.trim().split('\n\n');
  
  const map = mapData.split('\n').map((x) => x.split('')) as WarehouseGrid;
  const movements = movementData.replaceAll('\n', '').split('') as Direction[];
  
  return [map, movements];
};

const getStartingPosition = (
  map: WarehouseGrid | WideWarehouseGrid
): Coordinates => {
  for (let y = 0; y < map.length; y++) {
    const x = map[y].indexOf('@');
    if (x !== -1) {
      return [x, y];
    }
  }
  throw new Error("Starting position '@' not found in the map");
};

const movementFunctions1 = (
  map: WarehouseGrid
): Record<Direction, (arg0: Coordinates) => Coordinates> => ({
  '^': ([x, y]: Coordinates): Coordinates => {
    const currentCol = map.map((row) => row[x]);
    const closestWall = currentCol.lastIndexOf('#', y - 1);
    const closestSpace = currentCol.lastIndexOf('.', y - 1);

    if (closestSpace < closestWall) {
      return [x, y];
    }

    for (let i = closestSpace; i < y; ++i) {
      map[i][x] = map[i + 1][x];
    }
    map[y][x] = '.';

    return [x, y - 1];
  },

  'v': ([x, y]: Coordinates): Coordinates => {
    const currentCol = map.map((row) => row[x]);
    const closestWall = currentCol.indexOf('#', y + 1);
    const closestSpace = currentCol.indexOf('.', y + 1);

    if (closestSpace < 0 || closestSpace > closestWall) {
      return [x, y];
    }

    for (let i = closestSpace; i > y; --i) {
      map[i][x] = map[i - 1][x];
    }
    map[y][x] = '.';

    return [x, y + 1];
  },

  '<': ([x, y]: Coordinates): Coordinates => {
    const closestWall = map[y].lastIndexOf('#', x - 1);
    const closestSpace = map[y].lastIndexOf('.', x - 1);

    if (closestSpace < closestWall) {
      return [x, y];
    }

    map[y].splice(closestSpace, 1);
    map[y].splice(x, 0, '.');

    return [x - 1, y];
  },

  '>': ([x, y]: Coordinates): Coordinates => {
    const closestWall = map[y].indexOf('#', x + 1);
    const closestSpace = map[y].indexOf('.', x + 1);

    if (closestSpace < 0 || closestSpace > closestWall) {
      return [x, y];
    }

    map[y].splice(closestSpace, 1);
    map[y].splice(x, 0, '.');

    return [x + 1, y];
  },
});

const movementFunctions2 = (
  map: WideWarehouseGrid
): Record<Direction, (arg0: Coordinates) => Coordinates> => ({
  '^': ([x, y]: Coordinates): Coordinates => {
    const charAboveRobot = map[y - 1][x];

    if (charAboveRobot === '#') {
      return [x, y];
    }

    if (charAboveRobot === '.') {
      map[y - 1][x] = '@';
      map[y][x] = '.';
      return [x, y - 1];
    }

    let doNotMove = false;

    let boxesToMove = [
      `${x} ${y - 1}`,
      `${charAboveRobot === '[' ? x + 1 : x - 1} ${y - 1}`,
    ];

    for (let c = 0; c < boxesToMove.length; ++c) {
      const [cx, cy] = boxesToMove[c].split(' ').map(Number);
      const charAbove = map[cy - 1][cx];

      doNotMove ||= charAbove === '#';

      if (charAbove === '[') {
        boxesToMove.push(`${cx} ${cy - 1}`, `${cx + 1} ${cy - 1}`);
      } else if (charAbove === ']') {
        boxesToMove.push(`${cx - 1} ${cy - 1}`, `${cx} ${cy - 1}`);
      }

      boxesToMove = [...new Set(boxesToMove)];
    }

    if (doNotMove) {
      return [x, y];
    }

    boxesToMove
      .sort((a, b) => {
        const [ax, ay] = a.split(' ').map(Number);
        const [bx, by] = b.split(' ').map(Number);
        return ay - by || ax - bx;
      })
      .forEach((coords) => {
        const [cx, cy] = coords.split(' ').map(Number);
        map[cy - 1][cx] = map[cy][cx];
        map[cy][cx] = '.';
      });

    map[y][x] = '.';

    return [x, y - 1];
  },

  'v': ([x, y]: Coordinates): Coordinates => {
    const charBelowRobot = map[y + 1][x];

    if (charBelowRobot === '#') {
      return [x, y];
    }

    if (charBelowRobot === '.') {
      map[y + 1][x] = '@';
      map[y][x] = '.';
      return [x, y + 1];
    }

    let doNotMove = false;

    let boxesToMove = [
      `${x} ${y + 1}`,
      `${charBelowRobot === '[' ? x + 1 : x - 1} ${y + 1}`,
    ];

    for (let c = 0; c < boxesToMove.length; ++c) {
      const [cx, cy] = boxesToMove[c].split(' ').map(Number);
      const charBelow = map[cy + 1][cx];

      doNotMove ||= charBelow === '#';

      if (charBelow === '[') {
        boxesToMove.push(`${cx} ${cy + 1}`, `${cx + 1} ${cy + 1}`);
      } else if (charBelow === ']') {
        boxesToMove.push(`${cx - 1} ${cy + 1}`, `${cx} ${cy + 1}`);
      }

      boxesToMove = [...new Set(boxesToMove)];
    }

    if (doNotMove) {
      return [x, y];
    }

    boxesToMove
      .sort((a, b) => {
        const [ax, ay] = a.split(' ').map(Number);
        const [bx, by] = b.split(' ').map(Number);
        return by - ay || ax - bx;
      })
      .forEach((coords) => {
        const [cx, cy] = coords.split(' ').map(Number);
        map[cy + 1][cx] = map[cy][cx];
        map[cy][cx] = '.';
      });

    map[y][x] = '.';

    return [x, y + 1];
  },

  '<': ([x, y]: Coordinates): Coordinates => {
    const closestWall = map[y].lastIndexOf('#', x - 1);
    const closestSpace = map[y].lastIndexOf('.', x - 1);

    if (closestSpace < closestWall) {
      return [x, y];
    }

    map[y].splice(closestSpace, 1);
    map[y].splice(x, 0, '.');

    return [x - 1, y];
  },

  '>': ([x, y]: Coordinates): Coordinates => {
    const closestWall = map[y].indexOf('#', x + 1);
    const closestSpace = map[y].indexOf('.', x + 1);

    if (closestSpace < 0 || closestSpace > closestWall) {
      return [x, y];
    }

    map[y].splice(closestSpace, 1);
    map[y].splice(x, 0, '.');

    return [x + 1, y];
  },
});

const solve = async <T extends WarehouseGrid | WideWarehouseGrid>(
  map: T,
  movements: Readonly<Direction[]>,
  part: 1 | 2
): Promise<T> => {
  const movementFunctions =
    part === 1
      ? movementFunctions1(map as WarehouseGrid)
      : movementFunctions2(map as WideWarehouseGrid);

  let position = getStartingPosition(map);

  for (let moveCount = 0; moveCount < movements.length; ++moveCount) {
    const direction = movements[moveCount];
    position = movementFunctions[direction](position);
  }

  return map;
};

const gpsSum = (map: WarehouseGrid | WideWarehouseGrid, char = 'O'): number =>
  map.reduce(
    (sum, row, i) =>
      sum +
      row.reduce(
        (sum2, col, j) => (col === char ? sum2 + (100 * i + j) : sum2),
        0
      ),
    0
  );

const createWideMap = (map: WarehouseGrid): WideWarehouseGrid => {
  return map.map(row => 
    row.join('')
      .replaceAll('#', '##')
      .replaceAll('O', '[]')
      .replaceAll('.', '..')
      .replaceAll('@', '@.')
      .split('')
  ) as WideWarehouseGrid;
};

const pt1 = async (input: string): Promise<number> => {
  const [map, movements] = parseInput(input);
  return gpsSum(await solve(structuredClone(map), movements, 1));
};

const pt2 = async (input: string): Promise<number> => {
  const [map, movements] = parseInput(input);
  const wideMap = createWideMap(map);
  return gpsSum(await solve(structuredClone(wideMap), movements, 2), '[');
};

if (import.meta.main) {
  const run = async () => {
    console.log("Answer (P1):", await pt1(input));
    console.log("Answer (P2):", await pt2(input));
  };
  run();
}
