import {get_struct} from './text2struct'
import { clean } from './clean_text';
import * as vscode from 'vscode';
import { structCommand, speech_hist, edit_stack_item } from './struct_command';
import { start } from 'repl';

var end_branches = ["#if_branch_end;;", "#else_branch_end;;", "#for_end;;", "#while_end;;", "#case_end;;", 
                    "#function_end;;", "#if_branch_end", "#else_branch_end", "#for_end", "#while_end", 
                    "#case_end", "#function_end"];

var start_branches = ["#if_branch_start", "#else_branch_start", "#for_start", "#while_start", "#case_start", 
                    "#function_start"]

var cursor_comment = "#comment #value \" cursor here \";; #comment_end;;"

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

    constructor(language: string) {
        this.language = language;
        this.curr_index = 0;
        this.struct_command_list = [cursor_comment];
        this.curr_speech = [""];
        this.variable_list = [""];
        this.functions_list = [""];
        this.speech_hist = new speech_hist();
        this.edit_stack = []
    }

    reset() {
        this.curr_index = 0;
        this.struct_command_list = [cursor_comment];
        this.curr_speech = [""];
        this.variable_list = [""];
        this.functions_list = [""];
        this.speech_hist = new speech_hist();
        this.edit_stack = []
    }

    parse_speech(transcribed_word: string) {
        console.log("####################### NEXT COMMAND #######################");
        var cleaned_speech = clean(transcribed_word);
        /* Check if it is undo command */
        if (cleaned_speech == "scratch that" || cleaned_speech == "go back") {
            this.scratchThatCommand();
        }

        else if (cleaned_speech == "exit block") this.exitBlockCommand();

        else if (cleaned_speech == "go down") this.goDownCommand();

        else if (cleaned_speech == "go up") this.goUpCommand();

        /* Normal process. */
        else {
            this.edit_stack.push(new edit_stack_item("non-edit"))
            this.curr_speech.push(cleaned_speech);
            /* Remove the "" blanks from the curr speech. */
            this.curr_speech = this.curr_speech.filter(function(value, index, arr) {
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
        var struct_command = get_struct(this.curr_speech, prev_input_speech, prev_struct_command, this.language);

        this.updateStructCommandList(struct_command);
        this.updateVariableAndFunctionList(struct_command);
    }

    /* Updating the struct command list */
    updateStructCommandList(struct_command: structCommand) {
        /* Previous statement is extendable. */
        if (struct_command.removePreviousStatement) {
            /* join extendable speech to prev input speech */
            var extendable_speech = this.speech_hist.get_item(this.curr_index).join(" ");
            this.speech_hist.remove_item(this.curr_index);
            this.speech_hist.concat_item(this.curr_index-1, extendable_speech);

            this.curr_index -= 1;
            /* Remove current "" line and prev struct command. */
            this.struct_command_list.splice(this.curr_index, 2, "");
        }
        /* Previous block is extendable */
        else if (struct_command.removePreviousBlock) {
            /* join extendable speech to prev input speech */
            var extendable_speech = this.speech_hist.get_item(this.curr_index).join(" ");
            this.speech_hist.remove_item(this.curr_index);
            this.speech_hist.concat_item(this.curr_index-1, extendable_speech);

            this.curr_index -= 1;
            /* Remove current "" line and prev struct command. */
            this.struct_command_list.splice(this.curr_index, 3, "");
        }

        else if (struct_command.removePrevTerminator) {
            /* Remove terminator from prev index. */
            this.struct_command_list[this.curr_index - 1] = this.struct_command_list[this.curr_index - 1].replace(";;", "");
        }

        /* Command is parseable, add to struct command! */
        if (!struct_command.hasError) {
            this.curr_speech = [""] // Clear curr speech to prepare for next command.

            /* Block statement */
            if (struct_command.isBlock) {
                this.struct_command_list.splice(this.curr_index, 1, struct_command.parsedCommand)
                this.curr_index += 1
                this.struct_command_list.splice(this.curr_index, 0, cursor_comment)
                this.curr_index += 1
                this.struct_command_list.splice(this.curr_index, 0, struct_command.endCommand)
                this.curr_index -= 1 // Make sure curr_index points at the blank line.

                this.appendSpeechHist("block")
            }
            /* Single line */
            else {
                /* Splice and delete previous (unparseable speech) */
                this.struct_command_list.splice(this.curr_index, 1, struct_command.parsedCommand)

                /* insert blank line "". Now curr_index points at blank line. */
                this.curr_index += 1 // Point at next index
                this.struct_command_list.splice(this.curr_index, 0, cursor_comment)
                this.appendSpeechHist("line")
            }
        }
        /* Not ready to parse, add normal speech to struct_command_list */
        else {
            var speech = this.curr_speech.join(" ")
            var commented_speech = "#comment #value \"" + speech + "\";; #comment_end;;"
            this.struct_command_list.splice(this.curr_index, 1, commented_speech);
            /* Display to user what the error message is. */
            vscode.window.showInformationMessage(struct_command.errorMessage);
        }
    }

    exitBlockCommand() {
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
            this.struct_command_list.splice(this.curr_index, 1); /* Remove cursor from the struct_command_list. */
            /* note that after cursor has been removed, endIdx no longer points at end branch, but at the index
            AFTER the end branch. */
            this.struct_command_list.splice(endIdx, 0, cursor_comment); /* Add cursor after the end_branch. */
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
        /* Cant go up */
        if (0 == this.curr_index) return
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
            console.log("should not be here")
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
        /* Cant go down */
        if (this.struct_command_list.length -1 == this.curr_index) return

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

    undoExitBlock(edit_item: edit_stack_item) {

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
                /* Remove blank item from the cursor position. Do this to prevent multiple entries
                of new speech item with the same index. */
                this.speech_hist.remove_item(this.curr_index);

                /* Amount from the struct command list to remove. There is a difference for undoing a block command
                and a statement command as a block command also creates an additional "end_branch" struct commmand.*/
                var amountToSplice = 0;

                /* Case 1: Entered new line after finishing a block */
                // Check if there is start branch just before this one.
                if (this.struct_command_list[this.curr_index-1].split(" ").some(x=>start_branches.includes(x)))
                    amountToSplice = 3; // Remove prev statement, cursor comment and end branch.

                /* Case 2: Entered new line after finishing a statement */
                else amountToSplice = 2; // Remove prev statement and cursor comment.

                this.curr_index -= 1;
                this.struct_command_list.splice(this.curr_index, amountToSplice, cursor_comment);

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
                console.log("user made a mistake during curr speech");
                /* Remove latest speech input. */
                if (this.speech_hist.get_item(this.curr_index).length == 1) 
                    this.speech_hist.update_item(this.curr_index, [""]);
                else this.speech_hist.popFromSpeechItem(this.curr_index);
                /* Update current speech. */
                this.curr_speech = this.speech_hist.get_item(this.curr_index);

                /* Remove latest struct command. It will be updated by updateStructCommand later. */
                this.struct_command_list.splice(this.curr_index, 1, cursor_comment);
            }   
        }

        /* Perform enter block */
        else if (edit_item != null && edit_item.type == "exit-block") {

        }
        
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
        console.log(start_pos + " " + amt_to_remove)
        if (this.curr_index < amt_to_remove) this.curr_index = start_pos
        else this.curr_index -= amt_to_remove;

        /* Remove the speech inputs from speech hist */
        for (var i = start_pos; i < start_pos + amt_to_remove; i++) {
            this.speech_hist.remove_item(i)          
        }
        /* Update the index for the speech_hist */
        for (var i = start_pos + amt_to_remove; i < this.struct_command_list.length; i++) {
            if (end_branches.includes(this.struct_command_list[i])) continue
            else this.speech_hist.update_item_index(i, i - amt_to_remove);
        }
        this.struct_command_list.splice(start_pos, amt_to_remove);

        /* If cursor is within block of code being deleted. */

        /* Case 1: Nothing left */
        if (this.struct_command_list.length == 0) {
            this.struct_command_list = [cursor_comment];
            this.speech_hist.add_item(0, [""]);
        }
    }

    /* append speech hist every time a successful command is made. */
    appendSpeechHist(type: string) {
        console.log(this.speech_hist.hist)
        if (type == "line") {
            /* check if anymore commands below this one. Have to correct their index values.
            Have to start from the end. */
            for (var i = this.struct_command_list.length-2; i >= this.curr_index; i--) {
                console.log(i)
                this.speech_hist.update_item_index(i, i + 1)
            }
            this.speech_hist.add_item(this.curr_index, [""]);
        }
        /* type == block */
        else {
            /* check if anymore commands below this one. Have to correct their index values.
            Have to start from the end. */
            for (var i = this.struct_command_list.length-2; i >= this.curr_index; i--) {
                console.log(i)
                this.speech_hist.update_item_index(i, i + 2)
            }
            this.speech_hist.add_item(this.curr_index, [""]);
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
            else {
                toDisplay += "[" + i + "] " + JSON.stringify(this.speech_hist.get_item(i)) + '\n';
            }
        }
        return toDisplay;
    }
}
