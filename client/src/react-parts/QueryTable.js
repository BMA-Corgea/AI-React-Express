import React from "react";
import { QueryLine } from "./QueryLine";

export class QueryTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = { queryCount: 0, queries: [] };

    this.addQueryLine = this.addQueryLine.bind(this);
    this.deleteQuery = this.deleteQuery.bind(this);
    this.executeQuery = this.executeQuery.bind(this);
  }

  executeQuery(event) {}

  deleteQuery(event) {
    this.setState({
      queries: this.state.queries.filter(meme => {
        return meme.key !== event.target.id.split("button")[1];
      })
    });
  }

  addQueryLine() {
    this.setState({
      queryCount: this.state.queryCount + 1,
      queries: [
        ...this.state.queries,
        <div key={this.state.queryCount}>
          <QueryLine />
          <button
            onClick={this.deleteQuery}
            key={this.state.queryCount}
            id={"button" + this.state.queryCount}
          >
            Delete
          </button>
        </div>
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
      </div>
    );
  }
}
