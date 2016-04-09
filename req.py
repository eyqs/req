#!/usr/bin/env python
DATAFILE = 'cpsc.txt'

# Parse DATAFILE to find the courses
def parse():
    courses = {}
    with open(DATAFILE) as f:
        for line in f:
            split = line.split(':')
            param = split[0].strip()
            if param == 'code':
                curr = {'name':'', 'cred':'', 'preq':'',
                        'creq':'', 'term':'', 'excl':''}
                courses[split[1].strip()] = curr
            elif len(split) > 1:
                value = split[1].strip()
                if param == 'name':
                    curr[param] = value
                elif param == 'cred':
                    curr[param] = [int(c) for c in value.split(',')]
                elif param == 'preq' or param == 'creq':
                    pass
                elif param == 'term' or param == 'excl':
                    curr[param] = [t.strip() for t in value.split(',')]
    return courses

if __name__ == '__main__':
    # Parse the course list
    courses = parse()
    print(courses['CPSC 110'])
