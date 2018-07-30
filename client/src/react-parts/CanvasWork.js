import React from "react";

export class CanvasWork extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      canvasProp: ""
    };

    this.defineCanvas = this.defineCanvas.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  defineCanvas() {
    this.setState({
      canvasProp: this.props.canvasId
    });
  }

  handleClick() {
    let canvas = document.getElementById(this.state.canvasProp);
    let c;

    if (canvas !== null) {
      c = canvas.getContext("2d");
    }

    c.fillRect(100, 100, 100, 100);
  }

  componentWillMount() {
    this.defineCanvas();
  }

  render() {
    let canvas = document.getElementById(this.state.canvasProp);
    let c;

    if (canvas !== null) {
      c = canvas.getContext("2d");
    }

    return (
      <div>
        <canvas
          height="400"
          width="400"
          id={this.props.canvasId}
          onClick={this.handleClick}
        />
      </div>
    );
  }
}
