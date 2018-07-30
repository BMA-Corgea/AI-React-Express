import React, { Component } from "react";
//not particularly important, this was supposed to be AI before I changed to working with SQL first
import { CanvasWork } from "./react-parts/CanvasWork.js";
import logo from "./logo.svg";

import "./App.css";

class App extends Component {
  //start with a constructor in order to have a state, have functions, and set up initially
  constructor(props) {
    super(props);

    this.state = {
      response: "",
      heck: "",
      memeData: []
    };

    //this initially fills out the table with all the data from the SQL databse
    this.callMemeData()
      .then(res => {
        for (let memeIndex = 0; memeIndex < res.express.length; memeIndex++) {
          this.state.memeData.push(
            <tr key={res.express[memeIndex].id}>
              <td>{res.express[memeIndex].id}</td>
              <td>{res.express[memeIndex].memeText}</td>
              <td>{res.express[memeIndex].memePic}</td>
            </tr>
          );
        }
      })
      .catch(err => console.log(err));

    //functions:
    this.handleHeck = this.handleHeck.bind(this);
    this.pickResponse = this.pickResponse.bind(this);
    this.addMeme = this.addMeme.bind(this);
    this.pickPic = this.pickPic.bind(this);
    this.memeClear = this.memeClear.bind(this);
    this.checkUpdate = this.checkUpdate.bind(this);
  }

  //adding a new row to the table doesn't always make it appear. This button makes it appear
  //it's the handle for an unstuck button
  checkUpdate() {
    this.forceUpdate();
  }

  //this will clear out the database by asking the server to do it
  //it will then clear the state which is responsible for what is seen on the front end
  memeClear() {
    this.clearMemes().catch(err => console.log(err));

    this.setState({
      memeData: []
    });
  }

  //add a row via a post request
  addMeme() {
    this.postMeme()
      .catch(err => console.log(err))
      .then(this.forceUpdate());
  }

  //this is the async function that sends the request to the express server
  clearMemes = async () => {
    await fetch("/memeClear");
  };

  //post request for the express server. information that wants to be passed is sent through the url
  //I wanted randomized text and pics, so I made a simple function that selects 1 of a possible
  //4 responses.
  //It then goes onto making the return data from the server (which is what we sent plus an id)
  //into a table row that is put into the front end.
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

  //Simple choose 1 of 4 function
  pickResponse() {
    let possibleResponses = [
      "Topographical Map",
      "Character Portrait",
      "Unfinished Story",
      "Manga Chapter"
    ];

    let responseRoll = Math.floor(Math.random() * (4 - 0)) + 0;

    if (responseRoll === 0) {
      return possibleResponses[0];
    } else if (responseRoll === 1) {
      return possibleResponses[1];
    } else if (responseRoll === 2) {
      return possibleResponses[2];
    } else if (responseRoll === 3) {
      return possibleResponses[3];
    }
  }

  //Simple choose 1 of 4 function
  pickPic() {
    let possibleResponses = [
      "Oil Painting",
      "Warm-up Sketch",
      "Masterpiece",
      "Scribbles"
    ];

    let responseRoll = Math.floor(Math.random() * (4 - 0)) + 0;

    if (responseRoll === 0) {
      return possibleResponses[0];
    } else if (responseRoll === 1) {
      return possibleResponses[1];
    } else if (responseRoll === 2) {
      return possibleResponses[2];
    } else if (responseRoll === 3) {
      return possibleResponses[3];
    }
  }

  //Practiing getting a get function to talk to express to update the front end
  handleHeck() {
    this.callHeck()
      .then(res => this.setState({ heck: this.state.heck + " " + res.express }))
      .catch(err => console.log(err));
  }

  //this is what was used in the constructor. It takes all rows from the SQL table and makes it into
  //trs
  callMemeData = async () => {
    const response = await fetch("/api/memeData");
    const body = await response.json();

    if (response.status !== 200) throw Error(body.message);

    return body;
  };

  //call heck is the get response to respond with "WHAT THE HECK?!"
  //doesn't need the SQL table so it was an earlier step
  callHeck = async () => {
    const response = await fetch("/api/heck");
    const body = await response.json();

    if (response.status !== 200) throw Error(body.message);

    return body;
  };

  //boiler plate that proved that express was talking to react. Very similar to callHeck
  //but it isn't activated by a button
  callApi = async () => {
    const response = await fetch("/api/hello");
    const body = await response.json();

    if (response.status !== 200) throw Error(body.message);

    return body;
  };

  //instead of being called by a button, callAPI is called when the component mounts
  //or, in other words, near the beginning provided no errors occur
  componentDidMount() {
    this.callApi()
      .then(res => this.setState({ response: res.express }))
      .catch(err => console.log(err));
  }

  //it is importnat for understanding the render to know that any response from the SQL data table
  //or response from express is first shuttled into the state which is what ends up being rendered.
  //in the table you can see all the trs and from the state. This is also true for the heckHandler
  //and the hello from express

  //in the future, I hope that the table can be its own component, the rows can be a component
  //and the buttons are the only part that is included in app.js
  //this proof of concept is not modular and is therefore hard to follow.
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">{this.state.response}</p>
        <p>This is the Heck section:</p>
        <h1>{this.state.heck}</h1>
        <button onClick={this.handleHeck}>What the Heck?</button>
        <CanvasWork canvasId="wewew" />
        <p>This is the meme data:</p>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Meme Text</th>
              <th>Meme Pic</th>
            </tr>
          </thead>
          <tbody>{this.state.memeData}</tbody>
        </table>
        <button onClick={this.addMeme}>Add a row to table</button>
        <button onClick={this.memeClear}>Clear all rows</button>
        <button onClick={this.checkUpdate}>Check for updated list</button>
      </div>
    );
  }
}

export default App;
