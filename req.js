/* req v1.2.0
 * Copyright (c) 2016 Eugene Y. Q. Shen.
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
var WIDTH = 640;
var HEIGHT = 480;
var BORDER = 50;
var BTNWIDTH = 100;
var BTNHEIGHT = 30;
var BTNPADDING = 10;
var DEPTHPADDING = 20;
var TITLEPADDING = 40;
var COLOURS = { "done":"greenyellow", "none":"whitesmoke", "outs":"wheat",
                "creq":"gold", "preq":"pink", "excl":"lightsteelblue" };

/* Structure for courses is in req.txt */

/* Return the cursor position relative to the canvas */
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

/* Decide what to do when user clicks */
function onClick(e) {
    var pos = getCursorPosition(e);
    for (var i = 0; i < codeList.length; i++) {
        var code = codeList[i];
        if (pos.x > allCourses[code].x &&
            pos.x < allCourses[code].x + BTNWIDTH &&
            pos.y > allCourses[code].y &&
            pos.y < allCourses[code].y + BTNHEIGHT) {
            if (allCourses[code].needs == "done") {
                allCourses[code].needs = "none";
            } else {
                allCourses[code].needs = "done";
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

/* Recursively check whether the requirements are satisfied */
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
            if (allCourses[reqs[i]].needs == "done") {
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

/* Update the status of a course */
function updateCourse(code) {
    if (allCourses[code].needs != "done") {
        /* See req.py for detailed comments */
        if (allCourses[code].excl.length > 1 &&
            doneReqs(allCourses[code].excl) == "done") {
            allCourses[code].needs = "excl";
        } else if (doneReqs(allCourses[code].preq) == "none") {
            allCourses[code].needs = "preq";
        } else if (doneReqs(allCourses[code].creq) == "none") {
            allCourses[code].needs = "creq";
        } else if ((allCourses[code].excl.length <= 1 ||
                    doneReqs(allCourses[code].excl) == "none") &&
                   doneReqs(allCourses[code].preq) == "done" &&
                   doneReqs(allCourses[code].creq) == "done") {
            allCourses[code].needs = "none";
        } else {
            allCourses[code].needs = "outs";
        }
    }
}

/* Draw the entire application on the canvas */
function drawApp() {
    ctx.fillStyle = "black";
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.strokeRect(0, 0, WIDTH, HEIGHT);
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.font = "bold 18px sans-serif";
    ctx.fillText("req v1.2", WIDTH / 2, BORDER);
    ctx.textBaseline = "bottom";
    ctx.font = "8px sans-serif";
    ctx.fillText("Copyright \u00a9 2016 Eugene Y. Q. Shen.",
                 WIDTH / 2, HEIGHT - BORDER);
    ctx.textBaseline = "middle";
    ctx.font = "14px sans-serif";
    for (var i = 0; i < codeList.length; i++) {
        ctx.fillStyle = COLOURS[allCourses[codeList[i]].needs];
        ctx.fillRect(allCourses[codeList[i]].x, allCourses[codeList[i]].y,
                     BTNWIDTH, BTNHEIGHT);
        ctx.fillStyle = "black";
        ctx.strokeRect(allCourses[codeList[i]].x, allCourses[codeList[i]].y,
                       BTNWIDTH, BTNHEIGHT);
        ctx.fillText(allCourses[codeList[i]].code,
                     allCourses[codeList[i]].x + BTNWIDTH / 2,
                     allCourses[codeList[i]].y + BTNHEIGHT / 2);
    }
}

/* Parse the given course codes */
function parseCodes() {
    /* Remove unknown course codes and duplicates */
    for (var i = codeList.length - 1; i >= 0; i--) {
        if (!(codeList[i] in allCourses) ||
            codeList.indexOf(codeList[i]) != i) {
            codeList.splice(i, 1);
        }
    }

    /* Arrange courses in order depending on their depth of prereqs
     * First scan through courses with no preqs and set their depth to 1,
     * then scan through all courses whose preqs all have a non-zero depth
     * of which the maximum is 1, and set their depth to 2, etc. until done */
    var unordered = [];
    for (var i = 0; i < codeList.length; i++) {
        unordered.push(codeList[i]);
    }

    var depth = 0;
    while (unordered.length > 0) {
        depth += 1;
        if (depth > 2000) return;
        for (var i = unordered.length - 1; i >= 0; i--) {
            var code = unordered[i];
            var hasreq = false; /* Has a prereq in the current tree */
            var badreq = false; /* Has a prereq with zero or current depth */
            for (var j = 0; j < allCourses[code].preqs.length; j++) {
                var preq = allCourses[code].preqs[j];
                if (codeList.indexOf(preq) != -1) {
                    hasreq = true;
                    if (allCourses[preq].depth == 0 ||
                        allCourses[preq].depth == depth) {
                        badreq = true;
                    }
                }
            }
            if (depth == 1 && !hasreq) {
                allCourses[code].depth = 1;
                unordered.splice(i, 1);
                continue;
            }
            if (badreq) {
                continue;
            }
            allCourses[code].depth = depth;
            unordered.splice(i, 1);
        }
    }

    /* Find correct coordinates to place each button */
    var x = BORDER;
    var y = BORDER + TITLEPADDING;
    for (var d = 0; d <= depth; d++) {
        for (var i = 0; i < codeList.length; i++) {
            if (allCourses[codeList[i]].depth == d) {
                allCourses[codeList[i]].x = x;
                allCourses[codeList[i]].y = y;
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
        x = BORDER;
        y += BTNHEIGHT + BTNPADDING + DEPTHPADDING;
        if (y + BTNHEIGHT > HEIGHT - BORDER) {
            break;
        }
    }
}

/* Initialize the application */
function initApp(formElement, messageElement, canvasElement) {
    c = canvasElement;
    ctx = c.getContext("2d");
    if (!ctx)
        messageElement.innerHTML = "Your browser does not support this app!";
    else {
        codeList = formElement.elements["courses"].value.split(", ");
        parseCodes();
        c.width = WIDTH;
        c.height = HEIGHT;
        c.addEventListener("click", onClick, false);
        drawApp();
    }
}
