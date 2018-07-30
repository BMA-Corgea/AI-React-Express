import React, { Component } from "react";
import { CanvasWork } from "./react-parts/CanvasWork.js";
import logo from "./logo.svg";

import "./App.css";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      response: "",
      heck: "",
      memeData: []
    };

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

    this.handleHeck = this.handleHeck.bind(this);
    this.pickResponse = this.pickResponse.bind(this);
    this.addMeme = this.addMeme.bind(this);
    this.pickPic = this.pickPic.bind(this);
    this.memeClear = this.memeClear.bind(this);
    this.checkUpdate = this.checkUpdate.bind(this);
  }

  checkUpdate() {
    this.forceUpdate();
  }

  memeClear() {
    this.clearMemes().catch(err => console.log(err));

    this.setState({
      memeData: []
    });
  }

  addMeme() {
    this.postMeme()
      .catch(err => console.log(err))
      .then(this.forceUpdate());
  }

  clearMemes = async () => {
    await fetch("/memeClear");
  };

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

  handleHeck() {
    this.callHeck()
      .then(res => this.setState({ heck: this.state.heck + " " + res.express }))
      .catch(err => console.log(err));
  }

  callMemeData = async () => {
    const response = await fetch("/api/memeData");
    const body = await response.json();

    if (response.status !== 200) throw Error(body.message);

    return body;
  };

  callMemeCheck = async () => {
    const response = await fetch("/api/memeCheck");
    const body = await response.json();

    if (response.status !== 200) throw Error(body.message);

    return body;
  };

  callHeck = async () => {
    const response = await fetch("/api/heck");
    const body = await response.json();

    if (response.status !== 200) throw Error(body.message);

    return body;
  };

  callApi = async () => {
    const response = await fetch("/api/hello");
    const body = await response.json();

    if (response.status !== 200) throw Error(body.message);

    return body;
  };

  componentDidMount() {
    this.callApi()
      .then(res => this.setState({ response: res.express }))
      .catch(err => console.log(err));
  }

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
