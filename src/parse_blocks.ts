var variable_types = ["int", "long", "float", "double", "boolean", "char", "string", "void"];

// var parsy = require("./parse_statements.ts");
import { parse_statement, joinName, fragment_segmenter } from './parse_statements'
import { structCommand } from './struct_command'


/* Main function of segmenter.ts is to perform checks on the commands and segment out long var names.
Should look into seperating functionality of block statements and simple statements.

@params:
text - command spoken by the user.
var_list - list of variables already declared. 

@ Returns the struct command in the format [list of struct commands, variable list, conditions list]
list of struct commands 
    each element is a line of struct command. 
    For e.g. [#create int #variable first #value 1 #dec_end;;]
    If the struct command contains multiple lines, i.e. is a block statement, then
    the list of struct commands will contain:
    ['if #condition #variable helloWorld > #value 5  #if_branch_start', '#if_branch_end;;' ]

variable list
    list of new variables declared by the user. This is only updated when a declare command is given. */

export function parse_command(text: string, language: string) {
    var starting_command = determine_user_command(text, language);

    /* c does not support exception handling */
    if ((starting_command[0] == "try" && language == "c") || (starting_command[0] == "finally" && language == "c")) {
        var errorCommand = new structCommand("non-block");
        errorCommand.logError("C does not support exception handling");
    }

    /* c does not support classes */
    if (starting_command[0] == "start" && language == "c") {
        var errorCommand = new structCommand("non-block");
        errorCommand.logError("C does not support creating classes");
    }

    /* Python does not support switch statements */
    if (starting_command[0] == "switch" && language == "py") {
        var errorCommand = new structCommand("non-block");
        errorCommand.logError("Python does not support switch statements");
    }

    /* Splitted_text is the user's command without the leading starting command.
    Starting command refers to "begin if", "begin loop" etc. */
    var splitted_text = starting_command[1].split(" ");

    switch(starting_command[0]) {
        case "if":
            return parse_if(splitted_text, language);
        case "else":
            return parse_else(splitted_text);
        case "elseIf":
            return parse_elseIf(splitted_text, language);
        case "loop":
            if (language == "c") return parse_for_loop_c(splitted_text, language);
            else return parse_for_loop_py(splitted_text, language);
        case "function":
            if (language == "c") return parse_function_c(splitted_text);
            else return parse_function_py(splitted_text);
        case "while":
            return parse_while(splitted_text, language);
        case "switch":
            return parse_switch(splitted_text, language);
        case "do":
            return parse_do(splitted_text, language);
        case "case":
            return parse_case(splitted_text, language);
        case "structure":
            return parse_structure(splitted_text);
        case "try":
            return parse_try();
        case "finally":
            return parse_finally();
        case "class":
            return parse_class(splitted_text);
        default:
            var statement = parse_statement(text, "normal", language);
            return statement.convert2StructCommand();
    }
}

/* To determine what command the user is trying say */
function determine_user_command(text: string, language: string) {

    text = text.replace("begin if", "if");
    text = text.replace("else if", "elseIf");
    text = text.replace("begin loop", "loop");
    text = text.replace("begin switch", "switch");
    text = text.replace("create function", "function");
    text = text.replace("create structure", "structure")
    text = text.replace("create class", "class")
    text = text.replace("do while", "do");
    text = text.replace("begin try", "try");

    var splitted_text = text.split(" ");

    var starting_command = splitted_text[0];

    /* Remove starting command from the text. */
    return [starting_command, splitted_text.splice(1).join(" ")];
}

/* splitted_text e.g: ['hello', '<', '5'] */
function parse_if(splitted_text: string[], language: string) {
    var command = new structCommand("block");
    command.parsedCommand = "if #condition";

    var statement = parse_statement(splitted_text.join(" "), "infix", language);
    if (statement.hasError) {
        command.logError("incomplete condition, " + statement.errorMessage);
        return command;
    }
    if (!statement.isInfix) {
        command.logError("infix is required.");
        return command;
    }
    command.parsedCommand += " " + statement.parsedStatement + " #if_branch_start";
    command.endCommand = "#if_branch_end;;";
    return command;
}

function parse_elseIf(splitted_text: string[], language: string) {
    var command = new structCommand("block");
    command.isElseIf = true;
    command.parsedCommand = "else if #condition";

    var statement = parse_statement(splitted_text.join(" "), "infix", language);
    if (statement.hasError) {
        command.logError("incomplete condition, " + statement.errorMessage);
        return command;
    }
    if (!statement.isInfix) {
        command.logError("infix is required.");
        return command;
    }
    command.parsedCommand += " " + statement.parsedStatement + " #elseIf_branch_start";
    command.endCommand = "#elseIf_branch_end;;";
    return command;
}

