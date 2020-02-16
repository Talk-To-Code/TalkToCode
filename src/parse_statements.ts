/* simpleStatement():
	expression() < TERMINATOR >
	| create_variable()
	| breakStatement()
	| continueStatement()
	| labelStatement()
	| returnStatement()
	| importStatement()

importStatement() : < INCLUDE >< STRING_LITERAL > < TERMINATOR >
labelStatement() : < LABEL >< IDENTIFIER > < TERMINATOR >
returnStatement() : < RETURN >(< PARAMETER > expressionC())*< TERMINATOR >
continueStatement() : < CONTINUE >< IDENTIFIER > < TERMINATOR >
breakStatement() : < BREAK > (< IDENTIFIER >)? < TERMINATOR >
gotoStatement() : < GOTO >< IDENTIFIER > < TERMINATOR >

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

assignment() : < ASSIGNMENT > fragment()(< WITH >| compoundOperators())expression()
postfix_expression() : < POST > < VARIABLE > < IDENTIFIER > incrDecrOperators()
prefix_expression() :
	incrDecrOperators() < VARIABLE > < IDENTIFIER >
	| prefixOperators() fragment()
	| < MINUS >expression()

infix_expression() : term()
term() : fragment()(infixOperators()fragment())*
fragment() :
	< VALUE >value()
	| < VARIABLE >< IDENTIFIER >
	| < FUNCTION > (< IDENTIFIER > | < ACCESS > < IDENTIFIER >(< IDENTIFIER >)+< ACCESS_END >) < LPAREN >(< PARAMETER >expressionC())*< RPAREN >
	| < LPAREN > expression() < RPAREN >
	| < LBRACE > (< ARRAY > (< PARAMETER > expression())* | < DICTIONARY > (< KEY > value() < VALUE > expression())*) < RBRACE >
	| < ARRAY > < IDENTIFIER > ( < INDEX > value() < INDEX_END >)+
	|  < ACCESS > < IDENTIFIER >(< IDENTIFIER >)+< ACCESS_END >
*/

import { simpleStatement } from './struct_command'

var variable_types = ["int", "long", "float", "double", "boolean", "char", "string", "void"];

var infix_comparison_operator = [">", ">=", "<", "<=", "!=", "=="];
var infix_segmenting_operator = ["||", "&&", "&", "|", "or", "and"];
var postfix_prefix_operator = ["++", "--"];

/* E.g. hello world -> helloWorld */
export function convert2Camel(name_arr) {

    if (name_arr.length == 1) return name_arr.join(" ");

    var var_name = name_arr[0].toLowerCase();
    var i;
    for (i = 1; i < name_arr.length; i++) {
        /* Change first letter to capital */
        var toAdd = name_arr[i][0].toUpperCase() + name_arr[i].slice(1);
        var_name = var_name + toAdd;
    }
    return var_name;
}

/* Purpose of this function is to parse any potential statement into the structured command. */
/* Returns class statement. */
export function parse_statement(text) {
    var statementType = determine_type(text);

    switch(statementType) {
        case "declare":
            return parse_declare(text);
        case "assign":
            return parse_assignment(text);
        case "infix":
            return parse_infix(text);
        case "postfix": // For now just postfix man.
            return parse_postfix(text);
        case "return":
            return parse_return(text);
        case "break":
            return parse_break();
        case "continue":
            return parse_continue();
        default:
            var statement = new simpleStatement();
            statement.logError("default case of parse_statements");
            return statement;
    }
}

function determine_type(text) {
    var splitted_text = text.split(" ");
    if (splitted_text[0] == "declare") return "declare";
    else if (splitted_text[0] == "return") return "return";
    else if (splitted_text[0] == "continue") return "continue";
    else if (splitted_text[0] == "break") return "break";
    else if (splitted_text.includes("equal")) return "assign";
    else if (splitted_text.some(x=>infix_comparison_operator.includes(x))) return "infix";
    else if (splitted_text.some(x=>postfix_prefix_operator.includes(x))) return "postfix";
    else return "not ready.";
}

function parse_continue() {
    var statement = new simpleStatement();
    statement.isContinue = true;
    statement.parsedStatement = "continue;;"
    return statement;
}

function parse_break() {
    var statement = new simpleStatement();
    statement.isBreak = true;
    statement.parsedStatement = "break;;"
    return statement;
}

function parse_declare(text) {
    var statement = new simpleStatement();
    statement.isDeclare = true;
    statement.parsedStatement = "#create";

    var splitted_text = text.split(" ");
    /* Check if var type mentioned. */
    if (!variable_types.includes(splitted_text[1])){
        statement.logError("var type is not mentioned.");
        return statement;
    } 
    /* Check if var type is the last word mentioned. */
    if (variable_types.includes(splitted_text[splitted_text.length-1])) {
        statement.logError("var type is the last word mentioned.");
        return statement;
    }
    
    else statement.parsedStatement += " " + splitted_text[1]; // Add var_tpye. 
    /* Check for array declaration. */
    if (splitted_text.includes("array")) {
        if (!splitted_text.includes("size")) {
            statement.logError("Size was not mentioned.");
            return statement;
        }
        if (splitted_text.indexOf("size") == splitted_text.length-1) {
            statement.logError("size is the last word.");
            return statement;
        }
        statement.parsedStatement += " " + parse_array_d(splitted_text.slice(3).join(" "));
        statement.newline = true;
    }
    else {
        /* Check if Equal is mentioned. */
        if (splitted_text.includes("equal")) {
            var equal_idx = splitted_text.indexOf("equal");
            if (equal_idx == splitted_text.length-1) {
                statement.logError("equal was last word mentioned.");
                return statement;
            }
            statement.parsedStatement += " " + parse_fragment(splitted_text.slice(2, equal_idx));
            statement.parsedStatement += " " + parse_fragment(splitted_text.slice(equal_idx + 1));
            statement.newline = true;
        }
        else {
            statement.parsedStatement += " " + parse_fragment(splitted_text.slice(2));
            statement.extendable = true;
        }
    }
    statement.parsedStatement +=  " #dec_end;;";
    return statement;
}

