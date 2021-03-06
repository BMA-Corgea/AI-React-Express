import React, { Component } from "react";
//not particularly important, this was supposed to be AI before I changed to working with SQL first
import { CanvasWork } from "./react-parts/CanvasWork.js";
import logo from "./logo.svg";
import { TableData } from "./react-parts/TableData.js";
import { QueryTable } from "./react-parts/QueryTable.js";
import "./App.css";

class App extends Component {
  //start with a constructor in order to have a state, have functions, and set up initially
  constructor(props) {
    super(props);

    this.state = {
      response: "",
      heck: "",
      memeData: [],
      changeData: [],
      lastID: 0,
      PUTID: 0,
      PUTMemeText: "",
      PUTMemePic: "",
      originalMemeText: "",
      originalMemePic: "",
      deletePUTID: 0,
      CSVTableBody: [],
      CSVTableHeaders: [],
      numberFound: 0,
      sentQueryTable: [],
      fileInput: {},
      fileInputHeaders: [],
      fileInputBody: [],
      fileInputTable: [],
      fileInputStatus: false,
      addRowFileTable: [],
      addRowFileStatus: false,
      addRowInput: {}
    };

    //this initially fills out the table with all the data from the SQL databse
    this.callMemeData()
      .then(res => {
        for (let memeIndex = 0; memeIndex < res.express.length; memeIndex++) {
          this.setState({
            lastID: res.express[memeIndex].id
          });

          this.setState({
            memeData: [
              ...this.state.memeData,
              <tr key={res.express[memeIndex].id}>
                <td>{res.express[memeIndex].id}</td>
                <td>{res.express[memeIndex].memeText}</td>
                <td>{res.express[memeIndex].memePic}</td>
              </tr>
            ]
          });
        }
      })
      .catch(err => console.log(err));

    //This copy paste fills out the original change log
    this.callMemeChanges().then(res => {
      for (let memeIndex = 0; memeIndex < res.express.length; memeIndex++) {
        this.setState({
          changeData: [
            ...this.state.changeData,
            <tr key={res.express[memeIndex].id}>
              <td>{res.express[memeIndex].id}</td>
              <td>{res.express[memeIndex].date}</td>
              <td>{res.express[memeIndex].memeId}</td>
              <td>{res.express[memeIndex].newMemeText}</td>
              <td>{res.express[memeIndex].newMemePic}</td>
            </tr>
          ]
        });
      }
    });

    this.fillCSVObject();

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
    this.fillCSVObject = this.fillCSVObject.bind(this);
    this.handleSentQuery = this.handleSentQuery.bind(this);
    this.handleFileEnter = this.handleFileEnter.bind(this);
    this.handleFileInput = this.handleFileInput.bind(this);
    this.parseFileInputTable = this.parseFileInputTable.bind(this);
    this.confirmInputFile = this.confirmInputFile.bind(this);
    this.deleteInputUpdate = this.deleteInputUpdate.bind(this);
    this.handleMemeDataExport = this.handleMemeDataExport.bind(this);
    this.handleChangeDataExport = this.handleChangeDataExport.bind(this);
    this.handleFileRowAdd = this.handleFileRowAdd.bind(this);
    this.parseObjectToCSV = this.parseObjectToCSV.bind(this);
    this.parseObjectToTable = this.parseObjectToTable.bind(this);
    this.confirmAddRowFile = this.confirmAddRowFile.bind(this);
    this.deleteAddRowFile = this.deleteAddRowFile.bind(this);
    this.forceUpdate = this.forceUpdate.bind(this);
  }

