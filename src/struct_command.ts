export class structCommand {

    parsedCommand: string;
    endCommand: string;
    errorMessage: string;
    hasError: boolean;
    isBlock: boolean;
    isElse: boolean;
    isCase: boolean;
    /* removePrevTerminator: is true if the current block is combinable with the prev block. E.g. Else block
    is part of prev If block. Remove the terminator behind #if_branch_end and append it to #else_branch_end. */
    removePrevTerminator: boolean;
    /* removePrevious: is true if the previous statement is extendable by the current statement. */
    removePrevious: boolean;

    constructor(typeOfCommand: string) {
        this.parsedCommand = "";
        this.endCommand = "";
        this.errorMessage = "";
        this.hasError = false;
        this.isBlock = false;
        this.isElse = false;
        this.isCase = false;
        this.removePrevTerminator = false;
        this.removePrevious = false;

        if (typeOfCommand == "block") this.isBlock = true;
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

        command.hasError = this.hasError;
        command.errorMessage = this.errorMessage;

        return command;
    }
}