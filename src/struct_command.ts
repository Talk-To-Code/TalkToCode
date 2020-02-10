/* struct command in the format [list of struct commands, variable list, conditions list]

list of struct commands 
    each element is a line of struct command. 
    For e.g. [#create int #variable first #value 1 #dec_end;;]
    If the struct command contains multiple lines, i.e. is a block statement, then
    the list of struct commands will contain:
    ['if #condition #variable helloWorld > #value 5  #if_branch_start', '#if_branch_end;;' ]

variable list
    list of new variables declared by the user. This is only updated when a declare command is given

conditions list
    next_line: Is true when the command ends and the user can proceed to new line.
    extendable: Is true when the command is already parseable and it can still be extended.
        e.g. "declare int hello" is parseable, but can be extended with "equal 5".
    go_ahead: is true when the struct command confirmed to not be an extension of prev command. 
        This flag will tell the manager to go ahead with next command.
        
*/


export class structCommand {

    parsedCommand: string;
    endCommand: string;
    errorMessage: string;
    hasError: boolean;
    isBlock: boolean;
    newline: boolean;
    extendable: boolean;
    go_ahead: boolean;

    constructor(typeOfCommand: string) {
        this.parsedCommand = "";
        this.endCommand = "";
        this.errorMessage = "";
        this.hasError = false;
        this.isBlock = false;
        this.newline = false;
        this.extendable = false;
        this.go_ahead = false;

        if (typeOfCommand == "block") {
            this.isBlock = true;
            this.newline = true;
        }
    }

    logError(errorMessage:string) {
        this.hasError = true;
        this.errorMessage = errorMessage;
    }
}

export class simpleStatement {
    parsedStatement: string;
    errorMessage: string;
    hasError: boolean;
    isInfix: boolean;
    isPostfix: boolean;
    isDeclare: boolean;
    isAssign: boolean;
    newline: boolean;
    extendable: boolean;

    constructor() {
        this.parsedStatement = "";
        this.errorMessage = "";
        this.hasError = false;
        this.isInfix = false;
        this.isDeclare = false;
        this.isAssign = false;
        this.isPostfix = false;
        this.newline = false;
        this.extendable = false;
    }

    logError(errorMessage:string) {
        this.hasError = true;
        this.errorMessage = errorMessage;
    }

    removeTerminator() {
        this.parsedStatement = this.parsedStatement.replace(";;", "");
    }

    convert2StructCommand() {
        var command = new structCommand("non-block");
        command.parsedCommand = this.parsedStatement;
        command.newline = this.newline;
        command.extendable = this.extendable;

        command.hasError = this.hasError;
        command.errorMessage = this.errorMessage;

        return command;
    }
}