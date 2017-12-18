import React from "react";
import ReactDOM from "react-dom";
import * as constants from "./const.js";
import ButtonRow from "./button_row.jsx";
import course_data from '../req.json';      // course data constants
let parseCodes;                     // TODO: hacky way to keep forms dumb


// return a new course object using input data from course_data

function makeCourse(data) {
  return Object.assign({needs: "none", depth: 0,
      preqs: [], creqs: [], excls: [], dreqs: [], ddict: {}}, data);
};


// given a list of lists, return a flat list of all valid course codes in it

function flatten(listlist) {
  const flat_list = [];
  for (const list of listlist) {
    if (list instanceof Array) {
      flat_list.push(...flatten(list));
    } else if (course_data.hasOwnProperty(list)) {
      flat_list.push(list);
    }
  }
  return flat_list;
}


// update the course code input box with all excluded or dependent courses

function updateCodes(reqlist) {
  const code = document.getElementById("course").value.replace(/\s/g, "")
      .replace(/(^[^\d]*)(\d*)(.*$)/i, "$1 $2").toUpperCase();
  document.getElementById("course").value = "";
  if (course_data.hasOwnProperty(code)) {
    const value = document.getElementById("courses").value.trim();
    if (value.length > 0 && value[value.length - 1] != ",") {
      document.getElementById("courses").value += ", ";
    }
    document.getElementById("courses").value +=
        code + ", " + course_data[code][reqlist].join(", ") + ", ";
  }
}


// update the course code input box with all courses of the given subject

function addSubjectCodes() {
  const dept = document.getElementById("subject").value
      .replace(/\s/g, "").toLowerCase();
  document.getElementById("subject").value = "";
  fetch(constants.codefolder_url + dept + ".txt")
    .then((response) => response.text())
    .then(function (subject_codes) {
      const value = document.getElementById("courses").value.trim();
      if (value.length > 0 && value[value.length - 1] != ",") {
        document.getElementById("courses").value += ", ";
      }
      document.getElementById("courses").value +=
          subject_codes.split("\n").join(" ").trim() + " ";
    });
}



class App extends React.Component {

  // start the application

  constructor(props) {
    super(props);
    this.state = {course_dict: {}};
    parseCodes = this.parseCodes.bind(this);

    // add event listeners on the input forms
    document.getElementById("excls").addEventListener("click",
      () => updateCodes("excls"));
    document.getElementById("dreqs").addEventListener("click",
      () => updateCodes("dreqs"));
    document.getElementById("dept").addEventListener("submit", function (e) {
      e.preventDefault();
      addSubjectCodes();
    });
    document.getElementById("codes").addEventListener("submit", function (e) {
      e.preventDefault();
      parseCodes();
    });

    // print legend for button and border colours
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

    // make all course data into course objects
    for (const code in course_data) {
      if (course_data.hasOwnProperty(code)) {
        course_data[code] = makeCourse(course_data[code]);
      }
    }

    // update course_data with preqs, creqs, and dreqs
    for (const code in course_data) {
      if (course_data.hasOwnProperty(code)) {
        for (const param of [["excl", "excls", false],
            ["preq", "preqs", true], ["creq", "creqs", true]]) {
          course_data[code][param[1]] = flatten(course_data[code][param[0]])
          if (param[2]) {
            for (const dependency of course_data[code][param[1]]) {
              if (course_data.hasOwnProperty(dependency)) {
                course_data[dependency].ddict[code] = true;
              }
            }
          }
        }
      }
    }
    for (const code in course_data) {
      if (course_data.hasOwnProperty(code)) {
        course_data[code].dreqs = Object.keys(course_data[code].ddict);
      }
    }
  };


  // parse the course code input box and reorder the buttons on the tree

