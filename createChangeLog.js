const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("./memeBase.sqlite");

db.serialize(() => {
  db.run("DROP TABLE IF EXISTS memeChanges", error => {
    if (error) {
      throw error;
    }
  });

  db.run(
    "CREATE TABLE memeChanges (id INTEGER PRIMARY KEY, date STRING, memeId STRING, newMemeText STRING, newMemePic STRING)",
    error => {
      if (error) {
        throw error;
      }
    }
  );

  db.all("SELECT * FROM memeChanges", (error, rows) => {
    if (error) {
      throw error;
    }

    console.log(rows);
  });
});
