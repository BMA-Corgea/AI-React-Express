const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("./memeBase.sqlite");

db.all("SELECT * FROM memeChanges", (error, rows) => {
  if (error) {
    console.log(error);
  } else {
    console.log(rows);
  }
});
