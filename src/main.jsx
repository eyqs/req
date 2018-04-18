/* req v3.1
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
import * as constants from "./const.js";
import Helper from "./helper.jsx";
import Browser from "./browser.jsx";
import course_data from '../req.json';


// return a new course object using input data from course_data

function makeCourse(data) {
  return {needs: "none", depth: 0,
      preqs: [], creqs: [], excls: [], dreqs: [], ddict: {}, ...data};
};


// strip all whitespace characters from a string

function stripWhitespace(string) {
  return string.replace(/\s/g, "");
};


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
};



export default class Main extends React.Component {

  // start the application

  constructor(props) {
    // this.props.tab: the current tab the user is on
    super(props);
    this.state = {
      course_dict: {},      // course_dict["CPSC 110"] = makeCourse()
    };

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
  };


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


  // draw the main app

  render() {
    switch (this.props.tab) {
    case "helper":
      return (
        <div style={constants.main_style}>
          <Helper />
        </div>
      );
    case "browser":
      return (
        <div style={constants.main_style}>
          <Browser course_dict={this.state.course_dict}
                   parseCodes={this.parseCodes.bind(this)}
                   updateNeeds={this.updateNeeds.bind(this)}
                   updateCourse={this.updateCourse.bind(this)} />
        </div>
      );
    }
  };
};
