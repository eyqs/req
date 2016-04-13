#!/usr/bin/env python
"""
req v1.0.2
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
FOLDER  = 'courses' # relative path to folder with course lists

def translate(name):
    with open(name + '.html') as infile:
        # Skip all lines before the actual course list
        for line in infile:
            if line.strip() != '<dl class="double">':
                continue
            break
        # Open the output .txt file and start writing to it
        outfile = open(name + '.txt', 'w')
        hascode = False
        for line in infile:
            if line.strip() == '</dl>': # End of course list
                break
            # ['\t', 'dt>', 'a name="121">', '/a>CPSC 121 (4)  ',
            #  'b>Models of Computation', '/b>', '/dt>\n']
            if line.strip().startswith('<dt>'):
                hascode = True
                split = line.split('<')
                code = ' '.join(split[3][3:].split()[:2])
                if int(code.split()[1]) >= 500: # Skip grad courses
                    hascode = False
                    continue
                name = split[4][2:]
                cred = split[3].split('(')[1].split(')')[0]
                if '-' in cred:                 # Put credits into a range
                    cred = ', '.join([str(x) for x in range(
                        *map(int, cred.split('-')))])
                elif '/' in cred:
                    cred = ', '.join(cred.split('/'))
                outfile.write('\n\ncode: ' + code)
                outfile.write('\nname: ' + name)
                outfile.write('\ncred: ' + cred)
            # ['\t', 'dd>Structures of computation. [3-2-1]', 'br > ',
            #  'em>Prerequisite:', '/em> Principles of Mathematics 12',
            #  'br> ', 'em>Corequisite:', '/em> CPSC 110.', 'br> \n']
            elif hascode and line.strip().startswith('<dd>'):
                split = line.split('<')
                desc = split[1][3:]
                preq = ''
                creq = ''
                for i in range(len(split)):
                    if 'em>Prerequisite:' in split[i]:
                        preq = split[i+1][5:]
                    elif 'em>Corequisite:' in split[i]:
                        creq = split[i+1][5:]
                outfile.write('\ndesc: ' + desc)
                outfile.write('\npreq: ' + preq)
                outfile.write('\ncreq: ' + creq)

if __name__ == '__main__':
    for filename in os.listdir(FOLDER):
        if filename.endswith('.html'):
            translate(FOLDER + '/' + '.'.join(filename.split('.')[:-1]))
