import React from "react";
import { QueryLine } from "./QueryLine";

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
