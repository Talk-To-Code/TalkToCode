import {get_struct} from './text2struct'
import { clean } from './clean_text';
import * as vscode from 'vscode';
import { structCommand, speech_hist, edit_stack_item } from './struct_command';

var end_branches = ["#if_branch_end;;", "#elseIf_branch_end;;", "#else_branch_end;;", "#for_end;;", 
                    "#while_end;;", "#case_end;;", "#function_end;;", "#catch_end;;", "#finally_end;;", 
                    "#class_end;;", "#struct_end;;", "#switch_end;;", "#if_branch_end", "#elseIf_branch_end", "#else_branch_end", "#for_end", "#while_end", 
                    "#case_end", "#function_end", "#catch_end", "#finally_end", "#class_end", "#struct_end", "#switch_end"];

var start_branches = ["#if_branch_start", "elseIf_branch_start", "#else_branch_start", "#for_start", "#while_start", "#case_start", 
                    "#function_start", "catch #catch_start", "switch", "try", "finally"];

var cursor_struct = '#string "";;';

export class StructCommandManager {

    /* Language the user is typing in. */
    language = "c";
    /* List of structure commands. Used to feed into the AST */
    struct_command_list: string[]
    /* List of variables declared by the user */
    variable_list: string[]
    /* List of functions declared by the user */
    functions_list: string[]
    /* current index within the struct_command_list - helpful for:
        - determining where to splice new struct commands into the struct command list.
        - for extendable commands. whether to splice and replace/extend extendable command or go ahead to
          next command. */
    curr_index: number
    /* current command the user is saying. Stored in a list of string. e.g. ["declare", "integer", "hello"]*/
    curr_speech: string[]

    speech_hist: speech_hist;

    edit_stack: edit_stack_item[];

    debugMode: boolean;
    /* is true when command is being held */
    holding: boolean;

    heldCommand: string[];

    heldline: number;

    justReleased: boolean;

    speech_len: number;

    spelling: boolean;

    constructor(language: string, debugMode: boolean) {
        this.language = language;
        this.curr_index = 0;
        this.struct_command_list = [cursor_struct];
        this.curr_speech = [""];
        this.variable_list = [""];
        this.functions_list = [""];
        this.speech_hist = new speech_hist();
        this.edit_stack = [];
        this.debugMode = debugMode;
        this.holding = false;
        this.heldCommand = [""];
        this.heldline = 0;
        this.justReleased = false;
        this.speech_len = -1;
        this.spelling = false;

    }

    reset() {
        this.curr_index = 0;
        this.struct_command_list = [cursor_struct];
        this.curr_speech = [""];
        this.variable_list = [""];
        this.functions_list = [""];
        this.speech_hist = new speech_hist();
        this.edit_stack = []
        this.holding = false;
        this.heldCommand = [""];
        this.heldline = 0;
        this.justReleased = false;
        this.spelling = false;
    }

    parse_speech(transcribed_word: string, countlines: number[]) {
        if (this.debugMode) console.log("####################### NEXT COMMAND #######################");

        /* Check for undo or navigation command */
        if (transcribed_word == "scratch that" || transcribed_word == "go back") this.scratchThatCommand();
        else if (transcribed_word == "exit block") this.exitBlockCommand();
        else if (transcribed_word == "go down" || transcribed_word == "move down") this.goDownCommand();
        else if (transcribed_word == "go up" || transcribed_word == "move up") this.goUpCommand();
        else if (transcribed_word.startsWith("stay")) this.holdCommand(transcribed_word, countlines);
        else if (transcribed_word.startsWith("release")) this.releaseCommand();
        else if (transcribed_word.startsWith("backspace")) this.backspaceCommand(transcribed_word);

        /* Normal process. */
        else {

            if (transcribed_word.split(" ").includes("spell")) this.spelling = true;
            var cleaned_speech = clean(transcribed_word, this.spelling);
            if (cleaned_speech.split(" ").includes("end_spell")) this.spelling = false;

            this.edit_stack.push(new edit_stack_item(["non-edit"]));
            this.curr_speech.push(cleaned_speech);
            /* Remove the "" blanks from the curr speech. */
            this.curr_speech = this.curr_speech.filter(function(value) {
                return value != "";
            });
            this.speech_hist.update_item(this.curr_index, this.curr_speech); /* Update speech hist. */
        }
        /* Get prev input speech and struct command. */
        var prev_input_speech = "";
        var prev_struct_command = "";
        if (this.curr_index > 0) {
            prev_input_speech = this.speech_hist.get_item(this.curr_index-1).join(" ");
            prev_struct_command = this.struct_command_list[this.curr_index-1];
        }
        var struct_command = get_struct(this.curr_speech, prev_input_speech, prev_struct_command, 
                            this.language, this.debugMode, this.holding, this.variable_list, this.functions_list);

        this.updateStructCommandList(struct_command);
        this.updateVariableAndFunctionList(struct_command);

        if (this.debugMode) console.log(this.managerStatus());
    }

