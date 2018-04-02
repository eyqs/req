/* req v3.0
 * Copyright (c) 2016, 2017, 2018 Eugene Y. Q. Shen.
 *
 * req is free software: you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation, either version
 * 3 of the License, or (at your option) any later version.
 *
 * req is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see http://www.gnu.org/licenses/.
 */
import "babel-polyfill";
import React from "react";
import ReactDOM from "react-dom";
import * as constants from "./const.js";
import ButtonRow from "./button_row.jsx";
import course_data from '../req.json';      // course data constants
let parseCodes;                     // TODO: hacky way to keep forms dumb


// return a new course object using input data from course_data

function makeCourse(data) {
  return {needs: "none", depth: 0,
      preqs: [], creqs: [], excls: [], dreqs: [], ddict: {}, ...data};
};


// convert a size in rem to a size in pixels


function remToPixels(rem_string) {
  return parseInt(rem_string.substring(0, rem_string.length - 3))
      * parseFloat(getComputedStyle(document.documentElement).fontSize);
}


// strip all whitespace characters from a string

function stripWhitespace(string) {
  return string.replace(/\s/g, "");
}


// compile a regular expression from a string

function compileRegExp(string) {
  if (string.length == 0) {
    return new RegExp("^$", "i");
  }
  if (string[0] != "^") {
    string = "^" + string;
  }
  if (string[string.length - 1] != "$") {
    string = string + "$";
  }
  return new RegExp(string, "i");
}


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


// given a course object, return the raw HTML for its sidebar

function getDescription(course) {
  const paragraphs = [];
  paragraphs.push(course.code);
  if (course.name) {
    paragraphs[0] += ": " + course.name;
  }
  if (course.desc) {
    paragraphs.push(course.desc);
  }
  for (const param of [
      ["Prereqs: ", "preqs", "prer"], ["Coreqs: ", "creqs", "crer"],
      ["Excluded by: ", "excls"], ["Required by: ", "dreqs"],
      ["Terms: ", "terms"], ["Credits: ", "cred"]]) {
    if (course[param[2]]) {
      paragraphs.push(param[0] + course[param[2]]);
    } else if (course[param[1]] && course[param[1]].length > 0) {
      paragraphs.push(param[0] + course[param[1]].join(", "));
    }
  }
  return (
      <div style={{
        paddingTop: Math.max(0, window.pageYOffset
            - document.getElementById("sidebar").offsetTop),
      }}>
        {paragraphs.map((paragraph, index) => {
          return <p key={index}>{paragraph}</p>
        })}
      </div>
  );
}


// update the course code input box with all excluded or dependent courses

function updateCodes(reqlist) {
  try {
    const re = compileRegExp(stripWhitespace(
        document.getElementById("course").value));
    const codes = [];
    for (const code in course_data) {
      if (course_data.hasOwnProperty(code)) {
        const match = re.exec(code);
        if (match !== null) {
          Array.prototype.push.apply(codes, course_data[code][reqlist]);
        }
      }
    }
    if (codes.length > 0) {
      const value = document.getElementById("courses").value.trim();
      if (value.length > 0 && value[value.length - 1] != ",") {
        document.getElementById("courses").value += ", ";
      }
      for (const code of codes) {
        document.getElementById("courses").value +=
            code + ", " + course_data[code][reqlist].join(", ") + ", ";
      }
      document.getElementById("course").value = "";
    } else {
      document.getElementById("course").value = "Error: Not Found";
    }
  } catch (ignore) {
    document.getElementById("course").value = "Error: Invalid Input";
  }
}


// update the course code input box with all courses of the given subject

function addSubjectCodes() {
  const dept = stripWhitespace(document.getElementById("subject").value)
      .toLowerCase();
  fetch(constants.codefolder_url + dept + ".txt")
    .then(function (response) {
      if (!response.ok) {
        throw Error(response.statusText);
      }
      return response.text();
    }).then(function (subject_codes) {
      const value = document.getElementById("courses").value.trim();
      if (value.length > 0 && value[value.length - 1] != ",") {
        document.getElementById("courses").value += ", ";
      }
      document.getElementById("courses").value +=
          subject_codes.split("\n").join(" ").trim() + " ";
      document.getElementById("subject").value = "";
    }).catch(function (error) {
      document.getElementById("subject").value = error;
    });
}



class App extends React.Component {

  // start the application

  constructor(props) {
    super(props);
    this.state = {
      render_toggle: false, // toggle this every time you don't want to render
      min_height: 0,        // minimum height of the app
      course_dict: {},      // course_dict["CPSC 110"] = makeCourse()
      hover_code: "",       // course that the user is currently hovering over
      unshade_all: true,    // triggered some time after hover_code becomes ""
      unshade_timeout: null,// callback for unshade_all, store it to cancel
    };
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
    document.getElementById("noscript").style.display = "none";
    document.getElementById("javascript").style.display = "block";
  };


  // parse the course code input box and reorder the buttons on the tree

  parseCodes() {
    const re_lists = document.getElementById("courses").value.split(";").map(
        (list) => list.split(",").map(
        (code) => compileRegExp(stripWhitespace(code))));
    const new_list = [];
    const done_list = [];
    for (const re of re_lists[0]) {
      for (const code in course_data) {
        if (course_data.hasOwnProperty(code)) {
          const match = re.exec(code);
          if (match !== null) {
              new_list.push(code);
          }
        }
      }
    }
    if (re_lists.length > 1) {
      for (const re of re_lists[1]) {
        for (const code in course_data) {
          if (course_data.hasOwnProperty(code)) {
            const match = re.exec(code);
            if (match !== null) {
                done_list.push(code);
            }
          }
        }
      }
    }
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

    this.setState({course_dict, min_height: 0});
  };


