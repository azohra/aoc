const input = await Deno.readTextFile(new URL("./input.txt", import.meta.url));

type StoneMap = Map<string, bigint>;

const parseInput = (input: string): StoneMap => {
    const stones = new Map<string, bigint>();
    input.trim().split(" ").forEach(stone => {
        stones.set(stone, (stones.get(stone) || 0n) + 1n);
    });
    return stones;
};

const transformStones = (stones: StoneMap): StoneMap => {
    const result = new Map<string, bigint>();
    
    for (const [stoneStr, count] of stones.entries()) {
        const stone = stoneStr === "0" ? "0" : stoneStr;
        
        if (stone === "0") {
            // Rule 1: 0 becomes 1
            result.set("1", (result.get("1") || 0n) + count);
        } else if (stone.length % 2 === 0) {
            // Rule 2: Split into two parts
            const mid = stone.length / 2;
            const left = stone.slice(0, mid);
            const right = stone.slice(mid);
            result.set(left, (result.get(left) || 0n) + count);
            result.set(right, (result.get(right) || 0n) + count);
        } else {
            // Rule 3: Multiply by 2024
            const newValue = (BigInt(stone) * 2024n).toString();
            result.set(newValue, (result.get(newValue) || 0n) + count);
        }
    }
    
    return result;
};

const getTotalStones = (stones: StoneMap): bigint => {
    return Array.from(stones.values()).reduce((a, b) => a + b, 0n);
};

const simulateBlinks = (stones: StoneMap, blinks: number): number => {
    let current = stones;
    
    for (let i = 0; i < blinks; i++) {
        current = transformStones(current);
        if ((i + 1) % 5 === 0) {
            console.log(`Completed ${i + 1} blinks, stone count: ${getTotalStones(current)}`);
        }
    }
    
    return Number(getTotalStones(current));
};

const pt1 = (input: string): number => {
    const stones = parseInput(input);
    return simulateBlinks(stones, 25);
};

const pt2 = (input: string): number => {
    const stones = parseInput(input);
    return simulateBlinks(stones, 75);
};

if (import.meta.main) {
    console.log("Answer (P1):", pt1(input));
    console.log("Answer (P2):", pt2(input));
}