    /* Updating the struct command list */
    updateStructCommandList(struct_command: structCommand) {
        if (this.justReleased) {
            /* make sure that if it is a block command, nothing is broken */
            this.checkValidity();
            /* if not valid, set struct command to have error. */
        }
        /* Previous statement is extendable. */
        if (struct_command.removePreviousStatement) {
            /* join extendable speech to prev input speech */
            var extendable_speech = this.speech_hist.get_item(this.curr_index).join(" ");
            this.speech_hist.remove_item(this.curr_index, 1);
            this.speech_hist.concat_item(this.curr_index-1, extendable_speech);

            this.curr_index -= 1;
            /* Remove current "" line and prev struct command. */
            if (struct_command.isBlock) this.struct_command_list.splice(this.curr_index, 3, "");
            else this.struct_command_list.splice(this.curr_index, 2, "");
        }
        else if (struct_command.removePrevTerminator) {
            /* Remove terminator from prev index. */
            this.struct_command_list[this.curr_index - 1] = this.struct_command_list[this.curr_index - 1].replace(";;", "");
        }
        /* Command is parseable, add to struct command! */
        if (!struct_command.hasError) {
            this.curr_speech = [""] // Clear curr speech to prepare for next command.

            /* Block statement */
            if (struct_command.isBlock && !struct_command.isTry) {
                this.struct_command_list.splice(this.curr_index, 1, struct_command.parsedCommand);
                this.curr_index += 1;
                this.struct_command_list.splice(this.curr_index, 0, cursor_struct);
                this.curr_index += 1;
                this.struct_command_list.splice(this.curr_index, 0, struct_command.endCommand);
                this.curr_index -= 1; // Make sure curr_index points at the blank line.

                this.appendSpeechHist("block");
            }
            else if (struct_command.isBlock && struct_command.isTry) {
                this.struct_command_list.splice(this.curr_index, 1, "try");
                this.curr_index += 1;
                this.struct_command_list.splice(this.curr_index, 0, cursor_struct);
                this.curr_index += 1;
                this.struct_command_list.splice(this.curr_index, 0, "catch #catch_start");
                this.curr_index += 1;
                this.struct_command_list.splice(this.curr_index, 0, struct_command.endCommand);
                this.curr_index -= 2;

                this.appendSpeechHist("try");
            }
            /* Single line */
            else {
                /* Splice and delete previous (unparseable speech) */
                this.struct_command_list.splice(this.curr_index, 1, struct_command.parsedCommand)

                /* insert blank line "". Now curr_index points at blank line. */
                this.curr_index += 1 // Point at next index
                this.struct_command_list.splice(this.curr_index, 0, cursor_struct)
                this.appendSpeechHist("line");
            }
        }
        /* Not ready to parse, add normal speech to struct_command_list */
        else {
            var speech = this.curr_speech.join(" ");
            var temp = speech.split(" ");

            if (speech.includes("spell") && speech.includes("end_spell")) {
                
                var spellIdx = temp.indexOf("spell");
                var spellEndIdx = temp.indexOf("end_spell");

                speech = temp.slice(0, spellIdx).join(" ").trim() + " " + temp.slice(spellIdx + 1, spellEndIdx).join("").trim() + " " + temp.slice(spellEndIdx + 1).join(" ").trim();
                speech = speech.trim();
            }
            var commented_speech = "#string \"" + speech + "\";;"
            if (!this.holding) this.struct_command_list.splice(this.curr_index, 1, commented_speech);
            /* Display to user what the error message is. */
            vscode.window.showInformationMessage(struct_command.errorMessage);
        }
    }

