export interface WorldOptions {
    rowCount: number;
    colCount: number;
    minNeighbors?: number;
    maxNeighbors?: number;
    spawnNeighbors?: number;
}
export default class World {
    readonly rowCount: number;
    readonly colCount: number;
    minNeighbors: number;
    maxNeighbors: number;
    spawnNeighbors: number;
    private currentGrid;
    private nextGrid;
    constructor({ rowCount, colCount, minNeighbors, maxNeighbors, spawnNeighbors }: WorldOptions);
    valueRelativeTo(row: number, col: number, dx: number, dy: number): number;
    liveNeighborCountAt(row: number, col: number): number;
    currentValueAt(row: number, col: number): number;
    nextValueAt(row: number, col: number, currentValue?: number): number;
    populateNextGrid(): void;
    adoptNextGrid(): void;
    stepForward(): void;
    isAliveAt(row: number, col: number): boolean;
    toggleAt(row: number, col: number): number;
    spawnAt(row: number, col: number): number;
    killAt(row: number, col: number): number;
    reset(): void;
    iterate(mapper: (row: number, col: number, currentValue: number) => void): void;
    iterateAndStepForward(mapper: (row: number, col: number, currentValue: number, nextValue: number) => void): void;
    splitTimeline(...worldOptions: typeof World extends {
        new (...args: infer T): World;
    } ? T : never): World;
}
//# sourceMappingURL=World.d.ts.map