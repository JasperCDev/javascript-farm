import { COLUMN_COUNT, ROW_COUNT, TILE_COUNT } from "./constants";

class Plant {
  id: string;
  row: number;
  column: number;
  health: number = 3;
  static idHelper: number;
  elem: HTMLElement;
  constructor(row: number, column: number) {
    console.log("plant");
    Plant.idHelper++;
    this.row = row;
    this.column = column;
    this.id = `${this.row}${this.column}${Plant.idHelper}`;
    const temp = document.getElementById(
      "plant-template"
    )! as HTMLTemplateElement;
    this.elem = document
      .importNode(temp.content, true)
      .querySelector(".plant")!;
    GameGrid.elem.append(this.elem);
  }
  render() {
    this.elem.setAttribute(
      "style",
      `
          --top: ${(this.row - 1) * GameGrid.tileSize}px;
          --left: ${(this.column - 1) * GameGrid.tileSize}px;
          width: var(--tile-size);
          height: var(--tile-size);
          top: var(--top);
          left: var(--left);
          stroke: #12cc34;
        `
    );
  }
}

class Tile {
  row: number;
  column: number;
  id: string;
  elem: HTMLElement;
  type: "OCCUPIED" | "EMPTY" = "EMPTY";
  constructor(tileIndex: number) {
    console.log("tile");
    const tilePoint = GameGrid.getPointFromIterator(tileIndex);
    const id = GameGrid.getTileIdFromPoint(tilePoint);
    this.row = tilePoint.row;
    this.column = tilePoint.column;
    this.id = id;
    this.elem = document.createElement("div");
    this.elem.id = id;
    if (tileIndex === 0) {
      this.type = "OCCUPIED";
    }
    this.elem.className =
      this.type === "OCCUPIED" ? "tile is-occupied" : "tile is-empty";
    GameGrid.elem.appendChild(this.elem);
  }

  render() {}
}

class GameGrid {
  tiles: Tile[];
  plants: Plant[];
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
    window.addEventListener("resize", () => this.calcGridSize());

    this.plants = [new Plant(1, 1)];
    this.tiles = new Array(TILE_COUNT).fill(null).map((_, i) => new Tile(i));
  }

  static getPointFromIterator(i: number) {
    const n = i + 1;
    const row = Math.ceil(n / COLUMN_COUNT);
    const column = n % COLUMN_COUNT || COLUMN_COUNT;
    return { row, column };
  }

  static getTileIdFromPoint(point: { row: number; column: number }) {
    return (
      point.row.toString().padStart(2, "0") +
      point.column.toString().padStart(2, "0")
    );
  }

  private calcGridSize() {
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
    for (const plant of this.plants) {
      plant.render();
    }
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
