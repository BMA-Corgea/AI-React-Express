import React from "react";

export class DropDownTable extends React.Component {
  render() {
    return (
      <select>
        {[...this.props.options].map(meme => {
          return <option key={meme}>{meme}</option>;
        })}
      </select>
    );
  }
}
