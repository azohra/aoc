const input = await Deno.readTextFile(new URL("./input.txt", import.meta.url));

type DiskMap = number[];
type File = {
    id: number;
    size: number;
    position: number;
};

const parseInput = (input: string): number[] => {
    const numbers: number[] = [];
    let currentNumber = '';
    
    for (const char of input.trim()) {
        currentNumber += char;
        numbers.push(parseInt(currentNumber));
        currentNumber = '';
    }
    
    return numbers;
};

const createDiskMap = (numbers: number[]): DiskMap => {
    const diskMap: DiskMap = [];
    let fileId = 0;
    let isFile = true;
    
    for (const length of numbers) {
        if (isFile) {
            diskMap.push(...Array(length).fill(fileId));
            fileId++;
        } else {
            diskMap.push(...Array(length).fill(-1));
        }
        isFile = !isFile;
    }
    
    return diskMap;
};

const getFiles = (disk: DiskMap): File[] => {
    const files = new Map<number, File>();
    
    disk.forEach((fileId, index) => {
        if (fileId !== -1) {
            if (!files.has(fileId)) {
                files.set(fileId, { id: fileId, size: 1, position: index });
            } else {
                files.get(fileId)!.size++;
            }
        }
    });
    
    return Array.from(files.values()).sort((a, b) => b.id - a.id);
};

const findContiguousFreeSpace = (disk: DiskMap, size: number, startPos: number): number => {
    for (let i = 0; i < startPos; i++) {
        if (disk[i] === -1) {
            let spaceSize = 0;
            let j = i;
            while (j < disk.length && disk[j] === -1) {
                spaceSize++;
                j++;
            }
            if (spaceSize >= size) {
                return i;
            }
            i = j - 1;
        }
    }
    return -1;
};

const defragmentDiskPart1 = (diskMap: DiskMap): DiskMap => {
    const defragmented = [...diskMap];
    let lastFreeSpace = defragmented.indexOf(-1);
    
    while (lastFreeSpace !== -1) {
        let rightmostFile = -1;
        for (let i = defragmented.length - 1; i > lastFreeSpace; i--) {
            if (defragmented[i] !== -1) {
                rightmostFile = i;
                break;
            }
        }
        
        if (rightmostFile === -1) break;
        
        defragmented[lastFreeSpace] = defragmented[rightmostFile];
        defragmented[rightmostFile] = -1;
        lastFreeSpace = defragmented.indexOf(-1);
    }
    
    return defragmented;
};

const defragmentDiskPart2 = (diskMap: DiskMap): DiskMap => {
    const defragmented = [...diskMap];
    const files = getFiles(defragmented);

    for (const file of files) {
        // Find the first position of this file
        let fileStart = -1;
        let fileEnd = -1;
        for (let i = 0; i < defragmented.length; i++) {
            if (defragmented[i] === file.id) {
                if (fileStart === -1) fileStart = i;
                fileEnd = i;
            }
        }

        // Find suitable free space to the left
        const newPosition = findContiguousFreeSpace(defragmented, fileEnd - fileStart + 1, fileStart);
        
        if (newPosition !== -1 && newPosition < fileStart) {
            // Move the entire file
            const fileSize = fileEnd - fileStart + 1;
            for (let i = 0; i < fileSize; i++) {
                defragmented[newPosition + i] = file.id;
                defragmented[fileStart + i] = -1;
            }
        }
    }

    return defragmented;
};

const calculateChecksum = (disk: DiskMap): number => {
    return disk.reduce((sum, fileId, index) => fileId !== -1 ? sum + index * fileId : sum, 0);
};

const pt1 = (input: string): number => {
    const numbers = parseInput(input);
    const initialDisk = createDiskMap(numbers);
    const defragmentedDisk = defragmentDiskPart1(initialDisk);
    return calculateChecksum(defragmentedDisk);
};

const pt2 = (input: string): number => {
    const numbers = parseInput(input);
    const initialDisk = createDiskMap(numbers);
    const defragmentedDisk = defragmentDiskPart2(initialDisk);
    return calculateChecksum(defragmentedDisk);
};

if (import.meta.main) {
    console.log("Answer (P1):", pt1(input));
    console.log("Answer (P2):", pt2(input));
}
