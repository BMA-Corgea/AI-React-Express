import React from "react";

/*Dropdown table is essentially just an HTML select object. The difference which
requres a contructor and a function is that it passes the change in options
onto the parent. It is also more convienent to pass the options into the
object as an array of strings. If I want hello and world to be the options
then I just put <DropDownTable options=["foo", "bar"] />*/
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
