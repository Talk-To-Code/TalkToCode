
/* Purpose of this function is to parse any potential statement into the structured command. */

/* simpleStatement():
	expression() < TERMINATOR >
	| create_variable()
	| breakStatement()
	| continueStatement()
	| labelStatement()
	| returnStatement()
	| importStatement()

importStatement() :
	< INCLUDE >< STRING_LITERAL > < TERMINATOR >

labelStatement() :
	< LABEL >< IDENTIFIER > < TERMINATOR >

returnStatement() :
	< RETURN >(< PARAMETER > expressionC())*< TERMINATOR >

continueStatement() :
	< CONTINUE >< IDENTIFIER > < TERMINATOR >

breakStatement() :
	< BREAK > (< IDENTIFIER >)? < TERMINATOR >

gotoStatement() :
	< GOTO >< IDENTIFIER > < TERMINATOR >

create_variable() :
	< CREATE >(catchModifier())*(types_C())?
	((<VARIABLE><IDENTIFIER>(expression())?<DECLARE_END>)
	|(<ARRAY><VARIABLE><IDENTIFIER>(<INDEX>value()<INDEX_END>)+<DECLARE_END>))+
    < TERMINATOR >

expression():
	prefix_expression()
	| infix_expression()
	| postfix_expression()
	| assignment()

assignment() :
	< ASSIGNMENT > fragment()(< WITH >| compoundOperators())expression()

postfix_expression() :
	< POST > < VARIABLE > < IDENTIFIER > incrDecrOperators()

prefix_expression() :
	incrDecrOperators() < VARIABLE > < IDENTIFIER >
	| prefixOperators() fragment()
	| < MINUS >expression()

infix_expression() :
	term()

term() :
	fragment()(infixOperators()fragment())*

fragment() :
	< VALUE >value()
	| < VARIABLE >< IDENTIFIER >
	| < FUNCTION > (< IDENTIFIER > | < ACCESS > < IDENTIFIER >(< IDENTIFIER >)+< ACCESS_END >) < LPAREN >(< PARAMETER >expressionC())*< RPAREN >
	| < LPAREN > expression() < RPAREN >
	| < LBRACE > (< ARRAY > (< PARAMETER > expression())* | < DICTIONARY > (< KEY > value() < VALUE > expression())*) < RBRACE >
	| < ARRAY > < IDENTIFIER > ( < INDEX > value() < INDEX_END >)+
	|  < ACCESS > < IDENTIFIER >(< IDENTIFIER >)+< ACCESS_END >
*/
function parse_statement() {

}