#!/usr/bin/env python3
"""
req v3.0
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
import sys
import bs4
import requests
YEAR = '2018'
OUTPATH = '/courses/excls.txt'
if len(sys.argv) == 1:
    OUTFILE = YEAR + OUTPATH
else:
    OUTFILE = sys.argv[1] + OUTPATH

if __name__ == '__main__':
    res = requests.get('http://www.calendar.ubc.ca/' +
                       'vancouver/?tree=12,215,410,414')
    try:
        res.raise_for_status()
    except Exception as exc:
        print('There was a problem:', exc)
    else:
        soup = bs4.BeautifulSoup(res.text, 'html.parser')

    with open(OUTFILE, 'w', encoding='utf8') as f:
        for excls in soup.select('ol li'):
            courses = set()
            subject = ''
            for word in excls.contents[0].split(','):
                split = word.split()
                if len(split) > 1:
                    subject = split[0].strip()
                courses.add(' '.join([subject] + split[-1:]))
            for code in courses:
                f.write('\n\ncode: ' + code)
                courses.remove(code)
                f.write('\nexcl: ' + ', '.join(courses))
                courses.add(code)
