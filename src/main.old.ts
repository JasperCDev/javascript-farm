/*
CONSTANTS
*/
const TIME_SPEED = 500;
const ROW_COUNT = 18;
const COLUMN_COUNT = 32;
const TILE_COUNT = ROW_COUNT * COLUMN_COUNT;

export const ignore = null;
/*
GAME STATE
*/
let plants = new Array(5).fill(null).map<Plants[number]>((_, i) => {
  const { row, column } = getPointFromIterator(i);
  return {
    id: i.toString().padStart(2, "0"),
    row,
    column,
    squares: [{ row, column }],
    health: 3,
  };
});
let plantElems: { [id: string]: Element } = {};

const tiles = new Array(TILE_COUNT).fill(null).reduce<Tiles>((acc, _, i) => {
  const { row, column } = getPointFromIterator(i);
  const id = getTileIdFromPoint({ row, column });
  return {
    ...acc,
    [id]: {
      id,
      row,
      column,
      type: "EMPTY",
    },
  };
}, {});

const objects: Objects = [
  {
    id: "clock",
    row: 1,
    column: 31,
    name: "clock",
    type: "ui",
    squares: [
      { row: 1, column: 31 },
      { row: 1, column: 32 },
    ],
  },
  {
    id: "currency",
    row: 18,
    column: 31,
    name: "currency",
    type: "ui",
    squares: [
      { row: 18, column: 31 },
      { row: 18, column: 32 },
    ],
  },
  {
    id: "shop",
    row: 1,
    column: 31,
    name: "shop",
    type: "ui",
    squares: [
      { row: 18, column: 31 },
      { row: 18, column: 32 },
    ],
  },
];

// PLAYER STATE
let currency = 0;
let prevTime: Time;
let playerAction: PlayerAction = "none" as PlayerAction;
let isRaining = false;

// ELEMS
const grid = document.getElementById("grid")!;
const tintElem = document.getElementById("tint")!;
const plantElemTemplate = document.getElementById(
  "plant-template"
)! as HTMLTemplateElement;
const clockElemTemplate = document.getElementById(
  "clock-template"
)! as HTMLTemplateElement;
const currencyElemTemplate = document.getElementById(
  "currency-template"
)! as HTMLTemplateElement;
let clockElem: HTMLElement;
let clockLabelElement: HTMLElement;
let currencyLabelElem: HTMLElement;

// INITIALIZE
tintElem.style.setProperty("background", "#ffd500");
const { gridWidth, gridHeight } = getWidthAndHeight();
let TILE_SIZE = gridHeight / ROW_COUNT;

window.addEventListener("resize", () => {
  console.log("resize");
  const { gridWidth, gridHeight } = getWidthAndHeight();
  grid.style.width = gridWidth + "px";
  grid.style.height = gridHeight + "px";
  TILE_SIZE = gridHeight / ROW_COUNT;
  grid.style.setProperty("--tile-size", TILE_SIZE + "px");
});

grid.addEventListener("mousemove", (e) => {
  if (playerAction !== "placing") {
    return;
  }
  const x = e.clientX;
  const y = e.clientY;
  const relX = x - (window.innerWidth - grid.clientWidth) / 2;
  const relY = y - (window.innerHeight - grid.clientHeight) / 2;
  const modX = relX % TILE_SIZE;
  const modY = relY % TILE_SIZE;
  const snappedX = relX - modX;
  const snappedY = relY - modY;
  const row = Math.floor(snappedY / TILE_SIZE + 1);
  const column = Math.floor(snappedX / TILE_SIZE + 1);
  const tileId = getTileIdFromPoint({ row, column });
  const tile = tiles[tileId];
  if (tile.type === "OCCUPIED") {
    return;
  }
  clockElem.style.setProperty("top", snappedY + "px");
  clockElem.style.setProperty("left", snappedX + "px");
});

grid.setAttribute(
  "style",
  `
    --column-count: ${COLUMN_COUNT};
    height: ${gridHeight}px;
    width: ${gridWidth}px;
    --tile-size: ${TILE_SIZE}px;
    `
);
for (let i = 0; i < plants.length; i++) {
  const plant = plants[i];
  const plantElem = document
    .importNode(plantElemTemplate.content, true)
    .querySelector(".plant")!;
  const stroke = (() => {
    switch (plant.health) {
      case 1:
        return "#997c51";
      case 2:
        return "#cce841";
      case 3:
        return "#12cc34";
    }
  })();
  plantElem.setAttribute(
    "style",
    `
        --top: ${(plant.row - 1) * TILE_SIZE}px;
        --left: ${(plant.column - 1) * TILE_SIZE}px;
        width: var(--tile-size);
        height: var(--tile-size);
        top: var(--top);
        left: var(--left);
        stroke: ${stroke};
      `
  );
  grid.appendChild(plantElem);
  for (let j = 0; j < plant.squares.length; j++) {
    const coveredSquare = plant.squares[j];
    const tileId = getTileIdFromPoint(coveredSquare);
    tiles[tileId].type = "OCCUPIED";
  }
  plantElems[plant.id] = plantElem;
}
for (let i = 0; i < objects.length; i++) {
  const object = objects[i];
  switch (object.name) {
    case "clock": {
      const objectElem = document
        .importNode(clockElemTemplate.content, true)
        .querySelector(".clock")! as HTMLElement;
      objectElem.setAttribute(
        "style",
        `
          --top: ${(object.row - 1) * TILE_SIZE}px;
          --left: ${(object.column - 1) * TILE_SIZE}px;
          width: calc(var(--tile-size) * 2);
          height: var(--tile-size);
          top: var(--top);
          left: var(--left);
        `
      );
      grid.appendChild(objectElem);
      clockLabelElement = document.getElementById("clock-label")!;
      clockElem = objectElem;
      break;
    }
    case "currency": {
      const objectElem = document
        .importNode(currencyElemTemplate.content, true)
        .querySelector(".currency")!;
      objectElem.setAttribute(
        "style",
        `
          --top: ${(object.row - 1) * TILE_SIZE}px;
          --left: ${(object.column - 1) * TILE_SIZE}px;
          width: calc(var(--tile-size) * 2);
          height: var(--tile-size);
          top: var(--top);
          left: var(--left);
        `
      );
      grid.appendChild(objectElem);
      currencyLabelElem = document.getElementById("currency-label")!;
      break;
    }
  }
  for (let j = 0; j < object.squares.length; j++) {
    const coveredSquare = object.squares[j];
    const tileId = getTileIdFromPoint(coveredSquare);
    tiles[tileId].type = "OCCUPIED";
  }
}
for (let i = 0; i < TILE_COUNT; i++) {
  const { row, column } = getPointFromIterator(i);
  const id = getTileIdFromPoint({ row, column });
  const tile = tiles[id];
  const tileElem = document.createElement("div");
  tileElem.id = id;
  tileElem.className =
    tile.type === "OCCUPIED" ? "tile is-occupied" : "tile is-empty";
  grid.appendChild(tileElem);
}

