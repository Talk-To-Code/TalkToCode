var infix_operator_list = [">", ">=", "<", "<=", "!=", "=="];

/* E.g. hello world -> helloWorld */
function convert_to_camel_case(name_arr: string[]) {
    var var_name = name_arr[0].toLowerCase();
    var i;
    for (i = 1; i < name_arr.length; i++) {
        /* Change first letter to capital */
        var toAdd = name_arr[i][0].toUpperCase() + name_arr[i].slice(1);
        var_name = var_name + toAdd;
    }
    return var_name;
}

/* Compress names into camel case. E.g. 'declare integer number of name' -> declare integer numberOfName */
/* Should this really be called at the start of struct function? Maybe called during check function. 
reason being, for if-statements, it makes more sense to call this after finding the infix positions.
As of now it just determines infix positions, and then redo it again in the check function */
export function compress_name(text: string) {
    var splitted_text = text.split(" ");
    if (splitted_text.length == 1) return text; // Not ready

    var starting_command = splitted_text[0]

    /* Begin blocks - If, Loop */
    if (starting_command == "begin") {
        /* Check number of words */
        if(splitted_text[1] == "if") starting_command = "if";
        else if (splitted_text[1] == "loop") starting_command = "loop";
        else return text; // Not ready
    }

    switch(starting_command) {
        case "declare":
            return compress_for_declare(splitted_text);
        case "if":
            return compress_for_if(splitted_text);
        case "loop":
            return compress_for_loop(splitted_text);
        default:
            return compress_for_assign(splitted_text);
    }
}

function compress_for_declare(splitted_text: string[]) {
    /* If length is < 3, name can't be longer than 1 word, assuming first 2 words
        are 'declare <var type>' */
        if (splitted_text.length < 3) return splitted_text.join(" ");

        /* Declaring an array variable */
        if (splitted_text.includes("array") && splitted_text.includes("size")) {

            var size_idx = splitted_text.indexOf("size");
            /* 'array' or 'size' in wrong position. */
            if (splitted_text[2] != "array" || size_idx == 2 || size_idx == splitted_text.length - 1)  {
                return splitted_text.join(" ");
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
            if (splitted_text.includes("array")) return splitted_text.join(" ");

            var compressed_name = "";
            if (splitted_text.includes("equal")) {
                var equal_idx = splitted_text.indexOf("equal");
                /* 'equal' in wrong position. */
                if (equal_idx == 2 || equal_idx == splitted_text.length - 1) return splitted_text.join(" ");

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

function compress_for_if(splitted_text: string[]) {

    /* No name long enough to compress. 5 is the minimum. E.g. "begin if hello world <condition>..."*/
    if (splitted_text.length < 5) return splitted_text.join(" ");

    var infix_positions = [];  // There can be multiple operators in the condition
    var infix_operators = [];
    var i = 2;

    for (i; i < splitted_text.length; i++) {
        if (infix_operator_list.includes(splitted_text[i])) {
            infix_positions.push(i);
            infix_operators.push(splitted_text[i]);
        }
    }
    
    /* For the last variable to be compressed as well. 
    E.g. 'begin if hello world < bye world'. The positions to compress would be
    2 to 4 and 5 to <splitted_text.length-1>.
    */
    infix_positions.push(splitted_text.length);

    /* There needs to be an infix operator */
    if (infix_positions.length == 1) return splitted_text.join(" ");
    /* Compress names here */
    var compressed_name_list = []
    var i = 0;
    var start_point = 2;  // To be used when slicing and splicing
    for (i; i < infix_positions.length; i++) {

        var var_name_arr = splitted_text.slice(start_point, infix_positions[i]);
        /* Convert to camel case*/
        var compressed_name = convert_to_camel_case(var_name_arr);
        compressed_name_list.push(compressed_name);
        start_point =  infix_positions[i] + 1;

        if (start_point >= splitted_text.length) break;
    }

    console.log("compressed name list " + compressed_name_list)

    /* Recreate input speech with compressed names */
    /* Requires infix_operators and compressed_name_list */
    var new_text = "begin if ";
    var i = 0;

    for (i; i < infix_operators.length; i++) {
        new_text += compressed_name_list[i] + " " + infix_operators[i] + " "
    }

    if (compressed_name_list.length > infix_operators.length) {
        new_text += compressed_name_list[compressed_name_list.length-1]
    }
    return new_text.trim();
}

function compress_for_assign(splitted_text: string[]) {
    /* assign case */
    if (!splitted_text.includes("declare") && splitted_text.includes("equal")) {

        /* compress var name before the 'equal' keyword. */
        var equal_idx = splitted_text.indexOf("equal");
        var var_name_arr = splitted_text.slice(0, equal_idx);
        /* Convert to camel case*/
        var compressed_name = convert_to_camel_case(var_name_arr);
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
}

function compress_for_loop(splitted_text: string[]) {
    /* No name long enough to compress. 6 is the minimum. E.g. "begin loop condition hello world <infix>.."*/
    if (splitted_text.length < 6) return splitted_text.join(" ");

    /* For loop must have 'condition' key word. */
    if (!splitted_text.includes("condition")) return splitted_text.join(" ");

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
    if (condition_blocks.length < 3) return splitted_text.join(" ");

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
                if (j < 2 || j == condition_blocks[i].length-1) wrong_condition = true
                break;
            } 
        }
        if (!have_infix) wrong_condition = true
    }

    if (wrong_condition) {
        console.log("wrong condition")
        return splitted_text.join(" ");

    }

    var start_point = 1;  // To be used when slicing and splicing

    /* Create list of compressed names. */
    var compressed_name_list = []

    for (i = 0; i < condition_blocks.length - 1; i++) {
        
        var var_name_arr = condition_blocks[i].slice(start_point, infix_positions[i]);
        /* Convert to camel case*/
        var compressed_name = convert_to_camel_case(var_name_arr);
        compressed_name_list.push([compressed_name]);

        var var_name_arr = condition_blocks[i].slice(infix_positions[i] + 1, condition_blocks[i].length);
        var compressed_name = convert_to_camel_case(var_name_arr);
        compressed_name_list[i].push(compressed_name);
    }

    var var_name_arr = condition_blocks[condition_blocks.length-1].slice(1, condition_blocks[i].length-1);
    var compressed_name = convert_to_camel_case(var_name_arr);
    compressed_name_list.push([compressed_name]);

    /* Recreate speech! */
    var text = "begin loop condition ";

    /* Recreate from first 2 condition blocks */
    for (i = 0; i < compressed_name_list.length - 1; i++) {
        text += compressed_name_list[i][0] + " "
        /* Find infix operators through infix positions in the condition block. */
        text += condition_blocks[i][infix_positions[i]] + " "
        text += compressed_name_list[i][1] + " condition "
    }
    /* Assume is ++, for now. */
    text += compressed_name_list[compressed_name_list.length-1][0] + " ++"
    console.log("hi")
    return text;
}






