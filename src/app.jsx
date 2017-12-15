import React from "react";
import ReactDOM from "react-dom";
import * as constants from "./const.js";
import Course from "./course.jsx";
let button_dict = {};               // button_dict["CPSC 110"] = Button()
// all_courses is a global variable in "../req.txt", included in req.html
// structure for courses is in req.txt


// structure for course buttons

class Button {
  constructor() {
    this.depth = 0;                 // depth down the tree
    this.needs = "none";            // corresponds to button colours
  }
}


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


// update the course code input box with all excluded or dependent courses

function updateCodes(reqlist) {
  const code = document.getElementById("course").value.replace(/\s/g, "")
      .replace(/(^[^\d]*)(\d*)(.*$)/i, "$1 $2").toUpperCase();
  document.getElementById("course").value = "";
  if (all_courses.hasOwnProperty(code)) {
    document.getElementById("courses").value +=
      ", " + code + ", " + all_courses[code][reqlist].join(", ");
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
      document.getElementById("courses").value +=
        ", " + subject_codes.split("\n").join(" ");
    });
}


// parse the course code input box and reorder the buttons on the tree

function parseCodes() {
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
    if (code.length > 1 && all_courses.hasOwnProperty(code)) {
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
            for (const req of all_courses[code][reqlist]) {
              if (all_courses.hasOwnProperty(req)) {
                code_dict[req] = true;
              }
            }
          }
        }
      }
    }
  }

  // create new buttons for each course and mark some as done
  const unordered = {};
  const new_button_dict = {};
  for (const code in code_dict) {
    unordered[code] = true;
    new_button_dict[code] = new Button();
    if (button_dict[code] && button_dict[code].needs === "done") {
      new_button_dict[code].needs = "done";
    }
  }
  if (done_list) {
    for (const code of done_list) {
      if (all_courses.hasOwnProperty(code)) {
        unordered[code] = true;
        new_button_dict[code] = new Button();
        new_button_dict[code].needs = "done";
      }
    }
  }
  button_dict = new_button_dict;

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
        for (const preq of all_courses[code].preqs) {
          if (button_dict.hasOwnProperty(preq)) {
            haspreq = true;
            if (button_dict[preq].depth === 0
                || button_dict[preq].depth === depth) {
              badpreq = true;
            }
          }
        }
        for (const creq of all_courses[code].creqs) {
          if (button_dict.hasOwnProperty(creq)) {
            hascreq = true;
            if (button_dict[creq].depth === 0
                || button_dict[creq].depth === depth + 0.5) {
              badcreq = true;
            }
          }
        }
        if ((depth === 1 && !haspreq && !hascreq)
            || (!badpreq && !badcreq)) {
          button_dict[code].depth = depth;
          delete unordered[code];
        } else if (!badpreq) {
          button_dict[code].depth = depth + 0.5;
        }
      }
    }
    for (const code in unordered) {
      let badcreq = false;        // has a coreq with zero depth
      if (unordered.hasOwnProperty(code)
          && button_dict[code].depth === depth + 0.5) {
        for (const creq of all_courses[code].creqs) {
          if (button_dict.hasOwnProperty(creq)
              && button_dict[creq].depth === 0) {
            badcreq = true;
          }
        }
        if (!badcreq) {
          button_dict[code].depth = depth;
        }
      }
    }
  }
}


// start the application

function startApp() {

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

  // update all courses in req.txt with preqs, creqs, and dreqs
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
