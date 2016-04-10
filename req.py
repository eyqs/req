#!/usr/bin/env python
DATAFILE = 'cpsc.txt'

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
        params = {'name':self.name, 'cred':self.cred, 'preq':self.preq,
                  'creq':self.creq, 'term':self.term, 'excl':self.excl,
                  'preqs':self.preqs, 'creqs':self.creqs, 'dreqs':self.dreqs}
        if param in params.keys():
            return params[param]
        else:
            return params

    # Add course dependencies
    def add_dreq(self, dreq):
        self.dreqs.add(dreq)


# Parse DATAFILE to create the course graph
def parse():
    courses = {}
    with open(DATAFILE) as f:
        for line in f:
            split = line.split(':')
            if len(split) > 1:
                param = split[0].strip()
                value = split[1].strip()
                if param == 'code':
                    course = Course(value)
                    courses[value] = course
                else:
                    course.set_params(param, value)
    return courses


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


# Generate the course dependency graph
def gen_graph(courses):
    for course in courses.keys():
        for preq in courses[course].preqs:
            try:
                courses[preq].add_dreq(course)
            except KeyError:
                pass
        for creq in courses[course].creqs:
            try:
                courses[creq].add_dreq(course)
            except KeyError:
                pass


if __name__ == '__main__':
    courses = parse()
    gen_graph(courses)
    print(courses['CPSC 110'].get_params())
