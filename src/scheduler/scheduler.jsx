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


export default class Scheduler extends React.Component {
  constructor(props) {
    // this.props.course_dict: the dict of course objects
    super(props);
    this.state = {
      start_year: 2015,     // first year to schedule
      num_years: 4,         // number of years to schedule
    };
  };


  // draw the scheduler for all years

  render() {
    return (
      <div>
        <div style={constants.forms_style}>
          <label htmlFor="num_years">
            Starting year:
          </label>
          <input id="start_year"
                 style={constants.label_style}
                 type="number"
                 value={this.state.start_year}
                 onChange={(e) =>
                   this.setState({[e.target.id]: Number(e.target.value)})} />
          <br />
          <label htmlFor="num_years">
            Number of years:
          </label>
          <input id="num_years"
                 style={constants.label_style}
                 type="number"
                 value={this.state.num_years}
                 onChange={(e) =>
                   this.setState({[e.target.id]: Number(e.target.value)})} />
        </div>
      </div>
    );
  };
};
