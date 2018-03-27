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

import req
import re
import json
import collections

CONFIG = req.get_config()['parsers']['ubc']['scripts']['ubcparse.py']
YEAR = req.get_year(CONFIG['year'])
INFOLDER = req.get_year_path(CONFIG['infolder'], YEAR)
EXCLFILE = req.get_year_path(CONFIG['exclfile'], YEAR)
OUTFILE = req.get_path(CONFIG['outfile'])


# Parse a single line from the credit exclusion list
def parse_excls_line(code_list):
    code_set = set()
    subject = ''
    for word in re.split('(?:,|or)', code_list):
        split = word.split()
        if len(split) > 1:
            subject = split[0].strip()
        code_set.add(subject + ''.join(split[-1:]))
    return code_set


# Parse all excluded courses from the credit exclusion list
def parse_excls(courses, f):
    for line in f:
        if 'following' in line:
            excluded = parse_excls_line(line.split('following')[0])
            excluder = parse_excls_line(line.split('following')[1])
            for code in excluded:
                courses[code]['excl_string'] = \
                        CONFIG['exclstr'] + ', '.join(sorted(excluder)) + '.'
        else:
            excl_list = parse_excls_line(line)
            for code in excl_list:
                others = excl_list.copy()
                others.remove(code)
                courses[code]['excl_string'] = \
                        CONFIG['exclstr'] + ', '.join(sorted(others)) + '.'


if __name__ == '__main__':
    courses = collections.defaultdict(lambda: collections.defaultdict(str))
    with open(EXCLFILE, 'r', encoding='utf8') as f:
        parse_excls(courses, f)
    with open(OUTFILE, 'w', encoding='utf8') as f:
        sep = '\n'
        f.write('{')
        for code in sorted(courses.keys()):
            f.write(f'{sep}"{code}": {json.dumps(courses[code])}')
            sep = ',\n'
        f.write('\n}')
