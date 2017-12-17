import React from "react";
import * as constants from "./const.js";

export default class Course extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.handleMouseOver = this.handleMouseOver.bind(this);
    this.handleMouseOut = this.handleMouseOut.bind(this);
    this.state = {
      selected: false,              // whether the user is hovering over it
      needs: "none",                // course status and button colour
    };
  };

  handleClick() {
    if (this.state.needs === "done") {
      this.setState({needs: "none"});
    } else {
      this.setState({needs: "done"});
    }
  };

  handleMouseOver() {
    this.setState({selected: true});
  };

  handleMouseOut() {
    this.setState({selected: false});
  };

  render() {
    const button_style = {
      backgroundColor: constants.button_colours[this.state.needs]
    };
    Object.assign(button_style, constants.course_style);
    return (
      <div style={button_style}
           onClick={this.handleClick}
           onMouseOver={this.handleMouseOver}
           onMouseOut={this.handleMouseOut}>
        {this.props.code}
      </div>
    );
  };
};
