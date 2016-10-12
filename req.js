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
    drawApp();
}

/* Draw the entire application on the canvas */
function drawApp() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = "#000000";
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
    var x = BORDER;
    var y = BORDER + TITLEPADDING;
    for (var i = 0; i < courseList.length; i++) {
        ctx.strokeRect(x, y, BTNWIDTH, BTNHEIGHT);
        ctx.fillText(courseList[i], x + BTNWIDTH / 2, y + BTNHEIGHT / 2);
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
        courseList = formElement.elements["courses"].value.split(", ");
        console.log(courseList[0]);
        console.log(courseList[1]);
        c.width = WIDTH;
        c.height = HEIGHT;
        c.addEventListener("click", onClick, false);
        drawApp();
    }
}
