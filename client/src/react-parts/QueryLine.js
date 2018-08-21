import React from "react";
import { DropDownTable } from "./DropDownTable.js";

export class QueryLine extends React.Component {
  render() {
    return (
      <form>
        <DropDownTable options={["Meme Id", "Meme Text", "Meme Pic"]} />{" "}
        <DropDownTable
          options={["EQUALS", "CONTAINS", "DOES NOT CONTAIN", "DOES NOT EQUAL"]}
          className="Qualifiers"
        />
        <input />
      </form>
    );
  }
}
