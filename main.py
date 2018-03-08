import random

from graph import Grapher
from lexer import Lexer
from parser import Parser

input = {
    'CPSC 313': 'Either (a) all of CPSC 213, CPSC 221 or (b) all of CPSC 210, CPSC 213, CPSC 260, EECE 320.',
    'CPSC 319':'CPSC 310.',
    'CPSC 302':'One of CPSC 103, CPSC 110, CPSC 260, EOSC 211, PHYS 210 and one of MATH 101, MATH 103, MATH 105, MATH 121 and one of MATH 152, MATH 221, MATH 223.',
    'CPSC 221':'One of CPSC 210, EECE 210, CPEN 221 and one of CPSC 121, MATH 220.',
    'CPSC 121':'(Principles of Mathematics 12 or Pre-calculus 12.)',
    'CPSC 210':'One of CPSC 110, CPSC 260.',
    'CPSC 303':'One of CPSC 103, CPSC 110, CPSC 260, EOSC 211, PHYS 210 and one of MATH 101, MATH 103, MATH 105, MATH 121 and one of MATH 152, MATH 221, MATH 223.',
    'CPSC 344':'One of CPSC 210, EECE 210, EECE 309, CPEN 221.',
    'CPSC 259':'APSC 160.',
    'CPSC 322':'Either (a) CPSC 221 or (b) all of CPSC 260, EECE 320 and one of CPSC 210, EECE 210, EECE 309.',
    'CPSC 261':'One of EECE 259, CPEN 211 and one of CPSC 260, EECE 210, CPEN 221.',
    'CPSC 301':'(Third-year standing or higher.)',
    'CPSC 312':'One of CPSC 210, EECE 210, EECE 309, CPEN 221.',
    'CPSC 304':'Either (a) CPSC 221 or (b) all of CPSC 260, EECE 320 and one of CPSC 210, EECE 210, EECE 309.',
    'CPSC 340':'One of MATH 152, MATH 221, MATH 223 and one of MATH 200, MATH 217, MATH 226, MATH 253, MATH 263 and one of STAT 200, STAT 203, STAT 241, STAT 251, MATH 302, STAT 302, MATH 318, BIOL 300;  and either (a) CPSC 221 or (b) all of CPSC 260, EECE 320 and one of CPSC 210, EECE 210, EECE 309.',
    'CPSC 311':'CPSC 210.',
    'CPSC 320':'Either (a) CPSC 221 or (b) all of CPSC 260, EECE 320. (In addition to above pre-requisites, at least 3 credits from COMM 291, BIOL 300, MATH or STAT at 200 level or above.)',
    'CPSC 310':'CPSC 210.',
    'CPSC 317':'All of CPSC 213, CPSC 221.',
    'CPSC 213':'All of CPSC 121, CPSC 210.',
    'CPSC 314':'One of MATH 200, MATH 217, MATH 226, MATH 253 and one of MATH 152, MATH 221, MATH 223 and either (a) CPSC 221 or (b) all of CPSC 260, EECE 320.',
    'CPSC 444':'All of CPSC 310, CPSC 344 and one of STAT 200, STAT 241.',
    'CPSC 445':'CPSC 320. (and six credits of BIOL beyond BIOL 111.)',
    'CPSC 420':'CPSC 320.',
    'CPSC 411':'All of CPSC 213, CPSC 221, CPSC 311.',
    'CPSC 421':'Either (a) CPSC 221 or (b) all of CPSC 260, EECE 320. (CPSC 320 is recommended.)',
    'CPSC 449':'CPSC 349.',
    'CPSC 418':'One of CPSC 261, CPSC 313, EECE 476, CPEN 411 and one of CPSC 320, EECE 320.',
    'CPSC 410':'Either (a) CPSC 310 or (b) one of EECE 310, CPEN 321 and one of EECE 315, CPEN 331.',
    'CPSC 406':'One of CPSC 302, CPSC 303, MATH 307.',
    'CPSC 415':'One of CPSC 313, EECE 315, CPEN 331.',
    'CPSC 436D':'(Third-year standing in a Computer Science or Computer Engineering specialization, and permission of the department.)',
    'CPSC 424':'CPSC 320 and one of MATH 152, MATH 221, MATH 223 and one of MATH 200, MATH 217, MATH 226, MATH 253.',
    'CPSC 422':'CPSC 322.',
    'CPSC 416':'One of CPSC 313, EECE 315, CPEN 331 and one of CPSC 317, EECE 358, ELEC 331.',
    'CPSC 404':'CPSC 304 and one of CPSC 213, CPSC 261.',
}

lexer = Lexer()
parser = Parser()
grapher = Grapher()
for course, prerequisites in input.items():
    lexer.text = prerequisites
    tokens = lexer.lex()
    if (tokens):
        parser.tokens = tokens
        tree = parser.parse()
        grapher.plot_graph(course, course, tree)
    grapher.graph.attr('edge', color = str(random.uniform(0, 1)) + " 1.000 0.7")
grapher.render()
