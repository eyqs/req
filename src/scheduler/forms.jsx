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
import course_data from '../../req.json';


export default class Form extends React.Component {
  constructor(props) {
    // this.props.start_year: first year to schedule
    // this.props.num_years: number of years to schedule
    // this.props.updateNumber: callback for when user updates a number input
    super(props);
  };


  // update all forms with the current state

  render() {
    return (
      <div style={constants.forms_style}>
        <div>
          <label htmlFor="start_year">
            Starting year:
          </label>
          <input id="start_year"
                 style={constants.label_style}
                 type="number"
                 value={this.props.start_year}
                 onChange={this.props.updateNumber} />
        </div>
        <div>
          <label htmlFor="num_years">
            Number of years:
          </label>
          <input id="num_years"
                 style={constants.label_style}
                 type="number"
                 value={this.props.num_years}
                 onChange={this.props.updateNumber} />
        </div>
      </div>
    );
  };
};
