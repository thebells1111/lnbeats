import fs from "fs";

const data = fs.readFileSync("albums_with_songs.json", "utf8");
const albums = JSON.parse(data);
const lastUpdateTime = albums.reduce(
  (max, obj) => (obj.lastUpdateTime > max ? obj.lastUpdateTime : max),
  0
);

let _data = { lastUpdateTime, albums };

fs.writeFileSync(
  "albums_with_songs.json",
  JSON.stringify(_data).replace(/\r\n|\r/g, "\n"),
  "utf-8"
);
