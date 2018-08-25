const express = require("express");
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("./memeBase.sqlite");
const {
  calculateAverages,
  addClimateRowToObject,
  logNodeError,
  printQueryResults
} = require("./utils");
const { currentTime, makeTimeStamp } = require("./currentDateInConsoleLog");
const fs = require("fs");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 5000;

/*Basically, middleware checks every request so that I don't need to
repeat functions. In this case, the imported function checks requests
for a body and, if it does have one, it can be observed by the express
server as req.body*/
app.use(bodyParser.json());
app.use(bodyParser.text({ type: "text/csv" }));

/*This will take a file from the front end, check if it's a CSV, and send a response
if it's not, but if it is a CSV, then it will update the data table and send a
success response*/
app.post("/sendInputFile", (req, res) => {
  const output = fs
    .readFileSync(req.body, "utf8")
    .trim()
    .split("\r\n")
    .map(line => line.split(","))
    .reduce((memes, line) => {
      titles = [];
      object = {};
      experimentMeme = [];

      titles = memes.filter(meme => {
        return typeof meme === "string";
      });

      for (memeIndex = 0; memeIndex < titles.length; memeIndex++) {
        object[titles[memeIndex]] = line[memeIndex];
      }

      memes.push(object);

      return memes;
    });

  res.send({ express: memes });
});

/*These three functions translate the query table on the front end into information
that the SQL database is able to recognize. Simple, elementary if statements whose
return value is placed into the query string*/
function qualifierParse(qualifierString) {
  if (qualifierString === "EQUALS") {
    return "=";
  } else if (qualifierString === "DOES NOT EQUAL") {
    return "<>";
  } else if (qualifierString === "CONTAINS") {
    return " LIKE ";
  } else if (qualifierString === "DOES NOT CONTAIN") {
    return " NOT LIKE ";
  }
}

function fieldParse(fieldString) {
  if (fieldString === "Meme Id") {
    return "id";
  } else if (fieldString === "Meme Text") {
    return "memeText";
  } else if (fieldString === "Meme Pic") {
    return "memePic";
  }
}

function orParse(orString, condIndex) {
  if (condIndex === 0) {
    return "";
  } else {
    if (orString === "") {
      return " AND ";
    } else {
      return " OR ";
    }
  }
}

//this recieves a query to the database and sends back a subset of the full data table
/*The object is to take a JSON object of query requirements and turn it into a single
string that queries the database. It starts with queryParse and the second half
is like "id=2 AND memePic="WOW" OR memeText="DANG"
Each part of the JSON object needs to be translated from the front end to the backend*/
app.post("/sendQuery", (req, res) => {
  let queryParse = "SELECT * FROM Memes WHERE ";

  for (
    let condIndex = 0;
    condIndex < req.body.queryConditions.length;
    condIndex++
  ) {
    queryParse =
      queryParse +
      `${orParse(
        req.body.queryConditions[condIndex].or,
        condIndex
      )}${fieldParse(
        req.body.queryConditions[condIndex].field
      )}${qualifierParse(req.body.queryConditions[condIndex].qualifier)}"${
        req.body.queryConditions[condIndex].input
      }"`;
  }

  db.all(queryParse, (error, rows) => {
    if (error) {
      throw error;
    }

    res.send({
      express: rows
    });
  });
});

//the most basic express req res you will ever see
app.get("/api/hello", (req, res) => {
  res.send({ express: "Hello From Express" });
});

//also incredibly simple, this was was for a button instead
app.get("/api/heck", (req, res) => {
  res.send({ express: "What the HECK?!" });
});

app.get("/getCSV", (req, res) => {
  const CSVReadStream = fs.createReadStream("./Excel_Work/Book1.csv", "utf8");

  const fullFile = fs
    .readFileSync("./Excel_Work/Book1.csv", "utf8")
    .trim()
    .split("\r\n")
    .map(line => line.split(","));

  const output = fs
    .readFileSync("./Excel_Work/Book1.csv", "utf8")
    .trim()
    .split("\r\n")
    .map(line => line.split(","))
    .reduce((memes, line) => {
      titles = [];
      object = {};
      experimentMeme = [];

      titles = memes.filter(meme => {
        return typeof meme === "string";
      });

      for (memeIndex = 0; memeIndex < titles.length; memeIndex++) {
        object[titles[memeIndex]] = line[memeIndex];
      }

      memes.push(object);

      return memes;
    });

  let outputParse = output.filter(meme => {
    return typeof meme !== "string";
  });

  let titleParse = output.filter(meme => {
    return typeof meme === "string";
  });

  res.send({
    express: outputParse,
    titles: titleParse
  });

  /*
  CSVReadStream.on("data", function(chunk) {
    console.log(chunk);
        res.send({ express: chunk });
  });
  */
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

app.get("/memeChanges", (req, res) => {
  db.all("SELECT * FROM memeChanges", (error, rows) => {
    if (error) {
      throw error;
    }

    res.send({ express: rows });
  });
});

//rather simple because nothing needs to be sent back. This is just copy and pasted
//sqlite3 jargon
//It is the same code posted twice for the two tables
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
  });
  res.status(201).send({ express: `Table successfully cleared!` });
});

