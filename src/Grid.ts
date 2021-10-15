// Inspired by the `Grid` class described here:
// https://medium.com/@zandaqo/structurae-data-structures-for-high-performance-javascript-9b7da4c73f8

export default class Grid {
  public readonly rowCount: number;
  public readonly colCount: number;
  public readonly paddedColCount: number;

  private cells: Uint8ClampedArray;
  private colPower: number;

  constructor(rowCount: number, colCount: number) {
    this.rowCount = rowCount;
    this.colCount = colCount;

    // Snapping the "real" column count to powers of 2 so we can do bitwise
    // shift operations... so, e.g., a `colCount` of 100 would make the _actual_
    // column count 128.
    this.colPower = Math.ceil(Math.log2(colCount));
    this.paddedColCount = 1 << this.colPower;
    const cellCount = rowCount << this.colPower;

    this.cells = new Uint8ClampedArray(cellCount);
  }

  rowAtIndex(index: number): number {
    return index >> this.colPower;
  }

  colAtIndex(index: number): number {
    return index & (this.paddedColCount - 1);
  }

  indexAt(row: number, col: number): number {
    return (row << this.colPower) + col;
  }

  valueAt(row: number, col: number): number {
    const index = this.indexAt(row, col);
    return this.cells[index];
  }

  setValueAt(row: number, col: number, value: number): void {
    const index = this.indexAt(row, col);
    this.cells[index] = value;
  }

  delValueAt(row: number, col: number): void {
    this.setValueAt(row, col, 0);
  }

  clearValues(): void {
    this.cells.fill(0);
  }

  incValueAt(row: number, col: number): number {
    const index = this.indexAt(row, col);
    return ++this.cells[index];
  }

  decValueAt(row: number, col: number): number {
    const index = this.indexAt(row, col);
    return --this.cells[index];
  }
}
