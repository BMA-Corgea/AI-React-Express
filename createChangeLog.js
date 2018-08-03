const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("./memeBase.sqlite");

/* The change log is a table whose purpose is to keep a record of all the states
that each meme has been in. It will keep a time stamp as well as the id that is
being changed. It is technically unimpressive and is simply a copy paste of createDataBase*/

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
