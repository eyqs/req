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
var last_hover_code = "";
var current_hover_code = "";
var WIDTH;
var HEIGHT = 1920;
var PADDING = 50;
var BTNWIDTH = 100;
var BTNHEIGHT = 30;
var BTNPADDING = 10;
var BLACKLINE = 1;
var HOVERLINE = 5;
var HOVERWIDTH = 300;
var HOVERHEIGHT = 500;
var HOVERPADDING = 5;
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

// return an array of lines of wrapped hoverbox text
function wrapText(text) {
  var padded_width = HOVERWIDTH - 2 * HOVERPADDING;
  var lines = [];
  for (var i = 0; i < text.length; i++) {
    var line = "";
    var words = text[i].split(' ');
    lines.push("");
    for (var j = 0; j < words.length; j++) {
      if (ctx.measureText(line + words[j]).width > padded_width) {
        lines.push(line.trim());
        line = words[j] + ' ';
      } else {
        line += words[j] + ' ';
      }
    }
    lines.push(line.trim());
  }
  return lines;
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
  if (current_hover_code) {
    last_hover_code = current_hover_code;
    current_hover_code = "";
    drawApp(last_hover_code);
  } else {
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
        drawApp();
        return;
      }
    }
  }
}

// decide what to do when user moves mouse
function onMouseMove(e) {
  var pos = getCursorPosition(e);
  for (var i = 0; i < codeList.length; i++) {
    var code = codeList[i];
    if (pos.x > courseData[code].x &&
      pos.x < courseData[code].x + BTNWIDTH &&
      pos.y > courseData[code].y &&
      pos.y < courseData[code].y + BTNHEIGHT) {
      if (code === last_hover_code) {
        return;
      }
      current_hover_code = code;
      var text = [];
      text.push(allCourses[code].code)
      if (allCourses[code].name) {
        text[0] += ": " + allCourses[code].name;
      } if (allCourses[code].desc.length > 0) {
        text.push(allCourses[code].desc);
      } if (allCourses[code].preqs.length > 0) {
        text.push("Prereqs: " + allCourses[code].preqs.join(", "));
      } if (allCourses[code].creqs.length > 0) {
        text.push("Coreqs: " + allCourses[code].creqs.join(", "));
      } if (allCourses[code].excl.length > 1) {
        text.push("Exclusions: " + allCourses[code].excl.slice(1).join(", "));
      } if (allCourses[code].dreqs.length > 0) {
        text.push("Required by: " + allCourses[code].dreqs.join(", "));
      } if (allCourses[code].cred.length > 0) {
        text.push("Credits: " + allCourses[code].cred.join(", "));
      }
      drawApp(current_hover_code);
      ctx.textAlign = "start";
      ctx.textBaseline = "top";
      ctx.font = "12px sans-serif";
      var y = 0;
      var wrappedText = wrapText(text);
      for (var i = 0; i < wrappedText.length; i++) {
        var line = wrappedText[i];
        if (line) {
          y += 12;
          if (y > HOVERHEIGHT - 2 * HOVERPADDING) {
            var padded_width = HOVERWIDTH - 2 * HOVERPADDING;
            wrappedText[i] = line + " ...";
            if (ctx.measureText(wrappedText[i]).width > padded_width) {
              var words = line.split(' ');
              for (var j = words.length; j >= 0; j--) {
                var cut_line = words.slice(0, j).join(' ') + " ...";
                if (ctx.measureText(cut_line).width < padded_width) {
                  wrappedText[i] = cut_line;
                  break;
                }
              }
            }
            wrappedText = wrappedText.slice(0, i + 1)
            break;
          }
        } else {
          y += 6;
        }
      }
      var posx = pos.x - HOVERWIDTH < PADDING ? pos.x : pos.x - HOVERWIDTH;
      ctx.lineWidth = BLACKLINE;
      ctx.fillStyle = "honeydew";
      ctx.fillRect(posx, pos.y, HOVERWIDTH, y + 2 * HOVERPADDING);
      ctx.fillStyle = "black";
      ctx.strokeRect(posx, pos.y, HOVERWIDTH, y + 2 * HOVERPADDING);
      y = 0;
      for (var i = 0; i < wrappedText.length; i++) {
        var line = wrappedText[i];
        if (line) {
          ctx.fillText(line, posx + HOVERPADDING, pos.y + HOVERPADDING + y);
          y += 12;
        } else {
          y += 6;
        }
      }
      return;
    }
  }
  current_hover_code = "";
  last_hover_code = "";
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
function drawApp(hover_code) {
  ctx.lineWidth = BLACKLINE;
  ctx.fillStyle = "black";
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.strokeRect(0, 0, WIDTH, HEIGHT);
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.font = "bold 18px sans-serif";
  ctx.fillText("req v1.3", WIDTH / 2, PADDING);
  ctx.textBaseline = "bottom";
  ctx.font = "8px sans-serif";
  ctx.fillText("Copyright \u00a9 2016, 2017 Eugene Y. Q. Shen.",
    WIDTH / 2, HEIGHT - PADDING);
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
  if (hover_code) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    for (var i = 0; i < codeList.length; i++) {
      var code = codeList[i];
      var border = "";
      if (allCourses[hover_code].preqs.indexOf(code) != -1) {
        border = COLOURS["preq"];
      } if (allCourses[hover_code].creqs.indexOf(code) != -1) {
        border = COLOURS["creq"];
      } if (allCourses[hover_code].dreqs.indexOf(code) != -1) {
        border = COLOURS["done"];
      } if (allCourses[hover_code].excl.indexOf(code) != -1) {
        border = COLOURS["excl"];
      }
      if (border) {
        ctx.fillStyle = COLOURS[courseData[code].needs];
        ctx.fillRect(courseData[code].x, courseData[code].y,
          BTNWIDTH, BTNHEIGHT);
        ctx.lineWidth = HOVERLINE;
        ctx.strokeStyle = border;
        ctx.strokeRect(courseData[code].x, courseData[code].y,
          BTNWIDTH, BTNHEIGHT);
        ctx.lineWidth = BLACKLINE
        ctx.strokeStyle = "black";
        ctx.strokeRect(courseData[code].x, courseData[code].y,
          BTNWIDTH, BTNHEIGHT);
        ctx.fillStyle = "black";
        ctx.fillText(code, courseData[code].x + BTNWIDTH / 2,
          courseData[code].y + BTNHEIGHT / 2);
      }
    }
  }
}

