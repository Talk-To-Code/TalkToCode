export class structCommand {

    parsedCommand: string;
    endCommand: string;
    errorMessage: string;
    hasError: boolean;
    isBlock: boolean;
    isElse: boolean;
    isCase: boolean;
    newline: boolean;
    /* extendable: Is true when the command is already parseable and it can still be extended.
        e.g. "declare int hello" is parseable, but can be extended with "equal 5". */
    extendable: boolean;
    /* go_ahead: is true when the previously extendable struct command is confirmed to not be an extension of 
    the prev command. This flag will tell the manager to go ahead with next command. */
    go_ahead: boolean;
    /* removePrevTerminator: is true if the current block is combinable with the prev block. E.g. Else block
    is part of prev If block. Remove the terminator behind #if_branch_end and append it to #else_branch_end. */
    removePrevTerminator: boolean;

    constructor(typeOfCommand: string) {
        this.parsedCommand = "";
        this.endCommand = "";
        this.errorMessage = "";
        this.hasError = false;
        this.isBlock = false;
        this.isElse = false;
        this.isCase = false;
        this.newline = false;
        this.extendable = false;
        this.go_ahead = false;
        this.removePrevTerminator = false;

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
    isReturn: boolean;
    isBreak: boolean;
    isContinue: boolean;
    isFunction: boolean;
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
        this.isReturn = false;
        this.isBreak = false;
        this.isContinue = false;
        this.isFunction = false;
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