    backspaceCommand(command: string) {

        /* nothing to backspace */
        if (JSON.stringify(this.curr_speech) == JSON.stringify([""])) {
            console.log("Nothing to backspace");
            return;
        }

        this.edit_stack.push(new edit_stack_item(["backspace", this.deepCopyStringList(this.curr_speech)]));

        var arr = command.split(" ");
        var num_to_delete = 0;
        /* if only "backspace" is said */
        if (arr.length == 1) num_to_delete = 1;
        else {
            var number = arr[1];
            /* check if it is parseable */
            if (!isNaN(Number(number))) num_to_delete = parseInt(arr[1]);
        }

        while (num_to_delete > 0) {
            var latest_speech_input = this.curr_speech[this.curr_speech.length-1];
            var temp = latest_speech_input.split(" ");
            var count = (temp.length-num_to_delete >= 0) ? num_to_delete: temp.length;
            temp.splice(-count,count);

            if (temp.length == 0 || temp.join(" ") == " ") this.curr_speech.splice(-1,1);
            else this.curr_speech[this.curr_speech.length-1]  = temp.join(" ");
    
            num_to_delete -= count;
        }

        if (JSON.stringify(this.curr_speech) == JSON.stringify([])) this.curr_speech = [""];  
    }

    /* look out for end branches */
    holdCommand(cleaned_speech: string, countlines: number[]) {
        var splitted_speech = cleaned_speech.split(" ");

        if (cleaned_speech == "stay") {
            /* Perform basic hold */
            this.holding = true;
            this.heldline = countlines[this.curr_index];
            this.edit_stack.push(new edit_stack_item(["stay same"]));
        }
        
        else if (cleaned_speech.startsWith("stay on line") || cleaned_speech.startsWith("stay online")) {
            var lastArg = splitted_speech[splitted_speech.length-1];

            var line = 0;
            /* If the second argument is a valid number */
            if (!isNaN(Number(lastArg))) {
                line = parseInt(lastArg);
                var struct_line = -1;
                for (var i = 0; i < countlines.length; i++) {
                    if (countlines[i] == line) {
                        struct_line = i;
                        break;
                    }
                }
                /* it is a valid line. */
                if (struct_line != -1 && struct_line < this.struct_command_list.length) {

                    if (struct_line == this.curr_index) {
                        /* Perform basic hold */
                        this.holding = true;
                        this.heldline = countlines[this.curr_index];
                        this.edit_stack.push(new edit_stack_item(["stay same"]));
                    }

                    else {
                        this.holding = true;
                        var copiedStructCommand = this.deepCopyStructCommand();
                        var copiedSpeechHist = this.deepCopySpeechHist();
                        var oldIdx = this.curr_index;
                        this.heldCommand = this.speech_hist.get_item(struct_line);
    
                        /* if hold line on different line, have to change cursor location. */
                        if (this.curr_index != struct_line) {
                            /* remove old cursor position. */
                            this.speech_hist.remove_item(this.curr_index, 1);
                            this.struct_command_list.splice(this.curr_index, 1); /* remove old cursor position */
                        }
                        /* set new curr_index and remember held command. heldline is for extension.ts */
                        this.curr_index = struct_line;
                        this.curr_speech = this.heldCommand;
                        this.heldline = line;
    
                        this.edit_stack.push(new edit_stack_item(["stay change", copiedStructCommand, copiedSpeechHist, oldIdx]));
                    }
                }
            }
        }
    }

    releaseCommand() {
        if (this.holding) {
            this.holding = false;
            this.justReleased = true;

            var copiedStructCommand = this.deepCopyStructCommand();
            var copiedSpeechHist = this.deepCopySpeechHist();
            var oldIdx = this.curr_index;
            var oldCurrSpeech = this.deepCopyStringList(this.curr_speech);
            var oldHeldCommand = this.deepCopyStringList(this.heldCommand);
            this.edit_stack.push(new edit_stack_item(["release", copiedStructCommand, copiedSpeechHist, oldIdx, oldCurrSpeech, oldHeldCommand, this.heldline]));
        }
    }

    /* check if curr speech and held command is the same block type */
    checkValidity() {
        /* to be done once backspace works */
        return true;
    }

