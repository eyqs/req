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
        if (pos.x > allCourses[codeList[i]].x &&
            pos.x < allCourses[codeList[i]].x + BTNWIDTH &&
            pos.y > allCourses[codeList[i]].y &&
            pos.y < allCourses[codeList[i]].y + BTNHEIGHT) {
            switch (allCourses[codeList[i]].needs) {
            case "done": allCourses[codeList[i]].needs = "none"; break;
            case "none": allCourses[codeList[i]].needs = "outs"; break;
            case "outs": allCourses[codeList[i]].needs = "creq"; break;
            case "creq": allCourses[codeList[i]].needs = "preq"; break;
            case "preq": allCourses[codeList[i]].needs = "excl"; break;
            case "excl": allCourses[codeList[i]].needs = "done"; break;
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

    /* Find correct coordinates to place each button */
    var x = BORDER;
    var y = BORDER + TITLEPADDING;
    for (var i = 0; i < codeList.length; i++) {
        allCourses[codeList[i]].x = x;
        allCourses[codeList[i]].y = y;
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
	    codeList = formElement.elements["courses"].value.split(", ");
        parseCodes();
        c.width = WIDTH;
        c.height = HEIGHT;
        c.addEventListener("click", onClick, false);
        drawApp();
    }
}
