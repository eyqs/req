#!/usr/bin/env python
DATAFILE = 'cpsc.txt'

# Generic class to store course data
class Course():
    def __init__(self, code):
        self.code = code
        self.name = ''
        self.cred = []
        self.preq = []
        self.creq = []
        self.term = []
        self.excl = []

    # Set course parameters
    def set_params(self, param, value):
        if param == 'name':
            self.name = value
        elif param == 'cred':
            self.cred = [int(c.strip()) for c in value.split(',')]
        elif param == 'preq':
            self.preq = self.get_reqs(value)
        elif param == 'creq':
            self.creq = self.get_reqs(value)
        elif param == 'term':
            self.term = [t.strip() for t in value.split(',')]
        elif param == 'excl':
            self.excl = [e.strip() for e in value.split(',')]
        else:
            print('Error: parameter not recognized.')

    # Get course parameters
    def get_params(self, param=''):
        params = {'name':self.name, 'cred':self.cred, 'preq':self.preq,
                  'creq':self.creq, 'term':self.term, 'excl':self.excl}
        if param in params.keys():
            return params[param]
        else:
            return params

    # Turn requisites into list format; all entries must be true to satisfy
    def get_reqs(self, value):
        pass


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


if __name__ == '__main__':
    courses = parse()
    print(courses['CPSC 110'].get_params())
