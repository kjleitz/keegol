import Game from "./Game.js";

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("keegol-canvas") as HTMLCanvasElement;
  const game = new Game(canvas);

  game.init();

  const playPauseButton = document.getElementById("play-pause") as HTMLButtonElement;
  const resetButton = document.getElementById("reset") as HTMLButtonElement;
  const rowsControl = document.getElementById("rows") as HTMLInputElement;
  const colsControl = document.getElementById("cols") as HTMLInputElement;
  const fpsControl = document.getElementById("fps") as HTMLInputElement;
  const cellSizeControl = document.getElementById("cell-size") as HTMLInputElement;

  playPauseButton.addEventListener("click", (_event) => {
    game.started ? game.stop() : game.start();
  });

  resetButton.addEventListener("click", (_event) => {
    game.reset();
  });

  rowsControl.value = `${game.rowCount}`;
  colsControl.value = `${game.colCount}`;
  fpsControl.value = `${game.framesPerSecond}`;
  cellSizeControl.value = `${game.cellWidthPx}`;

  const setNumericGameProperty = (propertyName: keyof Game | (keyof Game)[]): { (event: Event): void } => {
    return (event) => {
      const { value } = event.target as HTMLInputElement;
      (Array.isArray(propertyName) ? propertyName : [propertyName]).forEach((prop) => {
        (game as any)[prop] = parseInt(value, 10);
      });
    }
  }

  rowsControl.addEventListener("input", setNumericGameProperty("rowCount"));
  colsControl.addEventListener("input", setNumericGameProperty("colCount"));
  fpsControl.addEventListener("input", setNumericGameProperty("framesPerSecond"));
  cellSizeControl.addEventListener("input", setNumericGameProperty(["cellWidthPx", "cellHeightPx"]));
});

