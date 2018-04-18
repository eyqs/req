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
import git
import yaml

CONFIG = None
ROOT_PATH = None


def get_config():
    global CONFIG
    if not CONFIG:
        with open(os.path.join(get_root_path(), "config.yaml")) as CONFIGFILE:
            CONFIG = yaml.safe_load(CONFIGFILE)
    return CONFIG


def get_root_path():
    global ROOT_PATH
    if not ROOT_PATH:
        path = os.path.dirname(os.path.realpath(__file__))
        repo = git.Repo(path, search_parent_directories=True)
        ROOT_PATH = repo.git.rev_parse("--show-toplevel")
    return ROOT_PATH


def get_year(default):
    if len(sys.argv) > 1:
        return sys.argv[1]
    else:
        return default


def get_year_path(path, year):
    return os.path.join(get_root_path(), path.replace("$YEAR", str(year)))


def make_dirs(path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