  // recursively check whether the given requirements are satisfied

  doneReqs(reqs) {
    if (reqs.length === 0) {
      return "done";
    }

    // recursively push status of each clause into status array
    const statuses = [];
    const operator = reqs[0];
    for (let i = 1; i < reqs.length; i++) {
      if (reqs[i] instanceof Array) {
        statuses.push(this.doneReqs(reqs[i]));
      }
      // push status of each course in the current tree
      else if (this.state.course_dict.hasOwnProperty(reqs[i])) {
        if (this.state.course_dict[reqs[i]].needs === "done") {
          statuses.push("done");
        } else {
          statuses.push("none");
        }
      }
      // courses outside the current tree are unknown
      else {
        statuses.push("outs");
      }
    }

    if (operator === "and") {
      if (statuses.indexOf("none") !== -1) {
        return "none";                // any course is none -> none
      } else if (statuses.indexOf("outs") !== -1) {
        return "outs";                // any course is outs -> outs
      } else {
        return "done";                // all courses are done -> done
      }
    } else if (operator === "or") {
      if (statuses.indexOf("done") !== -1) {
        return "done";                // any course is done -> done
      } else if (statuses.indexOf("outs") !== -1) {
        return "outs";                // any course is outs -> outs
      } else {
        return "none";                // all courses are none -> none
      }
    }
  }


  // update the status of the course with the given code

  updateCourse(code) {
    // courses can be taken in onClick -> done
    const button = this.state.course_dict[code];
    if (button.needs !== "done") {
      const course = course_data[code];
      // if any excluded course in the current tree is done -> excl
      if (course.excl.length > 1 && this.doneReqs(course.excl) === "done") {
        button.needs = "excl";
      // if any prerequisite in the current tree is not done -> preq
      } else if (this.doneReqs(course.preq) === "none") {
        button.needs = "preq";
      // if any corequisite in the current tree is not done -> creq
      } else if (this.doneReqs(course.creq) === "none") {
        button.needs = "creq";
      // if all prerequisites are in the current tree and done, and
      //    all corequisites are in the current tree and done, then check...
      } else if (this.doneReqs(course.preq) === "done"
          && this.doneReqs(course.creq) === "done") {
        // if all excluded courses are in the current tree and not done -> none
        if (course.excl.length <= 1 || this.doneReqs(course.excl) === "none") {
          button.needs = "none";
        // otherwise, some excluded course is not in the current tree -> xout
        } else {
          button.needs = "xout";
        }
      // otherwise, some requisite course is not in the current tree -> outs
      } else {
        button.needs = "outs";
      }
    }
  }


  // callback to update hover_code if the user hovers over a child button
  // child should call updateHover(this.props.code) if the user hovers in
  //   and updateHover("") if the user hovers out, to reset it

  updateHover(hover_code) {
    if (hover_code === "") {
      this.setState({hover_code, unshade_timeout:
          setTimeout(() => this.setState({unshade_all: true}),
              constants.unshade_delay_ms)});
    } else {
      if (this.state.unshade_timeout) {
        clearTimeout(this.state.unshade_timeout);
      }
      this.setState({hover_code, unshade_all: false, unshade_timeout: null});
    }
  };


  // callback to toggle the done status of a course

  updateNeeds(code) {
    const course_dict = {...this.state.course_dict};
    if (course_dict[code].needs === "done") {
      course_dict[code].needs = "none";
    } else {
      course_dict[code].needs = "done";
    }
    this.setState({course_dict});
  };


  // update the maximum height after rendering

  componentDidUpdate() {
    const min_height = Math.max(this.state.min_height,
        document.getElementById("app").clientHeight)
        - 2 * remToPixels(constants.sidebar_padding);
    const render_toggle = !this.state.render_toggle;
    this.setState({min_height, render_toggle});
  }


  // do not re-render if render_toggle has been toggled

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.render_toggle != nextState.render_toggle) {
      return false;
    }
    return true;
  }


  // draw the entire app

  render() {
    const button_lists = {};
    for (const code in this.state.course_dict) {
      if (this.state.course_dict.hasOwnProperty(code)) {
        this.updateCourse(code);
        const depth = this.state.course_dict[code].depth;
        if (!button_lists[depth]) {
          button_lists[depth] = [];
        }
        let highlighted = false;
        let shaded = !this.state.unshade_all;
        let reqs = "highs";
        if (this.state.hover_code) {
          if (code == this.state.hover_code) {
            shaded = false;
            highlighted = true;
          } else {
            for (const param of ["preqs", "creqs", "excls", "dreqs"]) {
              if (this.state.course_dict[this.state.hover_code]
                  [param].includes(code)) {
                shaded = false;
                highlighted = true;
                reqs = param;
              }
            }
          }
        }
        button_lists[depth].push({code, reqs, shaded, highlighted,
          needs: this.state.course_dict[code].needs,
        });
      }
    }

    // return nothing, to hide the sidebar when app is empty
    if (Object.keys(button_lists).length === 0) {
      return null;
    }

    return (
      <div style={{
        ...constants.wrapper_style,
        minHeight: this.state.min_height,
      }}>
        <div style={constants.app_style}>
          {Object.entries(button_lists).map(([depth, button_list]) => {
            return <ButtonRow key={depth}
                              button_list={button_list}
                              updateNeeds={this.updateNeeds.bind(this)}
                              updateHover={this.updateHover.bind(this)} />
          })}
        </div>
        <div id="sidebar" style={constants.sidebar_style}>
          {this.state.hover_code ?
              getDescription(this.state.course_dict[this.state.hover_code]) : ""}
        </div>
      </div>
    );
  };
};

ReactDOM.render(<App />, document.getElementById("app"));
