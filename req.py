#!/usr/bin/env python
"""
req v2.0
Copyright (c) 2016, 2017 Eugene Y. Q. Shen.

req is free software: you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation, either version
3 of the License, or (at your option) any later version.

req is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty
of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see http://www.gnu.org/licenses/.
"""
import os
import sys
YEAR    = '2017'
DUMP    = 'req.txt'
UBCPATH = 'data/ubc/'
INPATH  = '/courses/'
if len(sys.argv) == 1:
    COURSES = UBCPATH + YEAR + INPATH
else:
    COURSES = sys.argv[1] + INPATH


# Generic class to store course data
class Course():

    # Initialize all variables
    def __init__(self, code):
        self.code = code            # course code, x. 'CPSC 121'
        self.name = ''              # name, x. 'Models of Computation'
        self.desc = ''              # course description in UBC Calendar
        self.prer = ''              # raw prereqs, x. 'Either (a) CPSC ...'
        self.crer = ''              # raw coreqs, x. 'All of CPSC 213 ...'
        self.preq = []              # prereq tree, x. ['or', 'CPSC 221', ...]
        self.creq = []              # coreq tree, x. ['and', 'CPSC 213', ...]
        self.excl = ['or']          # exclusions, x. ['or', 'STAT 200', ...]
        self.term = []              # terms offered, x. ['2017S', '2017W']
        self.cred = []              # possible credits, x. [3.0, 6.0]

    # Set course parameters
    def set_params(self, param, value):
        if param == 'name':
            self.name = value
        elif param == 'desc':
            self.desc = value
        elif param == 'prer':
            self.prer = value
        elif param == 'crer':
            self.crer = value
        elif param == 'preq':
            self.preq = get_reqs(value.split())
        elif param == 'creq':
            self.creq = get_reqs(value.split())
        elif param == 'excl':
            self.excl.extend([e.strip() for e in value.split(',')])
        elif param == 'term':
            self.term.extend([t.strip() for t in value[-1].split(',')])
        elif param == 'cred':
            self.cred.extend([float(c.strip()) for c in value.split(',')])
        else:
            print('Error: parameter not recognized.')

    # Get course parameters
    def get_params(self, param=''):
        params = {'code':self.code, 'name':self.name, 'desc':self.desc,
                  'prer':self.prer, 'crer':self.crer,
                  'preq':self.preq, 'creq':self.creq, 'excl':self.excl,
                  'term':self.term, 'cred':self.cred}
        if param in params.keys():
            return params[param]
        else:
            return params


# Turn requisites into list format; all entries must be true to satisfy
def get_reqs(value):
    reqs = []
    course = []
    group = []
    depth = 0
    operator = 'and'
    for term in value:
        if depth < 0:
            print('Error: mismatched parentheses.')

        # Outside of parens, only terms are course names, and, or
        if depth == 0:
            if term.startswith('('):
                depth = term.count('(')
                group.append(term[1:])
            elif term == 'and' or term == 'or':
                operator = term
                if course:
                    reqs.append(' '.join(course))
                    course = []
            else:
                course.append(term)

        # Call get_reqs again on anything inside parens
        else:
            if term.startswith('('):
                depth += term.count('(')
            elif term.endswith(')'):
                depth -= term.count(')')
            if depth == 0:
                group.append(term[:-1])
                reqs.append(get_reqs(group))
                group = []
            else:
                group.append(term)

    # Add final course after last operator
    if course:
        reqs.append(' '.join(course))
    reqs.insert(0, operator)
    return reqs


DUMPHEADER = '\n'.join([
'/* Structure for courses */',
'class Course {',
'  constructor(code, name, desc, prer, crer, preq, creq, excl, term, cred) {',
'    Object.assign(this, {code, name, desc, prer, crer,',
'        preq, creq, excl, term, cred});',
'    this.preqs = [];',
'    this.creqs = [];',
'    this.excls = [];',
'    this.dreqs = [];',
'    this.ddict = {};',
'  }',
'}',
'',
'var all_courses = {',
''])

if __name__ == '__main__':
    # Parse all files in COURSES as Courses
    courses = {}
    for name in os.listdir(COURSES):
        if name.endswith('.txt'):
            with open(COURSES + '/' + name, encoding='utf8') as f:
                for line in f:
                    split = line.split(':')
                    if len(split) > 1:
                        param = split[0].strip()
                        value = ':'.join(split[1:]).strip()
                        if param == 'code':
                            if value in courses.keys():
                                course = courses[value]
                            else:
                                course = Course(value)
                                courses[value] = course
                        else:
                            course.set_params(param, value)

    # Dump courses into file for JavaScript frontend
    with open(DUMP, 'w', encoding='utf8') as f:
        f.write(DUMPHEADER);
        for code, course in courses.items():
            params = courses[code].get_params()
            f.write(repr(params['code']) + ': new Course(')
            f.write(', '.join([repr(params['code']), repr(params['name']),
                               repr(params['desc']), repr(params['prer']),
                               repr(params['crer']), repr(params['preq']),
                               repr(params['creq']), repr(params['excl']),
                               repr(params['term']), repr(params['creq'])]))
            f.write('),\n')
        f.write('};')
