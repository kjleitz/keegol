// Inspired by the `Grid` class described here:
// https://medium.com/@zandaqo/structurae-data-structures-for-high-performance-javascript-9b7da4c73f8
var Grid = /** @class */ (function () {
    function Grid(rowCount, colCount) {
        this.rowCount = rowCount;
        this.colCount = colCount;
        // Snapping the "real" column count to powers of 2 so we can do bitwise
        // shift operations... so, e.g., a `colCount` of 100 would make the _actual_
        // column count 128.
        this.colPower = Math.ceil(Math.log2(colCount));
        this.paddedColCount = 1 << this.colPower;
        var cellCount = rowCount << this.colPower;
        this.cells = new Uint8ClampedArray(cellCount);
    }
    Grid.prototype.rowAtIndex = function (index) {
        return index >> this.colPower;
    };
    Grid.prototype.colAtIndex = function (index) {
        return index & (this.paddedColCount - 1);
    };
    Grid.prototype.indexAt = function (row, col) {
        return (row << this.colPower) + col;
    };
    Grid.prototype.valueAt = function (row, col) {
        var index = this.indexAt(row, col);
        return this.cells[index];
    };
    Grid.prototype.setValueAt = function (row, col, value) {
        var index = this.indexAt(row, col);
        this.cells[index] = value;
    };
    Grid.prototype.delValueAt = function (row, col) {
        this.setValueAt(row, col, 0);
    };
    Grid.prototype.clearValues = function () {
        this.cells.fill(0);
    };
    Grid.prototype.incValueAt = function (row, col) {
        var index = this.indexAt(row, col);
        return ++this.cells[index];
    };
    Grid.prototype.decValueAt = function (row, col) {
        var index = this.indexAt(row, col);
        return --this.cells[index];
    };
    return Grid;
}());
export default Grid;
//# sourceMappingURL=Grid.js.map