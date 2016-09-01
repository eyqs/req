#!/usr/bin/env python
"""
req v1.2.0
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
import bs4
import requests
OUTFILE = 'excls.txt'

if __name__ == '__main__':
    res = requests.get('http://www.calendar.ubc.ca/vancouver/?tree=12,215,410,414')
    try:
        res.raise_for_status()
    except Exception as exc:
        print('There was a problem:', exc)
    else:
        soup = bs4.BeautifulSoup(res.text, 'html.parser')

    with open(OUTFILE, 'w') as f:
        for excls in soup.select('ol li'):
            courses = []
            subject = ''
            for word in excls.contents[0].split(','):
                split = word.split()
                if len(split) > 1:
                    subject = split[0].strip()
                courses.append(' '.join([subject] + split[-1:]))
            for code in courses:
                f.write('\n\ncode: ' + code)
                f.write('\nexcl: ' + ', '.join(courses))
