var variable_types = ["integer", "long", "float", "double", "boolean", "character", "string", "void"];
var struct_ver_variable_types = ["int", "long", "float", "double", "boolean", "char", "string", "void"];

export function get_struct(text, var_list) {

    text = compress_name(text);

    var starting_command = text.split(" ")[0];
    /* Returns ["Not ready"] if current line is not ready to be parsed.
       If current line ready to be parsed, struct_command[0] contains the struct command.
       struct_command[1] contains the new variables added.
    */
    var struct_command = [""];

    switch(starting_command) {
        case "declare":
            var checker = check_declare_statement(text);  
            struct_command = parse_declare_statement(text, checker);
            break;
        default:
            struct_command = ["Not ready"];
            break;
    }
    return struct_command;
}


/* So far it does not check for end declare */
function parse_declare_statement(text, checker) {

    /* variable list to return to caller */
    var var_list = [""]

    if (checker[0] == "Not ready"){
        console.log(checker[1]);
        return [checker[0], var_list];
    } 
    
    var struct_command = "#create "
    var splitted_text = text.split(" ");

    var var_idx = variable_types.indexOf(splitted_text[1]);
    struct_command = struct_command + struct_ver_variable_types[var_idx];

    /* User declaring an array type */
    if (splitted_text[2] == "array") {
        var_list.push(splitted_text[3]);
        struct_command = struct_command + " #array #variable " + splitted_text[3];
        struct_command = struct_command + " #value " + splitted_text[5] + " dec_end;;";
    }

    /* User declaring variable type */
    else {
        struct_command = struct_command + " #variable ";
        var_list.push(splitted_text[2]);
        if (splitted_text.includes("equal")) {
            struct_command = struct_command + splitted_text[2] + " value " + splitted_text[4] + " dec_end;;";
        }
        else struct_command = struct_command + splitted_text[2] + " dec_end;;";
    }
    return [struct_command, var_list];
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
    var notes = []
    var splitted_text = text.split(" ");
    var last_word = splitted_text[splitted_text.length-1];

    /* Check if declare contains variable type (e.g. 'integer', 'float' etc) */
    if (!variable_types.includes(splitted_text[1])) return ["Not ready", "Not valid variable"];
    /* Check if var type is last word spoken */
    else if (last_word == splitted_text[1]) ["Not ready", "var type is last word spoken"];

    /* Check if its an array declaration */
    if (splitted_text.includes("array")) {
        notes.push("array detected");
        /* Check if 'array' is in correct position */
        if (splitted_text[2] != "array") return ["Not ready", "array in wrong position"];
        /* Check if user specified size */
        if (!splitted_text.includes("size")) return ["Not ready", "size not declared"];
        /* 'size' is in correct position */
        else if (splitted_text[4] != "size") return ["Not ready", "size in wrong position"];

        /* Check if 'array' or 'size' is last word. */
        if (last_word == "array" || last_word == "size") return ["Not ready", "array or size is last word spoken"];

        /* Check if size declared is an integer */
        if (check_var_type(splitted_text[5], 'integer')) return ["Not ready", "size of array should be integer"];
    }

    /* Check if assigning a value */
    if (splitted_text.includes("equal")) {
        notes.push("equal detected");
        /* 'equal' is in correct position */
        if (splitted_text[3] != "equal") return ["Not ready", "equal in wrong position"];
        /* If assigning a value, make sure 'equal' is not the last word. */
        if (last_word == "equal") return ["Not ready", "equal is last word spoken"];

        /* Get value you are assigning to variable. Check if value does not match var type declared. */
        var equal_idx = splitted_text.indexOf("equal");
        var value_of_var = splitted_text[equal_idx+1];
        if (check_var_type(splitted_text[1], value_of_var)) return ["Not ready", "wrong variable type declared"];
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


/* Compress names into camel case. E.g. 'declare integer number of name' -> declare integer numberOfName */
function compress_name(text) {

    var statement_type = text.split(" ")[0];

    if (statement_type == "declare") {
        var splitted_text = text.split(" ");
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
function check_var_type(var_type, value) {
    switch(var_type) {
        case 'integer':
            if (isNaN(value)) return true;
            else return false;
            
        default:
            return false;
    }
}

if (require.main === module) {
    get_struct("declare integer", [""]);
}