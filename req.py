#!/usr/bin/env python
"""
req v1.3
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

COURSES = 'ubcparser/2017/courses'      # path to folder with course lists
TABS    = 'ubcparser/2017/tabs'         # path to folder with course tabs
DUMP    = 'req.txt'                     # path to file to dump courses
MAXNUM  = 10
COLOURS = {'done':'green yellow', 'none':'white', 'outs':'wheat',
           'creq':'gold', 'preq':'pink', 'excl':'light steel blue'}
# done: already taken
# none: meets all prerequisites and corequisites
# outs: status depends on classes which are outside of the current tree
# creq: meets all prerequisites, does not meet all corequisites
# preq: does not meet all prerequisites
# excl: cannot take for credit given previously taken and current courses


# Generic class to store course data
class Course():

    # Initialize all variables
    def __init__(self, code):
        self.code = code
        self.name = ''
        self.desc = ''
        self.cred = []
        self.preq = []
        self.creq = []
        self.term = []
        self.excl = ['or']
        self.preqs = set()
        self.creqs = set()
        self.dreqs = set()
        self.needs = 'none'
        self.depth = 0


    # Set course parameters
    def set_params(self, param, value):
        if param == 'name':
            self.name = value
        elif param == 'desc':
            self.desc = value
        elif param == 'cred':
            self.cred.extend([float(c.strip()) for c in value.split(',')])
        elif param == 'preq':
            self.preq = get_reqs(value.split())
            self.preqs.update(flatten(self.preq))
            try:
                self.preqs.remove('and')
            except KeyError:
                pass
            try:
                self.preqs.remove('or')
            except KeyError:
                pass
        elif param == 'creq':
            self.creq = get_reqs(value.split())
            self.creqs.update(flatten(self.creq))
            try:
                self.creqs.remove('and')
            except KeyError:
                pass
            try:
                self.creqs.remove('or')
            except KeyError:
                pass
        elif param == 'term':
            self.term.extend([t.strip() for t in value[-1].split(',')])
        elif param == 'excl':
            self.excl.extend([e.strip() for e in value.split(',')])
        else:
            print('Error: parameter not recognized.')


    # Get course parameters
    def get_params(self, param=''):
        params = {'code':self.code, 'name':self.name, 'desc':self.desc,
                  'cred':self.cred, 'excl':self.excl, 'term':self.term,
                  'preq':self.preq, 'creq':self.creq, 'preqs':self.preqs,
                  'creqs':self.creqs, 'dreqs':self.dreqs,
                  'needs':self.needs, 'depth':self.depth}
        if param in params.keys():
            return params[param]
        else:
            return params


    # Add course dependencies
    def add_dreq(self, dreq):
        self.dreqs.add(dreq)


    # Set current status
    def set_status(self, status):
        self.needs = status


    # Set current depth
    def set_depth(self, depth):
        self.depth = depth



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


# Flatten a list of lists, from http://stackoverflow.com/questions/2158395/
def flatten(lislis):
    for lis in lislis:
        if isinstance(lis, list) and not isinstance(lis, str):
            yield from flatten(lis)
        else:
            yield lis


DUMPHEADER = '\n'.join([
'/* Structure for courses */',
'function Course(code, name, desc, cred, excl, term,',
'                preq, creq, preqs, creqs, dreqs) {',
'    this.code = code;',
'    this.name = name;',
'    this.desc = desc;',
'    this.cred = cred;',
'    this.excl = excl;',
'    this.term = term;',
'    this.preq = preq;',
'    this.creq = creq;',
'    this.preqs = preqs;',
'    this.creqs = creqs;',
'    this.dreqs = dreqs;',
'}',
'',
'var allCourses = {\n'])


courses = {}
tabs = {}       # Dictionary of courses to put in each tab
tabsall = []    # List of all courses to put in each tab
for name in os.listdir(TABS):
    if name.endswith('.txt'):
        temp = []
        with open(TABS + '/' + name) as f:
            for line in f:
                if line.strip():
                    temp.append(line.strip())
                    tabsall.append(line.strip())
        if temp:
            tab = '.'.join(name.split('.')[:-1])
            tabs[tab] = tuple(temp)

# Parse all files in COURSES as Courses
for name in os.listdir(COURSES):
    if name.endswith('.txt'):
        with open(COURSES + '/' + name) as f:
            for line in f:
                split = line.split(':')
                if len(split) > 1:
                    param = split[0].strip()
                    value = ':'.join(split[1:]).strip()
                    if param == 'code':
                        if value in courses.keys():
                            hascourse = True
                            course = courses[value]
                        elif value in tabsall:
                            course = Course(value)
                            courses[value] = course
                            hascourse = True
                        else:
                            hascourse = False
                    elif hascourse:
                        course.set_params(param, value)

# Add course dependencies and other miscellaneous things
for code, course in courses.items():
    for reqlist in ('preqs', 'creqs', 'excl'):
        for dreq in course.get_params(reqlist):
            try:
                courses[dreq].add_dreq(code)
            except KeyError:
                pass

# Dump courses into file for JavaScript frontend
with open(DUMP, 'w') as f:
    f.write(DUMPHEADER);
    for code, course in courses.items():
        params = courses[code].get_params()
        f.write(repr(params['code']) + ': new Course(')
        f.write(', '.join([repr(params['code']), repr(params['name']),
            repr(params['desc']), repr(params['cred']),
            repr(params['excl']), repr(params['term']),
            repr(params['preq']), repr(params['creq'])]))
        for sets in ['preqs', 'creqs', 'dreqs']:
            if len(params[sets]) == 0:
                f.write(', []')
            else:
                f.write(', [' + repr(params[sets])[1:-1] + ']')
        f.write('),\n')
    f.write('};')