function parse_else(splitted_text: string[]) {
    var command = new structCommand("block");
    command.isElse = true;
    command.parsedCommand = "#else_branch_start";
    command.endCommand = "#else_branch_end;;";
    return command;
}

/* [ 'while', 'first hello', '==', 'second' ] 
I used the exact same code as If block. Will be much more different when If block allows for Else if. */
function parse_while(splitted_text: string[], language: string) {
    var command = new structCommand("block");
    command.parsedCommand = "while #condition"
    var statement = parse_statement(splitted_text.join(" "), "infix", language);
    if (statement.hasError) {
        command.logError("error in parsing statement, " + statement.errorMessage);
        return command;
    }
    if (!statement.isInfix) {
        command.logError("infix is required.");
        return command;
    }
    command.parsedCommand += " " + statement.parsedStatement + " #while_start";
    command.endCommand = "#while_end;;";
    return command;
}

function parse_do(splitted_text: string[], language: string) {
    var command = new structCommand("block");
    command.parsedCommand = "do #condition"
    var statement = parse_statement(splitted_text.join(" "), "infix", language);
    if (statement.hasError) {
        command.logError("error in parsing statement, " + statement.errorMessage);
        return command;
    }
    if (!statement.isInfix) {
        command.logError("infix is required.");
        return command;
    }
    command.parsedCommand += " " + statement.parsedStatement + " #while_start";
    command.endCommand = "#while_end;;";
    return command;
}

/* splitted_text e.g: [ 'condition','i','==','0','condition','i','<','number','condition','i','++' ] */
function parse_for_loop_c(splitted_text: string[], language: string) {
    var command = new structCommand("block");
    command.parsedCommand = "for";
    /* For loop must have 'condition' key word. */
    if (!splitted_text.includes("condition")) {
        command.logError("Condition was not mentioned.");
        return command;
    }
    /* Split the splitted text array into condition blocks. Omit the first "condition" (using .slice(1))
     for the .split("condition") to work. Lastly, trim each string of the condition block (using .map()).
    E.g. of condition_blocks = [ 'i = 0', 'i < 5', 'i ++' ] */
    var condition_blocks = splitted_text.slice(1).join(" ").split("condition").map(x=>x.trim());
    /* Condition_blocks should have 3 sets. */
    if (condition_blocks.length != 3) {
        command.logError("need to have 3 conditions.");
        return command;
    }
    condition_blocks[0] = condition_blocks[0].replace("==", "equal");
    var statement = parse_statement(condition_blocks[0], "normal", language);
    if (statement.hasError) {
        command.logError("something wrong with for-loop infix condition. " + statement.errorMessage);
        return command;
    }
    statement.removeTerminator();
    command.parsedCommand += " #condition " + statement.parsedStatement;

    statement = parse_statement(condition_blocks[1], "infix", language);
    if (statement.hasError) {
        command.logError("something wrong with for-loop infix condition. " + statement.errorMessage);
        return command;
    }
    statement.removeTerminator();
    command.parsedCommand += " #condition " + statement.parsedStatement;

    statement = parse_statement(condition_blocks[2], "normal", language);
    if (statement.hasError) {
        command.logError("something wrong with for-loop infix condition. " + statement.errorMessage);
        return command;
    }
    statement.removeTerminator();
    command.parsedCommand += " #condition " + statement.parsedStatement;

    command.parsedCommand += " #for_start"
    command.endCommand = "#for_end;;";
    return command;
}

