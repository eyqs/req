#!/usr/bin/env python
"""
req v1.1.9
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
import os
INFOLDER  = 'courses'
OUTFOLDER = 'tabs'
TERMSFILE = 'terms.txt'

if __name__ == '__main__':
    terms = set()
    with open(TERMSFILE, 'r') as termsfile:
        for line in termsfile:
            if line.strip().startswith('code'):
                terms.add(line.split(':')[1].strip())
    for name in os.listdir(INFOLDER):
        with open(INFOLDER + '/' + name, 'r') as infile:
            with open(OUTFOLDER + '/' + name, 'w') as outfile:
                for line in infile:
                    if line.strip().startswith('code'):
                        course = line.split(':')[1].strip()
                        if course in terms:
                            outfile.write('\n' + course)
