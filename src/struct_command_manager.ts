import {get_struct} from './text2struct'
import { clean } from './clean_text';
import * as vscode from 'vscode';


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
    Think of it as a list of prev curr_speech instances. */
    speech_hist: string[][]

    constructor() {
        this.curr_index = 0
        this.struct_command_list = [""]
        this.curr_speech = [""]
        this.variable_list = [""]
        this.extendable = false
        this.speech_hist = [[""]]
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
                console.log("im here")
                /* If it is just the beginning of the code */
                if (this.speech_hist.length == 0) console.log("Nothing to undo.")

                /* If user has just entered a new line */
                else {
                    console.log(this.curr_index)
                    this.curr_index -= 1
                    /* Update speech hist and curr speech, remove latest speech segment. */
                    this.speech_hist[this.curr_index].pop()
                    this.curr_speech = this.speech_hist[this.curr_index]
                    /* Remove latest struct command. It will be updated by updateStructCommand later. */
                    this.struct_command_list.splice(this.curr_index, 1, "")
                }

            }
        }

        /* Normal process. */
        else {
            this.curr_speech.push(cleaned_speech);
            /* Remove the "" blanks from the curr speech. */
            this.curr_speech = this.curr_speech.filter(function(value, index, arr){
                return value != "";
            });
            /* Update speech hist. */
            this.speech_hist.splice(this.curr_index, 1, this.curr_speech);
        }

        console.log("speech hist: ")
        console.log(this.speech_hist)
        console.log("curr speech:")
        console.log(this.curr_speech)
        var struct_command = get_struct(this.curr_speech, this.variable_list, this.extendable);
        this.updateStructCommandList(struct_command);
    }

    /* Updating the struct command list */
    updateStructCommandList(struct_command: any[] | (boolean | string[])[]) {

        /* Check if go ahead - Basically, the latest input speech is confirmed to not be related to the
        previous extendable command. We can go ahead and increase curr_index and remove the previous 
        extentable command from the curr_speech. 

        * NOTE that the extendable command is already in the struct command list. *

        curr_index should point at the chunk of speech that we have confirmed to not be related to prev
        command. */
        if (struct_command[2][2]) {
            this.curr_index += 1
            this.curr_speech.shift()
            this.struct_command_list.splice(this.curr_index, 0, this.curr_speech.join(" "))
            this.extendable = false;
        }

        /* Command is parseable, add to struct command! */
        if (struct_command[0][0] != "Not ready") {

            /* Block statement */
            if (struct_command[0].length > 1) {
                this.struct_command_list.splice(this.curr_index, 1, struct_command[0][0])
                this.curr_index += 1
                this.struct_command_list.push("") // Blank line for the curr_index to point at later.
                this.curr_index += 1
                this.struct_command_list.splice(this.curr_index, 0, struct_command[0][1])
                this.curr_index -= 1 // Make sure curr_index points at the blank line.

                this.curr_speech = [""] // Clear curr speech to prepare for next command
            }
    
            /* Single line */
            else {

                /* Splice and delete previous (unparseable speech) or (extendable command). */
                this.struct_command_list.splice(this.curr_index, 1, struct_command[0][0])

                /* If new_line is true, insert blank line "". Now curr_index points at blank line. */
                if (struct_command[2][0]) {
                    this.curr_speech = [""] // Clear curr speech to prepare for next command
                    
                    this.curr_index += 1 // Point at next index
                    this.struct_command_list.splice(this.curr_index, 0, "") // Insert blank line "".
                }

                this.extendable = struct_command[2][1]

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
            vscode.window.showInformationMessage(struct_command[0][1]);
            /* I'm not sure if extendable should be false here. But keep it here for now. */
            this.extendable = false
        }

        this.concatVariableList(struct_command[1]);
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
