type Rule = [number, number];
type Update = number[];

const input = await Deno.readTextFile(new URL("./input.txt", import.meta.url));

const parseInput = (input: string): { rules: Rule[], updates: Update[] } => {
    const [rulesSection, updatesSection] = input.trim().split('\n\n');
    
    const rules = rulesSection.split('\n').map(line => {
        const [before, after] = line.split('|').map(Number);
        return [before, after] as Rule;
    });

    const updates = updatesSection.split('\n').map(line => 
        line.split(',').map(Number)
    );

    return { rules, updates };
};

const isValidUpdate = (update: Update, rules: Rule[]): boolean => {
    for (const [before, after] of rules) {
        const beforeIndex = update.indexOf(before);
        const afterIndex = update.indexOf(after);
        
        if (beforeIndex !== -1 && afterIndex !== -1 && beforeIndex > afterIndex) {
            return false;
        }
    }
    return true;
};

const getMiddleNumber = (arr: number[]): number => {
    return arr[Math.floor(arr.length / 2)];
};

const solvePart1 = (rules: Rule[], updates: Update[]): number => {
    const validMiddleNumbers = updates
        .filter(update => isValidUpdate(update, rules))
        .map(getMiddleNumber);
    
    return validMiddleNumbers.reduce((sum, num) => sum + num, 0);
};

const orderUpdate = (update: Update, rules: Rule[]): Update => {
    return update.sort((a, b) => {
        for (const [before, after] of rules) {
            if (a === before && b === after) return -1;
            if (a === after && b === before) return 1;
        }
        return 0;
    });
};

const solvePart2 = (rules: Rule[], updates: Update[]): number => {
    const incorrectUpdates = updates.filter(update => !isValidUpdate(update, rules));
    
    const correctedMiddleNumbers = incorrectUpdates
        .map(update => orderUpdate([...update], rules))
        .map(getMiddleNumber);
    
    return correctedMiddleNumbers.reduce((sum, num) => sum + num, 0);
};

async function solvePuzzle() {
    const { rules, updates } = parseInput(input);

    const part1Answer = solvePart1(rules, updates);
    console.log("Answer (P1):", part1Answer);
    
    const part2Answer = solvePart2(rules, updates);
    console.log("Answer (P2):", part2Answer);
}

if (import.meta.main) {
    solvePuzzle();
}
