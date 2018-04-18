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

function getBackground(needs, shaded) {
  return constants.rgba
      + constants.colours_to_rgba[constants.button_colours[needs]]
      + (shaded ? constants.button_shaded_alpha
      : constants.button_plain_alpha);
};

function getBorder(reqs, highlighted) {
  return (highlighted ? constants.button_highlight_border
      : constants.button_plain_border)
      + constants.border_colours[reqs];
};

export default class Button extends React.Component {
  constructor(props) {
    // this.props.code: the course code
    // this.props.reqs: the relationship to the hover_code course
    // this.props.needs: the course status and button colour
    // this.props.shaded: true if the button should be shaded
    // this.props.highlighted: true if the button should be highlighted
    // this.props.updateNeeds: callback for when user clicks the button
    // this.props.updateHover: callback for when user starts/stops hovering
    super(props);
  };

  render() {
    return (
      <div style={{
        ...constants.button_style,
        backgroundColor: getBackground(this.props.needs, this.props.shaded),
        boxShadow: getBorder(this.props.reqs, this.props.highlighted),
      }}
           onClick={() => this.props.updateNeeds(this.props.code)}
           onMouseOver={() => this.props.updateHover(this.props.code)}
           onMouseOut={() => this.props.updateHover("")}>
        {this.props.code}
      </div>
    );
  };
};
