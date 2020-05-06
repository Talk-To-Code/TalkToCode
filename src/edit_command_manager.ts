import { StructCommandManager } from "./struct_command_manager";
import * as vscode from 'vscode';
import { edit_stack_item } from "./struct_command";


var insert_cursor = "#string \"\";;";
var start_comment = "#comment ";
var end_comment= " #comment_end;;";

export class EditCommandManager {
    /* Manager to access the structured command list and the current index of the code */
    manager: StructCommandManager
    /* Line counts to track what lines of the code correspond to the indices in struct command list */
    line_counts: number[]
    /* A buffer to save the line(s) copied or cut by the user to be used for pasting */
    cut_copy_struct_buffer: string[]

    speech_counts: number[]

    constructor(manager: StructCommandManager, line_counts: number[], speech_counts: number[]) {
        this.manager = manager;
        this.line_counts = line_counts;
        this.cut_copy_struct_buffer = [""];
        this.speech_counts = speech_counts;
    }

    checkAll(transcribedWord: String, line_counts: number[]){
        this.line_counts  = line_counts;
        transcribedWord = transcribedWord.toLowerCase();
        this.check_if_delete_line(transcribedWord);
        this.check_if_delete_function(transcribedWord);
        this.check_if_delete_block(transcribedWord);
        this.check_if_comment_line(transcribedWord);
        this.check_if_comment_block(transcribedWord);
        this.check_if_rename_function(transcribedWord);
        this.check_if_rename_variable(transcribedWord);
        this.check_if_cut_block(transcribedWord);
        this.check_if_cut_line(transcribedWord);
        this.check_if_copy_line(transcribedWord);
        this.check_if_copy_block(transcribedWord);
        this.check_if_paste_above_or_below_line(transcribedWord);
        this.check_if_insert_before_line(transcribedWord);
        this.check_if_insert_before_block(transcribedWord);
        this.check_if_uncomment_line(transcribedWord);
        this.check_if_uncomment_block(transcribedWord);
        this.check_if_search_and_replace(transcribedWord);
        this.check_if_typecast_variable(transcribedWord);
    }

    check_if_edit_command(text: String){
        var arr = text.toLowerCase().split(" ");
        if (arr[0]=="delete" || arr[0]=="rename" || arr[0]=="comment" || arr[0]=="insert"|| arr[0]=="cut"|| arr[0]=="paste" || arr[0]=="copy" || arr[0]=="uncomment" || arr[0]=="find" || arr[0]=="typecast"){
            return true;
        }
        return false;
    }

    //WORKS
    // There could be an error if the line the user asks to delete is "if (hello > 5)". Good to do checks for
    // that and reject the invalid command.
    check_if_delete_line(text: String) { 
        var arr = text.split(" ");
        if (arr.length!=3) return;
        if (arr[0] == "delete" && arr[1]=="line") {
            console.log("IN HERE to delete line");
            let line_num = parseInt(arr[2]);
            var index = this.binarySearch(line_num,0,this.line_counts.length,this.line_counts);
            if (index!=-1){
                this.manager.splice(index,1);
            }
            else this.show_no_index_message(line_num);
        }
    }

    //WORKS
    // if function name does not exist, just reject the command. If not an error occurs.
    check_if_delete_function(text: String) {
        var arr = text.split(" ");
        if (arr.length!=3) return;
        if (arr[0]=="delete" && arr[1]=="function"){
            console.log("IN HERE TO DELETE A FUNCTION");
            var functionToDelete = arr[2];
            var start = -1;
            var end = -1;
            var countNestedFunctions = 0;
            var flag = false;
            for (var i=0;i<this.manager.struct_command_list.length;i++){
                let structuredText = this.manager.struct_command_list[i];
                if (structuredText.startsWith("#function_declare")){
                    var temp = structuredText.split(" ");
                    if (temp[1]==functionToDelete){
                        start = i;
                        flag = true;
                    }
                    else if (i>start && flag==true){
                        countNestedFunctions+=1;
                    } 
                }
                else if (flag && structuredText.startsWith("#function_end")){
                    if (countNestedFunctions>0){
                        countNestedFunctions--;
                    }
                    if (countNestedFunctions==0) {
                        end = i;
                        break;
                    }
                }
            }
            if (start==-1){
                vscode.window.showInformationMessage("Sorry! Function with name "+functionToDelete+" not found.")
                return;
            }
            this.manager.splice(start,(end-start)+1);
        } 
    }
    
