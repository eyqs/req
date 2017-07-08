/* req v1.3
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

var c;
var ctx;
var codeList;
var courseData;
var WIDTH = 960;
var HEIGHT = 1920;
var BORDER = 50;
var BTNWIDTH = 100;
var BTNHEIGHT = 30;
var BTNPADDING = 10;
var DEPTHPADDING = 20;
var TITLEPADDING = 40;
var COLOURS = { "done":"greenyellow", "none":"whitesmoke", "outs":"wheat",
  "creq":"gold", "preq":"pink", "excl":"lightsteelblue", "xout":"lavender" };

/* done: already taken
 * none: meets all prerequisites and corequisites
 * creq: meets all prerequisites, does not meet all corequisites
 * preq: does not meet all prerequisites
 * excl: cannot take for credit given previously taken and current courses
 * xout: none or excl, depending on classes taken outside the current tree
 * outs: status could be anything, depending on classes outside the tree
 */

// structure for courses is in req.txt
function CourseData() {
  this.x;
  this.y;
  this.depth = 0;
  this.needs = "none";
}

// return the cursor position relative to the canvas
function getCursorPosition(e) {
  var x, y;
  if (e.pageX != undefined && e.pageY != undefined) {
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
  return { x:x, y:y };
}

// decide what to do when user clicks
function onClick(e) {
  var pos = getCursorPosition(e);
  for (var i = 0; i < codeList.length; i++) {
    var code = codeList[i];
    if (pos.x > courseData[code].x &&
      pos.x < courseData[code].x + BTNWIDTH &&
      pos.y > courseData[code].y &&
      pos.y < courseData[code].y + BTNHEIGHT) {
      if (courseData[code].needs == "done") {
        courseData[code].needs = "none";
      } else {
        courseData[code].needs = "done";
      }
      updateCourse(code);
      for (var j = 0; j < allCourses[code].dreqs.length; j++) {
        var dependency = allCourses[code].dreqs[j];
        if (codeList.indexOf(dependency) != -1) {
          updateCourse(dependency);
        }
      }
    }
  }
  drawApp();
}

// recursively check whether the requirements are satisfied
function doneReqs(reqs) {
  if (reqs.length == 0) {
    return "done";
  }
  var done = [];
  var operator = reqs[0];
  for (var i = 1; i < reqs.length; i++) {
    if (reqs[i] instanceof Array) {
      done.push(doneReqs(reqs[i]));
    } else if (codeList.indexOf(reqs[i]) != -1) {
      if (courseData[reqs[i]].needs == "done") {
        done.push("done");
      } else {
        done.push("none");
      }
    } else {
      done.push("outs");
    }
  }
  if (operator == "and") {
    if (done.indexOf("none") != -1) {
      return "none";
    } else if (done.indexOf("outs") != -1) {
      return "outs";
    } else {
      return "done";
    }
  } else if (operator == "or") {
    if (done.indexOf("done") != -1) {
      return "done";
    } else if (done.indexOf("outs") != -1) {
      return "outs";
    } else {
      return "none";
    }
  }
}

// update the status of a course
function updateCourse(code) {
  if (courseData[code].needs != "done") {
    // if any excluded course in the current tree is done -> excl
    if (allCourses[code].excl.length > 1 &&
      doneReqs(allCourses[code].excl) == "done") {
      courseData[code].needs = "excl";
    // if any prerequisite in the current tree is not done -> preq
    } else if (doneReqs(allCourses[code].preq) == "none") {
      courseData[code].needs = "preq";
    // if any corequisite in the current tree is not done -> creq
    } else if (doneReqs(allCourses[code].creq) == "none") {
      courseData[code].needs = "creq";
    // if all prerequisites are in the current tree and done, and
    //    all corequisites are in the current tree and done, then check
    } else if (doneReqs(allCourses[code].preq) == "done"
               && doneReqs(allCourses[code].creq) == "done") {
      // if all excluded courses are in the current tree and not done -> none
      if (allCourses[code].excl.length <= 1
          || doneReqs(allCourses[code].excl) == "none") {
        courseData[code].needs = "none";
      // otherwise, some excluded course is not in the current tree -> xout
      } else {
        courseData[code].needs = "xout";
      }
    // otherwise, some rerequisite course is not in the current tree -> outs
    } else {
      courseData[code].needs = "outs";
    }
  }
}

// draw the entire application on the canvas
function drawApp() {
  ctx.fillStyle = "black";
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.strokeRect(0, 0, WIDTH, HEIGHT);
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.font = "bold 18px sans-serif";
  ctx.fillText("req v1.3", WIDTH / 2, BORDER);
  ctx.textBaseline = "bottom";
  ctx.font = "8px sans-serif";
  ctx.fillText("Copyright \u00a9 2016, 2017 Eugene Y. Q. Shen.",
    WIDTH / 2, HEIGHT - BORDER);
  ctx.textBaseline = "middle";
  ctx.font = "14px sans-serif";
  for (var i = 0; i < codeList.length; i++) {
    var code = codeList[i];
    ctx.fillStyle = COLOURS[courseData[code].needs];
    ctx.fillRect(courseData[code].x, courseData[code].y,
      BTNWIDTH, BTNHEIGHT);
    ctx.fillStyle = "black";
    ctx.strokeRect(courseData[code].x, courseData[code].y,
      BTNWIDTH, BTNHEIGHT);
    ctx.fillText(code, courseData[code].x + BTNWIDTH / 2,
      courseData[code].y + BTNHEIGHT / 2);
  }
}

// parse the given course codes
function parseCodes() {
  /* Remove all whitespace, add one space before first number,
   * convert to uppercase, filter out blanks and unknown codes,
   * and finally return only unique valid course codes.
   */
    codeList = codeList.map((code) => code.replace(/\s/g, "")
      .replace(/(^[^\d]*)(\d*)(.*$)/i, "$1 $2$3").toUpperCase())
      .filter((code, i) => code.length !== 1
        && allCourses.hasOwnProperty(code) && codeList.indexOf(code) != i);
    courseData = []
    for (var i = 0; i < codeList.length; i++) {
        courseData[codeList[i]] = new CourseData();
    }

  /* Arrange courses in order depending on their depth of prereqs
   * First scan through courses with no preqs and set their depth to 1,
   * then scan through all courses whose preqs all have a non-zero depth
   * of which the maximum is 1, and set their depth to 2, etc. until done.
   */
    var unordered = [];
    for (var i = 0; i < codeList.length; i++) {
        unordered.push(codeList[i]);
    }

    var depth = 0;
    while (unordered.length > 0) {
        depth += 1;
        for (var i = unordered.length - 1; i >= 0; i--) {
            var code = unordered[i];
            var hasreq = false; // has a prereq in the current tree
            var badreq = false; // has a prereq with zero or current depth
            for (var j = 0; j < allCourses[code].preqs.length; j++) {
                var preq = allCourses[code].preqs[j];
                if (codeList.indexOf(preq) != -1) {
                    hasreq = true;
                    if (courseData[preq].depth == 0 ||
                        courseData[preq].depth == depth) {
                        badreq = true;
                    }
                }
            }
            if (depth == 1 && !hasreq) {
                courseData[code].depth = 1;
                unordered.splice(i, 1);
                continue;
            }
            if (badreq) {
                continue;
            }
            courseData[code].depth = depth;
            unordered.splice(i, 1);
        }
    }

    // find correct coordinates to place each button
    var x = BORDER;
    var y = BORDER + TITLEPADDING;
    for (var d = 0; d <= depth; d++) {
        for (var i = 0; i < codeList.length; i++) {
            if (courseData[codeList[i]].depth == d) {
                courseData[codeList[i]].x = x;
                courseData[codeList[i]].y = y;
                updateCourse(codeList[i]);
                x += BTNWIDTH + BTNPADDING;
                if (x + BTNWIDTH > WIDTH - BORDER) {
                    x = BORDER;
                    y += BTNHEIGHT + BTNPADDING;
                    if (y + BTNHEIGHT > HEIGHT - BORDER) {
                        break;
                    }
                }
            }
        }
        if (x == BORDER) {
            y += DEPTHPADDING;
        } else {
            y += BTNHEIGHT + BTNPADDING + DEPTHPADDING;
        }
        x = BORDER;
        if (y + BTNHEIGHT > HEIGHT - BORDER) {
            break;
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
    codeList = document.getElementById("form")
      .elements["courses"].value.split(",");
    parseCodes();
    c.width = WIDTH;
    c.height = HEIGHT;
    c.addEventListener("click", onClick, false);
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
