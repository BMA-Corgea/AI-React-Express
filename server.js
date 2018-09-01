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
app.use(bodyParser.text({ type: "application/vnd.ms-excel" }));

/*This function takes a CSV file and turns it into a JSON object that has all the
headers as string and all the rows as objects*/
function parseCSV(file) {
  const output = file
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

  return output;
}

//returns truthy if string is blank
function isntBlank(field) {
  if (field === "") {
    return false;
  } else {
    return true;
  }
}

//decides whether to update memeText or memePic
function whichColumn(columnIndex) {
  if (columnIndex === "1") {
    return "memeText";
  } else if (columnIndex === "2") {
    return "memePic";
  }
}

/*This function takes a bunch of rows and adds them to the data table and change log*/
app.post("/confirmAddRowFile", (req, res) => {
  let output = parseCSV(req.body);
  let outputParse = output.filter(meme => {
    return typeof meme !== "string";
  });
  let titleParse = output.filter(meme => {
    return typeof meme === "string";
  });
  let acceptableHeadersInOrder = ["memeText", "memePic"];
  let unacceptableHeadingBoolean = false;
  let uHBIndex = 0;
  let fileHeadersOrder = [];

  for (let headingIndex = 0; headingIndex < titleParse.length; headingIndex++) {
    if (acceptableHeadersInOrder.includes(titleParse[headingIndex]) === false) {
      unacceptableHeadingBoolean = true;
      uHBIndex = headingIndex;
    } else {
      for (
        acceptableHeaderIndex = 0;
        acceptableHeaderIndex < acceptableHeadersInOrder.length;
        acceptableHeaderIndex++
      ) {
        if (
          acceptableHeadersInOrder[acceptableHeaderIndex] ===
          titleParse[headingIndex]
        ) {
          fileHeadersOrder.push(acceptableHeaderIndex);
        }
      }
    }
  }

  if (unacceptableHeadingBoolean === true) {
    res.send({ error: `I don't like the heading for column ${uHBIndex + 1}` });
  } else if (
    unacceptableHeadingBoolean === false &&
    titleParse.length < acceptableHeadersInOrder.length
  ) {
    res.send({
      error: `At least one of the headings is missing from the file`
    });
  } else {
    for (let rowIndex = 0; rowIndex < outputParse.length; rowIndex++) {
      let rowData = [];

      for (
        let columnIndex = 0;
        columnIndex < titleParse.length;
        columnIndex++
      ) {
        rowData.push(
          outputParse[rowIndex][Object.keys(outputParse[rowIndex])[columnIndex]]
        );
      }

      db.serialize(() => {
        db.run(
          `INSERT INTO Memes (memeText, memePic) VALUES ("${
            rowData[fileHeadersOrder[0]]
          }", "${rowData[fileHeadersOrder[1]]}")`,
          error => {
            if (error) {
              throw error;
            }
          }
        ),
          db.get(
            "SELECT * FROM Memes WHERE id=last_insert_rowid()",
            (error, row) => {
              if (error) {
                throw error;
              }

              db.run(
                `INSERT INTO memeChanges (date, memeId, newMemeText, newMemePic) VALUES ("${makeTimeStamp()}", "${
                  row.id
                }", "${rowData[fileHeadersOrder[0]]}", "${
                  rowData[fileHeadersOrder[1]]
                }")`
              );
            }
          );
      });
    }
  }

  res.send({ express: "I think the rows have been added!" });
});

/*This function will parse a file into a format that the front end can understand
Once the user gets a chance to see the rows that they intend to add, then they can
confirm the add rows*/
app.post("/sendAddRowFile/", (req, res) => {
  let output = parseCSV(req.body);

  let outputParse = output.filter(meme => {
    return typeof meme !== "string";
  });

  res.send({ express: outputParse });
});

/*This will take a file from the front end, check if it's a CSV, and send a response
if it's not, but if it is a CSV, then it will update the data table and send a
success response*/
app.post("/sendInputFile", (req, res) => {
  const output = parseCSV(req.body);

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
});

/*I want a warning to appear before I confirm a mass update. This way, I can
check before I ruin everything*/
/*First we parse the CSV and then we get two for loops going.
To work from the inside out, we get the current data table updated one data point
at a time. This is significant because it doesn't matter how many fields there are
second, all the data points for a given row are put into the change table and then
a confirmation is sent back to the front end*/
app.post("/confirmInputFile", (req, res) => {
  const output = parseCSV(req.body);

  let outputParse = output.filter(meme => {
    return typeof meme !== "string";
  });

  let titleParse = output.filter(meme => {
    return typeof meme === "string";
  });

  for (let rowsIndex = 0; rowsIndex < outputParse.length; rowsIndex++) {
    let rowData = [];

    for (let columnIndex = 1; columnIndex < titleParse.length; columnIndex++) {
      rowData.push(
        outputParse[rowsIndex][Object.keys(outputParse[rowsIndex])[columnIndex]]
      );
      if (
        isntBlank(
          outputParse[rowsIndex][
            Object.keys(outputParse[rowsIndex])[columnIndex]
          ]
        )
      ) {
        db.run(
          `UPDATE Memes SET ${titleParse[columnIndex]} = "${
            outputParse[rowsIndex][
              Object.keys(outputParse[rowsIndex])[columnIndex]
            ]
          }" WHERE id = ${
            outputParse[rowsIndex][Object.keys(outputParse[rowsIndex])[0]]
          }`,
          error => {
            if (error) {
              throw error;
            }
          }
        );
      }
    }

    db.run(
      `INSERT INTO memeChanges (date, memeId, newMemeText, newMemePic) VALUES ("${makeTimeStamp()}", "${
        outputParse[rowsIndex][Object.keys(outputParse[rowsIndex])[0]]
      }", "${rowData[0]}", "${rowData[1]}" )`,
      error => {
        if (error) {
          throw error;
        }
      }
    );
  }

  res.send({
    express: "Update complete!"
  });
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
  const output = parseCSV(fs.readFileSync("./Excel_Work/Book1.csv", "utf8"));

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

    db.get("SELECT * FROM Memes WHERE _insert_rowid()", (error, row) => {
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
