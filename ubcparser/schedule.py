#!/usr/bin/env python
"""
req v1.1.0
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
import urllib.request
OUTFILE = 'terms.txt'
# Adjust these according to which sessions are available
SESSION = {'&sessyr=2015&sesscd=W': '2015W',
           '&sessyr=2016&sesscd=S': '2016S'}

# Get the terms a course is offered
def get_terms(url):
    html = urllib.request.urlopen(url)
    terms = set()
    flag = False
    for line in html:
        # Term looks like <td>1</td> or <td>1-2</td>
        term = line.decode('UTF-8', 'backslashreplace').strip()
        if flag:
            terms.add(term.split('>')[1].split('<')[0])
            flag = False
        # Term is always preceded by one of these activities
        if term in ['<td>Lecture</td>', '<td>Laboratory</td>',
                    '<td>Tutorial</td>', '<td>Waiting List</td>',
                    '<td>Practicum</td>', '<td>Work Placement</td>',
                    '<td>Distance Education</td>']:
            flag = True
    return terms

# Get all the course codes in a department
def get_codes(url):
    html = urllib.request.urlopen(url)
    codes = set()
    for line in html:
        # Course looks like <td><a href="/cs/main?pname=subjarea& \
        #   tname=subjareas&req=3&dept=CPSC&course=110">CPSC 110</a></td>
        course = line.decode('UTF-8', 'backslashreplace')
        if '&course' in course:
            codes.add(course.split('=')[7].split('"')[0])
    return sorted(codes)

# Get all the departments in UBC
def get_depts(url):
    html = urllib.request.urlopen(url)
    depts = set()
    for line in html:
        # Department looks like <a href="/cs/main?pname=subjarea& \
        #   tname=subjareas&req=1&dept=CPSC">CPSC</a>
        department = line.decode('UTF-8', 'backslashreplace')
        if '&dept' in department:
            depts.add(department.split('=')[6].split('"')[0])
    return sorted(depts)

# Get all the terms every course is offered from the UBC Course Schedule
if __name__ == '__main__':
    with open(OUTFILE, 'w') as f:
        for session in SESSION:
            d = get_depts('https://courses.students.ubc.ca/cs/main?' +
                          'pname=subjarea&tname=subjareas&req=0' + session)
            if d:
                for dept in d:
                    c = get_codes('https://courses.students.ubc.ca/cs/main?' +
                                  'pname=subjarea&tname=subjareas&req=1&dept='
                                  + dept + session)
                    if c:
                        for code in c:
                            t = get_terms(
                                'https://courses.students.ubc.ca/cs/main?' +
                                'pname=subjarea&tname=subjareas&req=3&dept='
                                + dept + session + '&course=' + code)
                            if t:
                                f.write(' '.join(['\n\ncode:', dept, code]))
                                f.write('\nterm: ')
                                for term in t:
                                    f.write(SESSION[session] + term + ', ')
