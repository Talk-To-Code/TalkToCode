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
export function get_struct(text_segment, var_list, is_extendable) {

    var text = ""
    var go_ahead = false
    /* For now only assign statements are extendable.
    for now only checks if next text segment contains equal. By right should check if first word of next
    segment contains equal. */
    if (is_extendable) {
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
    console.log("get_struct receiving: " + text)
    text = compress_name(text);
    text = replace_infix_operators(text);

    var starting_command = text.split(" ")[0];

    var struct_command = [[""], [""], [false, false]];

    /* For the following switch case */
    if (var_list.includes(starting_command)) starting_command = "assign";

    switch(starting_command) {
        case "declare":
            var checker = check_declare_statement(text);  
            struct_command = parse_declare_statement(text, checker);
            break;
        case "assign":
            var checker = check_assign_statement(text);
            struct_command = parse_assign_statement(text, checker);
            break;
        case "begin":
                var checker = check_if_statement(text);
                struct_command = parse_if_statement(text, checker);
                break;
        default:
            struct_command = [["Not ready"], [""], [false, false, false]];
            break;
    }

    struct_command[2][2] = go_ahead;

    return struct_command;
}


/* So far it does not check for end declare */
function parse_declare_statement(text, checker) {

    /* variable list to return to caller */
    var var_list = [""]
    var new_line = false;
    var extendable = false;

    if (checker[0] == "Not ready"){
        console.log(checker[1]);
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
        struct_command = struct_command + " #value " + splitted_text[5] + " dec_end;;";
    }

    /* User declaring variable type */
    else {
        struct_command = struct_command + " #variable ";
        var_list.push(splitted_text[2]);
        /* Assigning value to declared int */
        if (splitted_text.includes("equal")) {
            new_line = true;
            struct_command = struct_command + splitted_text[2] + " value " + splitted_text[4] + " dec_end;;";
        }

        /* No value assigned */
        else {
            extendable = true
            struct_command = struct_command + splitted_text[2] + " dec_end;;";
        }
    }
    return [[struct_command], var_list, [new_line, extendable, false]];
}

/* As of now, does not check whether variable is being assigned the correct element.
   Also, it only allows assignment of numbers and variables.
   It does not checks if the variable being assigned has been declared.
   we should also check the variable being used to assign as well.
*/
function parse_assign_statement(text, checker) {
    /* variable list to return to caller */
    var var_list = [""]
    var new_line = true;
    var extendable = false;

    if (checker[0] == "Not ready"){
        console.log(checker[1]);
        return [["Not ready", checker[1]], var_list, [false, false, false]];
    }
    
    var splitted_text = text.split(" ");  
    var struct_command = "#assign #variable " + splitted_text[0] + " #with ";

    /* Check if assigning a number or variable */
    if (!isNaN(splitted_text[2])) struct_command = struct_command + "#value " + splitted_text[2] + ";;";

    else struct_command = struct_command + "#variable " + splitted_text[2] + ";;";

    return [[struct_command], var_list, [new_line, extendable, false]];
}

function parse_if_statement(text, checker) {
    /* variable list to return to caller */
    var var_list = [""]
    var new_line = true;
    var extendable = false;

    if (checker[0] == "Not ready"){
        console.log(checker[1]);
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

    struct_command += " #if_branch_start"
    var struct_command_list = []
    struct_command_list.push(struct_command)
    struct_command_list.push("#if_branch_end;;")

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
function check_declare_statement(text) {
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
function check_assign_statement(text) {
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
function check_if_statement(text) {
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


/* Compress names into camel case. E.g. 'declare integer number of name' -> declare integer numberOfName */
/* Should this really be called at the start of struct function? Maybe called during check function. 
reason being, for if-statements, it makes more sense to call this after finding the infix positions.
As of now it just determines infix positions, and then redo it again in the check function */
function compress_name(text) {
    var splitted_text = text.split(" ");

    if (splitted_text[0] == "declare") {
        /* If length is < 3, name can't be longer than 1 word, assuming first 2 words
        are 'declare <var type>' */
        if (splitted_text.length < 3) return text;

        /* Declaring an array variable */
        if (splitted_text.includes("array") && splitted_text.includes("size")) {

            var size_idx = splitted_text.indexOf("size");
            /* 'array' or 'size' in wrong position. */
            if (splitted_text[2] != "array" || size_idx == 2 || size_idx == splitted_text.length - 1)  {
                return text;
            }

            var var_name_arr = splitted_text.slice(3, size_idx);
            /* Convert to camel case*/
            compressed_name = convert_to_camel_case(var_name_arr);

            /* Replace old uncompressed name and insert compressed name */
            /* Eg. declare integer hello world -> declare integer helloWorld */
            splitted_text.splice(3, var_name_arr.length);
            splitted_text.splice(3, 0, compressed_name);
            return splitted_text.join(' ');
        }

        /* Declaring a variable */
        else {
            /* 'array' should not be part of var name*/
            if (splitted_text.includes("array")) return text;

            var compressed_name = "";
            if (splitted_text.includes("equal")) {
                var equal_idx = splitted_text.indexOf("equal");

                /* 'equal' in wrong position. */
                if (equal_idx == 2 || equal_idx == splitted_text.length - 1) return text;

                var var_name_arr = splitted_text.slice(2, equal_idx);
                /* Convert to camel case*/
                compressed_name = convert_to_camel_case(var_name_arr);
            }
            else {
                var var_name_arr = splitted_text.slice(2);
                /* Convert to camel case*/
                compressed_name = convert_to_camel_case(var_name_arr);
            }
            /* Replace old uncompressed name and insert compressed name */
            /* Eg. declare integer hello world -> declare integer helloWorld */
            splitted_text.splice(2, var_name_arr.length);
            splitted_text.splice(2, 0, compressed_name);
            return splitted_text.join(' ');
        }
    }
    /* If case */
    else if (splitted_text[0] == "begin") {

        /* No name long enough to compress. 5 is the minimum. E.g. "begin if hello world equal..."*/
        if (splitted_text.length < 5) return text;

        var infix_positions = [];  // There can be multiple operators in the condition
        var my_infix_operators = [];
        var i = 2;

        for (i; i < splitted_text.length; i++) {
            if (infix_operators.includes(splitted_text[i])) {
                infix_positions.push(i);
                my_infix_operators.push(splitted_text[i]);
            }
        }
        /* For the last variable to be compressed as well. 
        E.g. 'begin if hello world < bye world'. The positions to compress would be
        2 to 4 and 5 to <splitted_text.length-1>.
        */
        infix_positions.push(splitted_text.length);

        /* There needs to be an infix operator */
        if (infix_positions.length == 1) return text;

        /* Compress names here */
        var compressed_name_list = []
        var i = 0;
        var start_point = 2;  // To be used when slicing and splicing
        for (i; i < infix_positions.length; i++) {

            var_name_arr = splitted_text.slice(start_point, infix_positions[i]);
            /* Convert to camel case*/
            compressed_name = convert_to_camel_case(var_name_arr);
            compressed_name_list.push(compressed_name);
            start_point =  infix_positions[i] + 1;

            if (start_point >= splitted_text.length) break;
        }

        /* Recreate input speech with compressed names */
        /* Requires my_infix_operators and compressed_name_list */
        var new_text = "begin if ";
        var i = 0;

        for (i; i < my_infix_operators.length; i++) {
            new_text += compressed_name_list[i] + " " + my_infix_operators[i] + " "
        }

        if (compressed_name_list.length > my_infix_operators.length) {
            new_text += compressed_name_list[compressed_name_list.length-1]
        }
        return new_text.trim();
    }

    /* assign case */
    else if (!splitted_text.includes("declare") && splitted_text.includes("equal")) {

        /* compress var name before the 'equal' keyword. */
        var equal_idx = splitted_text.indexOf("equal");
        var var_name_arr = splitted_text.slice(0, equal_idx);
        /* Convert to camel case*/
        compressed_name = convert_to_camel_case(var_name_arr);
        /* Replace old uncompressed name and insert compressed name */
        /* Eg. hello world equal 5 -> helloWorld equal 5 */
        splitted_text.splice(0, var_name_arr.length);
        splitted_text.splice(0, 0, compressed_name);
        if (splitted_text[splitted_text.length-1] == "equal") return splitted_text.join(" ");

        /* compress var name after the 'equal' keyword. */
        var equal_idx = splitted_text.indexOf("equal");
        var var_name_arr = splitted_text.slice(equal_idx+1);

        /* Check if assigning a number or variable name */
        if (var_name_arr.length == 1 && isNaN(var_name_arr[0])) return splitted_text.join(" ");

        /* Convert to camel case*/
        compressed_name = convert_to_camel_case(var_name_arr);

        /* Replace old uncompressed name and insert compressed name */
        /* Eg. hello world equal 5 -> helloWorld equal 5 */
        splitted_text.splice(equal_idx+1, var_name_arr.length);
        splitted_text.splice(equal_idx+1, 0, compressed_name);

        return splitted_text.join(" ");
    }

    /* Worse case it does not return any text. */
    return text
}

/* E.g. hello world -> helloWorld */
function convert_to_camel_case(name_arr) {
    var var_name = name_arr[0].toLowerCase();
    var i;
    for (i = 1; i < name_arr.length; i++) {
        /* Change first letter to capital */
        var toAdd = name_arr[i][0].toUpperCase() + name_arr[i].slice(1);
        var_name = var_name + toAdd;
    }
    return var_name;
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

/* If the input speech is meant to be an if block */
function replace_infix_operators(text) {
    if (text.split(' ')[0] == "begin") {
        text = text.replace('greater than', '>');
        text = text.replace('greater than equal', '>=');
        text = text.replace('less than', '<');
        text = text.replace('less than equal', '<=');
        text = text.replace('equal', '==');
        text = text.replace('not equal', '!=');
    }
    return text;
}

if (require.main === module) {
    console.log(get_struct("declare int hello", ["hello"], false));
}