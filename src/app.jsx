import React from "react";
import ReactDOM from "react-dom";
import Course from "./course.jsx";

class App extends React.Component {
  constructor(props) {
    super(props);
  };

  render() {
    return (
      <div>
        <Course code="CPSC 310" />
      </div>
    );
  };
};

ReactDOM.render(<App />, document.getElementById("app"));