    //WORKS: Delete block [block-name] at line [line-number]
    check_if_delete_block(text: String) {
        var arr = text.split(" ");
        if (arr.length!=6) return;
        if (arr[0]=="delete" && arr[1]=="block"){
            console.log("IN HERE TO DELETE A BLOCK");
            let editor = vscode.window.activeTextEditor;
            if (editor) {
                let document = editor.document;
                var line_num = parseInt(arr[5]);
                var line = document.lineAt(line_num-1).text.trimLeft();
                var start = -1;
                var end = -1;
                var res = this.resolve_block_name(arr[2]);
                 if (line.startsWith(res.block_name)){
                    var index = this.binarySearch(line_num,0,this.line_counts.length,this.line_counts);
                    if (index==-1) {
                        this.show_no_index_message(line_num);
                        return;
                    }

                    start = index;
                    end = this.determine_end(index,res.block_name,res.block_name_end);
                    this.manager.splice(start,(end-start)+1);
                }
                else vscode.window.showInformationMessage("Sorry! Code does not correspond to "+arr[2]+" block");
            }
        }
    }

    //WORKS NOT ON BLOCKS
     check_if_comment_line(text: String) {
        var arr = text.split(" ");
        if (arr.length!=3) return;
        if (arr[0]== "comment" && arr[1] == "line"){
            console.log("IN HERE COMMENTING LINE");
            let line_num = parseInt(arr[2]);
            var index = this.binarySearch(line_num,0,this.line_counts.length,this.line_counts);
            if (index!=-1){
                this.push_to_edit_stack();
                this.manager.struct_command_list[index] = start_comment + this.manager.struct_command_list[index] + end_comment;
            }
            else this.show_no_index_message(line_num);
        }      
    }

    //WORKS
    check_if_comment_block(text:String){
        var arr = text.split(" ");
        if (arr.length!=6) return;
        if (arr[0]=="comment" && arr[1]=="block"){
            console.log("IN HERE TO COMMENT BLOCK: "+text);
            let editor = vscode.window.activeTextEditor;
            if (editor) {
                let document = editor.document;
                var line_num = parseInt(arr[5]);
                var line = document.lineAt(line_num-1).text.trimLeft();
                var start = -1;
                var end = -1;
                var res = this.resolve_block_name(arr[2]);
                if (line.startsWith(res.block_name)){
                    var index = this.binarySearch(line_num,0,this.line_counts.length,this.line_counts);
                    if (index==-1) return;
                    this.push_to_edit_stack();
                    start = index;
                    end = this.determine_end(index,res.block_name,res.block_name_end);
                    this.manager.struct_command_list[start] = start_comment +  this.manager.struct_command_list[start]
                    this.manager.struct_command_list[end] = this.manager.struct_command_list[end] + end_comment;  
                }
                else{
                    vscode.window.showInformationMessage("Sorry! code at line 7 is not a "+arr[2]+" block!")
                }
            }
        }
    }

    //WORKS
    check_if_rename_function(text: String) {
        var arr = text.split(" ");
        if (arr.length!=5) return;
        if (arr[0]=="rename" && arr[1]=="function") {
            console.log("RENAMING THE FUNCTION")
            var functionToReplace = arr[2];
            var replaceWith = arr[4];
            var count = 0;
            this.push_to_edit_stack();
            for (var i=0;i<this.manager.struct_command_list.length;i++){
                let line = this.manager.struct_command_list[i];
                let text = line.split(" ");
                var changed = false;
                for (var j=1;j<text.length;j++){
                    if ((text[j] == functionToReplace || text[j].startsWith(functionToReplace+"(")) && (text[j-1]=="#function_declare" || text[j-1]=="#function")){
                        text[j] = text[j].replace(functionToReplace,replaceWith);
                        changed = true;
                    } 
                }
                if (changed){
                    count++;
                    this.manager.struct_command_list[i] = text.join(" ");
                }  
            }
            if (count==0){
                vscode.window.showInformationMessage("Function "+functionToReplace+" cannot be found. No action done.")
                return;
            }
        }
    }

