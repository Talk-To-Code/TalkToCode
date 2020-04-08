import { parse_command } from './parse_blocks'
import { structCommand } from './struct_command';

var joiningOperators = ["plus", "divide", "multiply", "minus", ">", ">=", "<", "<=", "==", "&", "&&", "|", "||"];
/*     

@ Parameters - list of commands, variable list

list of commands
    list of commands the user has spoken. For e.g. ['declare', 'int', 'hello']

prev_command
    string value of prev struct command. Useful for determining if the block command being created is legal.
    For e.g. Else block can on be created if prev_command is "#if_branch_end"

@ Returns the structCommand obj*/

/* Differences btw C and Python

Declaration: Python requires that variable be declared with something. Variable type is not needed as well.


*/

export function get_struct(input_speech_segments: string[], prev_input_speech: string, prev_struct_command: string,
    language: string, debugMode: boolean, holding: boolean, variable_list: string[], function_list: string[]) {
    if (debugMode) {
        console.log("prev input speech: " + prev_input_speech)
        console.log("prev struct command: " + prev_struct_command)
    }
    var input_speech = input_speech_segments.join(" ");

    input_speech = replace_infix_operators(input_speech, prev_struct_command);

    var removePreviousStatement = false;

    var extendCommand = checkPrevStatement(input_speech, prev_struct_command, language);
    if (extendCommand) {
        input_speech = prev_input_speech + " " + input_speech;
        removePreviousStatement = true;
    }

    if (input_speech.includes("spell")) {
        var check = getSpelling(input_speech);
        if (check[0] == "not ready") {
            var rejectedStructCommand = new structCommand("non-block");
            rejectedStructCommand.logError(check[1]);
            return rejectedStructCommand;
        }
        else input_speech = check[1];
    }

    if (debugMode) console.log("text going in: " + input_speech);
    var struct_command = parse_command(input_speech, language, variable_list, function_list);
    if (debugMode) console.log("segmented results: " + struct_command.parsedCommand);

    if (struct_command.hasError) {
        if (debugMode) console.log("Error: " + struct_command.errorMessage);
        return struct_command;
    }

    if (holding) {
        struct_command.logError("Held");
        struct_command.held = true;
        return struct_command;
    }

    struct_command.removePrevTerminator = checkPrevBlock(struct_command, prev_struct_command);
    /* If else or case block is not preceded by a If or Switch block accordingly, not valid. */
    if (struct_command.isElse || struct_command.isCase || struct_command.isElseIf) {
        if (!struct_command.removePrevTerminator) {
            struct_command.logError("This block is invalid.");
            console.log("Error: " + struct_command.errorMessage);
            return struct_command;
        }
    }
    struct_command.removePreviousStatement = removePreviousStatement;
    struct_command.newFunction = checkForNewFunction(struct_command);
    struct_command.newVariable = checkForNewVariable(struct_command);
    return struct_command;
}

/* If the input speech is meant to be an if/loop block */
function replace_infix_operators(text: string, previousStructCommand: string) {
    if (text.includes("begin if") || text.includes("begin loop") ||text.includes("while") || 
    previousStructCommand.includes("#if_branch_start") || previousStructCommand.includes("#elseIf_branch_start") ||
    previousStructCommand.includes("#while_start")) {
        /* Infix comparison operator. */
        text = text.replace(/greater than/g, '>');
        text = text.replace(/greater than equal/g, '>=');
        text = text.replace(/less than/g, '<');
        text = text.replace(/less than equal/g, '<=');
        text = text.replace(/not equal/g, '!=');
        text = text.replace(/equal/g, '==');

        /* Infix segmenting operator */
        text = text.replace(/bit_and/g, "&");
        text = text.replace(/bit_or/g, "|");
        text = text.replace(/and/g, "&&");
        text = text.replace(/or/g, "||");
    }

    if (text.includes("begin loop")) {
        text = text.replace("plus plus", "++");
    }
    return text;
}

/* Check if previous statement is extendable with the current statement. */
function checkPrevStatement(input_text: string, prev_struct_command: string, language: string) {
    
    /* A declare statement without an assignment */
    if (prev_struct_command.includes("#create") && language == "c") {
        /* normal variable */
        if (prev_struct_command.split(" ").length == 5 && input_text.split(" ")[0] == "equal") {
            return true;
        }
        /* Array declaration */
        if (prev_struct_command.split(" ").length == 9 && prev_struct_command.includes("#array") &&
        input_text.split(" ")[0] == "equal") {
            return true;
        }
        if (prev_struct_command.split(" ").length >= 7 && joiningOperators.includes(input_text.split(" ")[0])) {
            return true;
        }
    }
    else if (prev_struct_command.includes("#create") && language == "py") {
        if (prev_struct_command.split(" ").length >= 5 && joiningOperators.includes(input_text.split(" ")[0])) {
            return true;
        }
    }
    else if (prev_struct_command.includes("#if_branch_start") || prev_struct_command.includes("#elseIf_branch_start") ||
    prev_struct_command.includes("#while_start")) {
        if (joiningOperators.includes(input_text.split(" ")[0]))
            return true;
    }
    else if (prev_struct_command.includes("#assign")) {
        if (joiningOperators.includes(input_text.split(" ")[0])) {
            return true;
        }
    }
    return false;
}


/* check if current struct command is an extendable block of the prev block. */
function checkPrevBlock(struct_command: structCommand, prev_command: string) {

    if (prev_command == "#if_branch_end;;" && struct_command.isElse) return true;
    if (prev_command == "#elseIf_branch_end;;" && struct_command.isElse) return true;
    if (prev_command == "#catch_end;;" && struct_command.isElse) return true;
    if (prev_command == "#catch_end;;" && struct_command.isFinally) return true;
    if (prev_command == "#else_branch_end;;" && struct_command.isFinally) return true;
    if (prev_command == "#if_branch_end;;" && struct_command.isElseIf) return true;
    if (prev_command == "#case_end" && struct_command.isCase) return true;
    if (prev_command.includes("switch #condition #variable") && struct_command.isCase) return true;

    else return false;
}

function checkForNewVariable(struct_command: structCommand) {
    var newVariable = ""
    if (struct_command.parsedCommand.split(" ")[0] == "#create") {
        newVariable = struct_command.parsedCommand.split(" ")[3];
    }
    return newVariable;
}

function checkForNewFunction(struct_command: structCommand) {
    var newFunction = ""
    if (struct_command.parsedCommand.split(" ")[0] == "#function_declare") {
        newFunction = struct_command.parsedCommand.split(" ")[1];
    }
    return newFunction;
}

function getSpelling(input_speech: string) {

    if (!input_speech.includes("end_spell")) return ["not ready", "not done spelling"];

    var temp = input_speech.split(" ");
    var spellIdx = temp.indexOf("spell");
    var spellEndIdx = temp.indexOf("end_spell");

    if (spellIdx > spellEndIdx) return ["not ready", "wrong order"];

    var spelledWord = temp.slice(spellIdx + 1, spellEndIdx);

    if (spelledWord.length == 0) return ["not ready", "spelled word not mentioned"];

    input_speech = (temp.slice(0, spellIdx).join(" ").trim() + " " + spelledWord.join("").trim() + " " + temp.slice(spellEndIdx+1).join(" ")).trim();
    return ["ready", input_speech];
}
