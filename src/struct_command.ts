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
    /* isElseIf: true when struct command is an Else if block. Useful for checking conditions on whether the else
    if block is part of a previous If block. Used in the text2struct.ts file. */
    isElseIf: boolean;
    /* isElse: true when struct command is an Else block. Useful for checking conditions on whether the else
    block is part of a previous If block. Used in the text2struct.ts file. */
    isElse: boolean;
    /* isCase: true when struct command is a Case block. Useful for checking conditions on whether the case
    block is part of a previous switch block. Used in the text2struct.ts file. */
    isCase: boolean;
    /* isFinally: true when struct command is a finally block. Useful for checking conditions on whether the finally
    block is part of a previous try block. Used in the text2struct.ts file. */
    isFinally: boolean;
    /* isTry: true when struct command is a try block. Useful for checking conditions. try block is a special
    case where try and catch comes together. Hence, 2 blocks must be added to struct_command_list. */
    isTry: boolean;
    /* removePrevTerminator: is true if the current block is combinable with the prev block. E.g. Else block
    is part of prev If block. Remove the terminator behind #if_branch_end and append it to #else_branch_end. */
    removePrevTerminator: boolean;
    /* removePreviousStatement: is true if the previous statement is extendable by the current statement. */
    removePreviousStatement: boolean;
    /* held: is true when user is holding the statement there for editing or long commands. */
    held: boolean;
    

    constructor(typeOfCommand: string) {
        this.parsedCommand = "";
        this.endCommand = "";
        this.errorMessage = "";
        this.newVariable = "";
        this.newFunction = "";
        this.hasError = false;
        this.isBlock = false;
        this.isElseIf = false;
        this.isElse = false;
        this.isCase = false;
        this.isFinally = false;
        this.isTry = false;
        this.removePrevTerminator = false;
        this.removePreviousStatement = false;
        this.held = false;

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

export class edit_stack_item {

    /* What type of command was used.
    types include: non-edit, go-down, go-up, edit*/
    type : string;

    OldIdx: number = 0;
    snapshotSpeechHist: speech_hist = new speech_hist();
    snapshotStructCommand: string[] = [""];
    oldCurrSpeech: string[] = [""];
    oldHeldCommand: string[] = [""];
    oldHeldLine: number = 0;

    /* For non-edit commands */
    constructor(type: any) {
        this.type = type[0]

        if (type[0] == "exit-block") this.OldIdx = parseInt(type[1]);
        else this.OldIdx = 0;

        if (type[0]=="edit" || type[0] == "stay change") {
            this.snapshotStructCommand = type[1];
            this.snapshotSpeechHist = type[2];
            this.OldIdx = type[3];
        }
        else if (type[0] == "release") {
            this.snapshotStructCommand = type[1];
            this.snapshotSpeechHist = type[2];
            this.OldIdx = type[3];
            this.oldCurrSpeech = type[4];
            this.oldHeldCommand = type[5];
            this.oldHeldLine = type[6];
        }
    }
}

export class speech_hist {
    hist: speech_item[];

    constructor() {
        this.hist = [];
        this.hist.push(new speech_item(0, [""]));
    }

    add_item(index: number, speech_input: string[], amtToAdd: number) {
        for (var i = 0; i < this.hist.length; i++) {
            if (this.hist[i].index >= index) this.hist[i].index += amtToAdd;
        }
        this.hist.push(new speech_item(index, speech_input));
    }

    update_item(index: number, speech_input: string[]) {
        for (var i = 0; i < this.hist.length; i++) {
            if (this.hist[i].index == index) {
                this.hist[i].speech_input = speech_input;
                break;
            }
        }   
    }

    insert_item_in_between(index: number, numToDelete: number, input: string[]){
        var temp = [];
        temp.push(new speech_item(0,input));
        
        this.hist.splice(index,numToDelete,...temp);
    }

    get_item(index: number) {
        var speech_input = ["Error - Not mapped correctly"];
        for (var i = 0; i < this.hist.length; i++) {
            if (this.hist[i].index == index) speech_input = this.hist[i].speech_input;
        }
        return speech_input;
    }

    remove_item(index: number, amtToRemove: number) {
        var idxToRemove = -1;
        for (var i = 0; i < this.hist.length; i++) {
            if (this.hist[i].index == index) idxToRemove = i;
        }

        if (idxToRemove != -1) {
            this.hist.splice(idxToRemove, 1);
            /* shift every position after index back by amtToRemove. */
            for (var i = 0; i < this.hist.length; i++) {
                if (this.hist[i].index > index) this.hist[i].index -= amtToRemove;
            }
        }
    }

    concat_item(index: number, concat_item: string) {
        for (var i = 0; i < this.hist.length; i++) {
            if (this.hist[i].index == index) {
                this.hist[i].speech_input = this.hist[i].speech_input.concat(concat_item);
            }
        }
    }

    popFromSpeechItem(index: number) {
        for (var i = 0; i < this.hist.length; i++) {
            if (this.hist[i].index == index) {
                this.hist[i].speech_input.pop();
            }
        }
    }

    update_item_index(index: number, newIndex: number) {
        for (var i = 0; i < this.hist.length; i++) {
            if (this.hist[i].index == index) {
                this.hist[i].index = newIndex;
            }
        }
    }

    length() {
        return this.hist.length;
    }

    getAllItems() {
        return this.hist;
    }

}


class speech_item {
    speech_input: string[];
    index: number;

    constructor(index: number, speech_input: string[]) {
        this.speech_input = speech_input;
        this.index = index;
    }

}