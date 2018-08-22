import React from "react";
import { DropDownTable } from "./DropDownTable.js";

export class QueryLine extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentField: "Meme Id",
      currentQualifier: "EQUALS",
      currentInput: "",
      count: this.props.count
    };

    this.handleField = this.handleField.bind(this);
    this.handleQualifier = this.handleQualifier.bind(this);
    this.handleInput = this.handleInput.bind(this);
  }

  handleField(field) {
    this.setState(
      {
        currentField: field
      },
      () => {
        this.props.values(this.state);
      }
    );
  }

  handleQualifier(qualifier) {
    this.setState(
      {
        currentQualifier: qualifier
      },
      () => {
        this.props.values(this.state);
      }
    );
  }

  handleInput(event) {
    this.setState(
      {
        currentInput: event.target.value
      },
      () => {
        this.props.values(this.state);
      }
    );

    event.preventDefault();
  }

  render() {
    return (
      <form>
        <DropDownTable
          options={["Meme Id", "Meme Text", "Meme Pic"]}
          onChange={this.handleField}
        />{" "}
        <DropDownTable
          options={["EQUALS", "CONTAINS", "DOES NOT CONTAIN", "DOES NOT EQUAL"]}
          className="Qualifiers"
          onChange={this.handleQualifier}
        />
        <input onChange={this.handleInput} />
      </form>
    );
  }
}
