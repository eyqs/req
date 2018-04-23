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
import * as constants from "../const.js";
import * as utilities from "../util.jsx";
import Forms from "./forms.jsx";
import ButtonRow from "../button_row.jsx";


export default class Scheduler extends React.Component {
  constructor(props) {
    // this.props.course_dict: the dict of course objects
    // this.props.parseCodes: callback for when user updates the course list
    super(props);
    this.state = {
      start_year: 2015,     // first year to schedule
      num_years: 4,         // number of years to schedule
      render_toggle: false, // toggle this every time you don't want to render
      min_height: 0,        // minimum height of the app
      hover_code: "",       // code that the user is currently hovering over
    };
  };


  // update the maximum height after rendering

  componentDidUpdate() {
    const min_height = Math.max(this.state.min_height,
        document.getElementById("scheduler").clientHeight)
        - 2 * utilities.remToPixels(constants.scheduler_padding);
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


  // draw the scheduler for all years

  render() {
    const done_list = [];
    const button_list = [];
    for (const code in this.props.course_dict) {
      if (this.props.course_dict.hasOwnProperty(code)
          && this.props.course_dict[code].needs === "done") {
        done_list.push(code);
        button_list.push({code, reqs: "highs", needs: "done",
          shaded: false, highlighted: true});
      }
    }
    done_list.sort(constants.code_compare);
    button_list.sort(constants.code_compare);

    return (
      <div>
        <Forms done_list={done_list}
               start_year={this.state.start_year}
               num_years={this.state.num_years}
               updateNumber={(e) =>
                 this.setState({[e.target.id]: Number(e.target.value)})}
               parseCodes={this.props.parseCodes} />
        <div style={constants.scheduler_button_row_padding}>
          <ButtonRow button_list={button_list}
                     updateHover={(hover_code) => this.setState({hover_code})}
                     updateNeeds={() => false} />
        </div>
        <div id="scheduler" style={{
          ...constants.scheduler_style,
          minHeight: this.state.min_height,
        }}>
          <div style={{flex: "1"}}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </div>
          <div id="scheduler_sidebar" style={constants.sidebar_style}>
            {this.state.hover_code ? utilities.getDescription(
              this.props.course_dict[this.state.hover_code],
              document.getElementById("scheduler_sidebar").offsetTop) : ""}
          </div>
        </div>
      </div>
    );
  };
};