//The biggest trouble - taking information from react and then giving back new information
//It takes information from the query (the url)
//Then we get the row id for the item we just made via last_insert_rowid() which is an SQL function
//the 201 status is sent back with the entire row from the last rowid
/* The 201 status is now send in a get of the latest change log query.
this is done so that the id of the change log and a time stamp can be sent to the front end
Lines 123-147 are change log additions*/
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

      db.run(
        `INSERT INTO memeChanges (date, memeId, newMemeText, newMemePic) VALUES ("${makeTimeStamp()}", "${
          row.id
        }", "${req.query.memeText}", "${req.query.memePic}")`,
        (error, changeRow) => {
          if (error) {
            throw error;
          }
        }
      );

      db.get(
        "SELECT * FROM memeChanges WHERE id=last_insert_rowid()",
        (error, changeRows) => {
          if (error) {
            throw error;
          }

          res.status(201).send({
            express: row,
            post: "Row successfully posted!",
            change: changeRows
          });
        }
      );
    });
  });
});

//memePUT is responsible for doing a put request for changing memeText and memePic. It is the go to
//whether either field is blank or neither field is blank.
//it will do a db.run for which ever field is filled in.
//the db.run is a simple UPDATE function on the SQL table. If you have followed this far
//the function should make intuitive sense.
/*The change log has been added to all 3 conditions of the PUT. For more understanding
check the comment above the POST (103) */
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

      db.run(
        `INSERT INTO memeChanges (date, memeId, newMemeText, newMemePic) VALUES ("${currentTime}", "${
          req.query.id
        }", "${req.query.memeText}", "${req.query.memePic}")`,
        (error, row) => {
          if (error) {
            throw error;
          }
        }
      );

      db.get(
        "SELECT * FROM memeChanges WHERE id=last_insert_rowid()",
        (error, changeRows) => {
          if (error) {
            throw error;
          }

          res.status(201).send({
            express: `update successful for ${req.query.id}`,
            change: changeRows
          });
        }
      );
    });
  } else if (
    typeof req.query.memeText !== "undefined" &&
    typeof req.query.memePic === "undefined"
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
        `INSERT INTO memeChanges (date, memeId, newMemeText) VALUES ("${currentTime}", "${
          req.query.id
        }", "${req.query.memeText}")`,
        (error, row) => {
          if (error) {
            throw error;
          }
        }
      );

      db.get(
        "SELECT * FROM memeChanges WHERE id=last_insert_rowid()",
        (error, changeRows) => {
          if (error) {
            throw error;
          }

          res.status(201).send({
            express: `update successful for ${req.query.id}`,
            change: changeRows
          });
        }
      );
    });
  } else if (
    typeof req.query.memeText === "undefined" &&
    typeof req.query.memePic !== "undefined"
  ) {
    db.serialize(() => {
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

      db.run(
        `INSERT INTO memeChanges (date, memeId, newMemePic) VALUES ("${currentTime}", "${
          req.query.id
        }", "${req.query.memePic}")`,
        (error, row) => {
          if (error) {
            throw error;
          }
        }
      );

      db.get(
        "SELECT * FROM memeChanges WHERE id=last_insert_rowid()",
        (error, changeRows) => {
          if (error) {
            throw error;
          }

          res.status(201).send({
            express: `update successful for ${req.query.id}`,
            change: changeRows
          });
        }
      );
    });
  }
});

/*Delete updates the change log, it doesn't need to get sent back because
the two rows just say DELETE instead of a value. */
app.put("/memeDelete", (req, res, next) => {
  db.serialize(() => {
    db.run(`DELETE FROM Memes WHERE id=${req.query.id}`, error => {
      if (error) {
        throw error;
      }
    });

    db.run(
      `INSERT INTO memeChanges (date, memeId, newMemeText, newMemePic) VALUES ("${currentTime}", "${
        req.query.id
      }", "DELETED", "DELETED")`,
      (error, row) => {
        if (error) {
          throw error;
        }
      }
    );

    db.get(
      "SELECT * FROM memeChanges WHERE id=last_insert_rowid()",
      (error, changeRows) => {
        if (error) {
          throw error;
        }

        res.status(201).send({
          express: `Delete successful for ${req.query.id}`,
          change: changeRows
        });
      }
    );
  });
});

//It listens here and we established the port at the top of the file
app.listen(port, () => console.log(`Listening on port ${port}`));
