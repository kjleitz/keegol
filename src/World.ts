import Grid from "./Grid.js";

export interface WorldOptions {
  rowCount: number;
  colCount: number;
  minNeighbors?: number;
  maxNeighbors?: number;
  spawnNeighbors?: number;
}

export default class World {
  public readonly rowCount: number;
  public readonly colCount: number;

  public minNeighbors: number;
  public maxNeighbors: number;
  public spawnNeighbors: number;

  private currentGrid: Grid;
  private nextGrid: Grid;

  constructor({ rowCount, colCount, minNeighbors = 2, maxNeighbors = 3, spawnNeighbors = 3 }: WorldOptions) {
    this.rowCount = rowCount;
    this.colCount = colCount;
    this.minNeighbors = minNeighbors;
    this.maxNeighbors = maxNeighbors;
    this.spawnNeighbors = spawnNeighbors;
    this.currentGrid = new Grid(rowCount, colCount);
    this.nextGrid = new Grid(rowCount, colCount);
  }

  // Remember: origin is at top left
  valueRelativeTo(row: number, col: number, dx: number, dy: number): number {
    return this.currentGrid.valueAt(row + dx, col + dy) ?? 0;
  }

  liveNeighborCountAt(row: number, col: number): number {
    return (
      0
      + (this.valueRelativeTo(row, col, -1, -1) && 1)
      + (this.valueRelativeTo(row, col, -1,  0) && 1)
      + (this.valueRelativeTo(row, col, -1,  1) && 1)
      + (this.valueRelativeTo(row, col,  0,  1) && 1)
      + (this.valueRelativeTo(row, col,  1,  1) && 1)
      + (this.valueRelativeTo(row, col,  1,  0) && 1)
      + (this.valueRelativeTo(row, col,  1, -1) && 1)
      + (this.valueRelativeTo(row, col,  0, -1) && 1)
    );
  }

  currentValueAt(row: number, col: number): number {
    return this.currentGrid.valueAt(row, col);
  }

  nextValueAt(row: number, col: number, currentValue?: number): number {
    currentValue = currentValue ?? this.currentValueAt(row, col);
    const neighborCount = this.liveNeighborCountAt(row, col);
    const aliveNextTurn = currentValue
      ? neighborCount >= this.minNeighbors && neighborCount <= this.maxNeighbors
      : neighborCount === this.spawnNeighbors;

    return aliveNextTurn ? neighborCount : 0;
  }

  populateNextGrid(): void {
    for (let row = 0; row < this.rowCount; row++) {
      for (let col = 0; col < this.colCount; col++) {
        this.nextGrid.setValueAt(row, col, this.nextValueAt(row, col));
      }
    }
  }

  adoptNextGrid(): void {
    const { currentGrid, nextGrid } = this;
    this.currentGrid = nextGrid;
    this.nextGrid = currentGrid;
  }

  stepForward(): void {
    this.populateNextGrid();
    this.adoptNextGrid();
  }

  isAliveAt(row: number, col: number): boolean {
    return this.currentValueAt(row, col) > 0;
  }

  toggleAt(row: number, col: number): number {
    const currentValue = this.currentValueAt(row, col);
    const newValue = currentValue ? 0 : 1;
    this.currentGrid.setValueAt(row, col, newValue);
    return newValue;
  }

  spawnAt(row: number, col: number): number {
    this.currentGrid.setValueAt(row, col, 1);
    return 1;
  }

  killAt(row: number, col: number): number {
    this.currentGrid.setValueAt(row, col, 0);
    return 0;
  }

  reset(): void {
    this.currentGrid.clearValues();
    this.nextGrid.clearValues();
  }

  iterate(mapper: (row: number, col: number, currentValue: number) => void): void {
    for (let row = 0; row < this.rowCount; row++) {
      for (let col = 0; col < this.colCount; col++) {
        const currentValue = this.currentValueAt(row, col);
        mapper(row, col, currentValue);
      }
    }
  }

  // If you're going to iterate over all the cells in `this.currentGrid` and you
  // can do all your work in one callback function call per cell, then you might
  // might as well do the following:
  //
  //   - iterate over each cell
  //     - set the next value in the next grid
  //     - do your custom logic
  //   - step forward to the next grid once iteration is finished
  //
  // That way, you only map over all the cells ONCE per "frame."
  //
  iterateAndStepForward(mapper: (row: number, col: number, currentValue: number, nextValue: number) => void): void {
    this.iterate((row, col, currentValue) => {
      const nextValue = this.nextValueAt(row, col, currentValue);
      this.nextGrid.setValueAt(row, col, nextValue);
      mapper(row, col, currentValue, nextValue);
    });

    this.adoptNextGrid();
  }

  splitTimeline(...worldOptions: typeof World extends { new (...args: infer T): World } ? T : never): World {
    const newWorld = new World(...worldOptions);

    this.iterate((row, col, currentValue) => {
      newWorld.currentGrid.setValueAt(row, col, currentValue);
    });

    return newWorld;
  }
}
