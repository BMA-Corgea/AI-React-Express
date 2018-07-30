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

//the most basic express req res you will ever see
app.get("/api/hello", (req, res) => {
  res.send({ express: "Hello From Express" });
});

//also incredibly simple, this was was for a button instead
app.get("/api/heck", (req, res) => {
  res.send({ express: "What the HECK?!" });
});

//this is when express talks to the SQL data table "Memes"
//select all and send them all
//to get them into the table, you need to do a for each and get res.express[Index].(attribute)
app.get("/api/memeData", (req, res) => {
  db.all("SELECT * FROM Memes", (error, rows) => {
    if (error) {
      throw error;
    }

    res.send({ express: rows });
  });
});

//rather simple because nothing needs to be sent back. This is just copy and pasted
//sqlite3 jargon
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

//The biggest trouble - taking information from react and then giving back new information
//It takes information from the query (the url)
//Then we get the row id for the item we just made via last_insert_rowid() which is an SQL function
//the 201 status is sent back with the entire row from the last rowid
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

//It listens here and we established the port at the top of the file
app.listen(port, () => console.log(`Listening on port ${port}`));