    exitBlockCommand() {
        var check = this.checkIfCanNav();
        if (!check) return;
        /* Perform checks to see if user is within a block or not. */
        var oldIdx = this.curr_index;
        var endIdx = -1; /* Get index of end_branch */
        for (var i = this.curr_index; i < this.struct_command_list.length; i++) {
            if (end_branches.includes(this.struct_command_list[i])) {
                endIdx = i;
                break;
            }
        }
        if (endIdx != -1) {
            this.edit_stack.push(new edit_stack_item(["exit-block", String(oldIdx)]));
            this.struct_command_list.splice(this.curr_index, 1); /* Remove cursor from the struct_command_list. */
            /* note that after cursor has been removed, endIdx no longer points at end branch, but at the index
            AFTER the end branch. */
            this.struct_command_list.splice(endIdx, 0, cursor_struct); /* Add cursor after the end_branch. */
            this.curr_index = endIdx;

            this.curr_speech = [""];
            /* Update index of new item in speech_hist. When you exit block, this.curr_index changes location
            to outside the block. Further editing on this.curr_index will be on it's new location outside
            the block. Make sure future speech inputs into the speech_hist will be on the same index. */
            this.speech_hist.update_item_index(oldIdx, this.curr_index);
            this.speech_hist.update_item(oldIdx, [""])
        }
    }
    /* move up. */
    goUpCommand() {
        var check = this.checkIfCanNav();
        if (!check) return;
        /* Cant go up */
        if (0 == this.curr_index) return

        this.edit_stack.push(new edit_stack_item(["go-up"]));
        var oldIdx = this.curr_index;
        this.curr_index -= 1;
        this.curr_speech = [""];

        var endBranch = false
        if (end_branches.includes(this.struct_command_list[this.curr_index])) endBranch = true
        /* swap new curr_index and oldIdx */
        var temp = this.struct_command_list[oldIdx]
        this.struct_command_list[oldIdx] = this.struct_command_list[this.curr_index]
        this.struct_command_list[this.curr_index] = temp;

        /* If endBranch, only need to update cursor position in the speech hist */
        if (endBranch) {
            this.speech_hist.update_item_index(oldIdx, this.curr_index);
            this.speech_hist.update_item(oldIdx, [""]);
        }
        /* Else update both index */
        else {
            
            var temp_speech = this.speech_hist.get_item(this.curr_index);
            this.speech_hist.update_item(oldIdx, temp_speech);
            this.speech_hist.update_item(this.curr_index, [""]);
        }
    }

    goDownCommand() {
        var check = this.checkIfCanNav();
        if (!check) return;
        /* Cant go down */
        if (this.struct_command_list.length -1 == this.curr_index) return

        this.edit_stack.push(new edit_stack_item(["go-down"]));
        var oldIdx = this.curr_index;
        this.curr_index += 1;
        this.curr_speech = [""];
        
        var endBranch = false
        if (end_branches.includes(this.struct_command_list[this.curr_index])) endBranch = true
        /* swap new curr_index and oldIdx */
        var temp = this.struct_command_list[oldIdx]
        this.struct_command_list[oldIdx] = this.struct_command_list[this.curr_index]
        this.struct_command_list[this.curr_index] = temp;

        /* If endBranch, only need to update cursor position in the speech hist */
        if (endBranch) {
            this.speech_hist.update_item_index(oldIdx, this.curr_index);
            this.speech_hist.update_item(oldIdx, [""]);
        }
        /* Else update both index */
        else {
            var temp_speech = this.speech_hist.get_item(this.curr_index);
            this.speech_hist.update_item(oldIdx, temp_speech);
            this.speech_hist.update_item(this.curr_index, [""]);
        }
    }
    /* cursor position should be just below the end branch */
    undoExitBlock(edit_item: edit_stack_item) {
        var oldIdx = edit_item.OldIdx;

        this.struct_command_list.splice(this.curr_index, 1); /* remove cursor */
        this.struct_command_list.splice(oldIdx, 0, cursor_struct); /* Add cursor back to old location. */
        this.speech_hist.update_item_index(this.curr_index, oldIdx)
        this.curr_index = oldIdx;
        this.curr_speech = [""];
    }

