import React from "react";
import * as constants from "./const.js";

function getBackground(needs, shaded) {
  return constants.rgba
      + constants.colours_to_rgba[constants.button_colours[needs]]
      + (shaded ? constants.button_shaded_alpha
      : constants.button_plain_alpha);
}

export default class Button extends React.Component {
  constructor(props) {
    // this.props.code: the course code
    // this.props.needs: the course status and button colour
    // this.props.shaded: true if the button should be shaded
    // this.props.highlighted: true if the button should be highlighted
    // this.props.updateNeeds: callback for when user clicks the button
    // this.props.updateHover: callback for when user starts/stops hovering
    super(props);
  };

  render() {
    return (
      <div style={{
        ...constants.button_style,
        backgroundColor: getBackground(this.props.needs, this.props.shaded),
        border: this.props.highlighted ?
            constants.button_highlight_border : constants.button_plain_border,
      }}
           onClick={() => this.props.updateNeeds(this.props.code)}
           onMouseOver={() => this.props.updateHover(this.props.code)}
           onMouseOut={() => this.props.updateHover("")}>
        {this.props.code}
      </div>
    );
  };
};
