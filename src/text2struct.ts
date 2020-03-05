import { parse_command } from './parse_blocks'
import { structCommand } from './struct_command';

var infixSegmentOperator = ["&&", "||", "&", "|"];
/*     

@ Parameters - list of commands, variable list

list of commands
    list of commands the user has spoken. For e.g. ['declare', 'int', 'hello']

prev_command
    string value of prev struct command. Useful for determining if the block command being created is legal.
    For e.g. Else block can on be created if prev_command is "#if_branch_end"

@ Returns the structCommand obj*/
export function get_struct(input_speech_segments: string[], prev_command: string) {

    var input_speech = input_speech_segments.join(" ");

    var removePreviousStatement = false;
    var removePreviousBlock = false;

    var checkMsg = checkPrevStatement(input_speech, prev_command);
    if (checkMsg == "extend declare") {
        input_speech = remakePrevDeclareSpeech(prev_command) + " " + input_speech;
        removePreviousStatement = true;
    }
    else if (checkMsg == "extend if"){
        input_speech = remakePrevIfSpeech(prev_command) + " " + input_speech;
        removePreviousBlock = true;
    }
    input_speech = replace_infix_operators(input_speech);

    console.log("text going in: " + input_speech);
    var struct_command = parse_command(input_speech);
    console.log("segmented results: " + struct_command.parsedCommand);

    if (struct_command.hasError) {
        console.log("Error: " + struct_command.errorMessage)
        return struct_command;
    }

    struct_command.removePrevTerminator = checkPrevBlock(struct_command, prev_command);
    /* If else or case block is not preceded by a If or Switch block accordingly, not valid. */
    if (struct_command.isElse || struct_command.isCase) {
        if (!struct_command.removePrevTerminator) {
            struct_command.logError("This block is invalid.");
            console.log("Error: " + struct_command.errorMessage)
            return struct_command;
        }
    }
    struct_command.removePreviousStatement = removePreviousStatement;
    struct_command.removePreviousBlock = removePreviousBlock;
    struct_command.newFunction = checkForNewFunction(struct_command);
    struct_command.newVariable = checkForNewVariable(struct_command);
    return struct_command;
}

/* If the input speech is meant to be an if/loop block */
function replace_infix_operators(text: string) {
    if (text.includes("begin if") || text.includes("begin loop") ||text.includes("while")) {
        text = text.replace(/greater than/g, '>');
        text = text.replace(/greater than equal/g, '>=');
        text = text.replace(/less than/g, '<');
        text = text.replace(/less than equal/g, '<=');
        text = text.replace(/not equal/g, '!=');
        text = text.replace(/equal/g, '==');
        text = text.replace("plus plus", "++");
    }
    return text;
}

/* Check if previous statement is extendable with the current statement. */
function checkPrevStatement(input_text: string, prev_command: string) {
    /* A declare statement without an assignment */
    if (prev_command.includes("#create") && prev_command.split(" ").length == 5) {
        if (input_text.split(" ")[0] == "equal") return "extend declare";
    }

    else if (prev_command.includes("#if_branch_start")) {
        if (input_text.split(" ")[0] == "and" || input_text.split(" ")[0] == "or" ||
        input_text.split(" ")[0] == "bit_and" || input_text.split(" ")[0] == "bit_or") return "extend if"; 
    }

    return "do not extend";
}


/* check if current struct command is an extendable block of the prev block. */
function checkPrevBlock(struct_command: structCommand, prev_command: string) {

    if (prev_command == "#if_branch_end;;" && struct_command.isElse) return true;
    if (prev_command == "#case_end;;" && struct_command.isCase) return true;
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

function remakePrevDeclareSpeech(struct_command: string) {
    var splitted_text = struct_command.split(" ");
    return "declare " + splitted_text[1] + " " + splitted_text[3];
}

function remakePrevIfSpeech(struct_command: string) {
    var splitted_text = struct_command.split(" ").slice(1);
    var reconstructed = "begin if";
    for(var i = 0; i < splitted_text.length; i++) {
        if (infixSegmentOperator.includes(splitted_text[i])) 
            reconstructed += " " + mapInfixSegmentingOperator(splitted_text[i]);
        else if (splitted_text[i].charAt(0) != "#") {
            reconstructed += " " + splitted_text[i];
        }
    }
    return reconstructed;
}

/* Maps "or" to "||", "and" to "&&" and so on. */
function mapInfixSegmentingOperator(operator: string) {
    operator = operator.replace("||", "or");
    operator = operator.replace("&&", "and");
    operator = operator.replace("|", "bit_or");
    operator = operator.replace("&", "bit_and");

    return operator;
}