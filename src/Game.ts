import World, { DrawCellFn } from "./World.js";

export default class Game {
  public world: World;
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public framesPerSecond: number;
  public hoverCol: number = -1;
  public hoverRow: number = -1;
  public initialized: boolean = false;
  public started: boolean = false;
  public dirty: boolean = false;
  
  private lastSteppedForwardAt: number = 0;
  private dragging: boolean = false;
  private dragSpawning: boolean = false;
  private _rowCount: number;
  private _colCount: number;
  private _cellWidthPx: number;
  private _cellHeightPx: number;

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("CanvasRenderingContext2D not supported");

    this.canvas = canvas;
    this.ctx = ctx;
    this.framesPerSecond = 24;
    this._rowCount = 80;
    this._colCount = 125;
    this._cellWidthPx = 10;
    this._cellHeightPx = 10;
    this.canvas.width = this.widthPx;
    this.canvas.height = this.heightPx;

    this.world = new World({
      rowCount: this.rowCount,
      colCount: this.colCount,
      minNeighbors: 2,   // traditional Game of Life parameter value
      maxNeighbors: 3,   // traditional Game of Life parameter value
      spawnNeighbors: 3, // traditional Game of Life parameter value
    });
  }

  get rowCount(): number { return this._rowCount }
  set rowCount(rowCount: number) {
    this._rowCount = rowCount;
    this.world = this.world.splitTimeline({ ...this.world, rowCount });
    this.canvas.height = this.heightPx;
  }

  get colCount(): number { return this._colCount }
  set colCount(colCount: number) {
    this._colCount = colCount;
    this.world = this.world.splitTimeline({ ...this.world, colCount });
    this.canvas.width = this.widthPx;
  }

  get cellWidthPx(): number { return this._cellWidthPx }
  set cellWidthPx(cellWidthPx: number) {
    this._cellWidthPx = cellWidthPx;
    this.canvas.width = this.widthPx;
  }

  get cellHeightPx(): number { return this._cellHeightPx }
  set cellHeightPx(cellHeightPx: number) {
    this._cellHeightPx = cellHeightPx;
    this.canvas.width = this.widthPx;
  }

  get widthPx(): number {
    return this.cellWidthPx * this.colCount;
  }

  get heightPx(): number {
    return this.cellHeightPx * this.rowCount;
  }

  get msPerFrame(): number {
    return 1000 / this.framesPerSecond;
  }

  get nextStepForwardAt(): number {
    return this.lastSteppedForwardAt + this.msPerFrame;
  }

  // Draw frame without stepping forward
  drawFrame(drawCell: DrawCellFn): void {
    this.ctx.fillStyle = "black";
    this.ctx.clearRect(0, 0, this.widthPx, this.heightPx);
    this.world.iterate(drawCell);
  }

  // Draw frame and step forward in a single loop
  drawFrameAndStepForward(drawCell: DrawCellFn, msSincePageLoad: DOMHighResTimeStamp): void {
    this.ctx.fillStyle = "black";
    this.ctx.clearRect(0, 0, this.widthPx, this.heightPx);
    this.world.iterateAndStepForward(drawCell);
    this.lastSteppedForwardAt = msSincePageLoad;
  }

  // Step forward, but don't draw shit
  stepForward(msSincePageLoad: DOMHighResTimeStamp): void {
    this.world.stepForward();
    this.lastSteppedForwardAt = msSincePageLoad;
  }

  shouldStepForward(msSincePageLoad: DOMHighResTimeStamp): boolean {
    return this.started && (!msSincePageLoad || msSincePageLoad >= this.nextStepForwardAt);
  }

  setHover(x: number, y: number): void {
    this.hoverCol = this.colFromX(x);
    this.hoverRow = this.rowFromY(y);
  }

  clearHover(): void {
    this.hoverCol = -1;
    this.hoverRow = -1;
  }

  hovering(): boolean {
    return this.hoverCol >= 0 && this.hoverRow >= 0;
  }

  init(): void {
    this.initialized = true;
    this.ctx.fillStyle = "black";

    this.canvas.addEventListener("mousedown", (event) => {
      const { offsetX, offsetY } = event;
      this.dragging = true;
      this.dragSpawning = !this.isAliveAtPx(offsetX, offsetY);

      if (this.dragSpawning) {
        this.spawnAtPx(offsetX, offsetY);
      } else {
        this.killAtPx(offsetX, offsetY);
      }
    });

    this.canvas.addEventListener("mousemove", (event) => {
      const { offsetX, offsetY } = event;
      this.setHover(offsetX, offsetY);

      if (!this.dragging) return;

      if (this.dragSpawning) {
        this.spawnAtPx(offsetX, offsetY);
      } else {
        this.killAtPx(offsetX, offsetY);
      }
    });

    this.canvas.addEventListener("mouseout", (_event) => {
      this.clearHover();
    });

    window.addEventListener("mouseup", (_event) => {
      this.dragging = false;
    });

    const drawCell: DrawCellFn = (row, col, currentValue, nextValue) => {
      if (currentValue) { // (it's currently alive)
        if (nextValue) { // if it's going to stay alive...
          if (currentValue === this.world.minNeighbors) {
            this.ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
          } else {
            this.ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
          }
        } else { // if it's going to die...
          if (currentValue === this.world.minNeighbors) {
            this.ctx.fillStyle = "rgba(200, 0, 0, 0.25)";
          } else {
            this.ctx.fillStyle = "rgba(200, 0, 0, 0.65)";
          }
        }

        const x = col * this.cellWidthPx;
        const y = row * this.cellHeightPx;
        this.ctx.fillRect(x, y, this.cellWidthPx, this.cellHeightPx);
      } else { // (it's currently dead)
        if (nextValue) { // if it's going to spawn...
          this.ctx.fillStyle = "rgba(0, 200, 0, 0.25)";
          const x = col * this.cellWidthPx;
          const y = row * this.cellHeightPx;
          this.ctx.fillRect(x, y, this.cellWidthPx, this.cellHeightPx);
        } else { // if it's going to stay dead...
          // do nothing
        }
      }

      // if (currentValue) {
      //   const x = col * this.cellWidthPx;
      //   const y = row * this.cellHeightPx;
      //   if (currentValue === this.world.minNeighbors) {
      //     this.ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
      //   } else {
      //     this.ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
      //   }
      //   this.ctx.fillRect(x, y, this.cellWidthPx, this.cellHeightPx);
      // }

      const hoveringOverThisCell = this.hoverRow === row && this.hoverCol === col;
      if (hoveringOverThisCell) {
        const x = col * this.cellWidthPx;
        const y = row * this.cellHeightPx;
        this.ctx.fillStyle = "rgba(0, 0, 200, 0.5)";
        this.ctx.fillRect(x, y, this.cellWidthPx, this.cellHeightPx);
      }
    };

    // const drawWorld = (msSincePageLoad: DOMHighResTimeStamp): void => {
    //   if (this.shouldStepForward(msSincePageLoad)) {
    //     this.drawFrameAndStepForward(drawCell, msSincePageLoad);
    //   } else {
    //     this.drawFrame(drawCell);
    //   }
    // };

    const drawWorld = (msSincePageLoad: DOMHighResTimeStamp): void => {
      if (this.dirty) {
        this.world.populateNextGrid();
        this.dirty = false;
      }

      if (this.shouldStepForward(msSincePageLoad)) {
        this.world.adoptNextGrid();
        this.world.populateNextGrid();
        this.lastSteppedForwardAt = msSincePageLoad;
      }

      this.drawFrame(drawCell);
    };

    let fps = 0;
    let fpsCounter = 0;
    let prevSecond = 0;
    let thisSecond = 0;
    const drawLoop = (msSincePageLoad: DOMHighResTimeStamp): void => {
      requestAnimationFrame(drawLoop);
      drawWorld(msSincePageLoad);
      fpsCounter += 1;
      prevSecond = thisSecond;
      thisSecond = Math.floor(msSincePageLoad / 1000);
      if (prevSecond !== thisSecond) {
        fps = fpsCounter;
        fpsCounter = 0;
        console.log(fps);
      }
    };

    requestAnimationFrame(drawLoop);
  }

  start(): void {
    if (!this.initialized) this.init();
    this.started = true;
  }

  stop(): void {
    this.started = false;
  }

  reset(): void {
    this.stop();
    this.world.reset();
  }

  rowFromY(y: number): number {
    return Math.floor((y / this.heightPx) * this.rowCount)
  }

  colFromX(x: number): number {
    return Math.floor((x / this.widthPx) * this.colCount);
  }

  isAliveAtPx(x: number, y: number): boolean {
    return this.world.isAliveAt(this.rowFromY(y), this.colFromX(x));
  }

  spawnAtPx(x: number, y: number): number {
    this.dirty = true;
    return this.world.spawnAt(this.rowFromY(y), this.colFromX(x));
  }

  killAtPx(x: number, y: number): number {
    this.dirty = true;
    return this.world.killAt(this.rowFromY(y), this.colFromX(x));
  }

  toggleAtPx(x: number, y: number): number {
    this.dirty = true;
    return this.world.toggleAt(this.rowFromY(y), this.colFromX(x));
  }
}
