/* 
 * Contains functions for processing input speech from google.
 * Performs automatic corrections to prepare text for easy parsing to struct commands
*/

// export function correct_words
export function clean(input_speech: string) {
    input_speech = input_speech.toLowerCase();
    input_speech = fix_common_errors(input_speech);
    input_speech = replace_math_operators(input_speech);
    input_speech = correct_variables(input_speech);
    input_speech = word_2_num(input_speech);

    return input_speech;
}

/* Perform basic cleaning for common errors */
function fix_common_errors(text: string) {
    text = text.replace('equals', 'equal');
    text = text.replace('Eko', 'equal');
    text = text.replace('and declare', 'end declare');
    text = text.replace('begin is', 'begin if')
    return text;
}

/* Replace all math operators like '+', '-' and '*' with 'plus', 'minus' and 'multiply'.*/
function replace_math_operators(text: string) {
        text = text.replace('+', 'plus');
        text = text.replace('-', 'minus');
        text = text.replace('*', 'multiply');
        text = text.replace('/', 'divide');
    return text;
}

/* Replace all variables with the short form that will be used in text2struct.*/
function correct_variables(text: string) {
    text = text.replace(/integer/g, "int");
    text = text.replace(/character/g, "int");
    return text;
}

function word_2_num(text: string) {
    text = text.replace('one', '1');
    text = text.replace('two', '2');
    text = text.replace('to', '2');
    text = text.replace('three', '3');
    text = text.replace('tree', '3');
    text = text.replace('four', '4');
    text = text.replace('five', '5');
    text = text.replace('six', '6');
    text = text.replace('seven', '7');
    text = text.replace('eight', '8');
    text = text.replace('nine', '9');
    text = text.replace('ten', '10');

    return text;
}

// if (require.main === module) {
//     console.log(clean("declare integer first equal one and declare"));
// }