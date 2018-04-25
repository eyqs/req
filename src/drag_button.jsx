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
import {DragSource} from "react-dnd";
import * as constants from "./const.js";
import * as utilities from "./util.jsx";

const button_drag_source = {
  beginDrag(props) {
    return {code: props.code};
  },
};

function drag_collect(connect, monitor) {
  return {
    connect_drag_source: connect.dragSource(),
    is_dragging: monitor.isDragging(),
  };
};


class DragButton extends React.Component {
  constructor(props) {
    // this.props.code: the course code
    // this.props.reqs: the relationship to the hover_code course
    // this.props.needs: the course status and button colour
    // this.props.shaded: true if the button should be shaded
    // this.props.highlighted: true if the button should be highlighted
    // this.props.updateHover: callback for when user starts/stops hovering
    super(props);
  };

  render() {
    return this.props.connect_drag_source(
      <div style={{
        ...constants.button_style,
        ...constants.drag_button_style,
        cursor: "move",
        opacity: this.props.is_dragging ? 0.5 : 1,
        backgroundColor: utilities.getBackground(
            this.props.needs, this.props.shaded),
        boxShadow: utilities.getBorder(
            this.props.reqs, this.props.highlighted),
      }}
           onMouseOver={() => this.props.updateHover(this.props.code)}
           onMouseOut={() => this.props.updateHover("")}>
        {this.props.code}
      </div>
    );
  };
};


export default DragSource(
    "button", button_drag_source, drag_collect)(DragButton);
