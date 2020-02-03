import { compress_name } from './compress_name'

var variable_types = ["int", "long", "float", "double", "boolean", "char", "string", "void"];

var infix_operators = [">", ">=", "<", "<=", "!=", "=="];


/*     

@ Parameters - list of commands, variable list

list of commands
    list of commands the user has spoken. For e.g. ['declare', 'int', 'hello']

variable list
    list of variable already declared

@ Returns the struct command in the format [list of struct commands, variable list, conditions list]

list of struct commands 
    each element is a line of struct command. 
    For e.g. [#create int #variable first #value 1 #dec_end;;]
    If the struct command contains multiple lines, i.e. is a block statement, then
    the list of struct commands will contain:
    ['if #condition #variable helloWorld > #value 5  #if_branch_start', '#if_branch_end;;' ]

variable list
    list of new variables declared by the user. This is only updated when a declare command is given

conditions list
    next_line: Is true when the command ends and the user can proceed to new line.
    extendable: Is true when the command is already parseable and it can still be extended.
        e.g. "declare int hello" is parseable, but can be extended with "equal 5".
    go_ahead: is true when the struct command confirmed to not be an extension of prev command. 
        This flag will tell the manager to go ahead with next command.
    */
export function get_struct(text_segment: string[], var_list: string[], is_extendable: boolean) {

    var text = ""
    var go_ahead = false
    /* For now only assign statements are extendable.
    for now only checks if next text segment contains equal. By right should check if first word of next
    segment contains equal. */
    if (is_extendable) {
        
        if (text_segment.length < 2) console.log("ERROR. Extendable case, but text segment less than length 2.")

        /* extendable! */
        if (text_segment[1].includes("equal")) text = text_segment.join(" ");
        /* Not extendable :( */
        else {
            go_ahead = true
            text = text_segment[1];
        }
    }
    /* Just a normal case. */
    else text = text_segment.join(" ");

    var struct_command = [[""], [""], [false, false]];

    text = replace_infix_operators(text);
    text = compress_name(text);

    var starting_command = determine_user_command(text, var_list);

    switch(starting_command) {
        case "declare":
            var checker = check_declare_statement(text);  
            struct_command = parse_declare_statement(text, checker);
            break;
        case "assign":
            var checker = check_assign_statement(text);
            struct_command = parse_assign_statement(text, checker);
            break;
        case "if":
            var checker = check_if_statement(text);
            struct_command = parse_if_statement(text, checker);
            break;
        case "loop":
            var checker = check_loop_statement(text);
            struct_command = parse_loop_statement(text, checker);
            break;
        case "create":
            var checker = check_function_statement(text);
            struct_command = parse_function_statement(text, checker);
            break;
        default:
            struct_command = [["Not ready"], [""], [false, false, false]];
            break;
    }

    struct_command[2][2] = go_ahead;

    return struct_command;
}

/* To determine what command the user is trying say */
function determine_user_command(text: string, var_list: string[]) {
    var starting_command = text.split(" ")[0];
    /* For the following switch case */
    if (var_list.includes(starting_command)) starting_command = "assign";
    /* Differentiate If and For loop */
    if (starting_command == "begin") {
        /* Check number of words */
        var splitted_text = text.split(" ");
        if (splitted_text.length == 1) starting_command = "Not ready";
        else {
            if(splitted_text[1] == "if") starting_command = "if";
            else if (splitted_text[1] == "loop" || splitted_text[1] == "Loop") {
                starting_command = "loop";
            }
            else {
                starting_command = "Not ready";
            }
        }
    }
    return starting_command;
}

