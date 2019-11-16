import {get_struct} from './text2struct'
import { clean } from './clean_text';


export class StructCommandManager {

    struct_command_list: string[]
    variable_list: string[]
    curr_index: number
    curr_speech: string[]
    extendable: boolean

    constructor() {
        this.curr_index = 0
        this.struct_command_list = [""]
        this.curr_speech = [""]
        this.variable_list = [""]
        this.extendable = false
    }

    parse_speech(transcribed_word: string) {

        var cleaned_speech = clean(transcribed_word);

        this.curr_speech.push(cleaned_speech)

        /* Remove the "" blanks from the curr speech. */
        this.curr_speech = this.curr_speech.filter(function(value, index, arr){
            return value != "";
        });

        var struct_command = get_struct(this.curr_speech, this.variable_list, this.extendable);

        this.updateStructCommandList(struct_command)
    }

    updateStructCommandList(struct_command: any[] | (boolean | string[])[]) {

        /* Check if go ahead - Basically, the index can be increased and the current speech no longer
        includes the previous extendable speech. */
        if (struct_command[2][2]) {
            this.curr_index += 1
            this.curr_speech.shift()
            this.struct_command_list.splice(this.curr_index, 0, this.curr_speech.join(" "))
            this.extendable = false;
        }


        /* Add to struct_command_list */
        if (struct_command[0][0] != "Not ready") {

            /* Block statement */
            if (struct_command[0].length > 1) {
                this.struct_command_list.splice(this.curr_index, 1, struct_command[0][0])
                this.curr_index += 1
                this.struct_command_list.push("")
                this.curr_index += 1
                this.struct_command_list.splice(this.curr_index, 0, struct_command[0][1])
                this.curr_index -= 1 // Point to middle of block statement

                this.curr_speech = [""]
            }
    
            /* Single line */
            else {

                this.struct_command_list.splice(this.curr_index, 1, struct_command[0][0])

                /* If new_line is true, current speech is blank */
                if (struct_command[2][0]) {
                    this.curr_index += 1
                    this.curr_speech = [""]
                    this.struct_command_list.splice(this.curr_index, 0, "")
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
            
            /* No longer extendable. */
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
