#!/usr/bin/env python
import os
import tkinter as tk
import tkinter.ttk as ttk
FOLDER  = 'courses' # relative path to folder with course lists
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
    # Initialize Tkinter main frame
    def __init__(self, parent):
        self.parent = parent
        ttk.Frame.__init__(self, parent)
        self.pack(fill=tk.BOTH, expand=1)
        self.courses = {}
        self.widgets = {}
        self.init_tree()

    # Initialize the course tree
    def init_tree(self):
        # Parse all files in FOLDER as Courses
        for name in os.listdir(FOLDER):
            with open(FOLDER + '/' + name) as f:
                for line in f:
                    split = line.split(':')
                    if len(split) > 1:
                        param = split[0].strip()
                        value = split[1].strip()
                        if param == 'code':
                            course = Course(value)
                            self.courses[value] = course
                        else:
                            course.set_params(param, value)
        # Add prereqs and coreqs as dependencies
        for code, course in self.courses.items():
            for reqlist in ('preqs', 'creqs', 'excl'):
                for dreq in course.get_params(reqlist):
                    try:
                        self.courses[dreq].add_dreq(code)
                    except KeyError:
                        pass
        # Arrange courses in order depending on requirements
        unordered = set(self.courses.keys())
        while unordered:
            for code in list(unordered):
                depth = 0           # Minimum depth is 1
                params = self.courses[code].get_params()
                hasreq = False
                hasdepth = False
                # Course should be one level greater than any prereq
                for preq in params['preqs']:
                    if preq in self.courses.keys():
                        hasreq = True
                        if self.courses[preq].get_params('depth'):
                            hasdepth = True
                            depth = max(depth,
                                self.courses[preq].get_params('depth') + 1)
                # Course should not be on level less than any coreq
                for creq in params['creqs']:
                    if creq in self.courses.keys():
                        hasreq = True
                        if self.courses[creq].get_params('depth'):
                            hasdepth = True
                            depth = max(depth,
                                self.courses[creq].get_params('depth'))
                # Set depth to 1 if no prereq or coreq in current tree
                if not hasreq:
                    self.courses[code].set_depth(1)
                    unordered.remove(code)
                # Continue if no prereq or coreq has a depth yet
                if not hasdepth:
                    continue
                self.courses[code].set_depth(depth)
                unordered.remove(code)
        # Grid courses in rows of MAXNUM depending on depth
        row = 0
        col = 0
        depth = 0
        for code in sorted(self.courses.keys(), key=lambda code:
                           self.courses[code].get_params('depth')):
            if self.courses[code].get_params('depth') > depth:
                section = tk.Label(self)
                section.grid(row=row+1, column=0)
                row += 2
                col = 0
                depth += 1
            label = tk.Button(self, text=code,
                              command=lambda c=code: self.set_done(c))
            label.grid(row=row, column=col)
            self.widgets[code] = label
            self.update_course(code)
            col += 1
            if col >= MAXNUM:
                row += 1
                col = 0

    # Toggle whether the course has been taken or not
    def set_done(self, code):
        if self.courses[code].get_params('needs') == 'done':
            self.courses[code].set_status('none')
        else:
            self.courses[code].set_status('done')
        self.update_course(code)
        for dependency in self.courses[code].get_params('dreqs'):
            if dependency in self.courses.keys():
                self.update_course(dependency)

    # Update status of a course
    def update_course(self, code):
        params = self.courses[code].get_params()
        if params['needs'] != 'done':
            if (len(params['excl']) > 1):
                if self.done_reqs(params['excl']) == 'done':
                    self.courses[code].set_status('excl')
                elif self.done_reqs(params['excl']) == 'outs':
                    self.courses[code].set_status('outs')
            elif self.done_reqs(params['preq']) == 'none':
                self.courses[code].set_status('preq')
            elif self.done_reqs(params['creq']) == 'none':
                self.courses[code].set_status('creq')
            elif (self.done_reqs(params['preq']) == 'done' and
                  self.done_reqs(params['creq']) == 'done'):
                self.courses[code].set_status('none')
            else:
                self.courses[code].set_status('outs')
        colour = COLOURS[self.courses[code].get_params('needs')]
        self.widgets[code].configure(activebackground = colour, bg = colour)

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
            else:
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
            self.term = [t.strip() for t in value.split(',')]
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
