import {get_struct} from './text2struct'
import { clean } from './clean_text';
import * as vscode from 'vscode';
import { structCommand } from './struct_command';

var end_branches = ["#if_branch_end;;", "#else_branch_end;;", "#for_end;;", "#while_end;;", "#case_end;;", 
                    "#function_end;;", "#if_branch_end", "#else_branch_end", "#for_end", "#while_end", 
                    "#case_end", "#function_end"];

export class StructCommandManager {

    /* List of structure commands. Used to feed into the AST */
    struct_command_list: string[]
    /* List of variables declared by the user */
    variable_list: string[]
    /* current index within the struct_command_list - helpful for:
        - determining where to splice new struct commands into the struct command list.
        - for extendable commands. whether to splice and replace/extend extendable command or go ahead to
          next command. */
    curr_index: number
    /* current command the user is saying. Stored in a list of string. e.g. ["declare", "integer", "hello"]*/
    curr_speech: string[]

    /* If the command is extendable. e.g. "declare integer hello", can be extended with "equals 5" */
    extendable: boolean

    /* Contains 2D list of string. Rows indicate completed struct commands. Columns indicate segments
    of speech that make up the struct command. Uses curr_index as well to splice speech segments.
    Think of it as a list of instances of prev curr_speech. */
    speech_hist: string[][]

    constructor() {
        this.curr_index = 0;
        this.struct_command_list = [""];
        this.curr_speech = [""];
        this.variable_list = [""];
        this.extendable = false;
        this.speech_hist = [[""]];
    }

    reset() {
        this.curr_index = 0;
        this.struct_command_list = [""];
        this.curr_speech = [""];
        this.variable_list = [""];
        this.extendable = false;
        this.speech_hist = [[""]];
    }

    parse_speech(transcribed_word: string) {
        console.log("####################### NEXT COMMAND #######################");
        var cleaned_speech = clean(transcribed_word);

        /* Check if it is undo command */
        if (cleaned_speech == "scratch that") {
            /* If curr speech is not empty */
            if (this.curr_speech.length > 0 && this.curr_speech[0] != "") {
                /* Update speech hist and curr speech, remove latest speech segment. */
                this.speech_hist[this.curr_index].pop()
                this.curr_speech = this.speech_hist[this.curr_index]
                /* Remove latest struct command. It will be updated by updateStructCommand later. */
                this.struct_command_list.splice(this.curr_index, 1, "")

                /* extendable will be false, updateSructCommand will regenerate anyway. */
                this.extendable = false
            }
            /* If curr speech is empty. e.g. just enterd new line or beginning of code. */
            else {
                /* If it is just the beginning of the code */
                if (this.speech_hist.length == 0) console.log("Nothing to undo.")

                /* If user has just entered a new line */
                else {
                    this.curr_index -= 1
                    /* Update speech hist and curr speech, remove latest speech segment. */
                    this.speech_hist[this.curr_index].pop()
                    this.curr_speech = this.speech_hist[this.curr_index]
                    /* Remove latest struct command. It will be updated by updateStructCommand later. */
                    this.struct_command_list.splice(this.curr_index, 1, "")
                }
            }
        }

        else if (cleaned_speech == "step out") {
            this.curr_speech = [""]; // Not sure if this is right. But just keep it here for now.
            this.stepOutCommand();
        }

        /* Normal process. */
        else {
            this.curr_speech.push(cleaned_speech);
            /* Remove the "" blanks from the curr speech. */
            this.curr_speech = this.curr_speech.filter(function(value, index, arr) {
                return value != "";
            });
            /* Update speech hist. */
            this.speech_hist.splice(this.curr_index, 1, this.curr_speech);
        }
        var prev_struct_command = "";
        if (this.curr_index > 0) prev_struct_command = this.struct_command_list[this.curr_index-1];
        var struct_command = get_struct(this.curr_speech, this.variable_list, this.extendable, prev_struct_command);

        this.updateStructCommandList(struct_command);

        console.log("speech hist: ")
        console.log(this.speech_hist)
        console.log("command struct list:")
        console.log(this.struct_command_list)
    }

