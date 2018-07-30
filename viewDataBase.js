const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("./memeBase.sqlite");

db.serialize(() => {
  db.all("SELECT * FROM Memes", (error, rows) => {
    if (error) {
      throw error;
    }

    console.log(rows);
  });

  db.each("SELECT * FROM Memes", (error, row) => {
    if (error) {
      throw error;
    }

    console.log(row);
  });
});
