export class structCommand {

    parsedCommand: string;
    endCommand: string;
    errorMessage: string;
    /* newVariable: stores string of new variable declared. */
    newVariable: string;
    /* newFunction: stores string of new function declared. */
    newFunction: string;
    /* hasError: true when input speech is not parseable. */
    hasError: boolean;
    /* isBlock: true when the struct command is a block statement. Useful for updating the struct command
    list in the struct_command_manager. */
    isBlock: boolean;
    /* isElse: true when struct command is an Else block. Useful for checking conditions on whether the else
    block is part of a previous If block. Used in the text2struct.ts file. */
    isElse: boolean;
    /* isCase: true when struct command is a Case block. Useful for checking conditions on whether the case
    block is part of a previous switch block. Used in the text2struct.ts file. */
    isCase: boolean;
    /* removePrevTerminator: is true if the current block is combinable with the prev block. E.g. Else block
    is part of prev If block. Remove the terminator behind #if_branch_end and append it to #else_branch_end. */
    removePrevTerminator: boolean;
    /* removePreviousStatement: is true if the previous statement is extendable by the current statement. */
    removePreviousStatement: boolean;
    /* removePreviousBlock: is true if the previous block is extendable by the current statement. */
    removePreviousBlock: boolean;
    

    constructor(typeOfCommand: string) {
        this.parsedCommand = "";
        this.endCommand = "";
        this.errorMessage = "";
        this.newVariable = "";
        this.newFunction = "";
        this.hasError = false;
        this.isBlock = false;
        this.isElse = false;
        this.isCase = false;
        this.removePrevTerminator = false;
        this.removePreviousStatement = false;
        this.removePreviousBlock = false;

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