/* parameter <var name> in <var name>
parameter <var name> parameter <var name> in <var name>  
* parameter <var name> can be declared multiple times

struct_command E.g.:
for #parameter #variable item #parameter #variable item2 #variable item_list #for_start #for_end;;*/
function parse_for_loop_py(splitted_text: string[], language: string) {
    var command = new structCommand("block");
    command.parsedCommand = "for";

    /* For loop must have 'condition' key word. */
    if (splitted_text[0] != "parameter") {
        command.logError("parameter should be first word said.");
        return command;
    }
    if (splitted_text[splitted_text.length-1] == "parameter") {
        command.logError("parameter was last word mentioned.");
        return command;
    }
    /* For loop must have 'in' key word. */
    if (!splitted_text.includes("in")) {
        command.logError("in was not mentioned.");
        return command;
    }
    if (splitted_text[splitted_text.length-1] == "in") {
        command.logError("in was last word mentioned.");
        return command;
    }

    /* E.g. 
    "parameter hello in hellolist" -> [ '', ' hello in hellolist' ]
    "parameter hello parameter yolo in hellolist" -> [ '', ' hello ', ' yolo in hellolist' ]*/
    var parameter_block = splitted_text.join(" ").split("parameter");
    parameter_block.splice(0, 1); // remove ''.
    parameter_block = parameter_block.map((val) => { return val.trim(); }); // trim each element
    
    for (var i = 0; i < parameter_block.length; i++) {
        command.parsedCommand += " #parameter";
        /* Expected syntax: <var name> in <var name>*/
        var splitted_parameter_block = parameter_block[i].split(" ");
        if (splitted_parameter_block.includes("in")) {
            var inIdx = splitted_parameter_block.indexOf("in");
            var frag1 = fragment_segmenter(splitted_parameter_block.slice(0, inIdx), "py");
            var frag2 = fragment_segmenter(splitted_parameter_block.slice(inIdx+1), "py");

            if (frag1[0] == "not ready") {
                command.logError("Error in fragment. " + frag1[1]);
                return command;
            }
            if (frag2[0] == "not ready") {
                command.logError("Error in fragment. " + frag2[1]);
                return command;
            }
            command.parsedCommand += " " + frag1[1] + " " + frag2[1];
        }
        else {
            var frag = fragment_segmenter(splitted_parameter_block, "py");
            if (frag[0] == "not ready") {
                command.logError("Error in fragment. " + frag[1]);
                return command;
            }
            command.parsedCommand += " " + frag[1];
        }
    }
    command.parsedCommand += " #for_start"
    command.endCommand = "#for_end;;";
    return command;
}

function parse_function_py(splitted_text: string[]) {
    var command = new structCommand("block");
    command.parsedCommand = "#function_declare";

    if (splitted_text[splitted_text.length-1] != "begin") {
        command.logError("begin is not the last word.");
        return command;
    } 
    /* Remove "begin". Not necessary. */
    splitted_text.splice(splitted_text.length-1, 1);

    if (!splitted_text.includes("parameter")) {
        command.parsedCommand += " " + joinName(splitted_text) + " #function_start";
        command.endCommand = "#function_end;;";
        return command;
    }
    var text = splitted_text.join(" ")
    var parameter_block = text.split("parameter");
    parameter_block = parameter_block.map(x=>x.trim());

    command.parsedCommand += " " + joinName(parameter_block[0].split(" "));

    for (var i = 1; i < parameter_block.length; i++) {
        command.parsedCommand += " #parameter " + joinName(parameter_block[i].split(" "));
    }
    command.parsedCommand += " #function_start";
    command.endCommand = "#function_end;;";
    return command;
}

/* splitted_text e.g: ['main', 'with', 'return', 'type', 'int', 'begin'] or 
['main', 'with', 'return', 'type', 'int', 'parameter', 'int', 'length', 
'parameter', 'int', 'array', 'numbers', 'begin'] */
function parse_function_c(splitted_text: string[]) {
    var command = new structCommand("block");
    command.parsedCommand = "#function_declare";
    if (!splitted_text.includes("with")) {
        command.logError("with not mentioned.");
        return command;
    }
    if (splitted_text[splitted_text.length-1] != "begin") {
        command.logError("begin is not the last word.");
        return command;
    } 
    /* Remove "begin". Not necessary. */
    splitted_text.splice(splitted_text.length-1);
    var text = splitted_text.join(" ");

    var withIdx = splitted_text.indexOf("with");
    var splitted_funcName = splitted_text.slice(0, withIdx);
    if (splitted_funcName.length == 0) {
        command.logError("function name was not mentioned.");
        return command;
    }
    if (splitted_text[splitted_text.length-1] == "with") {
        command.logError("with was last word mentioned");
        return command;
    }
    /* From withIdx + 3 will accomodate enough space for "return type <var type>" */
    if (splitted_text.length-1  < withIdx + 3) {
        command.logError("function not ready");
        return command;
    }
    if (splitted_text.slice(withIdx+1, withIdx+3).join(" ") != "return type") {
        command.logError("the words \"return type\" was not mentioned.");
        return command;
    }
    if (!variable_types.includes(splitted_text[withIdx + 3])) {
        command.logError("variable type was not mentioned.");
        return command;
    }

    command.parsedCommand += " " + joinName(splitted_funcName); /* Add function name. */    
    command.parsedCommand += " " +  splitted_text[withIdx + 3]; /* Add var type. */

    /* No parameter declared. */
    if (!splitted_text.includes("parameter")) {
        command.endCommand = "#function_end;;";
        command.parsedCommand += " #function_start";
        return command;
    }
    var parameter_block = text.split("parameter");
    parameter_block = parameter_block.map(x=>x.trim());
    var i = 1;
    for (i; i < parameter_block.length; i++) {

        var splitted_param = parameter_block[i].split(" ");
        /* e.g. integer hello */
        if (splitted_param.length < 2) {
            command.logError("parameter not complete.");
            return command;
        }
        if (!variable_types.includes(splitted_param[0])) {
            command.logError("variable type was not mentioned.");
            return command;
        }
        if (splitted_param[1] == "array") { // If parameter of function is an array.
            if (splitted_param.length < 3) {
                command.logError("parameter not complete");
                return command;
            }
            if (splitted_param[2] == "dimension" && splitted_param.length < 5) {
                command.logError("parameter not complete");
                return command;
            }
            if (splitted_param[2] == "dimension") {
                //<var type> array dimension <number> <var name>
                var dimension = splitted_param[3];
                if (isNaN(Number(dimension))){
                    command.logError("dimension requires a number");
                    return command;
                }
                command.parsedCommand += " #parameter_a #dimension " + dimension + " " + splitted_param[0];
                command.parsedCommand += " #array " + joinName(splitted_param.slice(4));
            }
            else {
                command.parsedCommand += " #parameter_a #dimension 1 " + splitted_param[0];
                command.parsedCommand += " #array " + joinName(splitted_param.slice(2));
            }
        }
        else { // If parameter of function is not an array.
            console.log("heree")
            command.parsedCommand += " #parameter #type " + splitted_param[0]; // Add variable type
            command.parsedCommand += " " + joinName(splitted_param.slice(1));
        }
    }
    command.parsedCommand += " #function_start";
    command.endCommand += "#function_end;;";
    return command;
}

