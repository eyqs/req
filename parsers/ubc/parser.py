from lexer import TokenTypes

class Parser(object):
    def __init__(self, tokens=None):
        if tokens is None:
            tokens = []
        self.tokens = tokens

    def parse(self):
        children = []
        child = []
        for token in self.tokens:
            if token.type != TokenTypes.AND:
                child.append(token)
            else:
                children.append(self.prereqs(child))
                child = []
        children.append(self.prereqs(child))
        if len(children) == 1:
            return children[0]
        return AndNode(children)

    def prereqs(self, tokens):
        if tokens[0].type == TokenTypes.COURSENAME:
            return Course(tokens[0].value)
        elif tokens[0].type == TokenTypes.ALLOF:
            return AndNode(self.course_list(tokens[1:]))
        elif tokens[0].type == TokenTypes.ONEOF:
            return OrNode(self.course_list(tokens[1:]))
        elif tokens[0].type == TokenTypes.EITHERA:
            return self.either_or(tokens)
        else:
            exit(1) # you fucked up!


    def course_list(self, tokens):
        return list(map(lambda token: Course(token.value), tokens))

    def either_or(self, tokens):
        either_a = []
        either_b = []
        for token in tokens[1:]:
            if token.type == TokenTypes.EITHERB:
                either_a = either_b.copy()
                either_b = []
            else:
                either_b.append(token)
        return OrNode([self.prereqs(either_a), self.prereqs(either_b)])

class AST():
    pass

class AndNode(AST):
    def __init__(self, params):
        self.children = params

class OrNode(AST):
    def __init__(self, params):
        self.children = params

class Course(AST):
    def __init__(self, param):
        self.name = param