let prev: Time;
function game(timeStamp: number) {
  console.log(TILE_SIZE);
  const time = getTime(timeStamp);
  if (time.minutes % 15 === 0 && prev?.minutes !== time.minutes) {
    prev = time;
    const h = time.hours === 0 ? 12 : time.hours;
    if (clockLabelElement) {
      clockLabelElement.innerText = `${h
        .toString()
        .padStart(2, "0")}:${time.minutes.toString().padStart(2, "0")}${
        time.amPM
      }`;
    }

    let rainProbability = 0.1;
    if (time.amPM === "PM") {
      rainProbability += 0.2;
    }
    if (isRaining) {
      rainProbability += 0.5;
    }
    if (Math.random() <= rainProbability) {
      isRaining = true;
    } else {
      isRaining = false;
    }
  }
  if (time.hours > prevTime?.hours) {
    plants = plants.map((p) => {
      let health = p.health;
      if (!isRaining) {
        health -= 1;
      }

      return { ...p, health };
    });
    plants.forEach((p) => {
      const el = plantElems[p.id];
      if (p.health === 0) {
        el.remove();
        return;
      }
      const stroke = (() => {
        if (p.health >= 2.5) {
          return "#12cc34";
        }
        if (p.health >= 1.5) {
          return "#cce841";
        }
        return "#997c51";
      })();
      el.setAttribute(
        "style",
        `
            --top: ${(p.row - 1) * TILE_SIZE}px;
            --left: ${(p.column - 1) * TILE_SIZE}px;
            width: var(--tile-size);
            height: var(--tile-size);
            top: var(--top);
            left: var(--left);
            stroke: ${stroke};
          `
      );
      plants = plants.filter((p) => p.health !== 0);
    });
  }
  if (isRaining) {
    plants = plants.map((p) => ({
      ...p,
      health: Math.min(p.health + 0.01, 3),
    }));
  } else {
  }

  const newTint = (() => {
    let h = time.hours;
    if (time.amPM === "PM") {
      h += 12;
    }
    if (h >= 20) {
      return "#8100a1";
    }
    if (h >= 16) {
      return "#d671f0";
    }

    return "#ffc45e";
  })();
  tintElem.style.setProperty("background", newTint);
  prevTime = time;
  currency = currency + 0.01;
  if (currencyLabelElem) {
    currencyLabelElem.innerText = "$" + Math.floor(currency);
  }
  requestAnimationFrame(game);
}

requestAnimationFrame(game);

// UTILS
function getTime(ms: number): Time {
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
  const amPM = targetDate.getUTCHours() >= 12 ? "PM" : "AM";
  return { month, day, hours, minutes, amPM };
}

function getPointFromIterator(i: number) {
  const n = i + 1;
  const row = Math.ceil(n / COLUMN_COUNT);
  const column = n % COLUMN_COUNT || COLUMN_COUNT;
  return { row, column };
}

function getTileIdFromPoint(point: { row: number; column: number }) {
  return (
    point.row.toString().padStart(2, "0") +
    point.column.toString().padStart(2, "0")
  );
}

function getWidthAndHeight() {
  const widthPercent = window.innerWidth / 16000000;
  const heightPercent = window.innerHeight / 9000000;
  const smallestPercent = Math.min(widthPercent, heightPercent);

  const gridWidth = Math.round(16000000 * smallestPercent);
  const gridHeight = Math.round(9000000 * smallestPercent);
  return {
    gridWidth,
    gridHeight,
  };
}

// TYPES
type Tiles = {
  [id: string]: {
    id: string;
    row: number;
    column: number;
    type: "OCCUPIED" | "EMPTY";
  };
};
type Plant = {
  id: string;
  row: number;
  column: number;
  squares: Array<{ row: number; column: number }>;
  health: number;
};
type Plants = Array<Plant>;
type Object = {
  id: string;
  row: number;
  column: number;
  type: "ui";
  name: "clock" | "currency" | "shop";
  squares: Array<{ row: number; column: number }>;
};
type Objects = Array<Object>;

type Time = {
  month: string;
  day: number;
  hours: number;
  minutes: number;
  amPM: string;
};

type PlayerAction = "placing" | "none";
