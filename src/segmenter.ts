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

/* Segment functions return list of segmented commands or list of errors (string[]). */

function segment_statements(splitted_text) {
    var segmented = ["assign"];

    if (!splitted_text.includes("equal")) return ["not ready", "'Equal' is missing."];

    var equal_idx = splitted_text.indexOf("equal");
    if (equal_idx == splitted_text.length-1) return ["not ready", "Equal is the last word."];
    segmented.push(splitted_text.slice(0, equal_idx).join(" "));
    segmented.push("equal");
    segmented.push(splitted_text.slice(equal_idx+1).join(" "));

    return segmented;
}

/* splitted_text e.g: ['hello', '<', '5'] */
function segment_if(splitted_text) {
    var segmented = ["if"];

    var infix_positions = [];  // There can be multiple operators in the condition
    var infix_operators = [];
    var i = 0;

    for (i; i < splitted_text.length; i++) {
        if (infix_operator_list.includes(splitted_text[i])) {
            infix_positions.push(i);
            infix_operators.push(splitted_text[i]);
        }
    }

    /* For the last variable to be compressed as well. 
    E.g. 'begin if hello world < bye world'. The positions to compress would be
    2 to 4 and 5 to splitted_text.length.
    */
    infix_positions.push(splitted_text.length);

    /* There needs to be an infix operator */
    if (infix_positions.length == 1) return ["not ready", "No infix operator was used. i.e. >, <=, == etc."];

    /* Check if infix operator is the last word mentioned */
    if (infix_positions[infix_positions.length-2] + 1 == splitted_text.length)
        return ["not ready", "infix operator was the last word mentioned."];
    
    
    var i = 0;
    var start_point = 0;  // To be used when slicing and splicing
    for (i; i < infix_positions.length; i++) {
        segmented.push(splitted_text.slice(start_point, infix_positions[i]).join(" "));
        start_point =  infix_positions[i] + 1;
        if (start_point >= splitted_text.length) break;

        /* Push the infix operator into the segment. */
        segmented.push(splitted_text[infix_positions[i]]);
    }
    return segmented;
}

/* splitted_text e.g: [ 'condition','i','==','0','condition','i','<','number','condition','i','++' ] */
function segment_for_loop(splitted_text) {
    var segmented = ["loop"];

    /* For loop must have 'condition' key word. */
    if (!splitted_text.includes("condition")) return ["not ready", "Condition was not mentioned."];

    /* Split the splitted text array into condition blocks */
    var condition_blocks = []
    var i
    for (i = 0; i < splitted_text.length; i++) {
        if (splitted_text[i] == "condition") condition_blocks.push(["condition"]);
        else condition_blocks[condition_blocks.length-1].push(splitted_text[i])
    }
    /* Check if condition blocks are fine. An example of a good condition_blocks:
    [ [ 'condition', 'i', '==', '0' ],
    [ 'condition', 'i', '<', 'length' ],
    [ 'condition', 'i', 'plus plus' ] ]
    */
    /* Condition_blocks should have 3 sets. */
    if (condition_blocks.length < 3) return ["not ready", "not enough conditions."];
    var wrong_condition = false;
    var infix_positions = [] // Infix positions for first 2 blocks

    /* First 2 condition blocks should have minimum of 4, as seen from above e.g. */
    for (i = 0; i < condition_blocks.length - 1; i++) {
        if (condition_blocks[i].length < 4) {
            wrong_condition = true
            break;
        }
        /* Check if it includes infix */
        var have_infix = false
        var j
        for (j = 0; j < condition_blocks[i].length; j++) {
            if (infix_operator_list.includes(condition_blocks[i][j])) {
                have_infix = true
                infix_positions.push(j)
                /* Infix position cannot be in first 2 positions or last of the block */
                if (j < 2 || j == condition_blocks[i].length-1) {
                    wrong_condition = true;
                    break;
                }
            } 
        }
        if (!have_infix) wrong_condition = true
    }
    if (wrong_condition) return ["not ready", "no infix operator mentioned"];

    segmented.push("condition");
    segmented.push(condition_blocks[0].slice(1, infix_positions[0]).join(" "));
    segmented.push(condition_blocks[0][infix_positions[0]]);
    segmented.push(condition_blocks[0].slice(infix_positions[0]+1, condition_blocks[0].length).join(" "));

    segmented.push("condition");
    segmented.push(condition_blocks[1].slice(1, infix_positions[1]).join(" "));
    segmented.push(condition_blocks[1][infix_positions[1]]);
    segmented.push(condition_blocks[1].slice(infix_positions[1]+1, condition_blocks[1].length).join(" "));

    segmented.push("condition");
    segmented.push(condition_blocks[2].slice(1, condition_blocks[2].length-1).join(" "));
    /* Assume its plus plus */
    segmented.push("++")

    return segmented;

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
    var segmented = ["while"];

    var infix_positions = [];  // There can be multiple operators in the condition
    var infix_operators = [];
    var i = 0;

    for (i; i < splitted_text.length; i++) {
        if (infix_operator_list.includes(splitted_text[i])) {
            infix_positions.push(i);
            infix_operators.push(splitted_text[i]);
        }
    }

    /* For the last variable to be compressed as well. 
    E.g. 'while hello world < bye world'. The positions to compress would be
    2 to 4 and 5 to splitted_text.length.
    */
    infix_positions.push(splitted_text.length);

    /* There needs to be an infix operator */
    if (infix_positions.length == 1) return ["not ready", "No infix operator was used. i.e. >, <=, == etc."];

    /* Check if infix operator is the last word mentioned */
    if (infix_positions[infix_positions.length-2] + 1 == splitted_text.length)
        return ["not ready", "infix operator was the last word mentioned."];
    
    
    var i = 0;
    var start_point = 0;  // To be used when slicing and splicing
    for (i; i < infix_positions.length; i++) {
        segmented.push(splitted_text.slice(start_point, infix_positions[i]).join(" "));
        start_point =  infix_positions[i] + 1;
        if (start_point >= splitted_text.length) break;

        /* Push the infix operator into the segment. */
        segmented.push(splitted_text[infix_positions[i]]);
    }

    console.log("doneee")

    return segmented;
}

console.log(segment_command("declare array hello size 5", [""]));