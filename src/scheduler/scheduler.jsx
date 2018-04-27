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
import {DragDropContext} from "react-dnd";
import ReactDnDHTML5Backend from "react-dnd-html5-backend";
import * as constants from "../const.js";
import * as utilities from "../util.jsx";
import Forms from "./forms.jsx";
import Year from "./year.jsx";
import ButtonRow from "../button_row.jsx";
import degree_data from '../../deq.json';


class Scheduler extends React.Component {
  constructor(props) {
    // this.props.course_dict: the dict of course objects
    // this.props.parseCodes: callback for when user updates the course list
    // this.props.updateTerm: callback for when user updates the course term
    super(props);
    this.state = {
      start_year: 2015,     // first year to schedule
      num_years: 4,         // number of years to schedule
      program: "BASC BMEG", // program to consider degree requirements of
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
    const year_lists = [];
    const done_list = [];
    const button_list = [];
    for (let year = 1; year <= this.state.num_years; year++) {
      year_lists.push({
        year: year,
        req_list: [],
        done_list: [],
      });
    }
    const course_list = degree_data.program_data[this.state.program].courses;
    for (const course of course_list) {
      if (year_lists.length >= course.year) {
        year_lists[course.year - 1].req_list.push({code: course.code,
          reqs: "highs", needs: "preq", shaded: false, highlighted: true});
      }
    }


    for (const code in this.props.course_dict) {
      if (this.props.course_dict.hasOwnProperty(code)
          && this.props.course_dict[code].needs === "done") {
        const course = this.props.course_dict[code];
        done_list.push(code);
        if (course.year === 0) {
          button_list.push({code, reqs: "highs", needs: "done",
              shaded: false, highlighted: true});
        } else if (year_lists.length >= course.year) {
          year_lists[course.year - 1].done_list.push({code: course.code,
            reqs: "highs", needs: "done", shaded: false, highlighted: true});
        }
      }
    }
    done_list.sort(constants.code_compare);
    button_list.sort(constants.code_compare);

    return (
      <div>
        <Forms done_list={done_list}
               start_year={this.state.start_year}
               num_years={this.state.num_years}
               program={this.state.program}
               updateNumber={(e) =>
                 this.setState({[e.target.id]: Number(e.target.value)})}
               updateInput={(e) =>
                 this.setState({[e.target.id]: e.target.value})}
               parseCodes={this.props.parseCodes} />
        <div style={constants.scheduler_button_row_padding}>
          <ButtonRow button_list={button_list}
                     draggable={true}
                     updateHover={(hover_code) => this.setState({hover_code})}
                     updateNeeds={() => false} />
        </div>
        <div id="scheduler" style={{
          ...constants.scheduler_style,
          minHeight: this.state.min_height,
        }}>
          <div style={{flex: "1"}}>
            {year_lists.map((year_list) =>
              <Year key={year_list.year}
                    year={year_list.year}
                    start_year={this.state.start_year}
                    req_list={year_list.req_list}
                    done_list={year_list.done_list}
                    updateHover={(hover_code) => this.setState({hover_code})}
                    updateTerm={this.props.updateTerm} />
            )}
          </div>
          <div id="scheduler_sidebar" style={constants.sidebar_style}>
            {utilities.getDescription(this.state.hover_code,
              document.getElementById("scheduler_sidebar"))}
          </div>
        </div>
      </div>
    );
  };
};


export default DragDropContext(ReactDnDHTML5Backend)(Scheduler);