    //WORKS: need to work on scope
    check_if_rename_variable(text:String) {
        var arr = text.split(" ");
        if (arr.length!=5) return;
        if (arr[0]=="rename" && (arr[1]=="variable" || arr[1]=="variables")){
            console.log("IN HERE to replace variable")
            var wordToReplace = arr[2];
            var replaceWith = arr[4];
            var start = -1;
            var end =-1;
           
            var index = this.find_nearest_creation_of_variable(this.manager.curr_index,wordToReplace);
            var temp = this.find_start_of_function_or_block(index, this.manager.struct_command_list);
            start = temp;
            end = (start==-1)? -1 :this.find_end_of_function_or_block(temp, index);
            
            this.push_to_edit_stack();
            if (start ==-1 || end== -1){
                start = 0;
                end = this.manager.struct_command_list.length-1;
            }
            for (var k = start; k<=end;k++){
                let line = this.manager.struct_command_list[k];
                let text = line.split(" ");
                var changed = false;
                for (var j=1;j<text.length;j++){
                    if (text[j].startsWith(wordToReplace) && (text[j-1]=="#variable"|| text[j-1]=="(#variable")){

                        text[j] = text[j].replace(wordToReplace,replaceWith);
                        changed = true;
                    } 
                }
                if (changed){
                    this.manager.struct_command_list[k] = text.join(" ");
                }  
            }          
        }
    }

    //WORKS
    check_if_paste_above_or_below_line(text:String){
        var arr = text.split(" ");
        if (arr.length!=4) return;
        if (arr[0]=="paste"){
            console.log("IN HERE TO PASTE ABOVE/BELOW LINE");
            var line_num = parseInt(arr[3]);
            var index = this.binarySearch(line_num,0,this.line_counts.length, this.line_counts);
            if (index==-1){
                index = this.binarySearch(line_num+1,0,this.line_counts.length, this.line_counts);
            }
            if (index==-1){
                this.show_no_index_message(line_num);
                return;
            }
            this.push_to_edit_stack();
            if (arr[1]=="above"){
                this.manager.struct_command_list.splice(index,0,...this.cut_copy_struct_buffer);
            }
            else if (arr[1]=="below"){
                this.manager.struct_command_list.splice(index+1,0,...this.cut_copy_struct_buffer);
            }
        }
    }

    //WORKS
    check_if_cut_line(text: String){
        var arr = text.split(" ");
        if (arr.length!=3) return;
        if (arr[0] == "cut" && arr[1]=="line") {
            console.log("IN HERE to cut line");
            this.cut_copy_struct_buffer=[""]
            let line_num = parseInt(arr[2]);
            var index = this.binarySearch(line_num,0,this.line_counts.length,this.line_counts);
            if (index!=-1){
                this.push_to_edit_stack();
                this.cut_copy_struct_buffer[0] = this.manager.struct_command_list[index];
                this.manager.splice(index,1);
            }
            else this.show_no_index_message(line_num);
        }
    }

    //WORKS
    check_if_copy_line(text: String){
        var arr = text.split(" ");
        if (arr.length!=3) return;
        if (arr[0] == "copy" && arr[1]=="line") {
            console.log("IN HERE to copy line");
            this.cut_copy_struct_buffer=[""]
            let line_num = parseInt(arr[2]);
            var index = this.binarySearch(line_num,0,this.line_counts.length, this.line_counts);
            if (index!=-1){
                this.cut_copy_struct_buffer[0] = this.manager.struct_command_list[index];
            }
            else this.show_no_index_message(line_num);
        }
    }

    //WORKS
    check_if_copy_block(text: String){
        var arr = text.split(" ");
        if (arr.length!=6) return;
        if (arr[0]=="copy" && arr[1]=="block"){
            this.cut_copy_struct_buffer = [""];
            let editor = vscode.window.activeTextEditor;
            if (editor) {
                let document = editor.document;
                var line_num = parseInt(arr[5]);
                var line = document.lineAt(line_num-1).text.trimLeft();
                var start = -1;
                var end = -1;
                var res = this.resolve_block_name(arr[2]);
                 if (line.startsWith(res.block_name)){
                    var index = this.binarySearch(line_num,0,this.line_counts.length, this.line_counts);
                    if (index==-1) return;

                    start = index;
                    end = this.determine_end(index, res.block_name,res.block_name_end);

                    for (var j=start;j<=end;j++){
                        this.cut_copy_struct_buffer[j-start]=this.manager.struct_command_list[j];
                    }
                }
            }
        }
    }

