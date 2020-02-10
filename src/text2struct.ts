import { segment_command } from './segmenter'
/*     

@ Parameters - list of commands, variable list

list of commands
    list of commands the user has spoken. For e.g. ['declare', 'int', 'hello']

variable list
    list of variable already declared

@ Returns the structCommand obj*/
export function get_struct(text_segment: string[], var_list: string[], is_extendable: boolean) {

    var text = ""
    var go_ahead = false
    /* For now only assign statements are extendable.
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

    /* E.g. ['declare', 'int', 'first', 'equal', '10'] */
    var struct_command = segment_command(text, var_list);

    console.log("segmented results: " + struct_command.parsedCommand);
    
    if (struct_command.hasError) return struct_command;
    
    struct_command.go_ahead = go_ahead;

    return struct_command;
}

/* If the input speech is meant to be an if/loop block */
function replace_infix_operators(text: string) {
    if (text.includes("begin") || text.includes("while")) {
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