/* So far it does not check for end declare */
function parse_declare_statement(text: string, checker: string[]) {

    /* variable list to return to caller */
    var var_list = [""]
    var new_line = false;
    var extendable = false;

    if (checker[0] == "Not ready"){
        console.log("Not ready, " + checker[1]);
        return [["Not ready", checker[1]], var_list, [false, false, false]];
    } 
    
    var struct_command = "#create "
    var splitted_text = text.split(" ");

    struct_command = struct_command + splitted_text[1];

    /* User declaring an array type */
    if (splitted_text[2] == "array") {
        var_list.push(splitted_text[3]);
        new_line = true;
        struct_command = struct_command + " #array #variable " + splitted_text[3];
        struct_command = struct_command + " #value " + splitted_text[5] + " #dec_end;;";
    }

    /* User declaring variable type */
    else {
        struct_command = struct_command + " #variable ";
        var_list.push(splitted_text[2]);
        /* Assigning value to declared int */
        if (splitted_text.includes("equal")) {
            new_line = true;
            struct_command = struct_command + splitted_text[2] + " #value " + splitted_text[4] + " #dec_end;;";
        }

        /* No value assigned */
        else {
            extendable = true
            struct_command = struct_command + splitted_text[2] + " #dec_end;;";
        }
    }
    return [[struct_command], var_list, [new_line, extendable, false]];
}

/* As of now, does not check whether variable is being assigned the correct element.
   Also, it only allows assignment of numbers and variables.
   It does not checks if the variable being assigned has been declared.
   we should also check the variable being used to assign as well.
*/
function parse_assign_statement(text: string, checker: string[]) {
    /* variable list to return to caller */
    var var_list = [""]
    var new_line = true;
    var extendable = false;

    if (checker[0] == "Not ready"){
        console.log("Not ready, " + checker[1]);
        return [["Not ready", checker[1]], var_list, [false, false, false]];
    }
    
    var splitted_text = text.split(" ");  
    var struct_command = "#assign #variable " + splitted_text[0] + " #with ";

    /* Check if assigning a number or variable */
    if (!isNaN(splitted_text[2])) struct_command = struct_command + "#value " + splitted_text[2] + ";;";

    else struct_command = struct_command + "#variable " + splitted_text[2] + ";;";

    return [[struct_command], var_list, [new_line, extendable, false]];
}

function parse_if_statement(text: string, checker: string[]) {
    /* variable list to return to caller */
    var var_list = [""]
    var new_line = true;
    var extendable = false;

    if (checker[0] == "Not ready"){
        console.log("Not ready, " + checker[1]);
        return [["Not ready", checker[1]], var_list, [false, false, false]];
    }
    
    var splitted_text = text.split(" ");  
    var struct_command = "if #condition ";

    var i = 2;

    for (i; i < splitted_text.length; i++) {

        if (infix_operators.includes(splitted_text[i])) {
            struct_command += splitted_text[i] + " ";
        }

        else {
            if (!isNaN(splitted_text[i])) {
                struct_command += "#value " + splitted_text[i] + " ";
            }
            else {
                struct_command += "#variable " + splitted_text[i] + " ";
            }
        }
    }

    struct_command += "#if_branch_start"
    var struct_command_list = []
    struct_command_list.push(struct_command)
    struct_command_list.push("#if_branch_end;;")

    return [struct_command_list, var_list, [new_line, extendable, false]];
}

function parse_loop_statement(text: string, checker: string[]) {
    /* variable list to return to caller */
    var var_list = [""]
    var new_line = true;
    var extendable = false;

    if (checker[0] == "Not ready"){
        console.log("Not ready, " + checker[1]);
        return [["Not ready", checker[1]], var_list, [false, false, false]];
    }
    
    var splitted_text = text.split(" ");
    /* First condition block */
    var struct_command = "for #condition #assign #variable ";
    struct_command += splitted_text[3] + " #with #value " + splitted_text[5]

    /* Second condition block */
    struct_command += " #condition #variable " + splitted_text[7] + " " + splitted_text[8] + " #value " + splitted_text[9]

    /* Third condition block */
    struct_command += " #condition #post #variable " + splitted_text[11] + " " + splitted_text[12] + " #for_start"

    var struct_command_list = []
    struct_command_list.push(struct_command)
    struct_command_list.push("#for_end;;")
    return [struct_command_list, var_list, [new_line, extendable, false]];
}