  parseCodes() {
    // TODO: instead of deleting trailing letters, parse UBC Course Schedule
    /* Remove whitespace, add space before numbers, delete trailing letters,
     * convert to uppercase, and filter out blanks and unknown codes.
     */
    const code_list = document.getElementById("courses").value.split(";").map(
        (list) => list.split(",").map(
        (code) => code.replace(/\s/g, "")
            .replace(/(^[^\d]*)(\d*)(.*$)/i, "$1 $2").toUpperCase()));
    const new_list = code_list[0];
    const done_list = code_list[1];
    const code_dict = {};
    for (const code of new_list) {
      if (code.length > 1 && course_data.hasOwnProperty(code)) {
        code_dict[code] = true;
      }
    }

    // add all prerequisites and corequisites of all codes, recursively
    const reqlists = ["preqs", "creqs"];
    const checked_dict = {};
    while (Object.keys(checked_dict).length != Object.keys(code_dict).length) {
      for (const code in code_dict) {
        if (code_dict.hasOwnProperty(code)) {
          if (!checked_dict[code]) {
            checked_dict[code] = true;
            for (const reqlist of reqlists) {
              for (const req of course_data[code][reqlist]) {
                if (course_data.hasOwnProperty(req)) {
                  code_dict[req] = true;
                }
              }
            }
          }
        }
      }
    }

    // create new courses for each course and mark some as done
    const unordered = {};
    const course_dict = {};
    for (const code in code_dict) {
      unordered[code] = true;
      course_dict[code] = makeCourse(course_data[code]);
      if (this.state.course_dict[code]
          && this.state.course_dict[code].needs === "done") {
        course_dict[code].needs = "done";
      }
    }
    if (done_list) {
      for (const code of done_list) {
        if (course_data.hasOwnProperty(code)) {
          unordered[code] = true;
          course_dict[code] = makeCourse(course_data[code]);
          course_dict[code].needs = "done";
        }
      }
    }

    /* Arrange courses in order depending on their depth of prereqs
     * First scan through courses with no preqs and set their depth to 1,
     * then scan through all courses whose preqs all have a non-zero depth
     * of which the maximum is 1, and set their depth to 2, etc. until done.
     */
    let depth = 0;
    while (Object.keys(unordered).length !== 0) {
      depth += 1;
      for (const code in unordered) {
        if (unordered.hasOwnProperty(code)) {
          let haspreq = false;      // has a prereq in the current tree
          let badpreq = false;      // has a prereq with zero or current depth
          let hascreq = false;      // has a coreq in the current tree
          let badcreq = false;      // has a coreq with zero or current depth
          for (const preq of course_dict[code].preqs) {
            if (course_dict.hasOwnProperty(preq)) {
              haspreq = true;
              if (course_dict[preq].depth === 0
                  || course_dict[preq].depth === depth) {
                badpreq = true;
              }
            }
          }
          for (const creq of course_dict[code].creqs) {
            if (course_dict.hasOwnProperty(creq)) {
              hascreq = true;
              if (course_dict[creq].depth === 0
                  || course_dict[creq].depth === depth + 0.5) {
                badcreq = true;
              }
            }
          }
          if ((depth === 1 && !haspreq && !hascreq)
              || (!badpreq && !badcreq)) {
            course_dict[code].depth = depth;
            delete unordered[code];
          } else if (!badpreq) {
            course_dict[code].depth = depth + 0.5;
          }
        }
      }
      for (const code in unordered) {
        let badcreq = false;        // has a coreq with zero depth
        if (unordered.hasOwnProperty(code)
            && course_dict[code].depth === depth + 0.5) {
          for (const creq of course_dict[code].creqs) {
            if (course_dict.hasOwnProperty(creq)
                && course_dict[creq].depth === 0) {
              badcreq = true;
            }
          }
          if (!badcreq) {
            course_dict[code].depth = depth;
          }
        }
      }
    }

    this.setState({course_dict});
  }


  render() {
    const button_lists = {};
    for (const code in this.state.course_dict) {
      if (this.state.course_dict.hasOwnProperty(code)) {
        const depth = this.state.course_dict[code].depth;
        if (!button_lists[depth]) {
          button_lists[depth] = [];
        }
        button_lists[depth].push({
          code: code,
          needs: this.state.course_dict[code].needs,
        });
      }
    }
    return (
      <div style={constants.app_style}>
        {Object.entries(button_lists).map(([depth, button_list]) => {
          return <ButtonRow key={depth} button_list={button_list} />
        })}
      </div>
    );
  };
};

ReactDOM.render(<App />, document.getElementById("app"));
