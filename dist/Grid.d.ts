export default class Grid {
    readonly rowCount: number;
    readonly colCount: number;
    readonly paddedColCount: number;
    private cells;
    private colPower;
    constructor(rowCount: number, colCount: number);
    rowAtIndex(index: number): number;
    colAtIndex(index: number): number;
    indexAt(row: number, col: number): number;
    valueAt(row: number, col: number): number;
    setValueAt(row: number, col: number, value: number): void;
    delValueAt(row: number, col: number): void;
    clearValues(): void;
    incValueAt(row: number, col: number): number;
    decValueAt(row: number, col: number): number;
}
//# sourceMappingURL=Grid.d.ts.map