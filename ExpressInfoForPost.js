//express router that accepts a post request to /animals/

animalsRouter.post("/", (req, res, next) => {
  const receivedAnimal = createElement("animals", req.query);
  if (receivedAnimal) {
    animals.push(receivedAnimal);
    res.status(201).send(receivedAnimal);
  } else {
    res.status(400).send();
  }
});

//express without router that accepts a post request

app.post("/expressions", (req, res, next) => {
  const receivedExpression = createElement("expressions", req.query);
  if (receivedExpression) {
    expressions.push(receivedExpression);
    res.status(201).send(receivedExpression);
  } else {
    res.status(400).send();
  }
});

//long hand XMLHTTPRequest

const xhr = new XMLHttpRequest();
const url = "https://api-to-call.com/endpoint";
const data = JSON.stringify({ id: "200" });

xhr.responseType = "json";

xhr.onreadystatechange = () => {
  if (xhr.readyState === XMLHttpRequest.DONE) {
    return xhr.response;
  }
};

xhr.open("POST", url);
xhr.send(data);

//async POST request

const getData = async () => {
  try {
    const response = await fetch("https://api-to-call.com/endpoint", {
      method: "POST",
      body: JSON.stringify({ id: 200 })
    });
    if (response.ok) {
      const jsonResponse = await response.json();
      return jsonResponse;
    }
    throw new Error("Request failed!");
  } catch (error) {
    console.log(error);
  }
};

//My plan is to put the async POST request in the react part
//and then recieve it with the express without router that accepts a post request
//The code would look like this:
//***PLEASE NOTE THAT THE SUCCESSFUL CODE STARTS AT 117

const postMeme = async () => {
  try {
    const response = await fetch("/memePost", {
      method: "POST",
      body: JSON.stringify({
        memeText: pickResponse(),
        memePic: "wow"
      })
    });
    if (response.ok) {
      const jsonResponse = await response.json();
      return jsonResponse;
    }
    throw new Error("Request failed!");
  } catch (error) {
    console.log(error);
  }
};

//This would post the meme, this would be the handle that the button has.
//This is what the express server would do:

app.post("/postMeme", (req, res, next) => {
  function recivedTest() {
    if (req.query) {
      return true;
    } else {
      return false;
    }
  }

  if (recivedTest) {
    db.run(
      "INSERT INTO Memes (memeText, memePic) VALUES (" +
        req.query.memeText +
        "," +
        req.query.memePic +
        ")",
      error => {
        if (error) {
          throw error;
        }
      }
    );
    res.status(201).send("S'all good, bro!");
  } else {
    res.status(400).send();
  }
});

//I went to battle and came back victorious! This is what the front end code ended up looking like.

function addMeme() {
  this.postMeme()
    .catch(err => console.log(err))
    .then(this.forceUpdate());
}

postMeme = async () => {
  await fetch(
    `/memePost/?memeText=${this.pickResponse()}&memePic=${this.pickPic()}`,
    {
      method: "POST"
    }
  ).then(res =>
    res.json().then(data =>
      this.state.memeData.push(
        <tr key={data.express.id}>
          <td>{data.express.id}</td>
          <td>{data.express.memeText}</td>
          <td>{data.express.memePic}</td>
        </tr>
      )
    )
  );
};

//add meme is a handle for a button. Significantly less code is needed to send a post response.
//the information that needs to be transfered over to SQL is put into the URL that is sent
//An update is forced and then, sometimes, it will update the table. There is another
//button whose sole purpose is to force update again.

//This is the express back end part:
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

//line by line, db serialize makes sure that the item is inserted into the table before
//we attempt to get the latest row out of the table. Without serialize, the get function would
//probably finish first and be useless.
//req.query is how we recieve the information from the front end. This can be inserted into the
//quote that is sent to the SQL table.
//after it is inserted, the response is sent from the get function because that way we can include
//the latest row in the data table back to the front end. This allows the front end to update
//by changing the state instead of having to refresh the page to see results
