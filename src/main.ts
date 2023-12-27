/*
CONSTANTS
*/
const TIME_SPEED = 500;
const ROW_COUNT = 18;
const COLUMN_COUNT = 32;
const TILE_COUNT = ROW_COUNT * COLUMN_COUNT;

export const ignore = null;
/*
TYPES
*/
/*
GAME STATE
*/
const plants = new Array(5).fill(null).map((_, i) => {
  const n = i + 1;
  const row = Math.floor(n / COLUMN_COUNT) + 1;
  const column = n % COLUMN_COUNT;
  return {
    id: i.toString().padStart(2, "0"),
    row,
    column,
  };
});

const tiles = new Array(TILE_COUNT).fill(null).reduce<Tiles>((acc, _, i) => {
  const n = i + 1;
  const row = Math.floor(n / COLUMN_COUNT) + 1;
  const column = n % COLUMN_COUNT;
  const id =
    row.toString().padStart(2, "0") + column.toString().padStart(2, "0");
  return {
    ...acc,
    [id]: {
      id: n,
      row,
      column,
      type: "EMPTY",
    },
  };
}, {});

// ELEMS
const grid = document.getElementById("grid")!;
const plantElemTemplate = document.getElementById(
  "plant-template"
)! as HTMLTemplateElement;

// INITIALIZE

function getWidthAndHeight() {
  const widthPercent = window.innerWidth / 16000000;
  const heightPercent = window.innerHeight / 9000000;
  const smallestPercent = Math.min(widthPercent, heightPercent);

  // This works for both scaling up and scaling down
  const gridWidth = Math.round(16000000 * smallestPercent);
  const gridHeight = Math.round(9000000 * smallestPercent);
  return {
    gridWidth,
    gridHeight,
  };
}

const { gridWidth, gridHeight } = getWidthAndHeight();
let TILE_SIZE = gridHeight / ROW_COUNT;

window.addEventListener("resize", () => {
  const { gridWidth, gridHeight } = getWidthAndHeight();
  grid.style.width = gridWidth + "px";
  grid.style.height = gridHeight + "px";
  TILE_SIZE = gridHeight / ROW_COUNT;
});

grid.setAttribute(
  "style",
  `
    --column-count: ${COLUMN_COUNT};
    height: ${gridHeight}px;
    width: ${gridWidth}px;
    `
);
for (let i = 0; i < plants.length; i++) {
  const plant = plants[i];
  console.log(plant, TILE_SIZE);
  const plantElem = document
    .importNode(plantElemTemplate.content, true)
    .querySelector("svg")!;
  plantElem.setAttribute(
    "style",
    `
        --top: ${(plant.row - 1) * TILE_SIZE}px;
        --left: ${(plant.column - 1) * TILE_SIZE}px;
        --tile-size: ${TILE_SIZE}px;
      `
  );
  grid.appendChild(plantElem);
  const tileId =
    plant.row.toString().padStart(2, "0") +
    plant.column.toString().padStart(2, "0");
  tiles[tileId].type = "OCCUPIED";
}
for (let i = 0; i < TILE_COUNT; i++) {
  const n = i + 1;
  const row = Math.floor(n / COLUMN_COUNT) + 1;
  const column = n % COLUMN_COUNT;
  const id =
    row.toString().padStart(2, "0") + column.toString().padStart(2, "0");
  const tile = tiles[id];
  const tileElem = document.createElement("div");
  tileElem.id = id;
  tileElem.className =
    tile.type === "OCCUPIED" ? "tile is-occupied" : "tile is-empty";
  grid.appendChild(tileElem);
}

function game(timeStamp: number) {
  const { month, day, hours, minutes, amPM } = getTime(timeStamp);
  if (minutes % 15 === 0) {
    const h = hours === 0 ? 12 : hours;
    console.log(
      `${month} ${day} ${h}:${minutes.toString().padStart(2, "0")}${amPM}`
    );
  }
  requestAnimationFrame(game);
}

requestAnimationFrame(game);

// UTILS
function getTime(ms: number) {
  const milliseconds = ms * TIME_SPEED;
  const baseDate = new Date(0); // January 1, 1970
  baseDate.setUTCHours(6, 0, 0, 0); // Set the time to 6:00 AM

  const targetDate = new Date(baseDate.getTime() + milliseconds);

  const month = targetDate.toLocaleString("en-US", {
    month: "short",
  });
  const day = targetDate.getUTCDate();
  const hours = targetDate.getUTCHours() % 12;
  const minutes = targetDate.getUTCMinutes();
  const amPM = hours >= 12 ? "PM" : "AM";
  return { month, day, hours, minutes, amPM };
}

// TYPES
type Tiles = {
  [id: string]: {
    id: number;
    row: number;
    column: number;
    type: "OCCUPIED" | "EMPTY";
  };
};
console.log(TILE_COUNT, tiles);