// parse the given course codes
function parseCodes() {
  // TODO: instead of deleting trailing letters, parse UBC Course Schedule
  /* Remove all whitespace, add one space before first number,
   * delete trailing letters, convert to uppercase, filter out blanks,
   * filter out unknown codes, and return only unique valid course codes.
   */
    codeList = codeList.map((code) => code.replace(/\s/g, "")
      .replace(/(^[^\d]*)(\d*)(.*$)/i, "$1 $2").toUpperCase());
    codeList = codeList.filter((code, i) => code.length !== 1
        && allCourses.hasOwnProperty(code) && codeList.indexOf(code) == i);
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
    var x = PADDING;
    var y = PADDING + TITLEPADDING;
    for (var d = 0; d <= depth; d++) {
        for (var i = 0; i < codeList.length; i++) {
            if (courseData[codeList[i]].depth == d) {
                courseData[codeList[i]].x = x;
                courseData[codeList[i]].y = y;
                updateCourse(codeList[i]);
                x += BTNWIDTH + BTNPADDING;
                if (x + BTNWIDTH > WIDTH - PADDING) {
                    x = PADDING;
                    y += BTNHEIGHT + BTNPADDING;
                    if (y + BTNHEIGHT > HEIGHT - PADDING) {
                        break;
                    }
                }
            }
        }
        if (x == PADDING) {
            y += DEPTHPADDING;
        } else {
            y += BTNHEIGHT + BTNPADDING + DEPTHPADDING;
        }
        x = PADDING;
        if (y + BTNHEIGHT > HEIGHT - PADDING) {
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
    WIDTH = document.getElementById("canvas-wrapper").offsetWidth;
    var btncols = Math.floor((WIDTH - 2 * PADDING) / (BTNWIDTH + BTNPADDING));
    BTNWIDTH = (WIDTH - 2 * PADDING - (btncols - 1) * BTNPADDING) / btncols;
    c.width = WIDTH;
    c.height = HEIGHT;
    c.addEventListener("click", onClick, false);
    c.addEventListener("mousemove", onMouseMove, false);
    codeList = document.getElementById("form")
      .elements["courses"].value.split(",");
    parseCodes();
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
