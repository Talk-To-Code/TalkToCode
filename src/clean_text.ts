/* 
 * Contains functions for processing input speech from google.
 * Performs automatic corrections to prepare text for easy parsing to struct commands
*/

// export function correct_words
export function clean(input_speech: string, spelling: boolean, string: boolean) {
    input_speech = input_speech.toLowerCase();
    input_speech = spellOutArithmeticOperator(input_speech);
    input_speech = fix_common_errors(input_speech);
    if (!string) input_speech = correct_variables(input_speech);
    if (spelling) input_speech = spellingFunction(input_speech);
    return input_speech;
}

/* Perform basic cleaning for common errors */
function fix_common_errors(text: string) {
    text = text.replace('maine', 'main');
    text = text.replace(/equals/g, 'equal');
    text = text.replace('eko', 'equal');
    text = text.replace('creates', 'create');
    text = text.replace('and declare', 'end declare');
    text = text.replace('and function', 'end function');
    text = text.replace('and string', 'end string');
    text = text.replace('begin is', 'begin if');
    text = text.replace('begin look', 'begin loop');
    
    return text;
}

function spellOutArithmeticOperator(text: string) {
    text = text.replace(/\+/g, "plus");
    text = text.replace(/-/g, "minus");
    text = text.replace(/\*/g, "multiply");
    text = text.replace(/\//g, "divide");
    text = text.replace(/bit and/g, "bit_and");
    text = text.replace(/bit or/g, "bit_or");
    return text;
}

/* Replace all variables with the short form that will be used in text2struct. If integer is 
part of a string, do not correct it. */
function correct_variables(text: string) {
    if (text.includes("integer") || text.includes("character")) {
        var splitted_text = text.split(" ");
        for (var i = 0; i < splitted_text.length; i++) {
            if (splitted_text[i] == "integer") splitted_text[i] = "int";
            else if (splitted_text[i] == "character") splitted_text[i] = "char";
        }
        text = splitted_text.join(" ");
    }
    return text;
}

function spellingFunction(text: string) {

    text = text.replace("and spell", "end_spell");
    text = text.replace("n spell", "end_spell");
    text = text.replace("end spell", "end_spell");

    var splitted_text = text.split(" ");

    var startPoint = 0;
    var newText = "";

    if (splitted_text.includes("spell")) {
        startPoint = splitted_text.indexOf("spell") + 1;
        newText = "spell";
    }

    /* make sure spell is not last word */
    if (startPoint == splitted_text.length) return text;
    
    var stopSpelling = false;
    for (var i = startPoint; i < splitted_text.length; i++) {

        if (splitted_text[i] == "end_spell") {
            stopSpelling = true;
            newText += " end_spell";
            continue;
        }

        else if (!stopSpelling) {
            if (splitted_text[i].length > 1) {
                if (splitted_text[i] == "zach" || splitted_text[i] == "zack") splitted_text[i] = "z";
                else if (splitted_text[i] == "the") splitted_text[i] = "d";
                else if (splitted_text[i] == "bee") splitted_text[i] = "b";
                else if (splitted_text[i] == "pee") splitted_text[i] = "p";
                else if (splitted_text[i] == "tee") splitted_text[i] = "t";
                else if (splitted_text[i] == "see") splitted_text[i] = "c";
                else if (splitted_text[i] == "and" || splitted_text[i] == "end") splitted_text[i] = "n";
            }
            newText += " " + splitted_text[i].split("").join(" ");
        }
        else newText += " " + splitted_text[i];
    }
    return newText.replace(/  +/g, ' ').trim();
}
