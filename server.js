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

app.post("/memePost/", (req, res, next) => {
  db.run(
    `INSERT INTO Memes (memeText, memePic) VALUES ("${req.query.memeText}", "${
      req.query.memePic
    }")`,
    error => {
      if (error) {
        throw error;
      }
    }
  );

  res.status(201).send();
});

app.listen(port, () => console.log(`Listening on port ${port}`));
