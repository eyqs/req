from enum import Enum
import re

class TokenTypes(Enum):
    COURSENAME, EITHERA, EITHERB, COMMENT, ALLOF, ONEOF, AND, COMMA = range(8)

class Token(object):
    def __init__(self, token_type, token_value):
        self.type = token_type
        self.value = token_value
    def __str__(self):
        return "Token(%s, %s)" % (self.type, repr(self.value))
    __repr__ = __str__

coursename_pattern = re.compile(r"^[A-Z]{3,4} \d{3}[A-Z]?")

class Lexer(object):
    def __init__(self, text = ""):
        self.text = text
        self.tokens = []

    def lex(self):
        # tokenizer
        self.tokens = []
        while len(self.text) > 0:
            if self.text[0] == "(":
                # self.tokens.append(Token(TokenTypes.COMMENT, self.text[1:len(self.text) - 1])) let the parser do the job
                self.text = ""
                continue
            self.text = self.text.strip(" ;,.")
            self._check_token("and ", TokenTypes.AND)
            self._check_token("All of ", TokenTypes.ALLOF)
            self._check_token("One of ", TokenTypes.ONEOF)
            self._check_token("Either (a) ", TokenTypes.EITHERA)
            self._check_token("or (b) ", TokenTypes.EITHERB)
            match = coursename_pattern.match(self.text)
            if match:
                self.tokens.append(Token(TokenTypes.COURSENAME, match.group(0)))
                self._advance(match.group(0))
                self._advance(" ")
        return self.tokens

    def _check_token(self, starts_with, token):
        if self.text.startswith(starts_with) | self.text.startswith(starts_with.lower()):
            self._add_token(token)
            self._advance(starts_with)

    def _add_token(self, token_type):
        self.tokens.append(Token(token_type, ""))

    def _advance(self, string):
        self.text = self.text[len(string):]