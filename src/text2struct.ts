import { segment_command } from './segmenter'
import { join_names } from './join_names'

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
    console.log("text going in: " + text)
    var segmented = segment_command(text, var_list);

    console.log("segmented results: " + segmented)

    if (segmented[0] == "not ready") return [["Not ready"], [""], [false, false, false]];

    var splitted_text = join_names(segmented.slice(2));
    var starting_command = segmented[1];

    switch(starting_command) {
        case "declare":
            struct_command = parse_declare_statement(splitted_text);
            break;
        case "assign":
            struct_command = parse_assign_statement(splitted_text);
            break;
        case "if":
            struct_command = parse_if_statement(splitted_text);
            break;
        case "loop":
            struct_command = parse_loop_statement(splitted_text);
            break;
        case "create":
            struct_command = parse_function_statement(splitted_text);
            break;
        case "while":
            struct_command = parse_while_statement(splitted_text);
            break;
        default:
            struct_command = [["Not ready"], [""], [false, false, false]];
            break;
    }

    struct_command[2][2] = go_ahead;

    return struct_command;
}

/* So far it does not check for end declare */
function parse_declare_statement(splitted_text: string[]) {

    /* variable list to return to caller */
    var var_list = [""]
    var new_line = false;
    var extendable = false;
    
    var struct_command = "#create "

    struct_command = struct_command + splitted_text[0];

    /* User declaring an array type */
    if (splitted_text[1] == "array") {
        var_list.push(splitted_text[2]);
        new_line = true;
        struct_command = struct_command + " #array #variable " + splitted_text[2];
        struct_command = struct_command + " #value " + splitted_text[4] + " #dec_end;;";
    }

    /* User declaring variable type */
    else {
        struct_command = struct_command + " #variable ";
        var_list.push(splitted_text[1]);
        /* Assigning value to declared int */
        if (splitted_text.includes("equal")) {
            new_line = true;
            struct_command = struct_command + splitted_text[1] + " #value " + splitted_text[3] + " #dec_end;;";
        }

        /* No value assigned */
        else {
            extendable = true
            struct_command = struct_command + splitted_text[1] + " #dec_end;;";
        }
    }
    return [[struct_command], var_list, [new_line, extendable, false]];
}

/* As of now, does not check whether variable is being assigned the correct element.
   Also, it only allows assignment of numbers and variables.
   It does not checks if the variable being assigned has been declared.
   we should also check the variable being used to assign as well.
*/
function parse_assign_statement(splitted_text: string[]) {
    /* variable list to return to caller */
    var var_list = [""]
    var new_line = true;
    var extendable = false;
     
    var struct_command = "#assign #variable " + splitted_text[0] + " #with ";

    /* Check if assigning a number or variable */
    if (!isNaN(splitted_text[2])) struct_command = struct_command + "#value " + splitted_text[2] + ";;";

    else struct_command = struct_command + "#variable " + splitted_text[2] + ";;";

    return [[struct_command], var_list, [new_line, extendable, false]];
}

function parse_if_statement(splitted_text: string[]) {
    /* variable list to return to caller */
    var var_list = [""]
    var new_line = true;
    var extendable = false;
 
    var struct_command = "if #condition ";

    var i = 0;

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

function parse_while_statement(splitted_text: string[]) {
    /* variable list to return to caller */
    var var_list = [""]
    var new_line = true;
    var extendable = false;
 
    var struct_command = "while #condition ";

    var i = 0;

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

    struct_command += "#while_start"
    var struct_command_list = []
    struct_command_list.push(struct_command)
    struct_command_list.push("#while_end;;")

    return [struct_command_list, var_list, [new_line, extendable, false]];
}

function parse_loop_statement(splitted_text: string[]) {
    /* variable list to return to caller */
    var var_list = [""]
    var new_line = true;
    var extendable = false;

    /* First condition block */
    var struct_command = "for #condition #assign #variable ";
    struct_command += splitted_text[1] + " #with #value " + splitted_text[3]

    /* Second condition block */
    struct_command += " #condition #variable " + splitted_text[5] + " " + splitted_text[6] + " #value " + splitted_text[7]

    /* Third condition block */
    struct_command += " #condition #post #variable " + splitted_text[9] + " " + splitted_text[10] + " #for_start"

    var struct_command_list = []
    struct_command_list.push(struct_command)
    struct_command_list.push("#for_end;;")
    return [struct_command_list, var_list, [new_line, extendable, false]];
}

function parse_function_statement(splitted_text: string[]) {
    /* variable list to return to caller */
    var var_list = [""]
    var new_line = true;
    var extendable = false;

    var function_name = splitted_text[0];
    var return_type = splitted_text[4];

    var struct_command = "#function_declare " + function_name + " " + return_type;

    /* splitted_text[5] is either "begin" or number of parameters present. */
    if (splitted_text[5] != "begin") {
        var i = 0;
        var start_pos = 6;
        for (i; i < parseInt(splitted_text[5]); i++) {
            if (splitted_text[start_pos+1] == "#parameter") {
                struct_command += " " + splitted_text[start_pos+1] + " " + splitted_text[start_pos+2] +
                " " + splitted_text[start_pos+3];
            }
            else {
                struct_command += " " + splitted_text[start_pos+1] + " #dimension 1 " + 
                splitted_text[start_pos+2] + " #array " + splitted_text[start_pos+3];
            }
            start_pos += 4;
            
        }
    }

    struct_command += " #function_start";

    var struct_command_list = []
    struct_command_list.push(struct_command)
    struct_command_list.push("#function_end;;")

    return [struct_command_list, var_list, [new_line, extendable, false]];
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
    if (text.includes("begin") || text.includes("while")) {
        text = text.replace(/greater than/g, '>');
        text = text.replace(/greater than equal/g, '>=');
        text = text.replace(/less than/g, '<');
        text = text.replace(/less than equal/g, '<=');
        text = text.replace(/not equal/g, '!=');
        text = text.replace(/equal/g, '==');
        text = text.replace("plus plus", "++");
    }
    return text;
}