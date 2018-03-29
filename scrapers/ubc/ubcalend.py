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
import bs4
import requests

CONFIG = req.get_config()['scrapers']['ubc']['scripts']['ubcalend.py']
YEAR = req.get_year(CONFIG['year'])
LOGFILE = req.get_year_path(CONFIG['logfile'], YEAR)
OUTFOLDER = req.get_year_path(CONFIG['outfolder'], YEAR)


# Translate all webpages into .txt files from the UBC Academic Calendar
if __name__ == '__main__':
    with open(LOGFILE, 'w', encoding='utf8') as f:      # Clear logfile
        f.write('Please review the requisites for the following courses:\n')
    print('Scraping course directory...', end='\r')
    source = requests.get(CONFIG['starturl'])
    try:
        source.raise_for_status()
    except Exception as exc:
        print(exc)
        print('Scrape aborted.')
        exit(1)

    soup = bs4.BeautifulSoup(source.text, 'html.parser')
    for row in soup('tr', 'row-highlight'):
        url = row.find('td').find('a')['href']
        dept = url.split('=')[-1]