    //WORKS
    check_if_cut_block(text: String) {
        var arr = text.split(" ");
        if (arr.length!=6) return;
        if (arr[0]=="cut" && arr[1]=="block"){
            this.cut_copy_struct_buffer = [""];
            let editor = vscode.window.activeTextEditor;
            if (editor) {
                let document = editor.document;
                var line_num = parseInt(arr[5]);
                var line = document.lineAt(line_num-1).text.trimLeft();
                var start = -1;
                var end = -1;
                var res = this.resolve_block_name(arr[2]);
                 if (line.startsWith(res.block_name)){
                    var index = this.binarySearch(line_num,0,this.line_counts.length, this.line_counts);
                    if (index==-1) return;

                    start = index;
                    end = this.determine_end(index,res.block_name,res.block_name_end);

                    for (var j=start;j<=end;j++){
                        this.cut_copy_struct_buffer[j-start]=this.manager.struct_command_list[j];
                    }
                    this.manager.splice(start,(end-start)+1);
                }
            }
        }
    }

    //WORKS
    check_if_insert_before_line(text: String) {
        var arr = text.split(" ");
        if (arr.length!=4) return;
        if (arr[0]=="insert" && arr[1]=="before"  && arr[2]=="line"){
            console.log("IN HERE to insert before/after line");
                let line_num = parseInt(arr[3]);
                let index = this.binarySearch(line_num,0,this.line_counts.length, this.line_counts);
                if (index==-1){
                    index = this.binarySearch(line_num+1,0,this.line_counts.length, this.line_counts);
                }
                if (index==-1){
                    this.show_no_index_message(line_num);
                    return;
                }
                this.push_to_edit_stack();
                console.log("IN INSERT BEFORE CURR INDEX: "+this.manager.curr_index);
                this.manager.struct_command_list.splice(index,0,insert_cursor);

                if (index<this.manager.curr_index){
                    this.manager.struct_command_list.splice(this.manager.curr_index+1,1);
                }
                else{
                    this.manager.struct_command_list.splice(this.manager.curr_index,1);
                }
                this.manager.curr_index = index;
        }
    }

    //WORKS
    check_if_insert_before_block(text: String){
        var arr = text.split(" ");
        if (arr.length!=4) return;
        if (arr[0]=="insert" && arr[1]=="before" && arr[3]=="block"){
            console.log("IN HERE to insert before block");
            if (arr[2]=="4"|| arr[2]=="4:00") arr[2]="for";

            var block_name = (arr[2]=="else")? "#else_branch_start": arr[2];
            var minDistance = 1000000;
            var minIndex = -1;
            for (var i=0;i<this.manager.struct_command_list.length;i++){
                if (this.manager.struct_command_list[i].startsWith(block_name)){
                    if (Math.abs(i-this.manager.curr_index)<minDistance){
                        console.log("DIFF: "+(i-this.manager.curr_index));
                        minDistance = Math.abs(i-this.manager.curr_index);
                        minIndex = i;
                    }
                }
            }
            console.log("MIN INDEX: "+minIndex);
            this.push_to_edit_stack();
            this.manager.struct_command_list.splice(minIndex,0,insert_cursor);
            if (minIndex<this.manager.curr_index){
                console.log("IN IF: "+this.manager.curr_index+1);
                this.manager.struct_command_list.splice(this.manager.curr_index+1,1);
                
            }
            else{
                console.log("IN IF: "+this.manager.curr_index+1);
                this.manager.struct_command_list.splice(this.manager.curr_index,1);
            }
            this.manager.curr_index = minIndex;
        }
    }

    //WORKS
    check_if_uncomment_line(text: String){
        var arr = text.split(" ");
        if (arr.length!=3) return;
        if (arr[0]=="uncomment" && arr[1]=="line"){
            console.log("IN HERE UNCOMMENTING LINE");
            let line_num = parseInt(arr[2]);
            var index = this.binarySearch(line_num,0,this.line_counts.length,this.line_counts);
            if (index!=-1){
                if (!this.manager.struct_command_list[index].startsWith(start_comment)){
                    vscode.window.showInformationMessage("This line is not a comment. No action done.")
                    return;
                }
                this.push_to_edit_stack();
                this.manager.struct_command_list[index] = this.manager.struct_command_list[index].substring(start_comment.length,this.manager.struct_command_list[index].length-end_comment.length);
            }
            else this.show_no_index_message(line_num);
        }
    }

