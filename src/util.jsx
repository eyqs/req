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


// convert a size in rem to a size in pixels

export function remToPixels(rem_string) {
  return parseInt(rem_string.substring(0, rem_string.length - 3))
      * parseFloat(getComputedStyle(document.documentElement).fontSize);
};


// given a course object, return the raw HTML for its sidebar

export function getDescription(course, offset_top) {
  const paragraphs = [];
  paragraphs.push(course.code);
  if (course.name) {
    paragraphs[0] += ": " + course.name;
  }
  if (course.desc) {
    paragraphs.push(course.desc);
  }
  paragraphs.push("This " + constants.button_descriptions[course.needs]);
  for (const param of [
      ["Prereqs: ", "preqs", "prer"], ["Coreqs: ", "creqs", "crer"],
      ["Excluded by: ", "excls"], ["Required by: ", "dreqs"],
      ["Terms: ", "terms"], ["Credits: ", "cred"]]) {
    if (course[param[2]]) {
      paragraphs.push(param[0] + course[param[2]]);
    } else if (course[param[1]] && course[param[1]].length > 0) {
      paragraphs.push(param[0] + course[param[1]].join(", "));
    }
  }
  return (
      <div style={{paddingTop: Math.max(0, window.pageYOffset - offset_top)}}>
        {paragraphs.map((paragraph, index) =>
          <p key={index}>{paragraph}</p>
        )}
      </div>
  );
};


// get the correct background colour for a button

export function getBackground(needs, shaded) {
  return constants.rgba
      + constants.colours_to_rgba[constants.button_colours[needs]]
      + (shaded ? constants.button_shaded_alpha
      : constants.button_plain_alpha);
};


// get the correct border colour for a button

export function getBorder(reqs, highlighted) {
  return (highlighted ? constants.button_highlight_border
      : constants.button_plain_border)
      + constants.border_colours[reqs];
};
