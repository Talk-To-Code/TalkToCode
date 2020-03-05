import {get_struct} from './text2struct'
import { clean } from './clean_text';
import * as vscode from 'vscode';
import { structCommand } from './struct_command';

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

    /* Contains 2D list of string. Rows indicate completed struct commands. Columns indicate segments
    of speech that make up the struct command.
    Think of it as a list of instances of prev curr_speech. */
    speech_hist: string[][]

    constructor(language: string) {
        this.language = language;
        this.curr_index = 0;
        this.struct_command_list = [cursor_comment];
        this.curr_speech = [""];
        this.variable_list = [""];
        this.functions_list = [""];
        this.speech_hist = [[""]];
    }

    reset() {
        this.language = "c";
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
            this.exitBlockCommand();
        }

        /* Normal process. */
        else {
            this.curr_speech.push(cleaned_speech);
            /* Remove the "" blanks from the curr speech. */
            this.curr_speech = this.curr_speech.filter(function(value, index, arr) {
                return value != "";
            });
            this.speech_hist.splice(this.pointAtSpeech(), 1, this.curr_speech); /* Update speech hist. */
        }
        var prev_struct_command = "";
        if (this.curr_index > 0) prev_struct_command = this.struct_command_list[this.curr_index-1];
        var struct_command = get_struct(this.curr_speech, prev_struct_command);

        this.updateStructCommandList(struct_command);
        this.updateVariableAndFunctionList(struct_command);

        console.log(this.managerStatus());
    }

    /* Updating the struct command list */
    updateStructCommandList(struct_command: structCommand) {

        /* Previous statement is extendable. */
        if (struct_command.removePreviousStatement) {
            /* join extendable speech to prev input speech */
            var extendable_speech = this.speech_hist[this.pointAtSpeech()];
            this.speech_hist.splice(this.pointAtSpeech(), 1);
            this.speech_hist[this.pointAtSpeech()-1] = this.speech_hist[this.pointAtSpeech()-1].concat(extendable_speech);

            this.curr_index -= 1;
            /* Remove current "" line and prev struct command. */
            this.struct_command_list.splice(this.curr_index, 2);
            this.struct_command_list.splice(this.curr_index, 0, "");
        }
        
        else if (struct_command.removePreviousBlock) {
            /* join extendable speech to prev input speech */
            var extendable_speech = this.speech_hist[this.pointAtSpeech()];
            this.speech_hist.splice(this.curr_index, 1);
            this.speech_hist[this.pointAtSpeech()-1] = this.speech_hist[this.pointAtSpeech()-1].concat(extendable_speech);

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
            this.curr_speech = [""] // Clear curr speech to prepare for next command.
            /* Do not increment if the latest speech input in hist is empty. */
            if (JSON.stringify(this.speech_hist[this.speech_hist.length-1]) != JSON.stringify([""])) 
                this.speech_hist.push([""]);

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

            this.curr_speech = [""];
            this.speech_hist = [[""]];
        }
    }

    /* The undo command. */
    scratchThatCommand() {
        /* Empty speech hist */
        if (JSON.stringify(this.speech_hist) == JSON.stringify([[""]])) {
            console.log("Nothing to undo.");
            return;
        }

        /* If curr speech is empty. e.g. just enterd new line. */
        if (JSON.stringify(this.curr_speech) == JSON.stringify([""]) || 
        JSON.stringify(this.curr_speech) == JSON.stringify([])) {
            /* Case 1: Entered new line after finishing a block */
            // Check if there is start branch just before this one.
            if (this.struct_command_list[this.curr_index-1].split(" ").some(x=>start_branches.includes(x))) {
                console.log("case 1: entered new line after finishing block");
                this.curr_index -= 1;
                this.struct_command_list.splice(this.curr_index, 3, cursor_comment);
                
                /* If the previous struct command was created with only 1 speech input. */
                if (this.speech_hist[this.pointAtSpeech()].length == 1) {
                    this.speech_hist.splice(this.pointAtSpeech(), 2, [""]);
                }
                /* Prev structcommand created with multiple speech inputs. Remove latest segment of speech
                input and use it as curr_speech to generate new result. */
                else {
                    this.speech_hist[this.pointAtSpeech()].pop();
                    this.curr_speech = this.speech_hist[this.pointAtSpeech()];
                }
            }
            /* Case 2: Entered new line after finishing a statement */
            else {
                console.log("case 2: entered new line after finishing statement");
                this.curr_index = this.curr_index - 1; // Bring the cursor back.
                this.struct_command_list.splice(this.curr_index, 2, cursor_comment);

                /* If the previous struct command was created with only 1 speech input. */
                if (this.speech_hist[this.pointAtSpeech()].length == 1) {
                    this.speech_hist.splice(this.pointAtSpeech(), 2, [""]);
                }
                /* Prev structcommand created with multiple speech inputs. Remove latest segment of speech
                input and use it as curr_speech to generate new result. */
                else {
                    this.speech_hist[this.pointAtSpeech()].pop();
                    this.curr_speech = this.speech_hist[this.pointAtSpeech()];
                }
            }
        }
        /* User made a mistake during curr speech */
        else {
            console.log("user made a mistake during curr speech");
            /* Remove latest speech input. */
            if (this.speech_hist[this.pointAtSpeech()].length == 1) 
                this.speech_hist[this.pointAtSpeech()] = [""];
            else this.speech_hist[this.pointAtSpeech()].pop();
            /* Update current speech. */
            this.curr_speech = this.speech_hist[this.pointAtSpeech()];

            /* Remove latest struct command. It will be updated by updateStructCommand later. */
            this.struct_command_list.splice(this.curr_index, 1, cursor_comment);
        }   
    }

    /* Map curr_index to point at correct point at speech hist. */
    pointAtSpeech() {
        /* Logic is that they are the same, but remove end branches */
        var numEndBranches = 0;
        for (var i = 0; i <= this.curr_index; i++) {
            if (end_branches.includes(this.struct_command_list[i])) numEndBranches += 1;
            // else if (this.struct_command_list[i] == cursor_comment) numEndBranches += 1;
        }
        return this.curr_index - numEndBranches;
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

        for (var i = 0; i < this.speech_hist.length; i++) {
            toDisplay += "[" + i + "] " + JSON.stringify(this.speech_hist[i]) + '\n';
        }

        return toDisplay;
    }
}
