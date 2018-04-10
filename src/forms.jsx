/* req v3.0
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
import course_data from '../req.json';


// strip all whitespace characters from a string

function stripWhitespace(string) {
  return string.replace(/\s/g, "");
};


// compile a regular expression from a string

function compileRegExp(string) {
  return new RegExp(string, "i");
};



export default class Form extends React.Component {
  constructor(props) {
    super(props);
    this.state = {code: ""}
  };


  // update the course code input box with all selected courses

  updateCodes(reqlist) {
    try {
      const re = compileRegExp(stripWhitespace(this.state.code));
      const codes = [];
      for (const code in course_data) {
        if (course_data.hasOwnProperty(code)) {
          const match = re.exec(code);
          if (match !== null) {
            if (reqlist) {
              Array.prototype.push.apply(codes, course_data[code][reqlist]);
            } else {
              codes.push(code);
            }
          }
        }
      }
      if (codes.length > 0) {
        const value = document.getElementById("courses").value.trim();
        if (value.length > 0 && value[value.length - 1] != ",") {
          document.getElementById("courses").value += ", ";
        }
        if (reqlist) {
          for (const code of codes) {
            if (course_data[code][reqlist].length > 0) {
              document.getElementById("courses").value +=
                  course_data[code][reqlist].join(", ") + ", ";
            }
          }
        } else {
          for (const code of codes) {
            document.getElementById("courses").value +=
                code + ", ";
          }
        }
        this.setState({code: ""});
      } else {
        this.setState({code: "Error: Not Found"});
      }
    } catch (ignore) {
      this.setState({code: "Error: Invalid Input"});
    }
  };


  // update all forms with the current state

  render() {
    return (
      <div className="wrapper">
        <label htmlFor="code">Code:</label>
        <input type="text" id="code" value={this.state.code}
          onChange={(e) => this.setState({[e.target.id]: e.target.value})} />
        <button onClick={() => this.updateCodes()}>
          Add all such courses
        </button>
        <button onClick={() => this.updateCodes("excls")}>
          Add all excluded courses
        </button>
        <button onClick={() => this.updateCodes("dreqs")}>
          Add all dependent courses
        </button>
      </div>
    );
  };
};
