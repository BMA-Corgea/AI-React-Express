import React from "react";

export class TableData extends React.Component {
  render() {
    return <td key={this.props.tableKey}>{this.props.dataPoint}</td>;
  }
}
