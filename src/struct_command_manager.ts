import {get_struct} from './text2struct'
import { clean } from './clean_text';
import * as vscode from 'vscode';
import { structCommand } from './struct_command';

var end_branches = ["#if_branch_end;;", "#else_branch_end;;", "#for_end;;", "#while_end;;", "#case_end;;", 
                    "#function_end;;", "#if_branch_end", "#else_branch_end", "#for_end", "#while_end", 
                    "#case_end", "#function_end"];

var cursor_comment = "#comment #value \" cursor here \";; #comment_end;;"

export class StructCommandManager {

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

    /* Contains 2D list of string. Rows indicate completed struct commands. Columns indicate segments
    of speech that make up the struct command.
    Think of it as a list of instances of prev curr_speech. */
    speech_hist: string[][]

    constructor() {
        this.curr_index = 0;
        this.struct_command_list = [cursor_comment];
        this.curr_speech = [""];
        this.variable_list = [""];
        this.functions_list = [""];
        this.speech_hist = [[""]];
    }

    reset() {
        this.curr_index = 0;
        this.struct_command_list = [cursor_comment];
        this.curr_speech = [""];
        this.variable_list = [""];
        this.functions_list = [""];
        this.speech_hist = [[""]];
    }

    parse_speech(transcribed_word: string) {
        console.log("####################### NEXT COMMAND #######################");
        var cleaned_speech = clean(transcribed_word);

        /* Check if it is undo command */
        if (cleaned_speech == "scratch that") {
            this.scratchThatCommand();
        }

        else if (cleaned_speech == "exit block") {
            this.curr_speech = [""]; // Not sure if this is right. But just keep it here for now.
            this.exitBlockCommand();
        }

        /* Normal process. */
        else {
            this.curr_speech.push(cleaned_speech);
            /* Remove the "" blanks from the curr speech. */
            this.curr_speech = this.curr_speech.filter(function(value, index, arr) {
                return value != "";
            });            
            this.speech_hist.splice(this.curr_index, 1, this.curr_speech); /* Update speech hist. */
        }
        var prev_struct_command = "";
        if (this.curr_index > 0) prev_struct_command = this.struct_command_list[this.curr_index-1];
        var struct_command = get_struct(this.curr_speech, prev_struct_command);

        this.updateStructCommandList(struct_command);
        this.updateVariableAndFunctionList(struct_command);
    }

    /* Updating the struct command list */
    updateStructCommandList(struct_command: structCommand) {

        /* Previous statement is extendable. */
        if (struct_command.removePreviousStatement) {
            /* join extendable speech to prev input speech */
            var extendable_speech = this.speech_hist[this.curr_index][0];
            this.speech_hist.splice(this.curr_index, 1);
            this.speech_hist[this.curr_index-1].push(extendable_speech);

            this.curr_index -= 1;
            /* Remove current "" line and prev struct command. */
            this.struct_command_list.splice(this.curr_index, 2);
            this.struct_command_list.splice(this.curr_index, 0, "");
        }
        
        else if (struct_command.removePreviousBlock) {
            /* join extendable speech to prev input speech */
            var extendable_speech = this.speech_hist[this.curr_index][0];
            this.speech_hist.splice(this.curr_index, 1);
            this.speech_hist[this.curr_index-1].push(extendable_speech);

            this.curr_index -= 1;
            /* Remove current "" line and prev struct command. */
            this.struct_command_list.splice(this.curr_index, 3);
            this.struct_command_list.splice(this.curr_index, 0, "");
        }

        else if (struct_command.removePrevTerminator) {
            var prev_index = this.curr_index - 1;
            /* Remove terminator. */
            this.struct_command_list[prev_index] = this.struct_command_list[prev_index].replace(";;", "");
        }

        /* Command is parseable, add to struct command! */
        if (!struct_command.hasError) {
            this.curr_speech = [""] // Clear curr speech to prepare for next command

            /* Block statement */
            if (struct_command.isBlock) {
                this.struct_command_list.splice(this.curr_index, 1, struct_command.parsedCommand)
                this.curr_index += 1
                this.struct_command_list.splice(this.curr_index, 0, cursor_comment)
                this.curr_index += 1
                this.struct_command_list.splice(this.curr_index, 0, struct_command.endCommand)
                this.curr_index -= 1 // Make sure curr_index points at the blank line.
            }
            /* Single line */
            else {
                /* Splice and delete previous (unparseable speech) */
                this.struct_command_list.splice(this.curr_index, 1, struct_command.parsedCommand)

                /* insert blank line "". Now curr_index points at blank line. */
                this.curr_index += 1 // Point at next index
                this.struct_command_list.splice(this.curr_index, 0, cursor_comment)
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

    /* Jump out of whatever block the user is editing in. Edit the curr_index and the struct_command_list. */
    /* Assume that the curr index is pointing to the cursor. */
    exitBlockCommand() {
        /* Perform checks to see if user is within a block or not. */
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
        }
    }

    /* The undo command. */
    scratchThatCommand() {
        console.log("speech hist length: " + this.speech_hist.length);
        if (this.speech_hist.length == 1 && JSON.stringify(this.speech_hist[0]) == JSON.stringify([""]) ||
        JSON.stringify(this.speech_hist[0]) == JSON.stringify([])) {
            console.log("Nothing to undo.");
            return;
        }
        /* If curr speech is empty. e.g. just enterd new line. */
        if (JSON.stringify(this.curr_speech) == JSON.stringify([""]) || 
        JSON.stringify(this.curr_speech) == JSON.stringify([])) {
            console.log("undo after entering new line");
            /* Case 1: Entered new line after finishing a block */
            // Check if there is an end_block after curr_index
            if (this.struct_command_list.length -1 > this.curr_index && 
                end_branches.includes(this.struct_command_list[this.curr_index+1])) {
                console.log("case 1");
                this.curr_index -= 1;
                this.struct_command_list.splice(this.curr_index, 3, cursor_comment);
                this.speech_hist[this.curr_index].pop();
                this.curr_speech = this.speech_hist[this.curr_index];
            }
            /* Case 2: Entered new line after finishing a statement */
            else {
                console.log("case 2");
                this.curr_index = this.curr_index - 1;
                this.struct_command_list.splice(this.curr_index, 2, cursor_comment);
                this.curr_speech = this.speech_hist[this.curr_index];
                this.curr_speech.pop();
                this.speech_hist.splice(this.curr_index, 1, this.curr_speech);
            }
        }
        /* User made a mistake during curr speech */
        else {
            console.log("user made a mistake during curr speech")
            /* Update speech hist and curr speech, remove latest speech segment. */
            this.speech_hist[this.curr_index].pop();
            this.curr_speech = this.speech_hist[this.curr_index];

            /* Remove latest struct command. It will be updated by updateStructCommand later. */
            this.struct_command_list.splice(this.curr_index, 1, cursor_comment);
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
}
