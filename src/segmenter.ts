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
    var segmented = ["create"];
    var with_positions = [];  // There can be multiple 'with' commands.
    var i = 0;
    /* Find all idx of "with" keywords. */
    for (i; i < splitted_text.length; i++) {
        if (splitted_text[i] == "with") with_positions.push(i);
    }

    if (with_positions.length == 0) return ["not ready", "with was not mentioned."];
    if (splitted_text[splitted_text.length-1] != "begin") return ["not ready", "begin is not the last word."];

    /* Get function name. */
    segmented.push(splitted_text.slice(0, with_positions[0]).join(" "));
    segmented.push(splitted_text[with_positions[0]]); // "with"

    var min_dist = 4; // The min number of words btw "with" and endpos.
    /* endpos = pos of "begin" or "with". */
    var endpos = splitted_text.length - 1;
    if (with_positions.length > 1) endpos = with_positions[1];
    /* between with_position and next keyword ("with" or "begin"), 
    should have min of 4 idx pos - "return, type, var_type, begin/with"
    If endpos is lesser than (with_position + min_dist), there is not enough words. */
    if (with_positions[0] + min_dist > endpos)
        return ["not ready", "\"variable type\", \"return\" or \"type\" might be missing."]

    if (splitted_text[with_positions[0]+1] != "return") return ["not ready", "return was not mentioned."];
    if (splitted_text[with_positions[0]+2] != "type") return ["not ready", "type was not mentioned."];
    if (!variable_types.includes(splitted_text[with_positions[0]+3]))
        return ["not ready", "variable type is wrong."]
    
    segmented.push(splitted_text[with_positions[0]+1]); // "return"
    segmented.push(splitted_text[with_positions[0]+2]); // "type"
    segmented.push(splitted_text[with_positions[0]+3]); // variable of return type

    /* Function has parameters. */
    if (with_positions.length > 1) {

        segmented.push(String(with_positions.length-1))
        
        /* Loop through each parameter. */
        var i = 1;
        for (i; i < with_positions.length; i++) {
            /* "with parameter <var type> <var name> <"begin" or "with">" or
            "with parameter <var type> array <var name> <"begin" or "with">".
            */

            /* Assigning endpos with either next with_pos or idx of "begin". */
            if (i != with_positions.length-1) endpos = with_positions[i+1];
            else endpos = splitted_text.length-1;
            min_dist = 4;
            var isArray = false;
            if (splitted_text.slice(with_positions[i], endpos).includes("array")) {
                min_dist = 5;
                isArray = true;
            }
            if (with_positions[i] + min_dist > endpos)
                return ["not ready", "\"variable type\", \"parameter\" or \"variable name\" might be missing."];

            if (splitted_text[with_positions[i] + 1] != "parameter") // Make sure next word is parameter.
                return ["not ready", "parameter was not mentioned or in wrong position."];
            /* Check if a variable type was mentioned. */
            if (!variable_types.includes(splitted_text[with_positions[i] + 2]))
                return ["not ready", "no variable type was mentioned or in wrong position."];

            segmented.push("with");
            var var_type_of_param = splitted_text[with_positions[i] + 2];
            /* Parameter is an array type. */
            if (isArray) {
                if (splitted_text[with_positions[i] + 3] != "array")
                    return ["not ready", "array was not mentioned or in wrong position."];

                segmented.push("#parameter_a");
                segmented.push(var_type_of_param);
                segmented.push(splitted_text.slice(with_positions[i] + 4, endpos).join(" "));
            }

            /* Parameter is none array type. */
            else {
                segmented.push("#parameter");
                segmented.push(var_type_of_param);
                segmented.push(splitted_text.slice(with_positions[i] + 3, endpos).join(" "));
            }
        }
    }
    segmented.push("begin");

    return segmented;
}
/* [ 'while', 'first hello', '==', 'second' ] 
I used the exact same code as If block. Will be much more different when If block allows for Else if. */
function segment_while(splitted_text) {
    var parsed_results = "while #condition"

    var infix_exp = parsy.parse_statement(splitted_text.join(" "));

    if (infix_exp.includes("not ready.")) return ["not ready", "incomplete condition."];

    return [parsed_results + " " + infix_exp + " #while_start"];
}

console.log(segment_command("while first != second", [""]));