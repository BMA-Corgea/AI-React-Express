const express = require("express");
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("./memeBase.sqlite");
const {
  calculateAverages,
  addClimateRowToObject,
  logNodeError,
  printQueryResults
} = require("./utils");

const app = express();
const port = process.env.PORT || 5000;

app.get("/api/hello", (req, res) => {
  res.send({ express: "Hello From Express" });
});

app.get("/api/heck", (req, res) => {
  res.send({ express: "What the HECK?!" });
});

app.get("/api/memeData", (req, res) => {
  db.all("SELECT * FROM Memes", (error, rows) => {
    if (error) {
      throw error;
    }

    res.send({ express: rows });
  });
});

app.get("/memeClear", (req, res) => {
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
  });
});

app.post("/memePost/", (req, res, next) => {
  db.serialize(() => {
    db.run(
      `INSERT INTO Memes (memeText, memePic) VALUES ("${
        req.query.memeText
      }", "${req.query.memePic}")`,
      error => {
        if (error) {
          throw error;
        }
      }
    );

    db.get("SELECT * FROM Memes WHERE id=last_insert_rowid()", (error, row) => {
      if (error) {
        throw error;
      }

      res.status(201).send({ express: row });
    });
  });
});

app.listen(port, () => console.log(`Listening on port ${port}`));
