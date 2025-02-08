import { getCollection } from "../lnb/database/_db/connect.js";

await getCollection("albums")
  .then((collection) => {
    return collection.find().toArray(); // Return the promise here
  })
  .then((data) => {
    console.log(data.length);
    process.exit(0);
  });