    /* The undo command. */
    scratchThatCommand() {
        var edit_item = this.edit_stack.pop()
        if (edit_item != null && edit_item.type == "non-edit") {
            /* Empty speech hist */
            if (JSON.stringify(this.speech_hist) == JSON.stringify([[""]])) {
                console.log("Nothing to undo.");
                return;
            }

            /* If curr speech is empty. e.g. just enterd new line. */
            if (JSON.stringify(this.curr_speech) == JSON.stringify([""]) || JSON.stringify(this.curr_speech) == JSON.stringify([])) {
                /* Amount from the struct command list to remove. There is a difference for undoing a block command
                and a statement command as a block command also creates an additional "end_branch" struct commmand.*/
                var amountToSplice = 0;
                /* Case 1: Entered new line after finishing a block */
                // Check if there is start branch just before this one.
                if (this.struct_command_list[this.curr_index-1].split(" ").some(x=>start_branches.includes(x)))
                    amountToSplice = 3; // Remove prev statement, cursor comment and end branch.

                /* Case 2: Entered new line after finishing a statement */
                else amountToSplice = 2; // Remove prev statement and cursor comment.

                /* Remove blank item from the cursor position. Do this to prevent multiple entries
                of new speech item with the same index. */
                this.speech_hist.remove_item(this.curr_index, amountToSplice-1);

                this.curr_index -= 1;
                this.struct_command_list.splice(this.curr_index, amountToSplice, cursor_struct);

                /* If the previous struct command was created with only 1 speech input. */
                if (this.speech_hist.get_item(this.curr_index).length == 1) {
                    this.speech_hist.update_item(this.curr_index, [""]);
                }
                /* Prev structcommand created with multiple speech inputs. Remove latest segment of speech
                input and use it as curr_speech to generate new result. */
                else {
                    this.speech_hist.popFromSpeechItem(this.curr_index);
                    this.curr_speech = this.speech_hist.get_item(this.curr_index);
                }
            }
            /* User made a mistake during curr speech */
            else {
                /* Remove latest speech input. */
                if (this.speech_hist.get_item(this.curr_index).length == 1)
                    this.speech_hist.update_item(this.curr_index, [""]);
                else this.speech_hist.popFromSpeechItem(this.curr_index);
                /* Update current speech. */
                this.curr_speech = this.speech_hist.get_item(this.curr_index);

                /* Remove latest struct command. It will be updated by updateStructCommand later. */
                this.struct_command_list.splice(this.curr_index, 1, cursor_struct);
            }
            /* check if "spell" still within the curr_speech */
            if (!this.curr_speech.join(" ").includes("spell")) this.spelling = false;
        }

        /* Perform enter block */
        else if (edit_item != null && edit_item.type == "exit-block") this.undoExitBlock(edit_item);
        /* Perform go up */
        else if (edit_item != null && edit_item.type == "go-up") this.goDownCommand();
        /* Perform go down */
        else if (edit_item != null && edit_item.type == "go-down") this.goUpCommand();
        /* Perform undoing edit commands */
        else if (edit_item!=null && edit_item.type == "edit") this.undoEdit(edit_item);
        /* Perform undo of hold command */
        else if (edit_item!=null && edit_item.type == "stay same") this.undoStay();
        else if (edit_item!=null && edit_item.type == "stay change") this.undoStayChange(edit_item);
        /* Perform undo of release command */
        else if (edit_item!=null && edit_item.type == "release") this.undoRelease(edit_item);

        else if (edit_item!=null && edit_item.type == "backspace") this.undoBackspace(edit_item);
        
    }
    
    updateVariableAndFunctionList(struct_command: structCommand) {
        if (struct_command.newFunction != "") {
            if (!this.functions_list.includes(struct_command.newFunction)) {
                this.functions_list.push(struct_command.newFunction);
            }
        }
        if (struct_command.newVariable != "") {
            if (!this.variable_list.includes(struct_command.newVariable)) {
                this.variable_list.push(struct_command.newVariable);
            }
        }
    }

    /* A function to remove struct command and it's corresponding speech hist input of the same index.
    this.curr_index will also be adjusted */
    splice(start_pos: number, amt_to_remove: number) {
        console.log(start_pos + " " + amt_to_remove);

        this.curr_speech = [""];

        var copiedStructCommand = this.deepCopyStructCommand()
        var copiedSpeechHist = this.deepCopySpeechHist()
        var oldIdx = this.curr_index;

        var lostCursor = false;
        /* delete line */
        if (amt_to_remove == 1) {
            if (this.curr_index == start_pos) lostCursor = true;
            if (this.curr_index > start_pos) this.curr_index -= 1;
        }
        /* delete a chunk */
        else {
            if (this.curr_index > start_pos + amt_to_remove - 1) this.curr_index -= amt_to_remove;
            else if (this.curr_index >= start_pos && this.curr_index <= start_pos + amt_to_remove - 1) {
                this.curr_index = start_pos;
                lostCursor = true;
            }
        }
        /* Remove the speech inputs from speech hist */
        for (var i = start_pos; i < start_pos + amt_to_remove; i++) {
            this.speech_hist.remove_item(i, 1);
        }
        this.struct_command_list.splice(start_pos, amt_to_remove);

        /* Case 1: Nothing left */
        if (this.struct_command_list.length == 0) {
            this.struct_command_list = [cursor_struct];
            this.speech_hist.add_item(0, [""], 1);
        }
        /* Case 2: the line being deleted is the same as the cursor position */
        else if (lostCursor) {
            this.struct_command_list.splice(this.curr_index, 0, cursor_struct);
            this.speech_hist.add_item(this.curr_index, [""], 1);
        }
        this.edit_stack.push(new edit_stack_item(["edit", copiedStructCommand, copiedSpeechHist, oldIdx]));
    }

