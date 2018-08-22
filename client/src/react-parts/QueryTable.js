import React from "react";
import { QueryLine } from "./QueryLine";

/*This is the meat and potatoes of the query system. This is responsible
for conglomerating all the different queries into a single state array.
First, you have the functions that add or delete a line. This not only
has to delete the JSX, but it also has to delete the object that is responsible
for all the pertinent information that can be selected from the JSX.
This is the difference between the queries and the queryConditions. A queryCount
is added to make sure each query is unique so we can tell which one is being
manipulated. This way, when handleQueryValues is fired by any one of the
query lines, it can match the id to the same id (shown as count) on the line.
Once it is matched, it will change all the values to the values that have been
sent over from the query line.*/
export class QueryTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = { queryCount: 0, queries: [], queryConditions: [] };

    this.addQueryLine = this.addQueryLine.bind(this);
    this.deleteQuery = this.deleteQuery.bind(this);
    this.executeQuery = this.executeQuery.bind(this);
    this.checkLog = this.checkLog.bind(this);
    this.handleQueryValues = this.handleQueryValues.bind(this);
  }

  handleQueryValues(values) {
    this.setState({
      queryConditions: this.state.queryConditions.map(meme => {
        if (
          String(Object.values(meme)[0]) === String(Object.values(values)[3])
        ) {
          return {
            id: Object.values(meme)[0],
            field: Object.values(values)[0],
            qualifier: Object.values(values)[1],
            input: Object.values(values)[2]
          };
        } else {
          return meme;
        }
      })
    });
  }

  checkLog() {
    console.log("these are the queries:");
    console.log(this.state.queries);
    console.log("these are the conditions:");
    console.log(this.state.queryConditions);
  }

  executeQuery(event) {}

  deleteQuery(event) {
    this.setState({
      queries: this.state.queries.filter(meme => {
        return meme.key !== event.target.id.split("button")[1];
      }),
      queryConditions: this.state.queryConditions.filter(meme => {
        return (
          String(Object.values(meme)[0]) !== event.target.id.split("button")[1]
        );
      })
    });
  }

  addQueryLine() {
    this.setState({
      queryCount: this.state.queryCount + 1,
      queries: [
        ...this.state.queries,
        <div key={this.state.queryCount}>
          <QueryLine
            values={this.handleQueryValues}
            count={this.state.queryCount}
          />
          <button
            onClick={this.deleteQuery}
            key={this.state.queryCount}
            id={"button" + this.state.queryCount}
          >
            Delete
          </button>
        </div>
      ],
      queryConditions: [
        ...this.state.queryConditions,
        {
          id: this.state.queryCount,
          field: "Meme Id",
          qualifier: "EQUALS",
          input: ""
        }
      ]
    });
  }

  render() {
    return (
      <div>
        <p>
          Click here to add new query line:{" "}
          <button onClick={this.addQueryLine}>New Query Line</button>
        </p>{" "}
        {this.state.queries}
        <br />
        <br />
        <button onClick={this.executeQuery}>Execute Query</button>
        <button onClick={this.checkLog}>Check queries in console log</button>
      </div>
    );
  }
}
