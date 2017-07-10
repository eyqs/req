/* req v2.0
 * Copyright (c) 2016, 2017 Eugene Y. Q. Shen.
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

let c;                              // c = document.getElementById("canvas")
let ctx;                            // ctx = c.getContext("2d")
let button_dict;                    // button_dict["CPSC 110"] = Button()
let hover_code = "";                // course code that mouse is hovering over
                                    //   "" if mouse is not hovering over any
let closed_hoverbox = false;        // true if hoverbox has been manually
                                    //   closed by the user, otherwise false

let WIDTH;                          // canvas width, set by its width in CSS
const HEIGHT = 1920;                // canvas height
const PADDING = 50;                 // canvas padding
let BTNWIDTH = 100;                 // approximate button width
const BTNHEIGHT = 30                // button height
const BTNMARGIN = 10;               // margin between buttons
const BLACKLINE = 1;                // normal button border width
const HOVERLINE = 5;                // highlighted button border width
const HOVERWIDTH = 300;             // hoverbox width
const HOVERHEIGHT = 500;            // maximum hoverbox height
const HOVERPADDING = 5;             // hoverbox padding
const DEPTHSPACING = 20;            // spacing between different depths
const TITLESPACING = 40;            // spacing from top to title

const COLOURS = {                   // button background colours:
  "done": "greenyellow",            // course is already taken
  "none": "whitesmoke",             // course meets all prereqs and coreqs
  "creq": "gold",                   // meets all prereqs, does not meet coreqs
  "preq": "pink",                   // course does not meet all prereqs
  "excl": "lightsteelblue",         // credit excluded by already taken course
  "xout": "lavender",               // either none or excl, depending
                                    //   on courses taken outside the tree
  "outs": "wheat",                  // either none, creq, or preq, depending
                                    //   on courses taken outside the tree
  "hovr": "honeydew",               // hoverbox background colour

                                    // button border colours:
  "preb": "deeppink",               // prereq of hovered course
  "creb": "darkorange",             // coreq of hovered course
  "excb": "indigo",                 // credit excluded by hovered course
  "dreq": "olive",                  // has hovered course as prereq or coreq
};


// structure for courses is in req.txt

// structure for course buttons

class Button {
  constructor(x, y) {
    Object.assign(this, {x, y});    // coordinates of top left corner
    this.depth = 0;                 // depth down the tree
    this.needs = "none";            // corresponds to button background colour
  }
}


// return the cursor position relative to the canvas

function getCursorPosition(e) {
  let x, y;
  if (e.pageX !== undefined && e.pageY !== undefined) {
    x = e.pageX;
    y = e.pageY;
  } else {
    x = e.clientX + document.body.scrollLeft +
      document.documentElement.scrollLeft;
    y = e.clientY + document.body.scrollTop +
      document.documentElement.scrollTop;
  }
  x -= c.offsetLeft;
  y -= c.offsetTop;
  return {x, y};
}


// given a list of lists, return a flat list of all valid course codes in it

function flatten(listlist) {
  const flat_list = [];
  for (const list of listlist) {
    if (list instanceof Array) {
      flat_list.push(...flatten(list));
    } else if (all_courses.hasOwnProperty(list)) {
      flat_list.push(list);
    }
  }
  return flat_list;
}


// given an array of paragraphs of text and a maximum text width,
// return an array of lines of text wrapped under that maximum width

function wrapText(paragraphs, max_width) {
  const lines = [];
  for (const paragraph of paragraphs) {
    let line = "";
    lines.push("");
    for (const word of paragraph.split(' ')) {
      if (ctx.measureText(line + word).width > max_width) {
        lines.push(line.trim());
        line = "";
      }
      line += word + ' ';
    }
    lines.push(line.trim());
  }
  return lines;
}


// given an array of lines of text, a line index, and a maximum text width,
// return an array of lines up to that index, with " ..." appended to the
// last line, possibly with words cut out to fit under that maximum width

function dotText(lines, index, max_width) {
  if (ctx.measureText(lines[index] + " ...").width > max_width) {
    const words = lines[index].split(' ');
    for (let i = words.length; i >= 0; i--) {
      const cut_line = words.slice(0, i).join(' ') + " ...";
      if (ctx.measureText(cut_line).width < max_width) {
        lines[index] = cut_line;
        break;
      }
    }
  }
  return lines.slice(0, index + 1);
}


// given a course code, return an array of paragraphs of text for its hoverbox

function writeHoverbox(code) {
  const paragraphs = [];
  const course = all_courses[code];
  paragraphs.push(course.code);
  if (course.name) {
    paragraphs[0] += ": " + course.name;
  }
  if (course.desc) {
    paragraphs.push(course.desc);
  }
  for (const param of [
      ["Prereqs: ", "preqs", "prer"], ["Coreqs: ", "creqs", "crer"],
      ["Exclusions: ", "excls"], ["Required by: ", "dreqs"],
      ["Terms: ", "terms"], ["Credits: ", "cred"]]) {
    if (course[param[2]]) {
      paragraphs.push(param[0] + course[param[2]]);
    } else if (course[param[1]] && course[param[1]].length > 0) {
      paragraphs.push(param[0] + course[param[1]].join(", "));
    }
  }
  return paragraphs;
}


// given the mouse position and a course code, draw its hoverbox there

function drawHoverbox(pos, code) {
  const padded_width = HOVERWIDTH - 2 * HOVERPADDING;
  ctx.textAlign = "start";
  ctx.textBaseline = "top";
  ctx.font = "12px sans-serif";

  // calculate actual height of hoverbox and cut text over the maximum height
  let lines = wrapText(writeHoverbox(code), padded_width);
  let padded_height = 2 * HOVERPADDING;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i]) {
      padded_height += 6;
    }
    padded_height += 6;
    if (padded_height > HOVERHEIGHT) {
      lines = dotText(lines, i, padded_width);
      break;
    }
  }

  // calculate direction to draw hoverbox, then draw its box
  const x = pos.x - HOVERWIDTH < PADDING ? pos.x : pos.x - HOVERWIDTH;
  ctx.lineWidth = BLACKLINE;
  ctx.fillStyle = COLOURS["hovr"];
  ctx.fillRect(x, pos.y, HOVERWIDTH, padded_height);
  ctx.fillStyle = "black";
  ctx.strokeRect(x, pos.y, HOVERWIDTH, padded_height);

  // draw the hoverbox text
  let y = pos.y;
  for (const line of lines) {
    if (line) {
      ctx.fillText(line, x + HOVERPADDING, y + HOVERPADDING);
      y += 6;
    }
    y += 6;
  }
}


// decide what to do when user clicks

function onClick(e) {

  // if hoverbox is open, then close the hoverbox but keep the tree shaded
  if (hover_code && !closed_hoverbox) {
    closed_hoverbox = true;
    shadeApp();
  }

  // if mouse is hovering over a course but the hoverbox is closed,
  // then it must have been closed by the above, so toggle its status,
  // update its dependencies' statuses, and unshade the tree
  else if (hover_code && closed_hoverbox) {
    if (button_dict[hover_code].needs === "done") {
      button_dict[hover_code].needs = "none";
    } else {
      button_dict[hover_code].needs = "done";
    }
    updateCourse(hover_code);
    for (const dependency of all_courses[hover_code].dreqs) {
      if (button_dict.hasOwnProperty(dependency)) {
        updateCourse(dependency);
      }
    }
    drawApp();
  }

  // if mouse is not hovering over a course, unshade the tree
  else {
    drawApp();
  }
}


// decide what to do when user moves mouse

function onMouseMove(e) {
  const pos = getCursorPosition(e);

  // go through all course buttons to see if mouse is hovering over any
  for (const code in button_dict) {
    if (button_dict.hasOwnProperty(code)) {
      const button = button_dict[code];
      if (pos.x > button.x && pos.x < button.x + BTNWIDTH
          && pos.y > button.y && pos.y < button.y + BTNHEIGHT) {
        // do not shade the tree if the user manually closed its hoverbox
        if (code === hover_code && closed_hoverbox) {
          return;
        }
        hover_code = code;
        shadeApp();
        drawHoverbox(pos, code);
        return;
      }
    }
  }

  // if mouse is not hovering over any, then reset hover_code
  hover_code = "";
  closed_hoverbox = false;
  drawApp();
}


// recursively check whether the given requirements are satisfied

function doneReqs(reqs) {
  if (reqs.length === 0) {
    return "done";
  }

  // recursively push status of each clause into status array
  const statuses = [];
  const operator = reqs[0];
  for (let i = 1; i < reqs.length; i++) {
    if (reqs[i] instanceof Array) {
      statuses.push(doneReqs(reqs[i]));
    }
    // push status of each course in the current tree
    else if (button_dict.hasOwnProperty(reqs[i])) {
      if (button_dict[reqs[i]].needs === "done") {
        statuses.push("done");
      } else {
        statuses.push("none");
      }
    }
    // courses outside the current tree are unknown
    else {
      statuses.push("outs");
    }
  }

  if (operator === "and") {
    if (statuses.indexOf("none") !== -1) {
      return "none";                // any course is none -> none
    } else if (statuses.indexOf("outs") !== -1) {
      return "outs";                // any course is outs -> outs
    } else {
      return "done";                // all courses are done -> done
    }
  } else if (operator === "or") {
    if (statuses.indexOf("done") !== -1) {
      return "done";                // any course is done -> done
    } else if (statuses.indexOf("outs") !== -1) {
      return "outs";                // any course is outs -> outs
    } else {
      return "none";                // all courses are none -> none
    }
  }
}


// update the status of the course with the given code

function updateCourse(code) {
  // courses can be taken in onClick -> done
  const button = button_dict[code];
  if (button.needs !== "done") {
    const course = all_courses[code];
    // if any excluded course in the current tree is done -> excl
    if (course.excl.length > 1 && doneReqs(course.excl) === "done") {
      button.needs = "excl";
    // if any prerequisite in the current tree is not done -> preq
    } else if (doneReqs(course.preq) === "none") {
      button.needs = "preq";
    // if any corequisite in the current tree is not done -> creq
    } else if (doneReqs(course.creq) === "none") {
      button.needs = "creq";
    // if all prerequisites are in the current tree and done, and
    //    all corequisites are in the current tree and done, then check...
    } else if (doneReqs(course.preq) === "done"
        && doneReqs(course.creq) === "done") {
      // if all excluded courses are in the current tree and not done -> none
      if (course.excl.length <= 1 || doneReqs(course.excl) === "none") {
        button.needs = "none";
      // otherwise, some excluded course is not in the current tree -> xout
      } else {
        button.needs = "xout";
      }
    // otherwise, some requisite course is not in the current tree -> outs
    } else {
      button.needs = "outs";
    }
  }
}


// draw a single course button on the canvas, with an optional border

function drawButton(code, border_colour) {
  if (!button_dict.hasOwnProperty(code)) {
    return;
  }
  const button = button_dict[code];
  ctx.textBaseline = "middle";
  ctx.font = "14px sans-serif";
  ctx.fillStyle = COLOURS[button.needs];
  ctx.fillRect(button.x, button.y, BTNWIDTH, BTNHEIGHT);
  if (border_colour) {
    ctx.lineWidth = HOVERLINE;
    ctx.strokeStyle = border_colour;
    ctx.strokeRect(button.x, button.y, BTNWIDTH, BTNHEIGHT);
  } else {
    ctx.lineWidth = BLACKLINE;
    ctx.strokeStyle = "black";
    ctx.strokeRect(button.x, button.y, BTNWIDTH, BTNHEIGHT);
  }
  ctx.fillStyle = "black";
  ctx.fillText(code, button.x + BTNWIDTH / 2, button.y + BTNHEIGHT / 2);
}


// draw the entire application on the canvas

function drawApp() {
  ctx.lineWidth = BLACKLINE;
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.strokeRect(0, 0, WIDTH, HEIGHT);
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.font = "bold 18px sans-serif";
  ctx.fillText("req v2.0", WIDTH / 2, PADDING);
  ctx.textBaseline = "bottom";
  ctx.font = "8px sans-serif";
  ctx.fillText("Copyright \u00a9 2016, 2017 Eugene Y. Q. Shen.",
      WIDTH / 2, HEIGHT - PADDING);
  for (const code in button_dict) {
    if (button_dict.hasOwnProperty(code)) {
      drawButton(code);
    }
  }
}


// draw the entire application on the canvas, shade it,
// and highlight the courses related to the currently hovered course

function shadeApp() {
  drawApp();
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  drawButton(hover_code, 'black');
  const hover_course = all_courses[hover_code];
  for (const param of [["preqs", "preb"],
      ["creqs", "creb"], ["excls", "excb"], ["dreqs", "dreq"]]) {
    for (const code of hover_course[param[0]]) {
      drawButton(code, COLOURS[param[1]]);
    }
  }
}


// start the application

function startApp() {

  // save canvas and context into global variables
  c = document.getElementById("canvas");
  ctx = c.getContext("2d");
  if (!ctx) {
    document.getElementById("nocanvas").innerHTML =
      "Your browser does not support this app!";
  } else {
    WIDTH = document.getElementById("canvas-wrapper").offsetWidth;
    let btncols = Math.floor((WIDTH - 2 * PADDING) / (BTNWIDTH + BTNMARGIN));
    BTNWIDTH = (WIDTH - 2 * PADDING - (btncols - 1) * BTNMARGIN) / btncols;
    c.width = WIDTH;
    c.height = HEIGHT;
    c.addEventListener("click", onClick, false);
    c.addEventListener("mousemove", onMouseMove, false);

    // update all courses in req.txt with preqs, creqs, and dreqs
    for (const code in all_courses) {
      if (all_courses.hasOwnProperty(code)) {
        const course = all_courses[code];
        for (const param of [
            ["preq", "preqs"], ["creq", "creqs"], ["excl", "excls"]]) {
          course[param[1]] = flatten(course[param[0]])
          for (const dependency of course[param[1]]) {
            if (all_courses.hasOwnProperty(dependency)) {
              all_courses[dependency].ddict[code] = true;
            }
          }
        }
      }
    }
    for (const code in all_courses) {
      if (all_courses.hasOwnProperty(code)) {
        all_courses[code].dreqs = Object.keys(all_courses[code].ddict);
      }
    }

    // TODO: instead of deleting trailing letters, parse UBC Course Schedule
    /* Remove whitespace, add space before numbers, delete trailing letters,
     * convert to uppercase, and filter out blanks and unknown codes.
     */
    let code_list = document.getElementById("form").elements["courses"]
        .value.split(",").map((code) => code.replace(/\s/g, "")
        .replace(/(^[^\d]*)(\d*)(.*$)/i, "$1 $2").toUpperCase());
    code_list = code_list.filter((code, i) => code.length !== 1
        && all_courses.hasOwnProperty(code));
    const unordered = {};
    button_dict = {};
    for (const code of code_list) {
      unordered[code] = true;
      button_dict[code] = new Button();
    }

    /* Arrange courses in order depending on their depth of prereqs
     * First scan through courses with no preqs and set their depth to 1,
     * then scan through all courses whose preqs all have a non-zero depth
     * of which the maximum is 1, and set their depth to 2, etc. until done.
     */
    let depth = 0;
    while (Object.keys(unordered).length !== 0) {
      depth += 1;
      for (const code in unordered) {
        if (unordered.hasOwnProperty(code)) {
          let hasreq = false;       // has a prereq in the current tree
          let badreq = false;       // has a prereq with zero or current depth
          for (const preq of all_courses[code].preqs) {
            if (button_dict.hasOwnProperty(preq)) {
              hasreq = true;
              if (button_dict[preq].depth === 0
                  || button_dict[preq].depth === depth) {
                badreq = true;
              }
            }
          }
          if (!badreq || (depth === 1 && !hasreq)) {
            button_dict[code].depth = depth;
            delete unordered[code];
          }
        }
      }
    }

    // find correct coordinates to place each button
    let x = PADDING;
    let y = PADDING + TITLESPACING;
    for (let d = 0; d <= depth; d++) {
      for (const code in button_dict) {
        if (button_dict.hasOwnProperty(code)) {
          if (button_dict[code].depth === d) {
            Object.assign(button_dict[code], {x, y});
            updateCourse(code);
            x += BTNWIDTH + BTNMARGIN;
            if (x + BTNWIDTH > WIDTH - PADDING) {
              x = PADDING;
              y += BTNHEIGHT + BTNMARGIN;
              if (y + BTNHEIGHT > HEIGHT - PADDING) {
                break;
              }
            }
          }
        }
      }
      if (x === PADDING) {
        y += DEPTHSPACING;
      } else {
        y += BTNHEIGHT + BTNMARGIN + DEPTHSPACING;
      }
      x = PADDING;
      if (y + BTNHEIGHT > HEIGHT - PADDING) {
        break;
      }
    }
    drawApp();
  }
}


// add all event listeners when ready

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("form").addEventListener("submit", function (e) {
    e.preventDefault();
    startApp();
  });
});
