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
var WIDTH = 600;
var HEIGHT = 400;

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
    ctx.fillText(pos.x, WIDTH / 2, HEIGHT / 2);
}

/* Draw the entire application on the canvas */
function drawApp() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = "#000000";
    ctx.strokeRect(0, 0, WIDTH, HEIGHT);
    ctx.font = "bold 18px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("req v1.2", WIDTH / 2, 30);
    ctx.font = "8px sans-serif";
    ctx.fillText("Copyright \u00a9 2016 Eugene Y. Q. Shen.",
                 WIDTH / 2, HEIGHT - 30);
}

/* Initialize the application */
function initApp(formElement, messageElement, canvasElement) {
    c = canvasElement;
    ctx = c.getContext("2d");
    c.width = WIDTH;
    c.height = HEIGHT;
    if (!ctx)
        messageElement.innerHTML = "Your browser does not support this app!";
    else {
        c.addEventListener("click", onClick, false);
        drawApp();
    }
}
