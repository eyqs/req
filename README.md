# req

req is a simple program that shows you trees of course prereqs and coreqs.

## Basics

### Requirements

Use Python 3.5, or probably any Python 3. Does not work on Python 2.

### Installation

    $ git clone https://github.com/eyqs/req.git/
    $ cd req/
    $ python req.py
    $ xdg-open req.html

## Usage

Hover over a course to see its information. Click to dismiss the hoverbox.
Click again to toggle the course as already completed or not yet completed.
You can change the colours by editing the `COLOURS` dictionary in `req.js`.

Make sure you don't add a course which is a prerequisite of itself!
That'll just get you an infinite loop. The same applies to, for example,
a course which is a prereq of its own coreq, and all sorts of other nonsense.

### Regeneration

    $ # regenerates huge course req JavaScript object from the given folder
    $ python req.py folder_name         # default: data/ubc/2017
    $
    $ # regenerates course req lists from the current UBC Calendar
    $ python ubcalend.py folder_name    # default: 2017
    $
    $ # regenerates course code lists from the given folder of req lists
    $ python codetabs.py folder_name    # default: 2017
    $
    $ # regenerates excls.txt from the current UBC Credit Exclusion List
    $ python excluded.py folder_name    # default: 2017
    $
    $ # regenerates terms.txt from the current UBC Course Schedule, very slow
    $ python ubcsched.py foo bar baz    # default: 2017S 2017W

### Configuration

You can add separate courselists into the `courses` folder as plaintext files.
All lines without a colon `:` will be ignored, and all lines with a colon
will be split into the part before the colon and the part after the colon.
The part before the colon must be one of these allowed parameters:

- code: the course code, like `CPSC 121`
- name: the course name, like `Models of Computation`
- desc: the course description, like `Functions, derivatives, optimization...`
- prer: the raw course prerequisites, like `Either (a) CPSC 221 or (b) ...`
- crer: the raw course corequisites, like `All of CPSC 213, CPSC 221.`
- preq: the parsed course prerequisites, like `CPSC 221 or (CPSC 260 and ...`
- creq: the parsed course corequisites, like `CPSC 213 and CPSC 221
- excl: the courses that cannot be taken for credit after the course is taken,
in a comma-separated list, like `STAT 200, STAT 203, BIOL 300, COMM 291, ...`
- term: the terms in which the course is offered, like `2017S, 2017W`
- cred: the number of credits granted by the course, like `3`, or even
a comma-separated list for courses with variable credits, like `3, 6`

The course code is required and everything else is optional.
In particular, only preq, creq, and excl are actually used in the logic,
while name, desc, prer, crer, term, and cred are just shown in the hoverbox.
Everything between two appearances of `code:` is a property of the first code.

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
