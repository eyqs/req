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


export default class Helper extends React.Component {
  constructor(props) {
    super(props);
  };


  // draw legend for button and border colours

  render() {
    return (
      <div style={constants.helper_style}>
        <p>
          Click on the tabs above to navigate between different tools.
        </p>
        <p>
          On the Course Browser, click on a course button to toggle whether you've taken that course already or not. The course colours are based on what courses you've already taken.
        </p>
        <p>
          Advanced users can use a Javascript-style regex in place of a course code when searching for courses to add. All course codes have no whitespace in them, and the regex is automatically enclosed with ^ and $.
        </p>
        <ul>
          {Object.entries(constants.button_colours).map(([needs, colour]) => {
            return (
              <li key={colour + " button"}>
                A course with a{" "}
                <span style={{backgroundColor: colour}}>
                  {colour} button
                </span>
                {constants.button_descriptions[needs]}
              </li>
            );
          })}
        </ul>
        <ul>
          {Object.entries(constants.border_colours).map(([needs, colour]) => {
            return (
              <li key={colour + " border"}>
                A course with a{" "}
                <span style={{color: colour}}>
                  {colour} border
                </span>
                {constants.border_descriptions[needs]}
              </li>
            );
          })}
        </ul>
      </div>
    );
  };
};
