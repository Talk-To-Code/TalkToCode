var infix_operator_list = [">", ">=", "<", "<=", "!=", "=="];

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


var splitted_text = ["condition", "hello", "world", "==", "0", "condition", "hello", "world", "<", "length", "condition", "i", "++"]

var condition_blocks = [["condition"]]

var i
for (i = 1; i < splitted_text.length; i++) {
    if (splitted_text[i] == "condition") condition_blocks.push(["condition"])
    else condition_blocks[condition_blocks.length-1].push(splitted_text[i])
}

console.log(condition_blocks)

var wrong_condition = false;
var infix_positions = []
/* First 2 condition blocks should have minimum of 4, as seen from above e.g. */
for (i = 0; i < condition_blocks.length - 1; i++) {
    if (condition_blocks[i].length < 4) {
        console.log("too short")
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
    if (!have_infix) {
        console.log("no infix", condition_blocks[i])
        wrong_condition = true
    }
}

console.log("is condition correct? " + !wrong_condition)
console.log(infix_positions)

////////////////////////////////////////////////////////////

var start_point = 1;  // To be used when slicing and splicing

var compressed_name_list = []

for (i = 0; i < condition_blocks.length - 1; i++) {
    
    var var_name_arr = condition_blocks[i].slice(start_point, infix_positions[i]);
    /* Convert to camel case*/
    console.log(var_name_arr)
    var compressed_name = convert_to_camel_case(var_name_arr);
    compressed_name_list.push([compressed_name]);

    var var_name_arr = condition_blocks[i].slice(infix_positions[i] + 1, condition_blocks[i].length);
    var compressed_name = convert_to_camel_case(var_name_arr);
    compressed_name_list[i].push(compressed_name);
}

var var_name_arr = condition_blocks[condition_blocks.length-1].slice(1, condition_blocks[i].length-1);
var compressed_name = convert_to_camel_case(var_name_arr);
compressed_name_list.push([compressed_name]);

console.log(compressed_name_list)

var text = "begin loop condition ";

for (i = 0; i < compressed_name_list.length - 1; i++) {
    text += compressed_name_list[i][0] + " "
    text += condition_blocks[i][infix_positions[i]] + " "
    text += compressed_name_list[i][1] + " condition "
}

text += compressed_name_list[compressed_name_list.length-1][0] + " ++"
console.log(text)