function parse_switch(splitted_text: string[], language: string) {
    /* switch is a weird case where it is a block in actual code, but in struct command it is not a block. 
    It is not considered a block because it lacks and end branch. */
    var command = new structCommand("non-block");

    if (splitted_text.length == 0) {
        command.logError("no term mentioned");
        return command;
    }
    var fragment = fragment_segmenter(splitted_text, language);
    if (fragment[0] == "not ready") {
        command.logError(fragment[1]);
        return command;
    }
    command.parsedCommand = "switch #condition " + fragment[1] + ";;";
    return command;
}

function parse_case(splitted_text: string[], language: string) {
    var command = new structCommand("block");
    command.isCase = true;
    if (splitted_text.length == 0) {
        command.logError("no term mentioned");
        return command;
    }
    var fragment = fragment_segmenter(splitted_text, language);
    if (fragment[0] == "not ready") {
        command.logError(fragment[1]);
        return command;
    }
    command.parsedCommand = "case " + fragment[1] + " #case_start";
    command.endCommand = "#case_end;;"

    return command;
}

function parse_structure(splitted_text: string[]) {
    var command = new structCommand("block");

    if (splitted_text.length == 0) {
        command.logError("no term mentioned");
        return command;
    }

    if (JSON.stringify(splitted_text) == "[\"\"]") {
        command.logError("no term mentioned");
        return command;
    }

    console.log(splitted_text)

    command.parsedCommand = "#struct_declare " + joinName(splitted_text) + " #struct_start";
    command.endCommand = "#struct_end;;"

    return command;
}

/* only works for py. not for java. java has parameters in the catch condition. */
function parse_try() {
    var command = new structCommand("block");
    command.isTry = true;
    command.parsedCommand = "try catch #catch start"
    command.endCommand = "#catch_end;;";
    return command;
}

function parse_finally() {
    var command = new structCommand("block");
    command.isFinally = true;
    command.parsedCommand = "finally"
    command.endCommand = "#finally_end;;";

    return command;
}

function parse_class(splitted_text: string[]) {
    var command = new structCommand("block");
    var text = splitted_text.join(" ");
    text = text.replace("with parent", "parent");
    splitted_text = text.split(" ");

    if (!splitted_text.includes("parent")) {
        command.parsedCommand = "class " + joinName(splitted_text) + " #class_start";
        command.endCommand = "#class_end;;"
        return command;
    }

    if (splitted_text[splitted_text.length - 1] == "parent") {
        command.logError("parent is last word said");
        return command;
    }

    var parentIdx = splitted_text.indexOf("parent");
    var class_name = joinName(splitted_text.slice(0, parentIdx));
    var parent_name = joinName(splitted_text.slice(parentIdx + 1));

    command.parsedCommand = "class " + class_name + " #parent " + parent_name + " #class_start";
    command.endCommand = "#class_end;;"
    return command;
}