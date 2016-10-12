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
var courseList;
var WIDTH = 640;
var HEIGHT = 480;
var BORDER = 50;
var BTNWIDTH = 100;
var BTNHEIGHT = 30;
var BTNPADDING = 10;
var TITLEPADDING = 40;
var COLOURS = { "done":"greenyellow", "none":"whitesmoke", "outs":"wheat",
                "creq":"gold", "preq":"pink", "excl":"lightsteelblue" };

/* Structure for course buttons */
function Course(code, x, y) {
    this.code = code;
    this.x = x;
    this.y = y;
    this.name = "";
    this.desc = "";
    this.cred = -1.0;
    this.excl = [];
    this.term = [];
    this.preq = "";
    this.creq = "";
    this.preqs = []
    this.creqs = []
    this.dreqs = []
    this.needs = "none";
    this.depth = 0;
}

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
    for (var i = 0; i < courseList.length; i++) {
        if (pos.x > courseList[i].x && pos.x < courseList[i].x + BTNWIDTH &&
            pos.y > courseList[i].y && pos.y < courseList[i].y + BTNHEIGHT) {
            switch (courseList[i].needs) {
            case "done": courseList[i].needs = "none"; break;
            case "none": courseList[i].needs = "outs"; break;
            case "outs": courseList[i].needs = "creq"; break;
            case "creq": courseList[i].needs = "preq"; break;
            case "preq": courseList[i].needs = "excl"; break;
            case "excl": courseList[i].needs = "done"; break;
            default: break;
            }
        }
    }
    drawApp();
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
    for (var i = 0; i < courseList.length; i++) {
        ctx.fillStyle = COLOURS[courseList[i].needs];
        ctx.fillRect(courseList[i].x, courseList[i].y, BTNWIDTH, BTNHEIGHT);
        ctx.fillStyle = "black";
        ctx.strokeRect(courseList[i].x, courseList[i].y, BTNWIDTH, BTNHEIGHT);
        ctx.fillText(courseList[i].code, courseList[i].x + BTNWIDTH / 2,
                     courseList[i].y + BTNHEIGHT / 2);
    }
}

/* Parse the given course codes */
function parseCodes(codeList) {
    var x = BORDER;
    var y = BORDER + TITLEPADDING;
    for (var i = 0; i < codeList.length; i++) {
        courseList.push(new Course(codeList[i], x, y));
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

/* Initialize the application */
function initApp(formElement, messageElement, canvasElement) {
    c = canvasElement;
    ctx = c.getContext("2d");
    if (!ctx)
        messageElement.innerHTML = "Your browser does not support this app!";
    else {
        courseList = [];
        var codeList = formElement.elements["courses"].value.split(", ");
        parseCodes(codeList);
        c.width = WIDTH;
        c.height = HEIGHT;
        c.addEventListener("click", onClick, false);
        drawApp();
    }
}
