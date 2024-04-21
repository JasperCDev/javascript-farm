import { TIME_SPEED, COLUMN_COUNT } from "./constants";

// export function getTime(ms: number): Time {
//   const milliseconds = ms * TIME_SPEED;
//   const baseDate = new Date(0); // January 1, 1970
//   baseDate.setUTCHours(6, 0, 0, 0); // Set the time to 6:00 AM

//   const targetDate = new Date(baseDate.getTime() + milliseconds);

//   const month = targetDate.toLocaleString("en-US", {
//     month: "short",
//   });
//   const day = targetDate.getUTCDate();
//   const hours = targetDate.getUTCHours() % 12;
//   const minutes = targetDate.getUTCMinutes();
//   const amPM = targetDate.getUTCHours() >= 12 ? "PM" : "AM";
//   return { month, day, hours, minutes, amPM };
// }

export function getPointFromIterator(i: number) {
  const n = i + 1;
  const row = Math.ceil(n / COLUMN_COUNT);
  const column = n % COLUMN_COUNT || COLUMN_COUNT;
  return { row, column };
}

export function getTileIdFromPoint(point: { row: number; column: number }) {
  return (
    point.row.toString().padStart(2, "0") +
    point.column.toString().padStart(2, "0")
  );
}

export function getWidthAndHeight() {
  const widthPercent = window.innerWidth / 16000000;
  const heightPercent = window.innerHeight / 9000000;
  const smallestPercent = Math.min(widthPercent, heightPercent);
  const gridWidth = Math.round(16000000 * smallestPercent);
  const gridHeight = Math.round(9000000 * smallestPercent);
  console.log(window.innerWidth, " x ", window.innerHeight);
  console.log("w = ", window.innerWidth, " / ", 16000000, " = ", widthPercent);
  console.log("h = ", window.innerHeight, " / ", 9000000, " = ", heightPercent);
  console.log("smallest = ", smallestPercent);
  console.log("gridW = 16000000 * ", smallestPercent, " = ", gridWidth);
  console.log("gridH = 9000000 * ", smallestPercent, " = ", gridHeight);
  /*
    1000 x 1000
    w = 1000 / 16000000 = 0.0000625
    h = 1000 /  9000000 = 0.00011111
    smallest = w = 0.0000625
    gridW = 16000000 * 0.0000625 = 1000
    gridH =  9000000 * 0.0000625 = 562.5
  */
  return {
    gridWidth,
    gridHeight,
  };
}