function parse_function_statement(text: string, checker: string[]) {
    /* variable list to return to caller */
    var var_list = [""]
    var new_line = true;
    var extendable = false;

    if (checker[0] == "Not ready") {
        console.log("Not ready, " + checker[1]);
        return [["Not ready", checker[1]], var_list, [false, false, false]];
    }

    var splitted_text = text.split(" ");

    var struct_command = "#function_declare " + splitted_text[2] + " " + splitted_text[6];
    struct_command += " #function_start";

    var struct_command_list = []
    struct_command_list.push(struct_command)
    struct_command_list.push("#function_end;;")

    return [struct_command_list, var_list, [new_line, extendable, false]];
}


/* Helps to check if declare statement is parseable. Returns helpful information. */
/* E.g. statements:
   - declare integer i -> int i;
   - declare integer number elements -> int numberElements;
   - declare integer count equal 5 -> int count = 5;
   - declare float array number size one hundred -> int number[100];

   Returns an array notes or ["Not ready"]
*/
function check_declare_statement(text: string) {
    var notes = ["Ready"]
    var splitted_text = text.split(" ");
    var last_word = splitted_text[splitted_text.length-1];

    /* Check if declare contains variable type (e.g. 'integer', 'float' etc) */
    if (!variable_types.includes(splitted_text[1])) return ["Not ready", "Not valid variable"];
    /* Check if var type is last word spoken */
    else if (last_word == splitted_text[1]) ["Not ready", "var type is last word spoken"];

    /* Check if its an array declaration */
    if (splitted_text.includes("array")) {
        /* Check if 'array' is in correct position */
        if (splitted_text[2] != "array") return ["Not ready", "array in wrong position"];
        /* Check if user specified size */
        if (!splitted_text.includes("size")) return ["Not ready", "size not declared"];
        /* 'size' is in correct position */
        else if (splitted_text[4] != "size") return ["Not ready", "size in wrong position"];
        /* Check if 'array' or 'size' is last word. */
        if (last_word == "array" || last_word == "size") return ["Not ready", "array or size is last word spoken"];
        /* Check if size declared is an integer */
        if (!check_var_type('integer', splitted_text[5])) return ["Not ready", "size of array should be integer"];
    }

    /* Check if assigning a value */
    if (splitted_text.includes("equal")) {
        /* 'equal' is in correct position */
        if (splitted_text[3] != "equal") return ["Not ready", "equal in wrong position"];
        /* If assigning a value, make sure 'equal' is not the last word. */
        if (last_word == "equal") return ["Not ready", "equal is last word spoken"];

        /* Get value you are assigning to variable. Check if value does not match var type declared. */
        var equal_idx = splitted_text.indexOf("equal");
        var value_of_var = splitted_text[equal_idx+1];
        if (check_var_type(value_of_var, splitted_text[1])) return ["Not ready", "wrong variable type declared"];
    } 
    /* No 'equal' detected. Case where it is just a declaration without assignment of value.
     E.g. 'declare integer count' -> int count;
    */
    else {
        var var_name_arr = splitted_text.slice(2);
        /* User has not mentioned var name */
        if (var_name_arr.length == 0) return ["Not ready", "variable name not yet declared"];
    }

    return notes;
}


/* Helps to check if assign statement is parseable. Returns helpful information. */
/* E.g. statements:
   - first equal second -> first = second;
   Returns an array notes or ["Not ready"]
*/
function check_assign_statement(text: string) {
    var notes = ["Ready"]
    var splitted_text = text.split(" ");
    var last_word = splitted_text[splitted_text.length-1];

    if (splitted_text.includes("equal")) {
        if (last_word == "equal") return ["Not ready", "equal is last word spoken"];
    }

    else return ["Not ready", "equal was not mentioned"];

    return notes;
}

/*
as of now, I do not want the 'then' keyword. We already have the skip keyword to go to new line.
checking does not accomodate for array indexing. still thinking of how to do that.
As of now does not allow multiple conditions. Will think of a way soon.
*/
function check_if_statement(text: string) {
    var notes = ["Ready"]

    var splitted_text = text.split(" ");
    var last_word = splitted_text[splitted_text.length-1];

    /* Check if 'if' was spoken. */
    if (splitted_text.includes("if")) {
        if (last_word == "if") return ["Not ready", "if is last word spoken"];
        /* Check position of 'if' */
        if (splitted_text[1] != "if") return ["Not ready", "'if' should be the second word spoken after 'begin'"];
        /* Find infix operators */
        var infix_positions = [];  // There can be multiple operators in the condition
        var i = 2;

        for (i; i < splitted_text.length; i++) {
            if (infix_operators.includes(splitted_text[i])) {
                infix_positions.push(i);
            }
        }

        if (infix_positions.length == 0) return ["Not ready", "There should be infix operators for conditions"];

        if (infix_positions[0] == splitted_text.length-1) return ["Not ready", "infix operator is last word spoken"];

    }
    else return ["Not ready", "'if' was not mentioned"];

    return notes;
}

