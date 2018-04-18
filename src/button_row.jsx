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
import Button from "./button.jsx";

export default class ButtonRow extends React.Component {
  constructor(props) {
    // this.props.button_list: the list of course button objects
    // this.props.updateNeeds: callback for when user clicks the course
    // this.props.updateHover: callback for when user starts/stops hovering
    super(props);
  };

  render() {
    return (
      <div style={constants.button_row_style}>
        {this.props.button_list.sort(constants.code_compare).map(
            ({code, reqs, needs, shaded, highlighted}) => {
              return <Button key={code}
                             code={code}
                             reqs={reqs}
                             needs={needs}
                             shaded={shaded}
                             highlighted={highlighted}
                             updateNeeds={this.props.updateNeeds}
                             updateHover={this.props.updateHover} />
        })}
      </div>
    );
  };
};
