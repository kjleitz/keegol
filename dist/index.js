import Game from "./Game.js";
document.addEventListener("DOMContentLoaded", function () {
    var canvas = document.getElementById("keegol-canvas");
    var game = new Game(canvas);
    game.init();
    var playPauseButton = document.getElementById("play-pause");
    var resetButton = document.getElementById("reset");
    var rowsControl = document.getElementById("rows");
    var colsControl = document.getElementById("cols");
    var fpsControl = document.getElementById("fps");
    var cellSizeControl = document.getElementById("cell-size");
    playPauseButton.addEventListener("click", function (_event) {
        game.started ? game.stop() : game.start();
    });
    resetButton.addEventListener("click", function (_event) {
        game.reset();
    });
    rowsControl.value = "" + game.rowCount;
    colsControl.value = "" + game.colCount;
    fpsControl.value = "" + game.framesPerSecond;
    cellSizeControl.value = "" + game.cellWidthPx;
    var setNumericGameProperty = function (propertyName) {
        return function (event) {
            var value = event.target.value;
            (Array.isArray(propertyName) ? propertyName : [propertyName]).forEach(function (prop) {
                game[prop] = parseInt(value, 10);
            });
        };
    };
    rowsControl.addEventListener("input", setNumericGameProperty("rowCount"));
    colsControl.addEventListener("input", setNumericGameProperty("colCount"));
    fpsControl.addEventListener("input", setNumericGameProperty("framesPerSecond"));
    cellSizeControl.addEventListener("input", setNumericGameProperty(["cellWidthPx", "cellHeightPx"]));
});
//# sourceMappingURL=index.js.map