function parse_return(text) {
    var statement = new simpleStatement();
    statement.isReturn = true;
    statement.parsedStatement = "return #paramater";
    var splitted_text = text.split(" ");
    /* Return has an assign statement */
    if (splitted_text.includes("equal")) {
        var assign_statement = parse_assignment(splitted_text.slice(1).join(" "));
        if (assign_statement.hasError) return assign_statement;
        else statement.parsedStatement += " " + assign_statement.parsedStatement; // assign statement alr has its own ";;"
    }
    /* returning a variable or literal */
    else {
        statement.parsedStatement += " " + parse_fragment(splitted_text.slice(1).join(" ")) + ";;";
    }
    statement.newline = true;
    return statement;
}

function parse_assignment(text) {
    var statement = new simpleStatement();
    statement.isAssign = true;
    var splitted_text = text.split(" ");
    var equal_idx = splitted_text.indexOf("equal");

    if (equal_idx == splitted_text.length-1) {
        statement.logError("equal was last word mentioned.");
        return statement;
    }

    statement.parsedStatement = "#assign " + parse_fragment(splitted_text.slice(0, equal_idx)) + " #with " + 
    parse_fragment(splitted_text.slice(equal_idx + 1)) + ";;";
    statement.newline = true;
    return statement;
}

/* splitted_text e.g: ['hello', '<', '5'] or ['hello', '<', '5', '&&', 'g' '==', '5']*/
function parse_infix(text) {
    var statement = new simpleStatement();
    statement.isInfix = true;
    var splitted_text = text.split(" ");
    if (!splitted_text.some(x=>infix_comparison_operator.includes(x))) {
        statement.logError("not ready. infix operator missing.");
        return statement;
    }
    var i = 0;
    var start = 0;
    var end = 0;
    /* <frag_1> <comparison> <frag_2> <segment> <frag_1> <comparison> <frag_2> 
    <comparison> e.g. "==", "<=" etc. 
    <segment>    e.g. "&&", "||" etc.
    <frag>       e.g. "hello". */

    var awaiting_frag1 = false;
    var awaiting_frag2 = false;
    var awaiting_segment = false;
    for (i; i < splitted_text.length; i++) {
        end++;
        if (infix_comparison_operator.includes(splitted_text[i])) {
            if (end - start <= 1 || awaiting_segment) {
                statement.logError("Incomplete");
                return statement;
            }
            awaiting_frag1 = false;
            awaiting_frag2 = true;
            awaiting_segment = true;
            statement.parsedStatement += " " + parse_fragment(splitted_text.slice(start, i)) + " " + splitted_text[i];
            start = i + 1;
        }
        else if (infix_segmenting_operator.includes(splitted_text[i])) {
            if (end - start <= 1) {
                statement.logError("Incomplete");
                return statement;
            }
            awaiting_frag1 = true;
            awaiting_frag2 = false;
            awaiting_segment = false;
            statement.parsedStatement += " " + parse_fragment(splitted_text.slice(start, i)) + " " + splitted_text[i];
            start = i + 1;
            end++;
        }
        /* Last element */
        else if (i == splitted_text.length - 1) {
            awaiting_frag2 = false;
            statement.parsedStatement += " " + parse_fragment(splitted_text.slice(start));
        }
    }
    if (awaiting_frag1 || awaiting_frag2) {
        statement.logError("Incomplete.");
        return statement;
    }
    statement.parsedStatement = statement.parsedStatement.trim();
    return statement;
}

function parse_postfix(test) {
    var statement = new simpleStatement();
    statement.isPostfix = true;
    var splitted_text = test.split(" ");
    statement.parsedStatement = "#variable " + splitted_text[0] + " " + splitted_text[1] + ";;";
    return statement;
}

/* Parse array when doing daclaration.
E.g. array number size 100 -> #array #variable number #indexes #value 100 #index_end #dec_end;;
*/
function parse_array_d(text) {
    var splitted_text = text.split(" ");
    var size_idx = splitted_text.indexOf("size");
    var parsed_results = "#array #variable";
    parsed_results += " " + convert2Camel(splitted_text.slice(0, size_idx));
    parsed_results += " #indexes #value " + splitted_text.slice(size_idx+1).join(" ") + " #indexes_end";
    
    return parsed_results;  
}

export function parse_fragment(splitted_text) {
    if (splitted_text.length == 1) {
        /* Is a number! (Not Not a number) */
        if (!isNaN(splitted_text[0])) return "#value " + splitted_text[0];
        else return "#variable " + splitted_text[0];
    }

    return "#variable " + convert2Camel(splitted_text);
}


// console.log(parse_statement("declare int array hello world size 5"));
// console.log(parse_statement("hello world equal bye bye"));
// console.log(parse_infix("hello < 5 || hello != 5"))