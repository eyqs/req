#!/usr/bin/env python
"""
req v1.1.4
Copyright © 2016 Eugene Y. Q. Shen.

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
import tkinter as tk
import tkinter.ttk as ttk

COURSES = 'courses' # relative path to folder with course lists
TABS    = 'tabs'    # relative path to folder with course tabs
MAXNUM  = 10
COLOURS = {'done':'green yellow', 'none':'white', 'outs':'wheat',
           'creq':'gold', 'preq':'pink', 'excl':'light steel blue'}
# done: already taken
# none: meets all prerequisites and corequisites
# outs: status depends on classes which are outside of the current tree
# creq: meets all prerequisites, does not meet all corequisites
# preq: does not meet all prerequisites
# excl: cannot take for credit given previously taken and current courses



# Tkinter main frame
class Main(ttk.Frame):

    # Initialize everything!
    def __init__(self, parent):
        self.parent = parent
        ttk.Frame.__init__(self, parent)
        self.pack(fill=tk.BOTH)
        self.courses = {}
        self.widgets = {}

        # Read in all course codes in tabs and create them
        notebook = ttk.Notebook(self)
        notebook.bind_all("<<NotebookTabChanged>>", self.update_all)
        notebook.pack(fill=tk.BOTH)
        tabs = {}       # Dictionary of courses to put in each tab
        tabsttk = {}    # Dictionary of ttk Frames for each tab
        tabsall = []    # List of all courses to put in each tab
        for name in os.listdir(TABS):
            if name.endswith('.txt'):
                tab = '.'.join(name.split('.')[:-1])
                frame = ttk.Frame(notebook)
                notebook.add(frame, text=tab)
                tabsttk[tab] = frame
                temp = []
                with open(TABS + '/' + name) as f:
                    for line in f:
                        temp.append(line.strip())
                        tabsall.append(line.strip())
                tabs[tab] = tuple(temp)

        # Parse all files in COURSES as Courses
        for name in os.listdir(COURSES):
            if name.endswith('.txt'):
                with open(COURSES + '/' + name) as f:
                    for line in f:
                        split = line.split(':')
                        if len(split) > 1:
                            param = split[0].strip()
                            value = split[1].strip()
                            if param == 'code':
                                if value in self.courses.keys():
                                    hascourse = True
                                    course = self.courses[value]
                                elif value in tabsall:
                                    course = Course(value)
                                    self.courses[value] = course
                                    self.widgets[value] = []
                                    hascourse = True
                                else:
                                    hascourse = False
                            elif hascourse:
                                course.set_params(param, value)

        # Add course dependencies and other miscellaneous things
        for code, course in self.courses.items():
            for reqlist in ('preqs', 'creqs', 'excl'):
                for dreq in course.get_params(reqlist):
                    try:
                        self.courses[dreq].add_dreq(code)
                    except KeyError:
                        pass

        # Arrange courses in order depending on their depth of prereqs
        # First scan through courses with no preqs and set their depth to 1,
        # then scan through all courses whose preqs all have a non-zero depth
        # of which the maximum is 1, and set their depth to 2, etc. until done
        for tab in tabs.keys():
            depth = 0
            courses = self.courses.copy()
            unordered = set(tabs[tab])
            while unordered:
                depth += 1
                for code in list(unordered):
                    params = courses[code].get_params()
                    hasreq = False  # Has a prereq in the current tree
                    badreq = False  # Has a prereq with zero or current depth
                    for preq in params['preqs']:
                        if preq in tabs[tab]:
                            hasreq = True
                            if courses[preq].get_params('depth') in (0,depth):
                                badreq = True
                    if depth == 1 and not hasreq:
                        courses[code].set_depth(1)
                        unordered.remove(code)
                        continue
                    if badreq:
                        continue
                    courses[code].set_depth(depth)
                    unordered.remove(code)

            # Grid courses in rows of MAXNUM
            frame = tabsttk[tab]
            row = 0
            col = 0
            depth = 0
            # Sort first by depth of course and second by alphanumeric order
            for code in sorted(tabs[tab], key=lambda code:
                               (courses[code].get_params('depth'), code)):
                if courses[code].get_params('depth') > depth:
                    section = tk.Label(frame)
                    section.grid(row=row+1, column=0)
                    row += 2
                    col = 0
                    depth += 1
                label = tk.Button(frame, text=code,
                                  command=lambda c=code: self.set_done(c))
                label.grid(row=row, column=col)
                self.widgets[code].append(label)
                self.update_course(code)
                col += 1
                if col >= MAXNUM:
                    row += 1
                    col = 0


    # Toggle whether the course has been taken and update its dependencies
    def set_done(self, code):
        if self.courses[code].get_params('needs') == 'done':
            self.courses[code].set_status('none')
        else:
            self.courses[code].set_status('done')
        self.update_course(code)
        for dependency in self.courses[code].get_params('dreqs'):
            if dependency in self.courses.keys():
                self.update_course(dependency)


    # Update the status of all courses, when switching between tabs
    def update_all(self, event):
        for code in self.courses.keys():
            self.update_course(code)


    # Update the status of a course
    def update_course(self, code):
        params = self.courses[code].get_params()
        if params['needs'] != 'done':
            # If any excluded course in the current tree is done -> excl
            if ((len(params['excl']) > 1) and
                self.done_reqs(params['excl']) == 'done'):
                if self.done_reqs(params['excl']) == 'done':
                    self.courses[code].set_status('excl')
            # If any prerequisite in the current tree is not done -> preq
            elif self.done_reqs(params['preq']) == 'none':
                self.courses[code].set_status('preq')
            # If any corequisite in the current tree is not done -> creq
            elif self.done_reqs(params['creq']) == 'none':
                self.courses[code].set_status('creq')
            # If all excluded courses are in the current tree and not done,
            #    all prerequisites are in the current tree and done,
            #    all corequisites are in the current tree and done -> none
            elif ((len(params['excl']) <= 1 or
                   self.done_reqs(params['excl']) == 'none') and
                  self.done_reqs(params['preq']) == 'done' and
                  self.done_reqs(params['creq']) == 'done'):
                self.courses[code].set_status('none')
            # Otherwise, some courses are not in the current tree -> outs
            else:
                self.courses[code].set_status('outs')
        colour = COLOURS[self.courses[code].get_params('needs')]
        print(code, colour)
        for tab in self.widgets[code]:
            tab.configure(activebackground = colour, bg = colour)


    # Recursively check whether the requirements are satisfied
    def done_reqs(self, reqs):
        if len(reqs) == 0:
            return 'done'
        done = []
        operator = reqs[0]
        for term in reqs[1:]:
            if isinstance(term, list):
                done.append(self.done_reqs(term))
            else:
                if term in self.courses.keys():
                    if self.courses[term].get_params('needs') == 'done':
                        done.append('done')
                    else:
                        done.append('none')
                else:
                    done.append('outs')
        if operator == 'and':
            if 'none' in done:
                return 'none'
            elif 'outs' in done:
                return 'outs'
            return 'done'
        elif operator == 'or':
            if 'done' in done:
                return 'done'
            elif 'outs' in done:
                return 'outs'
            return 'none'



# Generic class to store course data
class Course():

    # Initialize all variables
    def __init__(self, code):
        self.code = code
        self.name = ''
        self.cred = []
        self.preq = []
        self.creq = []
        self.term = []
        self.excl = []
        self.preqs = set()
        self.creqs = set()
        self.dreqs = set()
        self.needs = 'none'
        self.depth = 0


    # Set course parameters
    def set_params(self, param, value):
        if param == 'name':
            self.name = value
        elif param == 'cred':
            self.cred = [int(c.strip()) for c in value.split(',')]
        elif param == 'preq':
            self.preq = get_reqs(value.split())
            self.preqs = set(flatten(self.preq))
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
            self.creqs = set(flatten(self.creq))
            try:
                self.creqs.remove('and')
            except KeyError:
                pass
            try:
                self.creqs.remove('or')
            except KeyError:
                pass
        elif param == 'term':
            self.term = [t.strip() for t in value[-1].split(',')]
        elif param == 'excl':
            self.excl = ['or'] + [e.strip() for e in value.split(',')]
        else:
            print('Error: parameter not recognized.')


    # Get course parameters
    def get_params(self, param=''):
        params = {'code':self.code, 'name':self.name, 'cred':self.cred,
                  'preq':self.preq, 'creq':self.creq, 'term':self.term,
                  'excl':self.excl, 'preqs':self.preqs, 'creqs':self.creqs,
                  'dreqs':self.dreqs, 'needs':self.needs, 'depth':self.depth}
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


if __name__ == '__main__':
    root = tk.Tk()
    main = Main(root)
    root.mainloop()
