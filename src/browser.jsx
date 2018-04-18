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
import React from "react";
import * as constants from "./const.js";
import Forms from "./forms.jsx";
import ButtonRow from "./button_row.jsx";


// convert a size in rem to a size in pixels

function remToPixels(rem_string) {
  return parseInt(rem_string.substring(0, rem_string.length - 3))
      * parseFloat(getComputedStyle(document.documentElement).fontSize);
};


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
};



export default class Browser extends React.Component {
  constructor(props) {
    // this.props.course_list: the list of course objects
    // this.props.parseCodes: callback for when user updates the course list
    // this.props.updateNeeds: callback for when user clicks the course
    // this.props.updateCourse: callback for when user updates the course
    super(props);
    this.state = {
      render_toggle: false, // toggle this every time you don't want to render
      min_height: 0,        // minimum height of the app
      hover_code: "",       // course that the user is currently hovering over
      unshade_all: true,    // triggered some time after hover_code becomes ""
      unshade_timeout: null,// callback for unshade_all, store it to cancel
    };
  };


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


  // update the maximum height after rendering

  componentDidUpdate() {
    const min_height = Math.max(this.state.min_height,
        document.getElementById("browser").clientHeight)
        - 2 * remToPixels(constants.sidebar_padding);
    const render_toggle = !this.state.render_toggle;
    this.setState({min_height, render_toggle});
  };


  // do not re-render if render_toggle has been toggled

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.render_toggle != nextState.render_toggle) {
      return false;
    }
    return true;
  };


  // draw the entire app only if user selects some courses

  render() {
    const button_lists = {};
    for (const code in this.props.course_dict) {
      if (this.props.course_dict.hasOwnProperty(code)) {
        this.props.updateCourse(code);
        const depth = this.props.course_dict[code].depth;
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
              if (this.props.course_dict[this.state.hover_code]
                  [param].includes(code)) {
                shaded = false;
                highlighted = true;
                reqs = param;
              }
            }
          }
        }
        button_lists[depth].push({code, reqs, shaded, highlighted,
          needs: this.props.course_dict[code].needs,
        });
      }
    }

    if (Object.keys(button_lists).length === 0) {
      return (
        <div>
          <Forms parseCodes={this.props.parseCodes} />
        </div>
      );
    }

    return (
      <div>
        <Forms parseCodes={this.props.parseCodes} />
        <div id="browser" style={{
          ...constants.browser_style,
          minHeight: this.state.min_height,
        }}>
          <div style={constants.button_lists_style}>
            {Object.entries(button_lists).map(([depth, button_list]) => {
              return <ButtonRow key={depth}
                                button_list={button_list}
                                parseCodes={this.props.parseCodes}
                                updateNeeds={this.props.updateNeeds}
                                updateHover={this.updateHover.bind(this)} />
            })}
          </div>
          <div id="sidebar" style={constants.sidebar_style}>
            {this.state.hover_code ?
                getDescription(this.props.course_dict[this.state.hover_code]) : ""}
          </div>
        </div>
      </div>
    );
  };
};
