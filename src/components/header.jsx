/**
 * header.jsx
 *
 * The React component responsible for drawing the header bar at the top of the page.
 */
"use strict";

import React from "react";

/**
 * The header bar at the top of the page.
 */
export default class Header extends React.Component {

  render() {
    return (
        <div id="header">
          <p>Martian Robots</p>
        </div>
    );
  }

}
