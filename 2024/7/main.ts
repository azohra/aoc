const input = await Deno.readTextFile(new URL("./input.txt", import.meta.url));

type Equation = {
    testValue: number;
    numbers: number[];
};

type Operator = '+' | '*' | '||';

const parseInput = (input: string): Equation[] => {
    return input.trim().split('\n').map(line => {
        const [testValueStr, numbersStr] = line.split(': ');
        return {
            testValue: parseInt(testValueStr),
            numbers: numbersStr.split(' ').map(Number)
        };
    });
};

const evaluateExpression = (numbers: number[], operators: Operator[]): number => {
    let result = numbers[0];
    for (let i = 0; i < operators.length; i++) {
        const nextNum = numbers[i + 1];
        switch (operators[i]) {
            case '+': result += nextNum; break;
            case '*': result *= nextNum; break;
            case '||': result = parseInt(`${result}${nextNum}`); break;
        }
    }
    return result;
};

const generateOperatorCombinations = function* (length: number, includeConcatenation: boolean): Generator<Operator[]> {
    const operators: Operator[] = includeConcatenation ? ['+', '*', '||'] : ['+', '*'];
    const total = Math.pow(operators.length, length);
    
    for (let i = 0; i < total; i++) {
        const combination: Operator[] = [];
        let num = i;
        for (let j = 0; j < length; j++) {
            combination.push(operators[num % operators.length]);
            num = Math.floor(num / operators.length);
        }
        yield combination;
    }
};

const canMakeTestValue = (testValue: number, numbers: number[], includeConcatenation: boolean): boolean => {
    const numOperators = numbers.length - 1;
    
    for (const operators of generateOperatorCombinations(numOperators, includeConcatenation)) {
        if (evaluateExpression(numbers, operators) === testValue) {
            return true;
        }
    }
    
    return false;
};

const solve = (equations: Equation[], includeConcatenation: boolean): number => {
    return equations.reduce((sum, { testValue, numbers }) => 
        canMakeTestValue(testValue, numbers, includeConcatenation) ? sum + testValue : sum, 0);
};

const pt1 = (input: string): number => {
    const equations = parseInput(input);
    return solve(equations, false);
};

const pt2 = (input: string): number => {
    const equations = parseInput(input);
    return solve(equations, true);
};

if (import.meta.main) {
    console.log("Answer (P1):", pt1(input));
    console.log("Answer (P2):", pt2(input));
}
