#!/usr/bin/env python
"""
req v1.0.9
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

# Get the terms a course is offered from the UBC Course Schedule
def get_terms(url):
    html = list(urllib.request.urlopen(url))
    terms = set()
    i = 0
    while i < len(html):
        # Term is always preceded by Lecture, Laboratory, or Waiting List
        if html[i].decode('UTF-8').strip() in ['<td>Lecture</td>',
                                               '<td>Laboratory</td>',
                                               '<td>Waiting List</td>']:
            # Term looks like <td>1</td> or <td>2</td>
            terms.add(html[i+1].decode('UTF-8').strip()[4:5])
        i += 1
    if terms:
        print(terms)

# Get all the terms every course is offered from the UBC Course Schedule
if __name__ == '__main__':
    get_terms('https://courses.students.ubc.ca/cs/main?sessyr=2015&sesscd=W&pname=subjarea&tname=subjareas&req=3&dept=CPSC&course=110')