    //WORKS
    check_if_uncomment_block(text: String){
        var arr = text.split(" ");
        if (arr.length!=6) return;
        if (arr[0]=="uncomment" && arr[1]=="block"){
            console.log("IN HERE TO UNCOMMENT BLOCK");
            let editor = vscode.window.activeTextEditor;
            if (editor) {
                let document = editor.document;
                var line_num = parseInt(arr[5]);
                var line = document.lineAt(line_num-1).text.trimLeft();
                var start = -1;
                var res = this.resolve_block_name(arr[2]);
                if (line.startsWith("/*")) {
                    line_num +=1;
                    line = document.lineAt(line_num-1).text.trimLeft();
                }
                else {
                    var temp = document.lineAt(line_num-2).text.trimLeft();
                    if (!temp.startsWith("/*")){
                        vscode.window.showInformationMessage("This block is not commented. No action done.");
                        return;
                    }
                }
                if (line.indexOf(res.block_name)!=-1 && line.indexOf(res.block_name)==line.lastIndexOf(res.block_name)){
                    var index = this.binarySearch(line_num,0,this.line_counts.length,this.line_counts);
                    if (index==-1) return;

                    start = index;
                    var end = this.determine_end(index,res.block_name,res.block_name_end);
                    if (!this.manager.struct_command_list[start].startsWith(start_comment)) return;
                    this.push_to_edit_stack();
                    this.manager.struct_command_list[start] = this.manager.struct_command_list[start].substring(start_comment.length);
                    this.manager.struct_command_list[end] = this.manager.struct_command_list[end].substring(0,this.manager.struct_command_list[end].length-end_comment.length);
                }
            }
        }
    }

    //WORKS: find [word] and replace with [new_word]
    check_if_search_and_replace(text: String){
        var arr = text.split(" ");
        if (arr.length!=6) return;
        if (arr[0]=="find"){
            console.log("IN HERE TO FIND AND REPLACE");
            var word = arr[1];
            var new_word = arr[5];
            if (!isNaN(parseInt(new_word))){
                vscode.window.showInformationMessage("Sorry! cant replace word: "+word+" with a number: "+arr[5]);
                return ;
            }
            this.push_to_edit_stack();
            for (var i=0;i<this.manager.struct_command_list.length;i++){
                if (this.manager.struct_command_list[i].indexOf(word)!=-1){
                    console.log("DEBUG: "+this.manager.struct_command_list[i]);
                    this.manager.struct_command_list[i] = this.manager.struct_command_list[i].replace(new RegExp(word,'g'),new_word);
                }
            }
        }
    }

    //WORKS: typecast variable [variable_name] as [data type] at line [line_num]
    check_if_typecast_variable(text: String){
        var arr = text.split(" ");
        if (arr.length!=8) return;
        if (arr[0]=="typecast" && arr[1]=="variable"){
            console.log("IN HERE to typecast");
            var variable_name = arr[2];
            var data_type = arr[4];
            var line_num = parseInt(arr[7]);
            var index = this.binarySearch(line_num,0,this.line_counts.length, this.line_counts);
            if (index==-1){
                this.show_no_index_message(line_num);
                return;
            }
            var phrase = "#variable "+variable_name;
            var substring_index = this.manager.struct_command_list[index].indexOf(phrase);
            if (substring_index!=-1){
                this.push_to_edit_stack();
                var line = this.manager.struct_command_list[index]
                
                this.manager.struct_command_list[index] = line.substring(0, substring_index)+"#type "+data_type+" ("+line.substring(substring_index,substring_index+phrase.length)+")"+line.substring(substring_index+phrase.length);
                return;
            }
        }
    }

