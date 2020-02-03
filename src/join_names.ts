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

export function join_names(splitted_text: string[]) {

    var i = 0;
    for (i; i < splitted_text.length; i++) {

        /* If any segment in splitted_text has more than 1 word, combine it in a camel case form. */
        if (splitted_text[i].split(" ").length > 1) 
            splitted_text[i] = convert_to_camel_case(splitted_text[i].split(" "));     
    }

    return splitted_text;
}