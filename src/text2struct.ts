import { parse_command } from './parse_blocks'
import { structCommand } from './struct_command';

var arithmetic_operator = ["plus", "divide", "multiply", "minus"];
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
    language: string) {
    console.log("prev input speech: " + prev_input_speech)
    console.log("prev struct command: " + prev_struct_command)

    var input_speech = input_speech_segments.join(" ");

    var removePreviousStatement = false;
    var removePreviousBlock = false;

    var checkMsg = checkPrevStatement(input_speech, prev_struct_command);
    if (checkMsg == "extend declare" || checkMsg == "extend assign") {
        input_speech = prev_input_speech + " " + input_speech;
        removePreviousStatement = true;
    }

    input_speech = replace_infix_operators(input_speech);

    console.log("text going in: " + input_speech);
    var struct_command = parse_command(input_speech, language);
    console.log("segmented results: " + struct_command.parsedCommand);

    if (struct_command.hasError) {
        console.log("Error: " + struct_command.errorMessage)
        return struct_command;
    }

    struct_command.removePrevTerminator = checkPrevBlock(struct_command, prev_struct_command);
    /* If else or case block is not preceded by a If or Switch block accordingly, not valid. */
    if (struct_command.isElse || struct_command.isCase) {
        if (!struct_command.removePrevTerminator) {
            struct_command.logError("This block is invalid.");
            console.log("Error: " + struct_command.errorMessage)
            return struct_command;
        }
    }
    struct_command.removePreviousStatement = removePreviousStatement;
    struct_command.newFunction = checkForNewFunction(struct_command);
    struct_command.newVariable = checkForNewVariable(struct_command);
    return struct_command;
}

/* If the input speech is meant to be an if/loop block */
function replace_infix_operators(text: string) {
    if (text.includes("begin if") || text.includes("begin loop") ||text.includes("while")) {
        /* Infix comparison operator. */
        text = text.replace(/greater than/g, '>');
        text = text.replace(/greater than equal/g, '>=');
        text = text.replace(/less than/g, '<');
        text = text.replace(/less than equal/g, '<=');
        text = text.replace(/not equal/g, '!=');
        text = text.replace(/equal/g, '==');

        /* Infix segmenting operator */
        text = text.replace(/and/g, "&&");
        text = text.replace(/or/g, "||");
        text = text.replace(/bit_and/g, "&");
        text = text.replace(/bit_or/g, "|");
    }

    if (text.includes("begin loop")) {
        text = text.replace("plus plus", "++");
    }
    return text;
}

/* Check if previous statement is extendable with the current statement. */
function checkPrevStatement(input_text: string, prev_struct_command: string) {
    
    /* A declare statement without an assignment */
    if (prev_struct_command.includes("#create")) {
        if (prev_struct_command.split(" ").length == 5 && input_text.split(" ")[0] == "equal") {
            return "extend declare";
        }
        if (prev_struct_command.split(" ").length >= 7 && arithmetic_operator.includes(input_text.split(" ")[0])) {
            return "extend declare";
        }
    }

    else if (prev_struct_command.includes("#assign")) {
        if (arithmetic_operator.includes(input_text.split(" ")[0])) {
            return "extend assign";
        }
    }
    return "do not extend";
}


/* check if current struct command is an extendable block of the prev block. */
function checkPrevBlock(struct_command: structCommand, prev_command: string) {

    if (prev_command == "#if_branch_end;;" && struct_command.isElse) return true;
    if (prev_command == "#case_end;;" && struct_command.isCase) return true;
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
