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
