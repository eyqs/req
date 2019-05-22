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
import requests

CONFIG = req.get_config()['scrapers']['ubc']['scripts']['ubcsched.py']
YEAR = CONFIG['year']
SESSION = [{
    'url': f'&campuscd=UBC&sessyr={YEAR}&sesscd=S',
    'id': f'{YEAR}S',
    'year': str(YEAR)
}, {
    'url': f'&campuscd=UBC&sessyr={YEAR}&sesscd=W',
    'id': f'{YEAR}W',
    'year': str(YEAR)
}]


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
    terms = set()
    for row in requests.get(url).text.split('<tr class=section')[1:]:
        # Term looks like <td>1</td> or <td>1-2</td>
        terms.add(row.split('</td>')[3][4:])
    return sorted(terms)


# Get all the course codes in a department
def get_codes(url):
    codes = set()
    for row in requests.get(url).text.split('&amp;course=')[1:]:
        # Course looks like <a href=/cs/courseschedule?pname=subjarea \
        #   &amp;tname=subj-course&amp;dept=CPSC&amp;course=110>CPSC 110</a>
        codes.add(row.split('>')[0])
    return sorted(codes)


# Get all the departments in UBC
def get_depts(url):
    html = requests.get(url).text
    depts = set()
    if 'No courses offered' in html or 'no longer offered' in html:
        return False;
    for row in html.split('&amp;dept=')[1:]:
        # Department looks like <a href=/cs/courseschedule?pname=subjarea \
        #   &amp;tname=subj-department&amp;dept=CPSC>CPSC</a>
        depts.add(row.split('>')[0])
    return sorted(depts)


# Get all the terms every course is offered from the UBC Course Schedule
if __name__ == '__main__':
    for session in SESSION:
        print('Preparing to scrape information from ' + session['id'] + '...')
        with open(req.get_year_path(CONFIG['outfile'], session['year']),
                'a', encoding='utf8') as f:
            d = get_depts('https://courses.students.ubc.ca/'
                    + 'cs/courseschedule?pname=subjarea'
                    + '&tname=subj-all-departments' + session['url'])
            if d:
                for dept in d:
                    print('Scraping ' + dept + ' courses...', end='\r')
                    c = get_codes('https://courses.students.ubc.ca/'
                            + 'cs/courseschedule?pname=subjarea'
                            + '&tname=subj-department&dept='
                            + dept + session['url'])
                    if c:
                        for code in c:
                            t = get_terms('https://courses.students.ubc.ca/'
                                    + 'cs/courseschedule?pname=subjarea'
                                    + f'&tname=subj-course&dept={dept}'
                                    + f'&course={code}{session["url"]}')
                            if t:
                                f.write(' '.join(['\n\ncode:', dept, code]))
                                f.write('\nterm: ')
                                for term in t:
                                    f.write(session['id'] + term + ', ')
                print(session['id'] + ' information successfully scraped.')
            else:
                print(session['id'] + ' information could not be found.')