  /*Recheck the meme data and the change table because the methods used
  to automatically update are unreliable. This is a reimagining of the
  code that is used after a mass update with a CSV file*/
  forceUpdate() {
    this.setState(
      {
        memeData: [],
        changeData: [],
        lastID: 0
      },
      () => {
        this.callMemeData()
          .then(res => {
            this.setState({
              lastID: res.express.length
            });
            for (
              let memeIndex = 0;
              memeIndex < res.express.length;
              memeIndex++
            ) {
              this.setState({
                memeData: [
                  ...this.state.memeData,
                  <tr key={res.express[memeIndex].id}>
                    <td>{res.express[memeIndex].id}</td>
                    <td>{res.express[memeIndex].memeText}</td>
                    <td>{res.express[memeIndex].memePic}</td>
                  </tr>
                ]
              });
            }
          })
          .catch(err => console.log(err));

        this.callMemeChanges()
          .then(res => {
            for (
              let memeIndex = 0;
              memeIndex < res.express.length;
              memeIndex++
            ) {
              this.setState({
                changeData: [
                  ...this.state.changeData,
                  <tr key={res.express[memeIndex].id}>
                    <td>{res.express[memeIndex].id}</td>
                    <td>{res.express[memeIndex].date}</td>
                    <td>{res.express[memeIndex].memeId}</td>
                    <td>{res.express[memeIndex].newMemeText}</td>
                    <td>{res.express[memeIndex].newMemePic}</td>
                  </tr>
                ]
              });
            }
          })
          .catch(err => console.log(err));
      }
    );
  }

  /*This is a reusable piece of code that takes the code that is created by the
express server's reusable piece of code and turns it into an HTML table*/
  parseObjectToTable(JSONObject) {
    let outputHeaders = [...Object.keys(JSONObject[0])].map(meme => {
      return <th key={meme}>{meme}</th>;
    });
    let Output = [];

    for (let rowIndex = 0; rowIndex < JSONObject.length; rowIndex++) {
      let tableRow = [];

      for (
        let keyIndex = 0;
        keyIndex < Object.keys(JSONObject[rowIndex]).length;
        keyIndex++
      ) {
        tableRow.push(
          <TableData
            key={keyIndex}
            tableKey={keyIndex}
            dataPoint={
              JSONObject[rowIndex][Object.keys(JSONObject[rowIndex])[keyIndex]]
            }
          />
        );
      }
      Output.push(<tr key={rowIndex}>{[...tableRow]}</tr>);
    }

    return (
      <table>
        <thead>
          <tr>{outputHeaders}</tr>
        </thead>
        <tbody>{Output}</tbody>
      </table>
    );
  }

  /*This is a reusable piece of code that takes the code that is created by the
express server's reusable piece of code and turns it into a CSV file format*/
  parseObjectToCSV(JSONObject) {
    let outputHeaders = [...Object.keys(JSONObject[0])];
    let Output = [];

    for (let rowIndex = 0; rowIndex < JSONObject.length; rowIndex++) {
      let rowData = [];
      for (
        let keyIndex = 0;
        keyIndex < Object.keys(JSONObject[rowIndex]).length;
        keyIndex++
      ) {
        rowData.push(
          JSONObject[rowIndex][Object.keys(JSONObject[rowIndex])[keyIndex]]
        );
      }
      Output = [...Output, rowData.join(",") + "\r\n"];
    }
    Output = [outputHeaders.join(",") + "\r\n", ...Output];

    return Output;
  }

  /*This is a copy of the CSV edit code. When the add rows are added, it triggers
a boolean change that puts the state table onto the front end. Along with this
comes two buttons that can either confirm or delete an update. Delete turns
the state back to before the file was added, confirm throws it back to the server*/
  parseAddRowTable() {
    if (this.state.addRowFileStatus === true) {
      return (
        <div>
          {this.state.addRowFileTable}
          <button onClick={this.confirmAddRowFile}>Confirm Update</button>
          <button onClick={this.deleteAddRowFile}>Delete Update</button>
        </div>
      );
    }
  }

  confirmAddRowFileSend = async enterFile => {
    const response = await fetch("/confirmAddRowFile/", {
      method: "POST",
      headers: {
        "Content-Type": "application/vnd.ms-excel"
      },
      body: enterFile
    });
    const body = await response.json();

    return body;
  };

  confirmAddRowFile() {
    this.confirmAddRowFileSend(this.state.addRowInput)
      .then(res => {
        if (res.error) {
          alert(res.error);
        }

        if (res.express) {
          console.log(res.express);
        }
      })
      .then(this.forceUpdate());
  }

