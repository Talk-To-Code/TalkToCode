
var variable_types = ["integer", "long", "float", "double", "boolean", "character", "string", "void"];
var struct_ver_variable_types = ["int", "long", "float", "double", "boolean", "char", "string", "void"];

export function get_struct(text) {
    var starting_command = text.split(" ")[0];
    var struct_command = "";

    if (starting_command == "declare") {
        struct_command = parse_declare_statement(text);
    }
    return struct_command;
}


/* So far. It does not check for end declare */
function parse_declare_statement(text) {
    var struct_command = "#create "
    var splitted_text = text.split(" ");
    /* Check if declare contains variable type */
    if (!variable_types.includes(splitted_text[1])) return "Not ready";
    else {
        /* Append token to back of struct_command */
        var var_idx = variable_types.indexOf(splitted_text[1]);
        /* If var type is last word spoken */
        if (var_idx == splitted_text.length - 1) return "Not ready";
        struct_command = struct_command + struct_ver_variable_types[var_idx] + " #variable ";
    }

    if (splitted_text.includes("equal")) {
        /* If assigning a value, make sure equal is not the last word. */
        if (splitted_text[splitted_text.length-1] == "equal") {
            return "Not ready";
        }
        /* Get array of words btw var type and equal */
        var equal_idx = splitted_text.indexOf("equal");
        var var_name_arr = splitted_text.slice(2, equal_idx);
        
        /* Convert to camel case*/
        var name_of_var = convert_to_camel_case(var_name_arr);
        struct_command = struct_command + name_of_var + " ";
        /* Get value you are assigning to variable */
        var value_of_var = splitted_text[equal_idx+1];

        if (check_var_type(splitted_text[1], value_of_var)) return "Not ready"; // Maybe return error?
        struct_command = struct_command + value_of_var + " #dec_end;;";
    } else {
        /* Just declaration. No assigning of values. */
        var var_name_arr = splitted_text.slice(2);
        /* User has not mentioned var name */
        if (var_name_arr.length == 0) return "Not ready";
        /* Convert to camel case*/
        var name_of_var = convert_to_camel_case(var_name_arr);
        struct_command = struct_command + name_of_var + " dec_end;;";
    }
    return struct_command;
}


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

// if (require.main === module) {
//     console.log(get_struct("declare integer"));
// }