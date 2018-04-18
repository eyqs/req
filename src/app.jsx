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
import "babel-polyfill";
import React from "react";
import ReactDOM from "react-dom";
import * as constants from "./const.js";
import Main from "./main.jsx";


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tab: "helper",
    };
  };


  // draw the entire app

  render() {
    return (
      <div style={constants.wrapper_style}>
        <div style={constants.tabbar_style}>
          {constants.tab_list.map((tab) => {
            if (tab == this.state.tab) {
              return (
                <div style={constants.focus_tab_style}
                     key={tab}>
                  {tab}
                </div>
              );
            } else {
              return (
                <div style={constants.tab_style}
                     key={tab}
                     onClick={() => this.setState({tab})}>
                  {tab}
                </div>
              );
            }
          })}
        </div>
        <Main tab={this.state.tab} />
      </div>
    );
  };
};

ReactDOM.render(<App />, document.getElementById("app"));
