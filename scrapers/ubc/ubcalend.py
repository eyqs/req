#!/usr/bin/env python3
"""
req v3.1
Copyright (c) 2016, 2017, 2018 Eugene Y. Q. Shen.

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

import req
import urllib.request

CONFIG = req.get_config()['scrapers']['ubc']['scripts']['ubcalend.py']
YEAR = req.get_year(CONFIG['year'])
LOGFILE = req.get_year_path(CONFIG['logfile'], YEAR)
OUTFOLDER = req.get_year_path(CONFIG['outfolder'], YEAR)

req.make_dirs(LOGFILE)
req.make_dirs(OUTFOLDER)


# Translate a file into a format that req can parse
def translate(url, out):
    html = urllib.request.urlopen(url)
    # Skip all lines before the actual course list
    for byte in html:
        line = byte.decode('UTF-8', 'backslashreplace')
        if line.strip() != '<dl class="double">':
            continue
        break

    # Open the output .txt file and start writing to it
    with open(out, 'w', encoding='utf8') as outfile:
        hascode = False     # The corresponding course code
        for byte in html:
            line = byte.decode('UTF-8', 'backslashreplace')
            if line.strip() == '</dl>': # End of course list
                break

            # Example of split, rest of the code is just chopping this up
            # ['\t', 'dt>', 'a name="121">', '/a>CPSC 121 (4)  ',
            #  'b>Models of Computation', '/b>', '/dt>\n']
            if line.strip().startswith('<dt>'):
                split = line.split('<')
                code = ' '.join(split[3][3:].split()[:2])
                if int(code.split()[1]) >= 500: # Skip grad courses
                    hascode = False
                    continue
                hascode = code

                name = split[4][2:]
                cred = split[3].split('(')[1].split(')')[0]
                if '-' in cred:                 # Put credits into a range
                    if cred.startswith('1.5-'): # Why do these exist. Come on.
                        cred = '1.5, ' + \
                            ', '.join([str(x) for x in range(int(cred[4:]))])
                    else:
                        cred = ', '.join([str(x) for x in range(
                            *map(int, cred.split('-')))])
                elif '/' in cred:
                    cred = ', '.join(cred.split('/'))
                outfile.write('\n\ncode: ' + code)
                outfile.write('\nname: ' + name)
                outfile.write('\ncred: ' + cred)

            # Example of split, rest of the code is just chopping this up
            # ['\t', 'dd>Structures of computation. [3-2-1]', 'br > ',
            #  'em>Prerequisite:', '/em> Principles of Mathematics 12',
            #  'br> ', 'em>Corequisite:', '/em> CPSC 110.', 'br> \n']
            elif hascode and line.strip().startswith('<dd>'):
                split = line.split('<')
                desc = split[1][3:]
                if desc.strip():
                    outfile.write('\ndesc: ' + desc)
                preq = ''
                creq = ''
                for i in range(len(split)):
                    if 'em>Prerequisite:' in split[i]:
                        # Remove leading '/em> ' and trailing periods
                        preq_raw = split[i+1][5:]
                        outfile.write('\nprer: ' + preq_raw)
                        preq = parse_reqs(preq_raw.strip('.'))
                        outfile.write('\npreq: ' + preq)
                    elif 'em>Corequisite:' in split[i]:
                        creq_raw = split[i+1][5:]
                        outfile.write('\ncrer: ' + creq_raw)
                        creq = parse_reqs(creq_raw.strip('.'))
                        outfile.write('\ncreq: ' + creq)
                if ((preq and any(x in preq for x in ['.', '%', ':', ';']))
                    or (creq and any(x in creq for x in ['.', ':', ';']))):
                    with open(LOGFILE, 'a', encoding='utf8') as logfile:
                        logfile.write(hascode + ', ')


# Parse all clauses, which are:
#   - course                'CPSC 110'
#   - clause + ,  + course  'CPSC 213, CPSC 221'
#   - clause + or + course  'CPSC 210, CPSC 260 or EECE 256'
# Return a list of only courses:
# ['CPSC 110'] ['CPSC 213', 'CPSC 221'] ['CPSC 210', 'CPSC 260', 'EECE 256']
def parse_clause(terms):
    parsed = []
    course = [] # The current course code
    for term in terms:
        if term == 'or':# 'or' signals the end of a course code
            if course:  # Join course code into string and reset it
                parsed.append(' '.join(course))
                course = []
        elif term.endswith(','):    # ',' signals end of a code
            course.append(term[:-1])
            parsed.append(' '.join(course))
            course = []
        else:   # Add anything else to the current course code
            course.append(term)
    if course:  # End of input signals the end of a course code
        parsed.append(' '.join(course))
    return parsed


# Parse all phrases, which are:
#   - clause          'APSC 160'
#   - all of + clause 'All of CPSC 260, EECE 320'
#   - one of + clause 'One of CPSC 313, EECE 315, CPEN 331'
# Return a string of courses connected by the appropriate boolean:
# 'APSC 160' '(CPSC 260 and EECE 320)' '(CPSC 313 or EECE 315 or CPEN 331)'
def parse_phrase(terms):
    if len(terms) < 2:  # Single course and cannot access terms[1]
        return ' '.join(parse_clause(terms))
    elif terms[0].lower() == 'one' and terms[1].lower() == 'of':
        return '(' + ' or '.join(parse_clause(terms[2:])) + ')'
    elif terms[0].lower() == 'all' and terms[1].lower() == 'of':
        return '(' + ' and '.join(parse_clause(terms[2:])) + ')'
    elif 'or' in terms:
        return '(' + ' or '.join(parse_clause(terms)) + ')'
    else:   # Single course, no parentheses needed
        return ' '.join(parse_clause(terms))


# Parse the reqs, which are:
#   - phrase
#   - reqs + and + phrase
#   - either (a) + phrase + or (b) + phrase + or (c) + phrase...
# Return a string that can be properly processed by req.
def parse_reqs(reqs):
    terms = reqs.split()
    parsed = []
    either = [] # The current strings in the either expression
    flag = 0    # The starting location of the last unprocessed phrase
    i = 0

    # 'and' only appears at the highest level, to separate phrases
    while i < len(terms):
        if terms[i].lower() == 'and':
            # 'and' signals the end of an either expression
            if either:  # Add last phrase, join them, and reset either
                either.append(parse_phrase(terms[flag:i]))
                parsed.append('(' + ' or '.join(either) + ')')
                either = []
            # Otherwise, 'and' signals the end of a phrase
            else:
                parsed.append(parse_phrase(terms[flag:i]))
            # Last phrase has been processed, next phrase starts after 'and'
            flag = i+1
        # Parentheses around a single character signal
        #   the beginning of a phrase in an either expression
        elif (terms[i].startswith('(') and terms[i].endswith(')') and
              len(terms[i]) == 3):
            # 'or' signals the end of a phrase, but that's before '(a)'
            if terms[i-1].lower() == 'or':  # Therefore -1
                either.append(parse_phrase(terms[flag:i-1]))
            # Last phrase has been processed, next phrase starts after '(a)'
            flag = i+1
        i += 1

    # End of input signals the end of an either expression
    if either:
        either.append(parse_phrase(terms[flag:]))
        parsed.append('(' + ' or '.join(either) + ')')
    # Otherwise, end of input signals the end of a phrase
    else:
        parsed.append(parse_phrase(terms[flag:]))
    # Remove parentheses around single phrases
    if len(parsed) == 1 and parsed[0][0] == '(' and parsed[0][-1] == ')':
        return parsed[0][1:-1]
    return ' and '.join(parsed)


# Translate all webpages into .txt files from the UBC Academic Calendar
if __name__ == '__main__':
    logfile = open(LOGFILE, 'w', encoding='utf8')       # Clear logfile
    logfile.write('Please review the requisites for the following courses:\n')
    logfile.close()
    calendar = urllib.request.urlopen('http://www.calendar.ubc.ca/' +
                                      'vancouver/courses.cfm?page=code')
    for line in calendar:
        # Department looks like <tr class="row-highlight"
        #   onClick="window.open('courses.cfm?page=code&code=AANB','_self');">
        department = line.decode('UTF-8', 'backslashreplace')
        if '<tr class="row-highlight"' in department:
            dept = department.split('=')[4].split("'")[0]
            translate('http://www.calendar.ubc.ca/' +
                      'vancouver/courses.cfm?page=code&code=' + dept,
                      OUTFOLDER + dept.lower() + '.txt')