/* Instead of "for loop", i am going with "begin loop". */
function check_loop_statement(text: string) {
    var notes = ["Ready"]

    var splitted_text = text.split(" ");

    /* For loop must have 'condition' key word. */
    if (!splitted_text.includes("condition")) return ["Not ready", "'condition' was not mentioned"];
    
    /* Remove "begin", "loop" from splitted text */
    splitted_text.splice(0, 2);
    /* Split the splitted text array into condition blocks */
    var condition_blocks = [["condition"]]
    var i
    for (i = 1; i < splitted_text.length; i++) {
        if (splitted_text[i] == "condition") condition_blocks.push(["condition"])
        else condition_blocks[condition_blocks.length-1].push(splitted_text[i])
    }
    /* Check if condition blocks are fine. An example of a good condition_blocks:
    [ [ 'condition', 'i', '==', '0' ],
    [ 'condition', 'i', '<', 'length' ],
    [ 'condition', 'i', 'plus plus' ] ]
    */
    /* Condition_blocks should have 3 sets. */
    if (condition_blocks.length < 3) return ["Not ready", "should have 3 condition blocks for for-loop"];

    /* First 2 condition blocks should have minimum of 4, as seen from above e.g. */
    for (i = 0; i < condition_blocks.length - 1; i++) {
        if (condition_blocks[i].length < 4) {
            return ["Not ready", "Problem with first 2 condition blocks."];
        }
        
        /* Check if it includes infix */
        var have_infix = false
        var j
        for (j = 0; j < condition_blocks[i].length; j++) {
            if (infix_operators.includes(condition_blocks[i][j])) {

                have_infix = true
                /* Infix position cannot be in first 2 positions or last of the block */
                if (j < 2 || j == condition_blocks[i].length-1) {
                    return ["Not ready", "infix operator in wrong position"];
                } 
                break;
            } 
        }
        if (!have_infix) {
            return ["Not ready", "No infix operator detected"];
        } 
    }
    return notes;
}

function check_function_statement(text: string) {
    var notes = ["Ready"]

    var splitted_text = text.split(" ");

    /* Create function must have 'function' key word. */
    if (!splitted_text.includes("function")) return ["Not ready", "'function' was not mentioned"];

    /* Create function must have 'begin' key word. */
    if (!splitted_text.includes("begin")) return ["Not ready", "'begin' was not mentioned"];

    /* Create function must have 'with return type' key words. */
    if (!text.includes("with return type")) 
        return ["Not ready", "'with return type' was not mentioned"];

    /* Element at index 6 must be a variable type. */
    if (splitted_text.length < 7 && !variable_types.includes(splitted_text[6])) 
        return ["Not ready", "No acceptable variable type mentioned."];

    return notes;
}

/* Check if var type given matches value. E.g. Check if "integer" matches 5.*/
/* Returns true if it matches. */
function check_var_type(var_type, value) {
    switch(var_type) {
        case 'integer':
            if (isNaN(value)) {
                console.log("is not a number")
                return false;
            }
            else {
                console.log("is a number")
                return true;
            }
        default:
            return false;
    }
}

/* If the input speech is meant to be an if/loop block */
function replace_infix_operators(text: string) {
    if (text.split(' ')[0] == "begin") {
        text = text.replace(/greater than/g, '>');
        text = text.replace(/greater than equal/g, '>=');
        text = text.replace(/less than/g, '<');
        text = text.replace(/less than equal/g, '<=');
        text = text.replace(/equal/g, '==');
        text = text.replace(/not equal/g, '!=');
        text = text.replace("plus plus", "++");
    }
    return text;
}