import React from "react";

export class TableData extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tableData: [],
      tableElements: []
    };

    this.setOriginalState = this.setOriginalState.bind(this);
  }

  setOriginalState() {
    this.setState({ tableData: [this.props.data] });

    console.log("Hello!");
  }

  componentDidMount() {
    this.setState({ tableData: [this.props.data] });

    console.log("Hello!");
  }

  render() {
    console.log(this.props.data);

    return <tr key={this.props.tableKey}>{this.state.tableData}</tr>;
  }
}
