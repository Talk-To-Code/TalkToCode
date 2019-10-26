/* 
 * Contains functions for processing input speech from google.
 * Performs automatic corrections to prepare text for easy parsing to struct commands
*/

var variable_types = ["integer", "long", "float", "double", "boolean", "character", "string", "void"]

// export function correct_words
export function clean(input_speech) {
    input_speech = fix_common_errors(input_speech);
    input_speech = replace_math_operators(input_speech);

    return input_speech;
}

/* Perform basic cleaning for common errors */
function fix_common_errors(text) {
    text = text.replace('equals', 'equal');
    text = text.replace('and declare', 'end declare');

    return text;
}

/* Replace all math operators like '+', '-' and '*' with 'plus', 'minus' and 'multiply'.*/
function replace_math_operators(text) {
        text = text.replace('+', 'plus');
        text = text.replace('-', 'minus');
        text = text.replace('*', 'multiply');
        text = text.replace('x', 'multiply');
        text = text.replace('/', 'divide');
    return text;
}

/* Automatically indent 'end' statements (e.g. end declare) when necessary. */
// for block statements, this requires the user to manually declare since we don't know if user
// intends to stay within the block.
function concat_end_statements(text) {

    var text_segments = text.split(" ");
    /* For the case where the user says out the whole variable declaration at once. */
    //if (text_segments.length == 5

    return text
}


// if (require.main === module) {
//     console.log(clean("declare integer first equal one and declare"));
// }