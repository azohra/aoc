const input = await Deno.readTextFile(new URL("./input.txt", import.meta.url));

type Schematic = string[];

const parseInput = (input: string): Schematic[] => {
  return input.trim().split('\n\n').map(item => item.split('\n'));
};

const isKey = (schematic: Schematic): boolean => {
  return schematic[0].startsWith('#');
};

const combine = (key: Schematic, lock: Schematic): boolean => {
  return !key.some((row, i) => 
    row.split('').some((char, j) => char === '#' && lock[i][j] === '#')
  );
};

const pt1 = (input: string): number => {
  const schematics = parseInput(input);
  const keys = schematics.filter(isKey);
  const locks = schematics.filter(s => !isKey(s));

  return keys.reduce((validPairs, key) => 
    validPairs + locks.filter(lock => combine(key, lock)).length, 0
  );
};


if (import.meta.main) {
  console.log("Answer (P1):", pt1(input));
}