    undoEdit(edit_item: edit_stack_item){
        this.speech_hist = edit_item.snapshotSpeechHist;
        this.struct_command_list = edit_item.snapshotStructCommand;
        this.curr_index = edit_item.OldIdx;
    }

    undoStay() {
        this.holding = false;
        this.heldCommand = [""];
        this.heldline = 0;
    }

    undoStayChange(edit_item: edit_stack_item) {
        this.holding = false;
        this.heldCommand = [""];
        this.heldline = 0;
        this.curr_speech = [""];
        this.speech_hist = edit_item.snapshotSpeechHist;
        this.struct_command_list = edit_item.snapshotStructCommand;
        this.curr_index = edit_item.OldIdx;
    }

    undoRelease(edit_item: edit_stack_item) {
        this.holding = true;
        this.justReleased = false;
        this.heldCommand = edit_item.oldHeldCommand;
        this.heldline = edit_item.oldHeldLine;
        this.curr_speech = edit_item.oldCurrSpeech;
        this.speech_hist = edit_item.snapshotSpeechHist;
        this.struct_command_list = edit_item.snapshotStructCommand;
        this.curr_index = edit_item.OldIdx;
    }

    undoBackspace(edit_item: edit_stack_item) {
        this.curr_speech = edit_item.oldCurrSpeech;
    }

    checkIfCanNav() {
        if (this.holding || JSON.stringify(this.curr_speech) != JSON.stringify([""])) {
            vscode.window.showInformationMessage("Cannot navigate in middle of construction.");
            return false;
        }
        return true;
    }

    deepCopyStructCommand() {
        var copiedStructCommand = []
        for (var i = 0; i < this.struct_command_list.length; i++) {
            copiedStructCommand.push(this.struct_command_list[i])
        }
        return copiedStructCommand;
    }

    deepCopySpeechHist() {
        var copiedSpeechHist = new speech_hist;
        copiedSpeechHist.remove_item(0, 1);

        for (var i = 0; i < this.speech_hist.length(); i++) {
            var index = this.speech_hist.hist[i].index
            var speech = this.speech_hist.hist[i].speech_input
            copiedSpeechHist.add_item(index, speech, 1);
        }
        return copiedSpeechHist;
    }

    deepCopyStringList(stringList: string[]) {
        var copiedList = [];
        for (var i = 0; i < stringList.length; i++) {
            copiedList.push(stringList[i]);
        }

        return copiedList;
    }

    /* append speech hist every time a successful command is made. */
    appendSpeechHist(type: string) {
        if (type == "line") {
            this.speech_hist.add_item(this.curr_index, [""], 1);
        }
        /* type == block */
        else if (type == "block") {
            this.speech_hist.add_item(this.curr_index, [""], 2);
        }
        /* type == try */
        else {
            this.speech_hist.add_item(this.curr_index, [""], 3);
        }
    }

    managerStatus() {
        let toDisplay = "Current Speech: " + JSON.stringify(this.curr_speech) + '\n';
        toDisplay += "Current index: " + this.curr_index + '\n';
        toDisplay += "//////////////////////////////////Structured Command List:";
        toDisplay += "//////////////////////////////////\n";

        for (var i = 0; i < this.struct_command_list.length; i++) {
            toDisplay += "[" + i + "] " + this.struct_command_list[i] + '\n';
        }
        toDisplay += "///////////////////////////////////Speech History List:";
        toDisplay += "///////////////////////////////////\n";

        for (var i = 0; i < this.struct_command_list.length; i++) {
            if (end_branches.includes(this.struct_command_list[i])) continue
            else if (this.struct_command_list[i] == "catch #catch_start") continue
            else {
                toDisplay += "[" + i + "] " + JSON.stringify(this.speech_hist.get_item(i)) + '\n';
            }
        }
        return toDisplay;
    }
}
