var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import World from "./World.js";
var Game = /** @class */ (function () {
    function Game(canvas) {
        this.hoverCol = -1;
        this.hoverRow = -1;
        this.initialized = false;
        this.started = false;
        this.lastSteppedForwardAt = 0;
        this.dragging = false;
        this.dragSpawning = false;
        var ctx = canvas.getContext("2d");
        if (!ctx)
            throw new Error("CanvasRenderingContext2D not supported");
        this.canvas = canvas;
        this.ctx = ctx;
        this.framesPerSecond = 60;
        this._rowCount = 80;
        this._colCount = 125;
        this._cellWidthPx = 10;
        this._cellHeightPx = 10;
        this.canvas.width = this.widthPx;
        this.canvas.height = this.heightPx;
        this.world = new World({
            rowCount: this.rowCount,
            colCount: this.colCount,
            minNeighbors: 2,
            maxNeighbors: 3,
            spawnNeighbors: 3, // traditional Game of Life parameter value
        });
    }
    Object.defineProperty(Game.prototype, "rowCount", {
        get: function () { return this._rowCount; },
        set: function (rowCount) {
            this._rowCount = rowCount;
            this.world = this.world.splitTimeline(__assign(__assign({}, this.world), { rowCount: rowCount }));
            this.canvas.height = this.heightPx;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "colCount", {
        get: function () { return this._colCount; },
        set: function (colCount) {
            this._colCount = colCount;
            this.world = this.world.splitTimeline(__assign(__assign({}, this.world), { colCount: colCount }));
            this.canvas.width = this.widthPx;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "cellWidthPx", {
        get: function () { return this._cellWidthPx; },
        set: function (cellWidthPx) {
            this._cellWidthPx = cellWidthPx;
            this.canvas.width = this.widthPx;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "cellHeightPx", {
        get: function () { return this._cellHeightPx; },
        set: function (cellHeightPx) {
            this._cellHeightPx = cellHeightPx;
            this.canvas.width = this.widthPx;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "widthPx", {
        get: function () {
            return this.cellWidthPx * this.colCount;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "heightPx", {
        get: function () {
            return this.cellHeightPx * this.rowCount;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "msPerFrame", {
        get: function () {
            return 1000 / this.framesPerSecond;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "nextStepForwardAt", {
        get: function () {
            return this.lastSteppedForwardAt + this.msPerFrame;
        },
        enumerable: false,
        configurable: true
    });
    // Draw frame without stepping forward
    Game.prototype.drawFrame = function (drawCell) {
        this.ctx.fillStyle = "black";
        this.ctx.clearRect(0, 0, this.widthPx, this.heightPx);
        this.world.iterate(drawCell);
    };
    // Draw frame and step forward in a single loop
    Game.prototype.drawFrameAndStepForward = function (drawCell, msSincePageLoad) {
        this.ctx.fillStyle = "black";
        this.ctx.clearRect(0, 0, this.widthPx, this.heightPx);
        this.world.iterateAndStepForward(drawCell);
        this.lastSteppedForwardAt = msSincePageLoad;
    };
    // Step forward, but don't draw shit
    Game.prototype.stepForward = function (msSincePageLoad) {
        this.world.stepForward();
        this.lastSteppedForwardAt = msSincePageLoad;
    };
    Game.prototype.shouldStepForward = function (msSincePageLoad) {
        return this.started && (!msSincePageLoad || msSincePageLoad >= this.nextStepForwardAt);
    };
    Game.prototype.setHover = function (x, y) {
        this.hoverCol = this.colFromX(x);
        this.hoverRow = this.rowFromY(y);
    };
    Game.prototype.clearHover = function () {
        this.hoverCol = -1;
        this.hoverRow = -1;
    };
    Game.prototype.hovering = function () {
        return this.hoverCol >= 0 && this.hoverRow >= 0;
    };
    Game.prototype.init = function () {
        var _this = this;
        this.initialized = true;
        this.ctx.fillStyle = "black";
        this.canvas.addEventListener("mousedown", function (event) {
            var offsetX = event.offsetX, offsetY = event.offsetY;
            _this.dragging = true;
            _this.dragSpawning = !_this.isAliveAtPx(offsetX, offsetY);
            if (_this.dragSpawning) {
                _this.spawnAtPx(offsetX, offsetY);
            }
            else {
                _this.killAtPx(offsetX, offsetY);
            }
        });
        this.canvas.addEventListener("mousemove", function (event) {
            var offsetX = event.offsetX, offsetY = event.offsetY;
            _this.setHover(offsetX, offsetY);
            if (!_this.dragging)
                return;
            if (_this.dragSpawning) {
                _this.spawnAtPx(offsetX, offsetY);
            }
            else {
                _this.killAtPx(offsetX, offsetY);
            }
        });
        this.canvas.addEventListener("mouseout", function (_event) {
            _this.clearHover();
        });
        window.addEventListener("mouseup", function (_event) {
            _this.dragging = false;
        });
        var drawCell = function (row, col, currentValue, _nextValue) {
            if (currentValue) {
                var x = col * _this.cellWidthPx;
                var y = row * _this.cellHeightPx;
                if (currentValue === _this.world.minNeighbors) {
                    _this.ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
                }
                else {
                    _this.ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
                }
                _this.ctx.fillRect(x, y, _this.cellWidthPx, _this.cellHeightPx);
            }
            var hoveringOverThisCell = _this.hoverRow === row && _this.hoverCol === col;
            if (hoveringOverThisCell) {
                var x = col * _this.cellWidthPx;
                var y = row * _this.cellHeightPx;
                _this.ctx.fillStyle = "rgba(200, 0, 0, 0.5)";
                _this.ctx.fillRect(x, y, _this.cellWidthPx, _this.cellHeightPx);
            }
        };
        var drawWorld = function (msSincePageLoad) {
            if (_this.shouldStepForward(msSincePageLoad)) {
                _this.drawFrameAndStepForward(drawCell, msSincePageLoad);
            }
            else {
                _this.drawFrame(drawCell);
            }
        };
        var drawLoop = function (msSincePageLoad) {
            requestAnimationFrame(drawLoop);
            drawWorld(msSincePageLoad);
        };
        requestAnimationFrame(drawLoop);
    };
    Game.prototype.start = function () {
        if (!this.initialized)
            this.init();
        this.started = true;
    };
    Game.prototype.stop = function () {
        this.started = false;
    };
    Game.prototype.reset = function () {
        this.stop();
        this.world.reset();
    };
    Game.prototype.rowFromY = function (y) {
        return Math.floor((y / this.heightPx) * this.rowCount);
    };
    Game.prototype.colFromX = function (x) {
        return Math.floor((x / this.widthPx) * this.colCount);
    };
    Game.prototype.isAliveAtPx = function (x, y) {
        return this.world.isAliveAt(this.rowFromY(y), this.colFromX(x));
    };
    Game.prototype.spawnAtPx = function (x, y) {
        return this.world.spawnAt(this.rowFromY(y), this.colFromX(x));
    };
    Game.prototype.killAtPx = function (x, y) {
        return this.world.killAt(this.rowFromY(y), this.colFromX(x));
    };
    Game.prototype.toggleAtPx = function (x, y) {
        return this.world.toggleAt(this.rowFromY(y), this.colFromX(x));
    };
    return Game;
}());
export default Game;
//# sourceMappingURL=Game.js.map