  deleteAddRowFile() {
    this.setState({
      addRowFileTable: [],
      addRowFileStatus: false,
      addRowInput: {}
    });
  }

  /*This will build off everything that's been happening. It'll be a ping to the
  server with a CSV file that then gets parsed and added to the data table and
  change log. The difference with this one is that it will return an error if
  there are rows that contain errors*/
  handleFileRowAdd(event) {
    this.setState(
      {
        addRowInput: document.getElementById("addRowFile").files[0]
      },
      () => {
        this.sendAddRowFile(this.state.addRowInput)
          .then(res => {
            this.setState({
              addRowFileStatus: true,
              addRowFileTable: this.parseObjectToTable(res.express)
            });
          })
          .catch(err => {
            console.log(err);
          });
      }
    );
    event.preventDefault();
  }

  sendAddRowFile = async enterFile => {
    const response = await fetch("/sendAddRowFile/", {
      method: "POST",
      headers: {
        "Content-Type": "application/vnd.ms-excel"
      },
      body: enterFile
    });
    const body = await response.json();

    return body;
  };

  /*I'm not perfectly happy about these two functions, but they work. I feel like the parsing could
be done server side and the front end would be passed an array that is the end result of
exportCSVHeaders. To that end, I don't think that the headers should have to be hard coded,
but that's how the data comes in. After that, I don't know anything about the blob code, but
it functions.*/
  handleMemeDataExport(event) {
    this.callMemeData().then(res => {
      let exportCSV = this.parseObjectToCSV(res.express);

      let blob = new Blob(exportCSV, { type: "text/csv;charset=utf-8;" });
      if (navigator.msSaveBlob) {
        // IE 10+
        navigator.msSaveBlob(blob, "Meme Table Data.csv");
      } else {
        var link = document.createElement("a");
        if (link.download !== undefined) {
          // feature detection
          // Browsers that support HTML5 download attribute
          var url = URL.createObjectURL(blob);
          link.setAttribute("href", url);
          link.setAttribute("download", "Meme Table Data.csv");
          link.style.visibility = "hidden";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
    });
    event.preventDefault();
  }

  /*Identical to the function above it, except that the headers are changed (along with the filename)*/
  handleChangeDataExport(event) {
    this.callMemeChanges().then(res => {
      let exportCSV = this.parseObjectToCSV(res.express);

      let blob = new Blob(exportCSV, { type: "text/csv;charset=utf-8;" });
      if (navigator.msSaveBlob) {
        // IE 10+
        navigator.msSaveBlob(blob, "Meme Table Changes.csv");
      } else {
        var link = document.createElement("a");
        if (link.download !== undefined) {
          // feature detection
          // Browsers that support HTML5 download attribute
          var url = URL.createObjectURL(blob);
          link.setAttribute("href", url);
          link.setAttribute("download", "Meme Table Changes.csv");
          link.style.visibility = "hidden";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
    });
    event.preventDefault();
  }

  //If the file chosen is incorrect, then you can clear the table that is made out of the data
  deleteInputUpdate() {
    this.setState({
      fileInputHeaders: [],
      fileInputBody: [],
      fileInputTable: [],
      fileInputStatus: false
    });
  }

  /*This seems like a large function, but the majority of it is simply copy and pasting
the refreshing of the current data table and the change table
the confirmation is a post request and console logging a success statement (or catching
an error)*/
  confirmInputFile() {
    this.sendFileConfirm(this.state.fileInput)
      .then(res => {
        console.log(res);
      })
      .then(this.forceUpdate());
  }

  //Post request for CSV file, note the content type
  sendFileConfirm = async enterFile => {
    const response = await fetch("/confirmInputFile/", {
      method: "POST",
      headers: {
        "Content-Type": "application/vnd.ms-excel"
      },
      body: enterFile
    });
    const body = await response.json();

    return body;
  };

  /*The first post request returns a table that makes sure that the CSV file
contains the correct information before a mass update*/
  parseFileInputTable() {
    if (this.state.fileInputStatus === true) {
      return (
        <div>
          {this.state.fileInputTable}
          <button onClick={this.confirmInputFile}>Confirm Update</button>
          <button onClick={this.deleteInputUpdate}>Delete Update</button>
        </div>
      );
    }
  }

  /*This will set the state so that file enter can send the result of this function
  to the express server*/
  /*As of now, I have just discovered how to reference the file with the document
  get id. The next step is to pass that over to the express server for digestion*/
  handleFileInput(event) {
    event.persist();
    this.setState({
      fileInput: document.getElementById("updateFile").files[0]
    });
  }

  /*The objective of this function is to be able to upload a CSV file that changes
  the data table. The file gets uploaded here and then sent off to the Express
  server where it can be digested and sent into the SQL database*/
  /*The previous table is deleted so it doesn't get stacked on top of and then
  two for loops are used to select each row and put each table data piece inside
  of it. After that, the table is constructed, and a true/false is triggered
  to show the table (instead of nothing) along with buttons to confirm or deny*/
  handleFileEnter(event) {
    this.setState(
      {
        fileInputHeaders: [],
        fileInputBody: [],
        fileInputTable: [],
        fileInputStatus: false
      },
      () => {
        this.sendFileEnter(this.state.fileInput)
          .then(res => {
            for (
              let bodyIndex = 0;
              bodyIndex < res.express.length;
              bodyIndex++
            ) {
              let tableRow = [];
              for (
                let keyIndex = 0;
                keyIndex < Object.keys(res.express[0]).length;
                keyIndex++
              ) {
                tableRow.push(
                  <TableData
                    key={keyIndex}
                    tableKey={keyIndex}
                    dataPoint={
                      res.express[bodyIndex][
                        Object.keys(res.express[bodyIndex])[keyIndex]
                      ]
                    }
                  />
                );
              }
              this.setState({
                fileInputBody: [
                  ...this.state.fileInputBody,
                  <tr key={bodyIndex}>{tableRow}</tr>
                ]
              });
            }

            for (
              let headerIndex = 0;
              headerIndex < res.titles.length;
              headerIndex++
            ) {
              this.setState({
                fileInputHeaders: [
                  ...this.state.fileInputHeaders,
                  <th key={headerIndex}>{res.titles[headerIndex]}</th>
                ]
              });
            }

            this.setState({
              fileInputTable: [
                <table key="1">
                  <thead>
                    <tr>{this.state.fileInputHeaders}</tr>
                  </thead>
                  <tbody>{this.state.fileInputBody}</tbody>
                </table>
              ],
              fileInputStatus: true
            });
          })
          .catch(err => console.log(err));
      }
    );

    event.preventDefault();
  }

  /*This will send a POST request to the express server in order to send a CSV. This
  will ultimately update the data table*/
  sendFileEnter = async enterFile => {
    const response = await fetch("/sendInputFile/", {
      method: "POST",
      headers: {
        "Content-Type": "application/vnd.ms-excel"
      },
      body: enterFile
    });
    const body = await response.json();

    return body;
  };

  //Once the Query table has been fired, we send a query to the data table
  /*This is relatively simple with the tools that I have built along the way,
  First, the query state is set to 0 so that the query doesn't continue on
  an earlier query. Then the function is called to ask the backend for the query
  that is explained in the QueryTable react part. The results of that query
  then get put into a table row by row and the number of results is recorded
  at the top.*/
  handleSentQuery(sentQuery) {
    this.setState(
      {
        numberFound: 0,
        sentQueryTable: []
      },
      () => {
        this.queryDataTable(sentQuery)
          .then(res => {
            for (let resIndex = 0; resIndex < res.express.length; resIndex++) {
              this.setState({
                numberFound: res.express.length,
                sentQueryTable: [
                  ...this.state.sentQueryTable,
                  <tr key={resIndex}>
                    <td>{res.express[resIndex].id}</td>
                    <td>{res.express[resIndex].memeText}</td>
                    <td>{res.express[resIndex].memePic}</td>
                  </tr>
                ]
              });
            }
          })
          .catch(err => {
            console.log(err);
          });
      }
    );
  }

  //This is the request to the express server
  /*Note that the header is necessary so that the express server can parse the body
  and the body needs to be JSON.stringify-ed as well. With these two attributes,
  the express server can access req.body with the help of body-parser*/
  queryDataTable = async sentQuery => {
    const response = await fetch("/sendQuery/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(sentQuery)
    });
    const body = await response.json();

    return body;
  };

  Qualifiers = ["EQUALS", "CONTAINS", "DOES NOT EQUAL", "DOES NOT CONTAIN"];

  /* One big part of filling a table is being able to fill it in masse. The ways
I have done this in a professional setting is with CSV files (though in my position
we have an app that can use a regular excel file). I want to first see a CSV output
appear on screen. After that, it will just need to be parsed like any other information
with for loops, post/put requests, and the like*/
  fillCSVObject() {
    this.CSVArrayFill()
      .then(res => {
        for (let memeIndex = 0; memeIndex < res.titles.length; memeIndex++) {
          this.setState({
            CSVTableHeaders: [
              ...this.state.CSVTableHeaders,
              <th key={memeIndex}>{res.titles[memeIndex]}</th>
            ]
          });
        }

        for (let memeIndex = 0; memeIndex < res.express.length; memeIndex++) {
          let tableRow = [];

          for (
            let keyCounter = 0;
            keyCounter < Object.keys(res.express[0]).length;
            keyCounter++
          ) {
            tableRow.push(
              <TableData
                key={keyCounter}
                tableKey={keyCounter}
                dataPoint={
                  res.express[memeIndex][
                    Object.keys(res.express[memeIndex])[keyCounter]
                  ]
                }
              />
            );
          }
          this.setState({
            CSVTableBody: [
              ...this.state.CSVTableBody,
              <tr key={memeIndex}>{tableRow}</tr>
            ]
          });
        }
      })
      .catch(err => console.log(err));
  }

  /*Get request for a CSV */
  CSVArrayFill = async () => {
    const response = await fetch("/getCSV/");
    const body = await response.json();

    return body;
  };

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
after the put request. It just makes sure that if one of the form sections is blank
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
    console.log(this.state.changeData);
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
  checkUpdate(event) {
    this.forceUpdate();

    event.preventDefault();
  }

  //this will clear out the database by asking the server to do it
  //it will then clear the state which is responsible for what is seen on the front end
  memeClear() {
    this.clearMemes().catch(err => console.log(err));

    this.setState({
      memeData: [],
      changeData: []
    });
  }

  //add a row via a post request
  addMeme() {
    this.postMeme().catch(err => console.log(err));
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
  /* Line 314 has a handle for the change log. The server now sends two objects in
  the JSON object, the post and the change. The change is a query from the change log
  table that has a timestamp for the post. This helps track the previous states of each meme*/
  postMeme = async () => {
    await fetch(
      `/memePost/?memeText=${this.pickResponse()}&memePic=${this.pickPic()}`,
      {
        method: "POST"
      }
    ).then(res =>
      res.json().then(data => {
        this.setState({
          memeData: [
            ...this.state.memeData,
            <tr key={data.express.id}>
              <td>{data.express.id}</td>
              <td>{data.express.memeText}</td>
              <td>{data.express.memePic}</td>
            </tr>
          ],
          changeData: [
            ...this.state.changeData,
            <tr key={data.change.id}>
              <td>{data.change.id}</td>
              <td>{data.change.date}</td>
              <td>{data.change.memeId}</td>
              <td>{data.change.newMemeText}</td>
              <td>{data.change.newMemePic}</td>
            </tr>
          ]
        });
        this.setState({
          lastID: data.express.id
        });
        console.log(data.post);
      })
    );
  };

  /*Delete meme now updates the change log with a row with data
  from a query from a second table*/
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
        }).then(res =>
          res.json().then(data => {
            console.log(data.express);
            this.setState({
              changeData: [
                ...this.state.changeData,
                <tr key={data.change.id}>
                  <td>{data.change.id}</td>
                  <td>{data.change.date}</td>
                  <td>{data.change.memeId}</td>
                  <td>{data.change.newMemeText}</td>
                  <td>{data.change.newMemePic}</td>
                </tr>
              ]
            });
          })
        );
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
  /*Each put will now update the change log for example 373*/
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
            console.log(data.express);
            this.setState({
              changeData: [
                ...this.state.changeData,
                <tr key={data.change.id}>
                  <td>{data.change.id}</td>
                  <td>{data.change.date}</td>
                  <td>{data.change.memeId}</td>
                  <td>{data.change.newMemeText}</td>
                  <td>{data.change.newMemePic}</td>
                </tr>
              ]
            });
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
            console.log(data.express);
            this.setState({
              changeData: [
                ...this.state.changeData,
                <tr key={data.change.id}>
                  <td>{data.change.id}</td>
                  <td>{data.change.date}</td>
                  <td>{data.change.memeId}</td>
                  <td>{data.change.newMemeText}</td>
                  <td />
                </tr>
              ]
            });
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
            console.log(data.express);
            this.setState({
              changeData: [
                ...this.state.changeData,
                <tr key={data.change.id}>
                  <td>{data.change.id}</td>
                  <td>{data.change.date}</td>
                  <td>{data.change.memeId}</td>
                  <td />
                  <td>{data.change.newMemePic}</td>
                </tr>
              ]
            });
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

  /* After the GET, POST, PUT, and DELETE requests to the front end, server, and SQL TABLE
  had been made to work as I wanted - I wanted to keep a change log. Every item that gets
  posted, changed, or deleted has a time stamp and a way to identify the meme that
  was manipulated*/
  callMemeChanges = async () => {
    const response = await fetch("/memeChanges");
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
        <h1>This is the meme data:</h1>
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
        <br />
        <br />
        <h3>This is manupulation of the data table:</h3>
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
        <br />
        <br />
        <h3>This is the table of changes to the data table</h3>
        <table>
          <thead>
            <tr>
              <th>id</th>
              <th>date</th>
              <th>meme Id</th>
              <th>meme text</th>
              <th>meme pic</th>
            </tr>
          </thead>
          <tbody>{this.state.changeData}</tbody>
        </table>
        <br />
        <br />
        <h3>This is from a CSV File:</h3>
        <br />
        <table>
          <thead>
            <tr>{this.state.CSVTableHeaders}</tr>
          </thead>
          <tbody>{this.state.CSVTableBody}</tbody>
        </table>
        <br />
        <br />
        <h3>Query the table here:</h3>
        <QueryTable sendQuery={this.handleSentQuery} />
        <br />
        <br />
        <h3>These are the results of the query:</h3>
        <p>
          Number of results found: <strong>{this.state.numberFound}</strong>
        </p>
        <table>
          <thead>
            <tr>
              <th>Meme Id</th>
              <th>Meme Text</th>
              <th>Meme Pic</th>
            </tr>
          </thead>
          <tbody>{this.state.sentQueryTable}</tbody>
        </table>
        <br />
        <br />
        <h3>Upload a CSV to edit the table here:</h3>
        <form>
          <input
            id="updateFile"
            type="file"
            onChange={this.handleFileInput}
            accept=".csv"
          />
          <button onClick={this.handleFileEnter}>Enter file</button>
        </form>
        <br />
        {this.parseFileInputTable()}
        <br />
        <br />
        <h3>Export the different data tables:</h3>
        <form>
          <button onClick={this.handleMemeDataExport}>
            Export the meme data
          </button>
          <br />
          <button onClick={this.handleChangeDataExport}>
            Export the change log
          </button>
        </form>
        <br />
        <br />
        <h3>Add Data Rows en Masse:</h3>
        <form>
          <input id="addRowFile" type="file" accept=".csv" />
          <button onClick={this.handleFileRowAdd}>Enter add rows</button>
        </form>
        {this.parseAddRowTable()}
      </div>
    );
  }
}

export default App;
