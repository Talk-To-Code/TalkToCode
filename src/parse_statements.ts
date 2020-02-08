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

var infix_operator_list = [">", ">=", "<", "<=", "!=", "=="];

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
    parse_statement: function(text) {
        console.log(text);
        var statementType = determine_type(text);

        switch(statementType) {
            case "declare":
                return parse_declare(text);
            case "assign":
                return parse_assignment(text);
            default:
                return ["not ready"];
        }

    }
}

function determine_type(text) {
    var splitted_text = text.split(" ");
    if (splitted_text[0] == "declare") return "declare";
    else return "assign";
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