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

var variable_types = ["int", "long", "float", "double", "boolean", "char", "string", "void"];

var infix_comparison_operator = [">", ">=", "<", "<=", "!=", "=="];
var infix_segmenting_operator = ["||", "&&", "&", "|", "or", "and"];

/* E.g. hello world -> helloWorld */
function convert2Camel(name_arr) {

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

module.exports = {
    /* Purpose of this function is to parse any potential statement into the structured command. */
    parse_statement: function(text, isCondition) {
        console.log(text);
        var statementType = determine_type(text);

        switch(statementType) {
            case "declare":
                return parse_declare(text);
            case "assign":
                return parse_assignment(text);
            case "infix":
                return parse_infix(text);
            default:
                return "no match. default case of parse_statements";
        }

    }
}

function determine_type(text) {
    var splitted_text = text.split(" ");
    if (splitted_text[0] == "declare") return "declare";
    else if (splitted_text.includes("equal")) return "assign";
    else if (splitted_text.some(x=>infix_comparison_operator.includes(x))) return "infix";
    else return "no match";
}

/* */
function parse_declare(text) {

    var parsed_results = "#create"
    var splitted_text = text.split(" ");
    /* Check if var type mentioned. */
    if (!variable_types.includes(splitted_text[1])) return "var type is not mentioned.";
    /* Check if var type is the last word mentioned. */
    if (variable_types.includes(splitted_text[splitted_text.length-1])) 
        return "var type is the last word mentioned.";
    
    else parsed_results += " " + splitted_text[1]; // Add var_tpye. 

    /* Check for array declaration. */
    if (splitted_text.includes("array")) {
        if (!splitted_text.includes("size")) return "Size was not mentioned.";
        if (splitted_text.indexOf("size") == splitted_text.length-1) return "Size is the last word.";
        parsed_results += " " + parse_array_d(splitted_text.slice(3).join(" "));
    }
    else {
        /* Check if Equal is mentioned. */
        if (splitted_text.includes("equal")) {
            var equal_idx = splitted_text.indexOf("equal");
            if (equal_idx == splitted_text.length-1) return "Equal is the last word.";
            parsed_results += " " + parse_fragment(splitted_text.slice(2, equal_idx));
            parsed_results += " " + parse_fragment(splitted_text.slice(equal_idx + 1));
        }
        else parsed_results += " " + parse_fragment(splitted_text.slice(2));
    }
    return parsed_results + ";;";
}

function parse_assignment(text) {
    var splitted_text = text.split(" ");
    var equal_idx = splitted_text.indexOf("equal");
    var parsed_results = "#assign " + parse_fragment(splitted_text.slice(0, equal_idx)) + " #with " + 
    parse_fragment(splitted_text.slice(equal_idx + 1));
    return  parsed_results + ";;";

}

/* splitted_text e.g: ['hello', '<', '5'] or ['hello', '<', '5', '&&', 'g' '==', '5']*/
function parse_infix(text) {
    var parsed_results = "";
    var splitted_text = text.split(" ");
    if (!splitted_text.some(x=>infix_comparison_operator.includes(x))) return "incomplete. infix operator missing."
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
            if (end - start <= 1 || awaiting_segment) return "incomplete.";
            awaiting_frag1 = false;
            awaiting_frag2 = true;
            awaiting_segment = true;
            parsed_results += " " + parse_fragment(splitted_text.slice(start, i)) + " " + splitted_text[i];
            start = i + 1;
        }
        else if (infix_segmenting_operator.includes(splitted_text[i])) {
            if (end - start <= 1) return "incomplete.";
            awaiting_frag1 = true;
            awaiting_frag2 = false;
            awaiting_segment = false;
            parsed_results += " " + parse_fragment(splitted_text.slice(start, i)) + " " + splitted_text[i];
            start = i + 1;
            end++;
        }
        /* Last element */
        else if (i == splitted_text.length - 1) {
            awaiting_frag2 = false;
            parsed_results += " " + parse_fragment(splitted_text.slice(start));
        }
    }
    if (awaiting_frag1 || awaiting_frag2) return "incomplete.";
    return parsed_results.trim();
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

function parse_fragment(splitted_text) {

    if (splitted_text.length == 1) {
        /* Is a number! (Not Not a number) */
        if (!isNaN(splitted_text[0])) return "#value " + splitted_text[0];
        else return "#variable " + splitted_text[0];
    }

    return "#variable " + convert2Camel(splitted_text);
}


// console.log(parse_statement("declare int array hello world size 5"));
// console.log(parse_statement("hello world equal bye bye"));
console.log(parse_infix("hello < 5 || hello != 5"))