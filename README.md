# req

req is a simple program that shows you trees of course prereqs and coreqs.

## Basics

### Requirements

- Python 3.5 with Tkinter

Probably works on earlier versions too. Definitely does not work on Python 2.

### Installation

    $ git clone https://github.com/eyqs/req.git/
    $ cd req/
    $ python req.py
    $ xdg-open req.html

## Usage

Click on a course to toggle it as already completed or not already completed.
You can change the colours by editing the `COLOURS` dictionary in `req.py`.
Make sure you don't add a course which is a prerequisite of itself!
That'll just get you an infinite loop. (The same applies to, for example,
a course which is a prereq of its own coreq, and all sorts of other nonsense.)

### Configuration

You can add separate courselists into the `courses` folder as plaintext files.
All lines without a colon `:` will be ignored, and all lines with a colon
will be split into the part before the colon and the part after the colon.
The part before the colon must be one of these allowed parameters:

- code: the course code, but you can use its name instead if you want;
- name: the course name, but you can use its code instead if you want;
- cred: the number of credits granted by the course, can be a comma-separated
list for courses that grant a variable number of credits, like `3, 6`;
- preq: the prerequisites of the course, which must be taken beforehand;
- creq: the corequisites of the course, which must be taken with it;
- term: the terms in which the course is offered, in a comma-separated list;
- excl: the courses that cannot be taken for credit after the course is taken,
in a comma-separated list, it's probably just a weird UBC thing;

The course code is required and everything else is optional. In particular,
name, cred, and term currently don't do anything at all, so they're useless.
Everything between two appearances of `code:` is a property of the first code.
If the preq, creq, or excl requirements are too complicated, you can always
write `more...` to remind people not to rely on hacky tacky Python scripts.

For preq and creq, the structure of the part after the colon has to be an
unambiguous, properly parenthesized boolean expression made from the codes of
the reqs, such as `preq: (CPSC 221 or (CPSC 260 and EECE 320)) and more...`
Reading the example lists in this repo will probably make more sense than me.

## License

Copyright (c) 2016, 2017 Eugene Y. Q. Shen.

req is free software: you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation, either version
3 of the License, or (at your option) any later version.

req is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License in [LICENSE.md][] for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <http://www.gnu.org/licenses/>.

[license.md]:                ../master/LICENSE.md
                               "The GNU General Public License"
