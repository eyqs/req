import React from "react";
import * as constants from "./const.js";
import Button from "./button.jsx";

export default class ButtonRow extends React.Component {
  constructor(props) {
    super(props);
  };

  render() {
    return (
      <div style={constants.button_row_style}>
        {this.props.button_list.map(({code, needs}) => {
          return <Button key={code} code={code} needs={needs} />
        })}
      </div>
    );
  };
};
