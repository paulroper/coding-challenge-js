/**
 * robot.jsx
 *
 * A React component responsible for drawing a robot on the grid.
 */
"use strict";

import React from "react";

export default class Robot extends React.Component {
  render() {
    return (
      <div className="robot" style={this.props.style} >
        <p>{this.props.id + " " + this.props.heading}</p>
      </div>
    );
  }
}
