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
  res.status(201).send({ express: `Table successfully cleared!` });
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

      res.status(201).send({
        express: row,
        post: "Row successfully posted!"
      });
    });
  });
});

//memePUT is responsible for doing a put request for changing memeText and memePic. It is the go to
//whether either field is blank or neither field is blank.
//it will do a db.run for which ever field is filled in.
//the db.run is a simple UPDATE function on the SQL table. If you have followed this far
//the function should make intuitive sense.
app.put("/memePUT", (req, res, next) => {
  if (
    typeof req.query.memeText !== "undefined" &&
    typeof req.query.memePic !== "undefined"
  ) {
    db.serialize(() => {
      db.run(
        `UPDATE Memes SET memeText = "${req.query.memeText}" WHERE id = ${
          req.query.id
        }`,
        error => {
          if (error) {
            throw error;
          }
        }
      );

      db.run(
        `UPDATE Memes SET memePic = "${req.query.memePic}" WHERE id = ${
          req.query.id
        }`,
        error => {
          if (error) {
            throw error;
          }
        }
      );
    });
    res.status(201).send({ express: `update successful for ${req.query.id}` });
  } else if (
    typeof req.query.memeText !== "undefined" &&
    typeof req.query.memePic === "undefined"
  ) {
    db.run(
      `UPDATE Memes SET memeText = "${req.query.memeText}" WHERE id = ${
        req.query.id
      }`,
      error => {
        if (error) {
          throw error;
        }
      }
    );
    res.status(201).send({ express: `update successful for ${req.query.id}` });
  } else if (
    typeof req.query.memeText === "undefined" &&
    typeof req.query.memePic !== "undefined"
  ) {
    db.run(
      `UPDATE Memes SET memePic = "${req.query.memePic}" WHERE id = ${
        req.query.id
      }`,
      error => {
        if (error) {
          throw error;
        }
      }
    );
    res.status(201).send({ express: `update successful for ${req.query.id}` });
  }
});

app.put("/memeDelete", (req, res, next) => {
  db.run(`DELETE FROM Memes WHERE id=${req.query.id}`, error => {
    if (error) {
      throw error;
    }
  });
  res.status(201).send({ express: `Delete successful for ${req.query.id}` });
});

//It listens here and we established the port at the top of the file
app.listen(port, () => console.log(`Listening on port ${port}`));
