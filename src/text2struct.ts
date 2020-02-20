import { segment_command } from './segmenter'
import { structCommand } from './struct_command';


var end_branches = ["#if_branch_end;;", "#else_branch_end;;", "#for_end;;", "#while_end;;", "#case_end;;", 
                    "#function_end;;", "#if_branch_end", "#else_branch_end", "#for_end", "#while_end", 
                    "#case_end", "#function_end"];

/*     

@ Parameters - list of commands, variable list

list of commands
    list of commands the user has spoken. For e.g. ['declare', 'int', 'hello']

variable list
    list of variable already declared

is_extendable
    boolean value to indicate that the 2 items in the text_segment have a possibility to be combined.

prev_command
    string value of prev struct command. Useful for determining if the block command being created is legal.
    For e.g. Else block can on be created if prev_command is "#if_branch_end"

@ Returns the structCommand obj*/
export function get_struct(text_segment: string[], var_list: string[], is_extendable: boolean, prev_command: string) {

    var text = ""
    var go_ahead = false
    /* For now only declare statements are extendable.
    for now only checks if next text segment contains equal. By right should check if first word of next
    segment contains equal. */
    if (is_extendable) {
        
        if (text_segment.length < 2) console.log("ERROR. Extendable case, but text segment less than length 2.")

        /* extendable! */
        if (text_segment[1].includes("equal")) text = text_segment.join(" ");
        /* Not extendable :( */
        else {
            go_ahead = true
            text = text_segment[1];
        }
    }
    /* Just a normal case. */
    else text = text_segment.join(" ");
    text = replace_infix_operators(text);

    console.log("text going in: " + text)

    var struct_command = segment_command(text, var_list);

    console.log("segmented results: " + struct_command.parsedCommand);
    
    if (struct_command.hasError) return struct_command;
    struct_command.go_ahead = go_ahead;

    struct_command.removePrevTerminator = checkPrevBlock(struct_command, prev_command);
    return struct_command;
}

/* If the input speech is meant to be an if/loop block */
function replace_infix_operators(text: string) {
    if (text.includes("begin if") || text.includes("begin loop") ||text.includes("while")) {
        text = text.replace(/greater than/g, '>');
        text = text.replace(/greater than equal/g, '>=');
        text = text.replace(/less than/g, '<');
        text = text.replace(/less than equal/g, '<=');
        text = text.replace(/not equal/g, '!=');
        text = text.replace(/equal/g, '==');
        text = text.replace("plus plus", "++");
    }
    return text;
}

/* check if current struct command is an extendable block of the prev block. */
function checkPrevBlock(struct_command: structCommand, prev_command: string) {

    if (!end_branches.includes(prev_command)) return false;

    if (prev_command == "#if_branch_end;;" && struct_command.isElse) return true;
    if (prev_command == "#case_end;;" && struct_command.isCase) {
        console.log("i should be here")
        return true;
    }

    else return false;
}