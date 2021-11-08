var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import Grid from "./Grid.js";
var World = /** @class */ (function () {
    function World(_a) {
        var rowCount = _a.rowCount, colCount = _a.colCount, _b = _a.minNeighbors, minNeighbors = _b === void 0 ? 2 : _b, _c = _a.maxNeighbors, maxNeighbors = _c === void 0 ? 3 : _c, _d = _a.spawnNeighbors, spawnNeighbors = _d === void 0 ? 3 : _d;
        this.rowCount = rowCount;
        this.colCount = colCount;
        this.minNeighbors = minNeighbors;
        this.maxNeighbors = maxNeighbors;
        this.spawnNeighbors = spawnNeighbors;
        this.currentGrid = new Grid(rowCount, colCount);
        this.nextGrid = new Grid(rowCount, colCount);
    }
    // Remember: origin is at top left
    World.prototype.valueRelativeTo = function (row, col, dx, dy) {
        var _a;
        return (_a = this.currentGrid.valueAt(row + dx, col + dy)) !== null && _a !== void 0 ? _a : 0;
    };
    World.prototype.liveNeighborCountAt = function (row, col) {
        return (0
            + (this.valueRelativeTo(row, col, -1, -1) && 1)
            + (this.valueRelativeTo(row, col, -1, 0) && 1)
            + (this.valueRelativeTo(row, col, -1, 1) && 1)
            + (this.valueRelativeTo(row, col, 0, 1) && 1)
            + (this.valueRelativeTo(row, col, 1, 1) && 1)
            + (this.valueRelativeTo(row, col, 1, 0) && 1)
            + (this.valueRelativeTo(row, col, 1, -1) && 1)
            + (this.valueRelativeTo(row, col, 0, -1) && 1));
    };
    World.prototype.currentValueAt = function (row, col) {
        return this.currentGrid.valueAt(row, col);
    };
    World.prototype.nextValueAt = function (row, col, currentValue) {
        currentValue = currentValue !== null && currentValue !== void 0 ? currentValue : this.currentValueAt(row, col);
        var neighborCount = this.liveNeighborCountAt(row, col);
        var aliveNextTurn = currentValue
            ? neighborCount >= this.minNeighbors && neighborCount <= this.maxNeighbors
            : neighborCount === this.spawnNeighbors;
        return aliveNextTurn ? neighborCount : 0;
    };
    World.prototype.populateNextGrid = function () {
        for (var row = 0; row < this.rowCount; row++) {
            for (var col = 0; col < this.colCount; col++) {
                this.nextGrid.setValueAt(row, col, this.nextValueAt(row, col));
            }
        }
    };
    World.prototype.adoptNextGrid = function () {
        var _a = this, currentGrid = _a.currentGrid, nextGrid = _a.nextGrid;
        this.currentGrid = nextGrid;
        this.nextGrid = currentGrid;
    };
    World.prototype.stepForward = function () {
        this.populateNextGrid();
        this.adoptNextGrid();
    };
    World.prototype.isAliveAt = function (row, col) {
        return this.currentValueAt(row, col) > 0;
    };
    World.prototype.toggleAt = function (row, col) {
        var currentValue = this.currentValueAt(row, col);
        var newValue = currentValue ? 0 : 1;
        this.currentGrid.setValueAt(row, col, newValue);
        return newValue;
    };
    World.prototype.spawnAt = function (row, col) {
        this.currentGrid.setValueAt(row, col, 1);
        return 1;
    };
    World.prototype.killAt = function (row, col) {
        this.currentGrid.setValueAt(row, col, 0);
        return 0;
    };
    World.prototype.reset = function () {
        this.currentGrid.clearValues();
        this.nextGrid.clearValues();
    };
    World.prototype.iterate = function (mapper) {
        for (var row = 0; row < this.rowCount; row++) {
            for (var col = 0; col < this.colCount; col++) {
                var currentValue = this.currentValueAt(row, col);
                mapper(row, col, currentValue);
            }
        }
    };
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
    World.prototype.iterateAndStepForward = function (mapper) {
        var _this = this;
        this.iterate(function (row, col, currentValue) {
            var nextValue = _this.nextValueAt(row, col, currentValue);
            _this.nextGrid.setValueAt(row, col, nextValue);
            mapper(row, col, currentValue, nextValue);
        });
        this.adoptNextGrid();
    };
    World.prototype.splitTimeline = function () {
        var worldOptions = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            worldOptions[_i] = arguments[_i];
        }
        var newWorld = new (World.bind.apply(World, __spreadArray([void 0], worldOptions, false)))();
        this.iterate(function (row, col, currentValue) {
            newWorld.currentGrid.setValueAt(row, col, currentValue);
        });
        return newWorld;
    };
    return World;
}());
export default World;
//# sourceMappingURL=World.js.map