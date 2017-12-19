import React from "react";
import * as constants from "./const.js";
import Button from "./button.jsx";

export default class ButtonRow extends React.Component {
  constructor(props) {
    // this.props.button_list: the list of course button objects
    // this.props.updateNeeds: callback for when user clicks the course
    // this.props.updateHover: callback for when user starts/stops hovering
    super(props);
  };

  render() {
    return (
      <div style={constants.button_row_style}>
        {this.props.button_list.map(({code, needs, shaded, highlighted}) => {
          return <Button key={code}
                         code={code}
                         needs={needs}
                         shaded={shaded}
                         highlighted={highlighted}
                         updateNeeds={this.props.updateNeeds}
                         updateHover={this.props.updateHover} />
        })}
      </div>
    );
  };
};
