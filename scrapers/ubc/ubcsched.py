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
import sys
import urllib.request

CONFIG = req.get_config()['scrapers']['ubc']['scripts']['ubcsched.py']
YEAR = CONFIG['year']
SESSION = [{
    'url': f'&sessyr={YEAR}&sesscd=S',
    'id': f'{YEAR}S',
    'year': str(YEAR)
}, {
    'url': f'&sessyr={YEAR}&sesscd=W',
    'id': f'{YEAR}W',
    'year': str(YEAR)
}]

# List of all activity types, taken from search page
ACTIVITY = ['<td>' + activity + '</td>' for activity in
    ['Lecture', 'Laboratory', 'Seminar', 'Tutorial', 'Waiting List',
    'Discussion', 'Directed Studies', 'Thesis', 'Work Placement', 'Practicum',
    'Lecture-Laboratory', 'Studio', 'Web-Oriented Course', 'Exchange Program',
    'Rehearsal', 'Essay/Report', 'Project', 'Workshop', 'Problem Session',
    'Lecture-Seminar', 'Lab-Seminar', 'Flexible Learning', 'Reserved Section',
    'Optional Section', 'Research', 'Field Trip', 'Lecture-Discussion',
    'Distance Education']]


if len(sys.argv) > 1:
    SESSION = []
    for arg in sys.argv[1:]:
        year = arg[:-1]
        season = arg[-1]
        SESSION.append({
            'url': f'&sessyr={year}&sesscd={season}',
            'id': arg,
            'year': year
        })
for session in SESSION:
    req.make_dirs(req.get_year_path(CONFIG['outfile'], session['year']))


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
        if term in ACTIVITY:
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
        if '&course' in course or '&amp;course' in course:
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
        if '&dept' in department or '&amp;dept' in department:
            depts.add(department.split('=')[6].split('"')[0])
        if 'no courses offered for the current session by UBC' in department:
            return False;
    return sorted(depts)


# Get all the terms every course is offered from the UBC Course Schedule
if __name__ == '__main__':
    for session in SESSION:
        print('Preparing to scrape information from ' + session['id'] + '...')
        with open(req.get_year_path(CONFIG['outfile'], session['year']),
                'a', encoding='utf8') as f:
            d = get_depts('https://courses.students.ubc.ca/cs/main?' +
                          'pname=subjarea&tname=subjareas&req=0' +
                          session['url'])
            if d:
                for dept in d:
                    print('Scraping ' + dept + ' courses...', end='\r')
                    c = get_codes('https://courses.students.ubc.ca/cs/main?' +
                                  'pname=subjarea&tname=subjareas&req=1&dept='
                                  + dept + session['url'])
                    if c:
                        for code in c:
                            t = get_terms(
                                'https://courses.students.ubc.ca/cs/main?' +
                                'pname=subjarea&tname=subjareas&req=3&dept='
                                + dept + session['url'] + '&course=' + code)
                            if t:
                                f.write(' '.join(['\n\ncode:', dept, code]))
                                f.write('\nterm: ')
                                for term in t:
                                    f.write(session['id'] + term + ', ')
                print(session['id'] + ' information successfully scraped.')
            else:
                print(session['id'] + ' information could not be found.')
