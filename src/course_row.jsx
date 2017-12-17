import React from "react";
import * as constants from "./const.js";
import Course from "./course.jsx";

export default class CourseRow extends React.Component {
  constructor(props) {
    super(props);
  };

  render() {
    return (
      <div style={constants.course_row_style}>
        {this.props.button_list.map(({code, needs}) => {
          return <Course key={code} code={code} needs={needs} />
        })}
      </div>
    );
  };
};
