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
import os
import sys
YEAR = '2018'
INPATH = '/courses/terms.txt'
OUTPATH = '/codes/'
if len(sys.argv) == 1:
    INFILE = YEAR + INPATH
    OUTFOLDER = YEAR + OUTPATH
else:
    INFILE = sys.argv[1] + INPATH
    OUTFOLDER = sys.argv[1] + OUTPATH

if __name__ == '__main__':
    codes = set()
    outfile = None
    current_dept = None
    with open(INFILE, 'r', encoding='utf8') as infile:
        for line in infile:
            if line.strip().startswith('code'):
                dept, course = line.split(':')[1].strip().split(' ')
                if int(course[0]) > 4:
                    continue
                if dept != current_dept:
                    current_dept = dept
                    if outfile:
                        outfile.close()
                    outfile = open(OUTFOLDER + dept.lower() + '.txt',
                                   'a', encoding='utf8')
                outfile.write(dept + ' ' + course + ',\n')