    /* Updating the struct command list */
    updateStructCommandList(struct_command: structCommand) {

        /* Check if go ahead - Basically, the latest input speech is confirmed to not be related to the
        previous extendable command. We can go ahead and increase curr_index and remove the previous 
        extentable command from the curr_speech. 

        * NOTE that the extendable command is already in the struct command list. *

        curr_index should point at the chunk of speech that we have confirmed to not be related to prev
        command. */
        if (struct_command.go_ahead) {
            this.curr_index += 1
            this.curr_speech.shift() // 
            this.struct_command_list.splice(this.curr_index, 0, this.curr_speech.join(" "))
            this.extendable = false;
        }

        if (struct_command.removePrevTerminator) {
            var prev_index = this.curr_index - 1;
            /* Remove terminator. */
            this.struct_command_list[prev_index] = this.struct_command_list[prev_index].replace(";;", "");
        }

        /* Command is parseable, add to struct command! */
        if (!struct_command.hasError) {
            /* Block statement */
            if (struct_command.isBlock) {
                this.struct_command_list.splice(this.curr_index, 1, struct_command.parsedCommand)
                this.curr_index += 1
                this.struct_command_list.splice(this.curr_index, 0, "")
                this.curr_index += 1
                this.struct_command_list.splice(this.curr_index, 0, struct_command.endCommand)
                this.curr_index -= 1 // Make sure curr_index points at the blank line.

                this.curr_speech = [""] // Clear curr speech to prepare for next command
            }
    
            /* Single line */
            else {

                /* Splice and delete previous (unparseable speech) or (extendable command). */
                this.struct_command_list.splice(this.curr_index, 1, struct_command.parsedCommand)

                /* If new_line is true, insert blank line "". Now curr_index points at blank line. */
                if (struct_command.newline) {
                    this.curr_speech = [""] // Clear curr speech to prepare for next command
                    
                    this.curr_index += 1 // Point at next index
                    this.struct_command_list.splice(this.curr_index, 0, "") // Insert blank line "".
                }

                this.extendable = struct_command.extendable

                /* Combine the extendable message into 1 */
                if (this.extendable) {
                    this.curr_speech = [this.curr_speech.join(" ")]
                }
            }
        }
        /* Not ready to parse, add normal speech to struct_command_list */
        else {
            var speech = this.curr_speech.join(" ")
            this.struct_command_list.splice(this.curr_index, 1, speech)
            /* Display to user what the error message is. */
            vscode.window.showInformationMessage(struct_command.errorMessage);
            /* I'm not sure if extendable should be false here. But keep it here for now. */
            this.extendable = false
        }

        // this.concatVariableList(struct_command[1]);
    }

    /* Jump out of whatever block the user is editing in. 
    Edit the curr_index and the struct_command_list. */
    /* Right now assume that the curr index is pointing to "". */
    stepOutCommand() {
        /* Perform checks to see if user is within a block or not. */
        /* Get index of end_branch */
        var endIdx = -1;
        for (var i = this.curr_index; i < this.struct_command_list.length; i++) {
            if (end_branches.includes(this.struct_command_list[i])) {
                endIdx = i;
                break;
            }
        }
        if (endIdx != -1) {
            this.struct_command_list.splice(this.curr_index, 1); /* Remove "" from the struct_command_list. */
            /* note that after "" has been removed, endIdx no longer points at end branch, but at the index
            AFTER the end branch. */
            this.struct_command_list.splice(endIdx, 0, ""); /* Add "" after the end_branch. */
            this.curr_index = endIdx;
        }
    }
    
    concatVariableList(var_list: any) {
        if (var_list.length > 0) {
            let i;
            for (i = 0; i < var_list.length; i++) {
                if (var_list[i].length > 0 && !this.variable_list.includes(var_list[i])) {
                    this.variable_list.push(var_list[i]);
                }
            }
        }
    }
}
