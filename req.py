#!/usr/bin/env python
import os
import tkinter as tk
import tkinter.ttk as ttk
FOLDER  = 'courses'
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
            for preq in course.get_params('preqs'):
                try:
                    self.courses[preq].add_dreq(code)
                except KeyError:
                    pass
            for creq in course.get_params('creqs'):
                try:
                    self.courses[creq].add_dreq(code)
                except KeyError:
                    pass
        # Grid courses as buttons in a spiral
        size = 0    # Size of spiral
        dire = 0    # 0 = top to bottom, 1 = top to bottom
        line = 0    # Location in the spiral
        for code, course in self.courses.items():
            if line > size:
                if dire == 0:
                    dire = 1
                    line = 0
                elif dire == 1:
                    dire = 0
                    line = 0
                    size += 1
            if dire == 0:
                x = size
                y = line
            elif dire == 1:
                x = line
                y = size + 1
            label = tk.Button(self, text=code,
                              command=lambda c=code: self.set_done(c))
            label.grid(row=x, column=y)
            self.widgets[code] = label
            self.update_course(code)
            line += 1

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
            self.courses[code].set_status('none')
            if ('more...' in params['preqs'] or 'more...' in params['creqs']
                or 'more...' in params['excl']):
                self.courses[code].set_status('outs')
            elif self.done_reqs(params['preq']) == False:
                self.courses[code].set_status('preq')
            elif self.done_reqs(params['creq']) == False:
                self.courses[code].set_status('creq')
            else:
                for excl in params['excl']:
                    try:
                        if self.courses[excl].get_params('needs') == 'done':
                            self.courses[code].set_status('excl')
                            break
                    except:
                        self.courses[code].set_status('outs')
        colour = COLOURS[self.courses[code].get_params('needs')]
        self.widgets[code].configure(activebackground = colour, bg = colour)

    # Recursively check whether the requirements are satisfied
    def done_reqs(self, reqs):
        if len(reqs) == 0:
            return True
        done = []
        operator = reqs[0]
        for term in reqs[1:]:
            if isinstance(term, list):
                done.append(self.done_reqs(term))
            else:
                if term in self.courses.keys():
                    if self.courses[term].get_params('needs') == 'done':
                        done.append(True)
                else:
                    done.append(False)
        if operator == 'and':
            return all(done)
        elif operator == 'or':
            return any(done)



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
            self.excl = [e.strip() for e in value.split(',')]
        else:
            print('Error: parameter not recognized.')

    # Get course parameters
    def get_params(self, param=''):
        params = {'code':self.code, 'name':self.name, 'cred':self.cred,
                  'preq':self.preq, 'creq':self.creq, 'term':self.term,
                  'excl':self.excl, 'preqs':self.preqs, 'creqs':self.creqs,
                  'dreqs':self.dreqs, 'needs':self.needs}
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
