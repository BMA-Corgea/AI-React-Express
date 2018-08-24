import React from "react";
import { DropDownTable } from "./DropDownTable.js";

/*This is a single unit of query. The idea was to have a cascade
of different qualities to search for at the same time by having many
of these. This keeps track of two drop down tables: one for each field
then one for each qualifier. You then put what you want of that field as
an input. So, for example, you can search "meme text EQUALS 'hello world'"
Notice the setState on line 27 has a callback. This is so the asynchronous
stateSet happens before it sends the full state off to the parent.*/
export class QueryLine extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentField: "Meme Id",
      currentQualifier: "EQUALS",
      currentInput: "",
      count: this.props.count,
      currentOr: ""
    };

    this.handleField = this.handleField.bind(this);
    this.handleQualifier = this.handleQualifier.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.handleOr = this.handleOr.bind(this);
  }

  handleOr(Or) {
    this.setState(
      {
        currentOr: Or
      },
      () => {
        this.props.values(this.state);
      }
    );
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
        <DropDownTable options={["", "OR"]} onChange={this.handleOr} />
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
