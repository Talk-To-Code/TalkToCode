var variable_types = ["int", "long", "float", "double", "boolean", "char", "string", "void"];

var infix_operator_list = [">", ">=", "<", "<=", "!=", "=="];

var parsy = require("./parse_statements.ts");
// import { parse_statement } from './parse_statements'


/* Main function of segmenter.ts is to perform checks on the commands and segment out long var names.
Should look into seperating functionality of block statements and simple statements. */
function segment_command(text, var_list) {
    var starting_command = determine_user_command(text, var_list);

    if (starting_command[0] == "not ready") return starting_command;

    var splitted_text = starting_command[1].split(" ");

    switch(starting_command[0]) {
        case "if":
            return segment_if(splitted_text);
        case "loop":
            return segment_for_loop(splitted_text);
        case "function":
            return segment_function(splitted_text);
        case "while":
            return segment_while(splitted_text);
        default:
            var statements = parsy.parse_statement(text);
            console.log(statements);
            var statementType = statements.split(" ")[0];
            if (statementType != "#create" || statementType != "#assign") return ["no matches."];
            else return [statements];
    }
}

/* To determine what command the user is trying say */
function determine_user_command(text, var_list) {

    text = text.replace("begin if", "if");
    text = text.replace("begin Loop", "loop");
    text = text.replace("create function", "function");

    var splitted_text = text.split(" ");

    if (splitted_text.length == 1) return ["not ready", "one word is not sufficient to do any parsing."];

    var starting_command = splitted_text[0];

    /* Remove starting command from the text. */
    return [starting_command, splitted_text.splice(1).join(" ")];
}

/* splitted_text e.g: ['hello', '<', '5'] */
function segment_if(splitted_text) {
    var parsed_results = "if #condition"

    var infix_exp = parsy.parse_statement(splitted_text.join(" "));

    if (infix_exp.includes("not ready.")) return ["not ready", "incomplete condition."];

    return [parsed_results + " " + infix_exp + " #if_branch_start"];
}

/* [ 'while', 'first hello', '==', 'second' ] 
I used the exact same code as If block. Will be much more different when If block allows for Else if. */
function segment_while(splitted_text) {
    var parsed_results = "while #condition"

    var infix_exp = parsy.parse_statement(splitted_text.join(" "));

    if (infix_exp.includes("not ready.")) return ["not ready", "incomplete condition."];

    return [parsed_results + " " + infix_exp + " #while_start"];
}

/* splitted_text e.g: [ 'condition','i','==','0','condition','i','<','number','condition','i','++' ] */
function segment_for_loop(splitted_text) {
    var parsed_results = "for";
    /* For loop must have 'condition' key word. */
    if (!splitted_text.includes("condition")) return ["not ready", "Condition was not mentioned."];
    /* Split the splitted text array into condition blocks. Omit the first "condition" for the split by 
    "condition" to work. Lastly, trim each string of the condition block.
    E.g. of condition_blocks = [ 'i = 0', 'i < 5', 'i ++' ] */
    var condition_blocks = splitted_text.slice(1).join(" ").split("condition").map(x=>x.trim());
    /* Condition_blocks should have 3 sets. */
    if (condition_blocks.length != 3) return ["not ready", "need to have 3 conditions."];

    var i = 0;
    for (i; i < condition_blocks.length; i++) {
        var statement = parsy.parse_statement(condition_blocks[i]);
        if (statement.includes("not ready")) return ["not ready", "something wrong with for-loop condition."];
        /* Remove terminator. */
        statement = statement.replace(";;", "");
        parsed_results += " #condition " + statement;
    }

    return [parsed_results];

}
/* splitted_text e.g: ['main', 'with', 'return', 'type', 'int', 'begin'] or 
['main', 'with', 'return', 'type', 'int', 'with', 'parameter', 'int', 'length', 
'with', 'parameter', 'int', 'array', 'numbers', 'begin'] */
function segment_function(splitted_text) {

    var parsed_results = "#function_declare";
    var i = 0;

    if (!splitted_text.includes("with")) return ["not ready", "with was not mentioned."];
    if (splitted_text[splitted_text.length-1] != "begin") return ["not ready", "begin is not the last word."];

    /* Remove "begin" from the last with_block element. Not necessary. */
    var text = splitted_text.join(" ").replace("begin", "");

    var with_blocks = text.split("with");
    with_blocks = with_blocks.map(x=>x.trim());

    /* Add function name. */
    if (with_blocks[0].length == 0) return ["not ready", "function name was not mentioned."];
    parsed_results += " " + parsy.convert2Camel(with_blocks[0].split(" "));

    if (with_blocks[1].substring(0, 11) != "return type") return ["not ready", "return type was not mentioned."];
    if (!with_blocks[1].split(" ").some(x=>variable_types.includes(x))) return ["not ready", "variable type was not mentioned."];
    
    /* Add var type. */
    parsed_results += " " +  with_blocks[1].slice(12);

    if (with_blocks.length == 2) return parsed_results += " #function_start";
    
    var i = 2;
    for (i; i < with_blocks.length; i++) {

        var splitted_param = with_blocks[i].split(" ");

        if (splitted_param.length < 3) return ["not ready", "parameter not complete."];
        if (splitted_param[0] != "parameter") return ["not ready", "parameter was not mentioned."];
        if (!variable_types.includes(splitted_param[1])) return ["not ready", "variable type was not mentioned."];

        if (splitted_param[2] == "array") {
            if (splitted_param.length < 4) return ["not ready", "parameter not complete."];
            parsed_results += " #parameter_a #dimension 1 " + splitted_param[1];
            parsed_results += " #array " + splitted_param.slice(3);
        }
        else {
            parsed_results += " #parameter #type " + splitted_param[1]; // Add variable type
            parsed_results += " " + splitted_param.slice(2);
        }
    }
    return parsed_results += " #function_start";
}

console.log(segment_command("create function find maximum with return type int with parameter int array numbers with parameter int length begin", [""]));