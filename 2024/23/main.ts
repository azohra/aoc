const input = await Deno.readTextFile(new URL("./input.txt", import.meta.url));

type Graph = Map<string, Set<string>>;

const parseInput = (input: string): Graph => {
  const graph: Graph = new Map();
  const connections = input.trim().split('\n');

  for (const connection of connections) {
    const [a, b] = connection.split('-');
    if (!graph.has(a)) graph.set(a, new Set());
    if (!graph.has(b)) graph.set(b, new Set());
    graph.get(a)!.add(b);
    graph.get(b)!.add(a);
  }

  return graph;
};

const findTriples = (graph: Graph): Set<string>[] => {
  const triples: Set<string>[] = [];
  const nodes = Array.from(graph.keys());

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      for (let k = j + 1; k < nodes.length; k++) {
        const a = nodes[i], b = nodes[j], c = nodes[k];
        if (graph.get(a)!.has(b) && graph.get(b)!.has(c) && graph.get(c)!.has(a)) {
          triples.push(new Set([a, b, c]));
        }
      }
    }
  }

  return triples;
};

const findLargestClique = (graph: Graph): Set<string> => {
  let maxClique: Set<string> = new Set();
  const nodes = Array.from(graph.keys()).sort((a, b) => graph.get(b)!.size - graph.get(a)!.size);

  const intersection = (setA: Set<string>, setB: Set<string>): Set<string> =>
    new Set([...setA].filter(x => setB.has(x)));

  const findPivot = (P: Set<string>): string => {
    let maxDegree = -1;
    let pivot = '';
    for (const v of P) {
      const degree = intersection(graph.get(v)!, P).size;
      if (degree > maxDegree) {
        maxDegree = degree;
        pivot = v;
      }
    }
    return pivot;
  };

  const bronKerbosch = (R: Set<string>, P: Set<string>, X: Set<string>) => {
    if (P.size === 0 && X.size === 0) {
      if (R.size > maxClique.size) {
        maxClique = new Set(R);
      }
      return;
    }

    const pivot = findPivot(P);
    const pivotNeighbors = pivot ? graph.get(pivot)! : new Set<string>();
    const vertices = new Set([...P].filter(v => !pivotNeighbors.has(v)));
    if (vertices.size === 0 && P.size > 0) {
      vertices.add(pivot);
    }

    for (const v of vertices) {
      const neighbors = graph.get(v)!;
      bronKerbosch(
        new Set([...R, v]),
        intersection(P, neighbors),
        intersection(X, neighbors)
      );
      P.delete(v);
      X.add(v);
    }
  };

  bronKerbosch(new Set(), new Set(nodes), new Set());
  return maxClique;
};

const pt1 = (input: string): number => {
  const graph = parseInput(input);
  const triples = findTriples(graph);
  return triples.filter(triple => 
    Array.from(triple).some(node => node.startsWith('t'))
  ).length;
};

const pt2 = (input: string): string => {
  const graph = parseInput(input);
  const largestClique = findLargestClique(graph);
  return Array.from(largestClique).sort().join(',');
};

if (import.meta.main) {
  console.log("Answer (P1):", pt1(input));
  console.log("Answer (P2):", pt2(input));
}
