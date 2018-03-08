import random
import json

from graph import Grapher
from lexer import Lexer
from parser import Parser

with open("req.json", "r") as JSON:
    courses = json.load(JSON)

lexer = Lexer()
parser = Parser()
grapher = Grapher()
for course, params in courses.items():
    if course.startswith("CPSC"):
        lexer.text = params["prer"]
        lexer.text = (lexer.text
            .replace("Principles of Mathematics 12", "MATH 012")
            .replace("Pre-calculus 12", "MATH 013")
            .replace("Third-year standing or higher", "YEAR 003")
            .replace("at least third-year standing", "YEAR 003")
            .replace("Third-year standing in a Computer Science or Computer Engineering specialization, and permission of the department", "YEAR 003")
            .replace("In addition to above pre-requisites, at least 3 credits from COMM 291, BIOL 300, MATH or STAT at 200 level or above", "ARGH 320")
            .replace("CPSC 320 is recommended", "")
            .replace("3 credits of Computer Science", "CPSC 003")
            .replace("six credits of BIOL beyond BIOL 111", "BIOL 006"))
        tokens = lexer.lex()
        if (tokens):
            parser.tokens = tokens
            tree = parser.parse()
            grapher.plot_graph(course, course, tree)
        grapher.graph.attr('edge', color = str(random.uniform(0, 1)) + " 1.000 0.7")
grapher.render()
