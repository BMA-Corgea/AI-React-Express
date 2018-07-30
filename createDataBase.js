const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("./memeBase.sqlite");

db.serialize(() => {
  db.run("DROP TABLE IF EXISTS Memes", error => {
    if (error) {
      throw error;
    }
  });

  db.run(
    "CREATE TABLE Memes (id INTEGER PRIMARY KEY, memeText STRING NOT NULL, memePic STRING NOT NULL)",
    error => {
      if (error) {
        throw error;
      }
    }
  );

  db.run(
    "INSERT INTO Memes (memeText, memePic) VALUES ('wow dude nice', 'dont stop believing')",
    error => {
      if (error) {
        throw error;
      }
    }
  );

  db.run(
    "INSERT INTO Memes (memeText, memePic) VALUES ('poopoo pepe', 'YEETERTON')",
    error => {
      if (error) {
        throw error;
      }
    }
  );

  db.run(
    "INSERT INTO Memes (memeText, memePic) VALUES ('E', 'Markiplier')",
    error => {
      if (error) {
        throw error;
      }
    }
  );

  db.all("SELECT * FROM Memes", (error, rows) => {
    if (error) {
      throw error;
    }

    console.log(rows);
  });
});