    push_to_edit_stack(){
        this.manager.edit_stack.push(new edit_stack_item(["edit",this.manager.deepCopyStructCommand(),this.manager.deepCopySpeechHist(),this.manager.curr_index]))
    }



binarySearch(line_num: number, left: number, right: number, arr: number[]): number{
    if (right>=left){
        var mid = Math.floor(left+(right-left)/2);
        if (arr[mid]==line_num){
            return mid;
        }
        else if (arr[mid]> line_num){
            return this.binarySearch(line_num,left, mid-1, arr);
        }
        else {
            return this.binarySearch(line_num,mid+1,right, arr);
        }
    }
    return -1;
}

determine_end(index: number, block_name: string, block_name_end: string){
    var count_block = 0;
    var end = -1;
    for (var i=index;i<this.manager.struct_command_list.length;i++){
        if (i>index && this.manager.struct_command_list[i].startsWith(block_name)){
            count_block++;
        }

        else if (this.manager.struct_command_list[i].startsWith(block_name_end)){
            if (count_block==0){
                end = i;
                break;
            }
            else if (count_block>0){
                count_block--;
            }
        }
    }
    return end;
}



find_end_of_function_or_block(start: number, index: number){
    var end = -1;
    var branch_end_phrase = "";
    var line = this.manager.struct_command_list[start];
    if (line.length==0|| line==undefined) return end;

    if (line.startsWith("if")) branch_end_phrase = "#if_branch_end;;";
    else if (line.startsWith("for")) branch_end_phrase = "#for_end;;";
    else if (line.startsWith("while")) branch_end_phrase = "#while_end;;";
    else if (line.startsWith("#else_branch_start")) branch_end_phrase = "#else_branch_end;;";
    else if (line.startsWith("#function_declare")) branch_end_phrase = "#function_end;;";
    for (var j= index;j<=this.manager.struct_command_list.length;j++){
        if (this.manager.struct_command_list[j].startsWith(branch_end_phrase)){
            end = j;
            break;
        }
    }
    
    
    return end;
}

find_start_of_function_or_block(index: number, struct_command_list: string[]){
    let line_stack = [];
    let index_stack = [];
    var start = -1;
    for (var i=0;i<index;i++){
        var line =struct_command_list[i];
        if (line.startsWith("if")|| line.startsWith("for") || line.startsWith("while")|| line.startsWith("#function_declare")|| line.startsWith("#else_branch_start")){
            line_stack.push(line);
            index_stack.push(i);
        }
        else if (line.startsWith("#if_branch_end")){
            this.is_stack_poppable("if",line_stack,index_stack);
        }
        else if (line.startsWith("#for_end")){
            this.is_stack_poppable("for",line_stack,index_stack);
        }
        else if (line.startsWith("#while_end")){
            this.is_stack_poppable("while",line_stack,index_stack);
            this.is_stack_poppable("do",line_stack,index_stack);
        }
        else if (line.startsWith("#function_end")){
            this.is_stack_poppable("#function_declare",line_stack,index_stack);
        }
        else if (line.startsWith("#else_branch_end")){
            this.is_stack_poppable("#else_branch_start",line_stack,index_stack);
        }

    }
    start = (index_stack.length==0)?-1: index_stack[index_stack.length-1];

    return start;

}

is_stack_poppable(text: string, line_stack: string[],index_stack:number[]){
    if (line_stack.length!=0 && line_stack[line_stack.length-1].startsWith(text)){
        line_stack.pop();
        index_stack.pop();
    }
}

find_nearest_creation_of_variable(index:number, variable_name: string){
    var res = -1;
    for (var i = index;i>=0;i--){
        var line = this.manager.struct_command_list[i];
        let text = line.split(" ");
        var found = false;
        if (line.startsWith("#create")){
            console.log("GOT IN HERE CREATE: "+line);
            for (var j=1;j<text.length;j++){
                if (text[j].startsWith(variable_name) && text[j-1]=="#variable"){
                    console.log("GOT IN HERE: "+variable_name);
                    res = i;
                    found = true;
                    break;
                }
            }
            if (found) break;
        }
    }
    return res;
}

resolve_block_name(text: string){
    var block_name = (text=="is")? "if": text;
    var block_name_end = text;
    if (text=="else"){
        block_name=="#else_branch_start";
        block_name_end = "#else_branch_end";
    }
    else if (text=="do-while" || text=="do") {
        block_name = "do";
        block_name_end="#while_end";
    }
    else if (text=="switch-case"|| text=="switch"){
        block_name = "switch"; 
        block_name_end = "#switch_end";
    }
    else {
        block_name = text;
        block_name_end = "#"+text+"_end";
        if (block_name =="if") block_name_end = "#if_branch_end";
    }
    return {block_name,block_name_end};
}

show_no_index_message(line: number){
    vscode.window.showInformationMessage("Sorry! No code on line "+line+". Please provide a line number that has code.")
}



}