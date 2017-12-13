import React from "react";
import ReactDOM from "react-dom";
import * as constants from "./const.js";
import Course from "./course.jsx";

// given a list of lists, return a flat list of all valid course codes in it
function flatten(listlist) {
  const flat_list = [];
  for (const list of listlist) {
    if (list instanceof Array) {
      flat_list.push(...flatten(list));
    } else if (all_courses.hasOwnProperty(list)) {
      flat_list.push(list);
    }
  }
  return flat_list;
}

function startApp() {
  const legend = [];
  for (const needs in constants.button_colours) {
    if (constants.button_colours.hasOwnProperty(needs)) {
      legend.push('<li> A course with a <span style="background-color:'
        + constants.button_colours[needs] + '">'
        + constants.button_colours[needs] + ' button</span>'
        + constants.button_descriptions[needs] + '</li>'
      );
    }
  }
  for (const needs in constants.border_colours) {
    if (constants.border_colours.hasOwnProperty(needs)) {
      legend.push('<li> A course with a <span style="color:'
        + constants.border_colours[needs] + '">'
        + constants.border_colours[needs] + ' border</span>'
        + constants.border_descriptions[needs] + '</li>'
      );
    }
  }
  document.getElementById("colours").innerHTML = legend.join("\n");

  for (const code in all_courses) {
    if (all_courses.hasOwnProperty(code)) {
      const course = all_courses[code];
      for (const param of [["excl", "excls", false],
          ["preq", "preqs", true], ["creq", "creqs", true]]) {
        course[param[1]] = flatten(course[param[0]])
        if (param[2]) {
          for (const dependency of course[param[1]]) {
            if (all_courses.hasOwnProperty(dependency)) {
              all_courses[dependency].ddict[code] = true;
            }
          }
        }
      }
    }
  }
  for (const code in all_courses) {
    if (all_courses.hasOwnProperty(code)) {
      all_courses[code].dreqs = Object.keys(all_courses[code].ddict);
    }
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    startApp();
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
