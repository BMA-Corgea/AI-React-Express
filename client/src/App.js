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
      memeData: [],
      lastID: 0,
      PUTID: 0,
      PUTMemeText: "",
      PUTMemePic: "",
      originalMemeText: "",
      originalMemePic: "",
      deletePUTID: 0
    };

    //this initially fills out the table with all the data from the SQL databse
    this.callMemeData()
      .then(res => {
        for (let memeIndex = 0; memeIndex < res.express.length; memeIndex++) {
          this.setState({
            lastID: res.express[memeIndex].id
          });

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
    this.changeMeme = this.changeMeme.bind(this);
    this.updatePUTID = this.updatePUTID.bind(this);
    this.updatePUTMemeText = this.updatePUTMemeText.bind(this);
    this.updatePUTMemePic = this.updatePUTMemePic.bind(this);
    this.filterMemeData = this.filterMemeData.bind(this);
    this.checkMemeData = this.checkMemeData.bind(this);
    this.handleFilterScenarios = this.handleFilterScenarios.bind(this);
    this.handleMemeDelete = this.handleMemeDelete.bind(this);
    this.updatedDeletePUTID = this.updatedDeletePUTID.bind(this);
    this.findMemeInArray = this.findMemeInArray.bind(this);
  }

  handleMemeDelete(event) {
    this.deleteMeme()

      .then(
        this.setState({
          memeData: [
            ...this.state.memeData.filter(meme => {
              return meme.key !== this.state.deletePUTID;
            })
          ]
        })
      )
      .catch(err => console.log(err));

    event.preventDefault();
  }

  /* The array doesn't like disorder in the IDs. I found this problem when there were only 7
  active IDs, but the IDs went up to 10. This was done by adding a delete requests
  instead of simply saying that the item in the array will be the PUTID - 1th getElementById
  of the array, I need to find the element that corrisponds to the correct ID*/
  findMemeInArray(memeID) {
    for (
      let memeDataIndex = 0;
      memeDataIndex < this.state.memeData.length;
      memeDataIndex++
    ) {
      if (this.state.memeData[memeDataIndex].key === memeID) {
        return memeDataIndex;
      }
    }
  }

  /* This is simple enough, it is the three different scenarios that are possible
after the put request. It just makes sure that, if one of the form sections is blank
that it will keep the original value. The state for originalMemeText/Pic is handled in
the filterMemeData() function.*/
  handleFilterScenarios() {
    if (this.state.PUTMemeText !== "" && this.state.PUTMemePic !== "") {
      return (
        <tr key={this.state.PUTID}>
          <td>{this.state.PUTID}</td>
          <td>{this.state.PUTMemeText}</td>
          <td>{this.state.PUTMemePic}</td>
        </tr>
      );
    } else if (this.state.PUTMemeText !== "" && this.state.PUTMemePic === "") {
      return (
        <tr key={this.state.PUTID}>
          <td>{this.state.PUTID}</td>
          <td>{this.state.PUTMemeText}</td>
          <td>{this.state.originalMemePic}</td>
        </tr>
      );
    } else if (this.state.PUTMemeText === "" && this.state.PUTMemePic !== "") {
      return (
        <tr key={this.state.PUTID}>
          <td>{this.state.PUTID}</td>
          <td>{this.state.originalMemeText}</td>
          <td>{this.state.PUTMemePic}</td>
        </tr>
      );
    }
  }

  checkMemeData() {
    console.log(this.state.memeData);
  }

  //filterMemeData is made for the purpose of updating the table rows after
  //the put request changes it in the SQL database
  /*So, this function ended up being much more complicated than I had expected
  First, we take note of what the row is before we change it. This makes is so
  that I can handle the scenario of one of the forms being blank. The second part
  of the function must be done within a callback. Don't ask me why
  (https://stackoverflow.com/questions/37847028/react-setstate-not-working-on-first-try-but-works-on-second)
  the three dots makes it so that the new array will take all the objects of the previous
  array, but it won't be an array object within the array. The, the filter makes it so that
  the array item that is the same as the one being selected is deleted. Finally,
  it pushes a new tr that has the same id and has done the put requests
  this will produce the change without having to refresh the page*/
  filterMemeData() {
    if (
      this.state.memeData.some(meme => {
        return meme.key === this.state.PUTID;
      })
    ) {
      this.setState(
        {
          originalMemeText: this.state.memeData[
            this.findMemeInArray(this.state.PUTID)
          ].props.children[1].props.children,
          originalMemePic: this.state.memeData[
            this.findMemeInArray(this.state.PUTID)
          ].props.children[2].props.children
        },
        () => {
          this.setState({
            memeData: [
              ...this.state.memeData.filter(meme => {
                return meme.key !== this.state.PUTID;
              }),
              this.handleFilterScenarios()
            ]
          });
        }
      );
    }
  }

  //These 4 functions update the state so that the PUT request can pull from the state
  //I prefer this to asking for a getElementById
  //added another function for deleting a row
  updatePUTID(event) {
    this.setState({
      PUTID: event.target.value
    });
  }

  updatedDeletePUTID(event) {
    this.setState({
      deletePUTID: event.target.value
    });
  }

  updatePUTMemeText(event) {
    this.setState({
      PUTMemeText: event.target.value
    });
  }

  updatePUTMemePic(event) {
    this.setState({
      PUTMemePic: event.target.value
    });
  }

  //this is for handling PUT requests. It has extra logic to make sure that blank fields don't
  //change the field. Also, if the requested ID is larger than the field it won't go
  changeMeme(event) {
    this.memePUT()

      .catch(err => console.log(err))
      .then(this.filterMemeData());

    event.preventDefault();
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
    await fetch("/memeClear").then(res =>
      res.json().then(data => console.log(data))
    );
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
      res.json().then(data => {
        this.state.memeData.push(
          <tr key={data.express.id}>
            <td>{data.express.id}</td>
            <td>{data.express.memeText}</td>
            <td>{data.express.memePic}</td>
          </tr>
        );
        this.setState({
          lastID: data.express.id
        });
        console.log(data.post);
      })
    );
  };

  deleteMeme = async () => {
    if (this.state.deletePUTID < 1) {
      alert("ID must be above 0");
    } else if (this.state.deletePUTID > this.state.lastID) {
      alert("ID is above the highest ID");
    } else if (this.state.deletePUTID % 1 !== 0) {
      alert("Cmon, man...");
    } else {
      if (
        this.state.memeData.some(meme => {
          return meme.key === this.state.deletePUTID;
        })
      ) {
        await fetch(`/memeDelete/?id=${this.state.deletePUTID}`, {
          method: "PUT"
        }).then(res => res.json().then(data => console.log(data)));
      } else {
        alert("ID does not corrispond to a row");
        throw new Error("ID mismatch");
      }
    }
  };

  //Meme put is complicated because of all the different possibilities to mess up the put request
  //Say you don't want to change the Pic and just the text, you can just leave pic blank with this.
  //The first part is making sure the ID corrisponds to something in the SQL Database
  //The second part is different PUT requests for the 4 different scenarios
  //If both are blank it will call you out on it.
  memePUT = async () => {
    if (this.state.PUTID < 1) {
      alert("ID must be above 0");
      throw new Error("ID mismatch");
    } else if (this.state.PUTID > this.state.lastID) {
      alert("ID is above the highest ID");
      throw new Error("ID mismatch");
    } else if (this.state.PUTID % 1 !== 0) {
      alert("Cmon, man...");
      throw new Error("ID mismatch");
    } else if (
      this.state.memeData.some(meme => {
        return meme.key === this.state.PUTID;
      })
    ) {
      if (this.state.PUTMemeText !== "" && this.state.PUTMemePic !== "") {
        await fetch(
          `/memePUT/?id=${this.state.PUTID}&memeText=${
            this.state.PUTMemeText
          }&memePic=${this.state.PUTMemePic}`,
          {
            method: "PUT"
          }
        ).then(res =>
          res.json().then(data => {
            console.log(data);
          })
        );
      } else if (
        this.state.PUTMemeText !== "" &&
        this.state.PUTMemePic === ""
      ) {
        await fetch(
          `/memePUT/?id=${this.state.PUTID}&memeText=${this.state.PUTMemeText}`,
          {
            method: "PUT"
          }
        ).then(res =>
          res.json().then(data => {
            console.log(data);
          })
        );
      } else if (
        this.state.PUTMemeText === "" &&
        this.state.PUTMemePic !== ""
      ) {
        await fetch(
          `/memePUT/?id=${this.state.PUTID}&memePic=${this.state.PUTMemePic}`,
          {
            method: "PUT"
          }
        ).then(res =>
          res.json().then(data => {
            console.log(data);
          })
        );
      } else if (
        this.state.PUTMemeText === "" &&
        this.state.PUTMemePic === ""
      ) {
        alert("Both Meme Text and Meme Pic are blank");
      }
    } else {
      alert("ID does not corrispond to a row");
      throw new Error("ID mismatch");
    }
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
        <br />
        <br />
        <form>
          Manipulate an ID:<br />ID:{" "}
          <input type="number" onChange={this.updatePUTID} /> Meme Text:{" "}
          <input type="text" onChange={this.updatePUTMemeText} /> Meme Pic:{" "}
          <input type="text" onChange={this.updatePUTMemePic} />
          <br />
          <button onClick={this.changeMeme}>Enter request</button>
        </form>
        <br />
        <button onClick={this.checkMemeData}>Check meme data</button>
        <br />
        <br />
        <form>
          Select ID to delete:{" "}
          <input type="number" onChange={this.updatedDeletePUTID} />
          <br />
          <button onClick={this.handleMemeDelete}>Delete row</button>
        </form>
      </div>
    );
  }
}

export default App;
