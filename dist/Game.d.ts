import World from "./World.js";
interface DrawCellFn {
    (row: number, col: number, currentValue: number, nextValue?: number): void;
}
export default class Game {
    world: World;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    framesPerSecond: number;
    hoverCol: number;
    hoverRow: number;
    initialized: boolean;
    started: boolean;
    private lastSteppedForwardAt;
    private dragging;
    private dragSpawning;
    private _rowCount;
    private _colCount;
    private _cellWidthPx;
    private _cellHeightPx;
    constructor(canvas: HTMLCanvasElement);
    get rowCount(): number;
    set rowCount(rowCount: number);
    get colCount(): number;
    set colCount(colCount: number);
    get cellWidthPx(): number;
    set cellWidthPx(cellWidthPx: number);
    get cellHeightPx(): number;
    set cellHeightPx(cellHeightPx: number);
    get widthPx(): number;
    get heightPx(): number;
    get msPerFrame(): number;
    get nextStepForwardAt(): number;
    drawFrame(drawCell: DrawCellFn): void;
    drawFrameAndStepForward(drawCell: DrawCellFn, msSincePageLoad: DOMHighResTimeStamp): void;
    stepForward(msSincePageLoad: DOMHighResTimeStamp): void;
    shouldStepForward(msSincePageLoad: DOMHighResTimeStamp): boolean;
    setHover(x: number, y: number): void;
    clearHover(): void;
    hovering(): boolean;
    init(): void;
    start(): void;
    stop(): void;
    reset(): void;
    rowFromY(y: number): number;
    colFromX(x: number): number;
    isAliveAtPx(x: number, y: number): boolean;
    spawnAtPx(x: number, y: number): number;
    killAtPx(x: number, y: number): number;
    toggleAtPx(x: number, y: number): number;
}
export {};
//# sourceMappingURL=Game.d.ts.map