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
import re
import bs4
import requests

CONFIG = req.get_config()["scrapers"]["ubc"]["scripts"]["excluded.py"]
YEAR = req.get_year(CONFIG['year'])
OUTFILE = req.get_year_path(CONFIG["outfile"], YEAR)

req.make_dirs(OUTFILE)


def parse(words):
    courses = set()
    subject = ''
    for word in re.split('(?:,|or)', words):
        split = word.split()
        if len(split) > 1:
            subject = split[0].strip()
        courses.add(' '.join([subject] + split[-1:]))
    return courses


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
            if "following" in excls.contents[0]:
                excluded = parse(excls.contents[0].split('following')[0])
                excluder = parse(excls.contents[0].split('following')[1])
                for code in excluded:
                    f.write('\n\ncode: ' + code)
                    f.write('\nexcl: ' + ', '.join(excluder))
            else:
                courses = parse(excls.contents[0])
                for code in courses:
                    f.write('\n\ncode: ' + code)
                    courses.remove(code)
                    f.write('\nexcl: ' + ', '.join(courses))
                    courses.add(code)
