var variable_types = ["int", "long", "float", "double", "boolean", "char", "string", "void"];

var infix_operator_list = [">", ">=", "<", "<=", "!=", "=="];

/* */
export function segment_command(text, var_list) {
    var starting_command = determine_user_command(text, var_list);

    if (starting_command[0] == "not ready") return starting_command;

    /* Remove starting command from the text. */
    var splitted_text = starting_command[1].split(" ").splice(1);

    switch(starting_command[0]) {
        case "declare":
            return segment_declare(splitted_text);
        case "begin_if":
            return segment_if(splitted_text);
        case "begin_loop":
            return segment_for_loop(splitted_text);
        case "create_function":
            return segment_function(splitted_text);
        case "assign":
            return segment_assign(splitted_text);
        default:
            return ["not ready", "does not match any command."];
    }
}

/* To determine what command the user is trying say */
function determine_user_command(text, var_list) {

    text = text.replace("begin if", "begin_if");
    text = text.replace("begin loop", "begin_loop");
    text = text.replace("create function", "create_function");

    var splitted_text = text.split(" ");

    if (splitted_text.length == 1) return ["not ready", "one word is not sufficient to do any parsing."];

    var starting_command = splitted_text[0];

    /* super hacky but works for now. in future use varlist and undo the variable camel case and check*/
    if (starting_command != "declare" && starting_command != "begin_if" && starting_command != "begin_loop" &&
    starting_command != "create_function" && splitted_text.includes("equal")) {
        starting_command = "assign";

        return [starting_command, "assign " + splitted_text.join(" ")];
    }

    return [starting_command, splitted_text.join(" ")];
}

/* Segment functions return list of segmented commands or list of errors (string[]). */

function segment_assign(splitted_text) {
    var segmented = ["ready", "assign"];

    if (!splitted_text.includes("equal")) return ["not ready", "'Equal' is missing."];

    var equal_idx = splitted_text.indexOf("equal");
    if (equal_idx == splitted_text.length-1) return ["not ready", "Equal is the last word."];
    segmented.push(splitted_text.slice(0, equal_idx).join(" "));
    segmented.push("equal");
    segmented.push(splitted_text.slice(equal_idx+1).join(" "));

    return segmented;
}

/* splitted_text e.g: ['int', 'first', 'equal', '5'] */
function segment_declare(splitted_text) {
    var segmented = ["ready", "declare"];

    /* Check if var type mentioned. */
    if (!variable_types.includes(splitted_text[0])) return ["not ready", "var type is not mentioned."];

    /* Check if var type is the last word mentioned. */
    if (variable_types.includes(splitted_text[splitted_text.length-1])) 
        return ["not ready", "var type is the last word mentioned."];
    
    /* Simply add the var type as a segment. E.g. segmented -> [ 'ready', 'declare', 'int' ] */
    else segmented.push(splitted_text[0]);

    /* Check for array declaration. */
    if (splitted_text.includes("array")) {
        if (!splitted_text.includes("size")) return ["not ready", "Size was not mentioned."];

        segmented.push("array");

        var size_idx = splitted_text.indexOf("size");
        if (size_idx == splitted_text.length-1) return ["not ready", "Size is the last word."];
        segmented.push(splitted_text.slice(2, size_idx).join(" "));
        segmented.push("size");
        segmented.push(splitted_text.slice(size_idx+1).join(" "));
    }

    /* Non array declaration. */
    else {
        /* Check if Equal is mentioned. */
        if (splitted_text.includes("equal")) {
            var equal_idx = splitted_text.indexOf("equal");
            if (equal_idx == splitted_text.length-1) return ["not ready", "Equal is the last word."];
            segmented.push(splitted_text.slice(1, equal_idx).join(" "));
            segmented.push("equal");
            segmented.push(splitted_text.slice(equal_idx+1).join(" "));
        } 
    
        /* If Equal is not mentioned. Just append everything behind as a segment.
        E.g. "declare int hello world" -> [ 'ready', 'declare', 'int', 'hello world' ] */
        else segmented.push(splitted_text.slice(1).join(" "));
    }

    return segmented;
}

/* splitted_text e.g: ['hello', '<', '5'] */
function segment_if(splitted_text) {

    console.log("if block splitted text " + splitted_text)

    var segmented = ["ready", "if"];

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
    console.log(splitted_text)
    var segmented = ["ready", "loop"];

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
/* splitted_text e.g: ['main', 'with', 'return', 'type', 'int', 'begin'] */
function segment_function(splitted_text) {
    var segmented = ["ready", "create"];

    var with_idx = splitted_text.indexOf("with");
    segmented.push(splitted_text.slice(0, with_idx).join(" "));
    segmented.push(splitted_text[with_idx]); // "with"
    segmented.push(splitted_text[with_idx + 1]); // "return"
    segmented.push(splitted_text[with_idx + 2]); // "type"
    segmented.push(splitted_text[with_idx + 3]); // <variable type>

    segmented.push("begin");

    return segmented;
}

// console.log(segment("create function main main with return type integer begin", [""]));