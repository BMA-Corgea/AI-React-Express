import React from "react";

export class DropDownTable extends React.Component {
  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.props.onChange(event.target.value);

    event.preventDefault();
  }

  render() {
    return (
      <select onChange={this.handleChange}>
        {[...this.props.options].map(meme => {
          return <option key={meme}>{meme}</option>;
        })}
      </select>
    );
  }
}
