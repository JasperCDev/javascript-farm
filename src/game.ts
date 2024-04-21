import { COLUMN_COUNT, ROW_COUNT, TILE_COUNT } from "./constants";
import {
  getPointFromIterator,
  getTileIdFromPoint,
  getWidthAndHeight,
} from "./utils";

class Plant {
  constructor() {}
  render() {}
}

class Tile {
  row: number;
  column: number;
  id: string;
  elem: HTMLElement;
  type: "OCCUPIED" | "EMPTY";
  constructor(tileIndex: number) {
    console.log("tile");
    const { row, column } = getPointFromIterator(tileIndex);
    const id = getTileIdFromPoint({ row, column });
    this.row = row;
    this.column = column;
    this.id = id;
    this.type = Math.floor(Math.random() * 2) === 1 ? "EMPTY" : "OCCUPIED";
    this.elem = document.createElement("div");
    this.elem.id = id;
    this.elem.className =
      this.type === "OCCUPIED" ? "tile is-occupied" : "tile is-empty";
    GameGrid.elem.appendChild(this.elem);
  }

  render() {}
}

class GameGrid {
  tiles: Tile[];
  static tileSize: number;
  static elem: HTMLElement;
  static width: number;
  static height: number;

  constructor() {
    console.log("game grid");
    GameGrid.elem = document.createElement("div");
    GameGrid.elem.id = "grid";
    GameGrid.elem.className = "grid";
    this.calcGridSize();
    GameScene.elem.append(GameGrid.elem);
    const tint = document.createElement("tint");
    tint.id = "tint";
    tint.className = "tint";
    tint.style.setProperty("background", "#ffd500");
    GameGrid.elem.append(tint);
    this.tiles = new Array(TILE_COUNT).fill(null).map((_, i) => new Tile(i));
    window.addEventListener("resize", () => this.calcGridSize());
  }

  calcGridSize() {
    const widthPercent = window.innerWidth / 16000000;
    const heightPercent = window.innerHeight / 9000000;
    const smallestPercent = Math.min(widthPercent, heightPercent);
    const gridWidth = Math.round(16000000 * smallestPercent);
    const gridHeight = Math.round(9000000 * smallestPercent);
    GameGrid.width = gridWidth;
    GameGrid.height = gridHeight;
    GameGrid.tileSize = GameGrid.height / ROW_COUNT;
  }

  render() {
    GameGrid.elem.setAttribute(
      "style",
      `
        --column-count: ${COLUMN_COUNT};
        height: ${GameGrid.height}px;
        width: ${GameGrid.width}px;
        --tile-size: ${GameGrid.tileSize}px;
        `
    );
    for (const tile of this.tiles) {
      tile.render();
    }
  }
}

class GameScene {
  gameGrid: GameGrid;
  static elem = document.getElementById("main")!;
  constructor() {
    console.log("game scene");
    this.gameGrid = new GameGrid();
  }
  render() {
    this.gameGrid.render();
  }
}

class SceneManager {
  static currentScene = "game";
  gameScene: GameScene;
  constructor() {
    console.log("scene manager");
    this.gameScene = new GameScene();
  }
  render() {
    switch (SceneManager.currentScene) {
      case "game":
        this.gameScene.render();
        return;
    }
  }
}

class Game {
  sceneManager: SceneManager;
  constructor() {
    console.log("game");
    this.sceneManager = new SceneManager();
  }
  render() {
    this.sceneManager.render();
  }
}
const game = new Game();

function gameLoop(timeStamp: number) {
  game.render();
  requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);
