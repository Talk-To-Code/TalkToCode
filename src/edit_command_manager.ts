import { StructCommandManager } from "./struct_command_manager";
import * as vscode from 'vscode';


var insert_comment = "#comment #value \" insert here \";; #comment_end;;";
var start_comment = "#comment ";
var end_comment= " #comment_end;;";

export class EditCommandManager {
    /* Manager to access the structured command list and the current index of the code */
    manager: StructCommandManager
    /* Line counts to track what lines of the code correspond to the indices in struct command list */
    line_counts: number[]
    /* A buffer to save the line(s) copied or cut by the user to be used for pasting */
    cut_copy_buffer: string[]

    constructor(manager: StructCommandManager, line_counts: number[]) {
        this.manager = manager;
        this.line_counts = line_counts;
        this.cut_copy_buffer = [""];
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

    binarySearch(line_num: number, left: number, right: number): number{
        if (right>=left){
            var mid = Math.floor(left+(right-left)/2);
            if (this.line_counts[mid]==line_num){
                return mid;
            }
            else if (this.line_counts[mid]> line_num){
                return this.binarySearch(line_num,left, mid-1);
            }
            else {
                return this.binarySearch(line_num,mid+1,right);
            }
        }
        return -1;
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
            var index = this.binarySearch(line_num,0,this.line_counts.length);
            if (index!=-1){
                this.manager.splice(index,1);
            }
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
                else if (structuredText.startsWith("#function_end")){
                    if (countNestedFunctions>0){
                        countNestedFunctions--;
                    }
                    if (countNestedFunctions==0) end = i;
                }
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
                var block_name = (arr[2]=="else")? "#else_branch_start": arr[2];
            
                var block_name_end = (arr[2] == "if" || arr[2] == "else")? "#"+arr[2]+"_branch_end": "#"+arr[2]+"_end";
                 if (line.startsWith(block_name)){
                    var index = this.binarySearch(line_num,0,this.line_counts.length);
                    if (index==-1) return;

                    start = index;
                    end = this.determine_end(index,block_name,block_name_end);
                    this.manager.splice(start,(end-start)+1);
                }
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
            var index = this.binarySearch(line_num,0,this.line_counts.length);
            if (index!=-1){
                this.manager.struct_command_list[index] = start_comment + this.manager.struct_command_list[index] + end_comment;
            }
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
                if (arr[2]=="is") arr[2]="if";
                var block_name = (arr[2]=="else")? "#else_branch_start": arr[2];
                var block_name_end = (arr[2] == "if" || arr[2] == "else")? "#"+arr[2]+"_branch_end": "#"+arr[2]+"_end";
                if (line.startsWith(block_name)){
                    var index = this.binarySearch(line_num,0,this.line_counts.length);
                    if (index==-1) return;

                    start = index;
                    end = this.determine_end(index,block_name,block_name_end);

                    this.manager.struct_command_list[start] = start_comment +  this.manager.struct_command_list[start]
                    this.manager.struct_command_list[end] = this.manager.struct_command_list[end] + end_comment;  
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
            for (var i=0;i<this.manager.struct_command_list.length;i++){
                let line = this.manager.struct_command_list[i];
                let text = line.split(" ");
                var changed = false;
                for (var j=1;j<text.length;j++){
                    if (text[j].startsWith(functionToReplace) && (text[j-1]=="#function_declare" || text[j-1]=="#function")){
                        text[j] = text[j].replace(functionToReplace,replaceWith);
                        changed = true;
                    } 
                }
                if (changed){
                    this.manager.struct_command_list[i] = text.join(" ");
                }  
            }
        }
    }

    //WORKS: need to work on scope
    check_if_rename_variable(text:String) {
        var arr = text.split(" ");
        if (arr.length!=5) return;
        if (arr[0]=="rename" && (arr[1]=="variable" || arr[1]=="variables")){
            var wordToReplace = arr[2];
            var replaceWith = arr[4];
            for (var i=0;i<this.manager.struct_command_list.length;i++){
                let line = this.manager.struct_command_list[i];
                let text = line.split(" ");
                var changed = false;
                for (var j=1;j<text.length;j++){
                    if (text[j].startsWith(wordToReplace) && text[j-1]=="#variable"){
                        text[j] = text[j].replace(wordToReplace,replaceWith);
                        changed = true;
                    } 
                }
                if (changed){
                    this.manager.struct_command_list[i] = text.join(" ");
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
            var index = this.binarySearch(line_num,0,this.line_counts.length);
            if (arr[1]=="above"){
                this.manager.struct_command_list.splice(index,0,...this.cut_copy_buffer);
            }
            else if (arr[1]=="below"){
                this.manager.struct_command_list.splice(index+1,0,...this.cut_copy_buffer);
            }
        }
    }

    //WORKS
    check_if_cut_line(text: String){
        var arr = text.split(" ");
        if (arr.length!=3) return;
        if (arr[0] == "cut" && arr[1]=="line") {
            console.log("IN HERE to cut line");
            this.cut_copy_buffer=[""]
            let line_num = parseInt(arr[2]);
            var index = this.binarySearch(line_num,0,this.line_counts.length);
            if (index!=-1){
                this.cut_copy_buffer[0] = this.manager.struct_command_list[index];
                this.manager.splice(index,1);
            }
        }
    }

    //WORKS
    check_if_copy_line(text: String){
        var arr = text.split(" ");
        if (arr.length!=3) return;
        if (arr[0] == "copy" && arr[1]=="line") {
            console.log("IN HERE to copy line");
            this.cut_copy_buffer=[""]
            let line_num = parseInt(arr[2]);
            var index = this.binarySearch(line_num,0,this.line_counts.length);
            if (index!=-1){
                this.cut_copy_buffer[0] = this.manager.struct_command_list[index];
            }
        }
    }

    //WORKS
    check_if_copy_block(text: String){
        var arr = text.split(" ");
        if (arr.length!=6) return;
        if (arr[0]=="copy" && arr[1]=="block"){
            this.cut_copy_buffer = [""];
            let editor = vscode.window.activeTextEditor;
            if (editor) {
                let document = editor.document;
                var line_num = parseInt(arr[5]);
                var line = document.lineAt(line_num-1).text.trimLeft();
                var start = -1;
                var end = -1;
                var block_name = (arr[2]=="else")? "#else_branch_start": arr[2];
            
                var block_name_end = (arr[2] == "if" || arr[2] == "else")? "#"+arr[2]+"_branch_end": "#"+arr[2]+"_end";
                 if (line.startsWith(block_name)){
                    var index = this.binarySearch(line_num,0,this.line_counts.length);
                    if (index==-1) return;

                    start = index;
                    end = this.determine_end(index, block_name,block_name_end);

                    for (var j=start;j<=end;j++){
                        this.cut_copy_buffer[j-start]=this.manager.struct_command_list[j];
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
            this.cut_copy_buffer = [""];
            let editor = vscode.window.activeTextEditor;
            if (editor) {
                let document = editor.document;
                var line_num = parseInt(arr[5]);
                var line = document.lineAt(line_num-1).text.trimLeft();
                var start = -1;
                var end = -1;
                var block_name = (arr[2]=="else")? "#else_branch_start": arr[2];
            
                var block_name_end = (arr[2] == "if" || arr[2] == "else")? "#"+arr[2]+"_branch_end": "#"+arr[2]+"_end";
                 if (line.startsWith(block_name)){
                    var index = this.binarySearch(line_num,0,this.line_counts.length);
                    if (index==-1) return;

                    start = index;
                    end = this.determine_end(index,block_name,block_name_end);

                    for (var j=start;j<=end;j++){
                        this.cut_copy_buffer[j-start]=this.manager.struct_command_list[j];
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
        if (arr[0]=="insert" && arr[1]=="before" && arr[2]=="line"){
            console.log("IN HERE to insert before line");
                let line_num = parseInt(arr[3]);
                let index = this.binarySearch(line_num,0,this.line_counts.length);
                this.manager.struct_command_list.splice(index,0,insert_comment);
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
                        minDistance = Math.abs(i-this.manager.curr_index);
                        minIndex = i;
                    }
                }
            }
            this.manager.struct_command_list.splice(minIndex,0,insert_comment);
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
            var index = this.binarySearch(line_num,0,this.line_counts.length);
            if (index!=-1){
                if (!this.manager.struct_command_list[index].startsWith(start_comment)) return;
                this.manager.struct_command_list[index] = this.manager.struct_command_list[index].substring(start_comment.length,this.manager.struct_command_list[index].length-end_comment.length);
            }
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
                var block_name = (arr[2]=="else")? "#else_branch_start": arr[2];
    
                var block_name_end = (arr[2] == "if" || arr[2] == "else")? "#"+arr[2]+"_branch_end": "#"+arr[2]+"_end";
                if (line.indexOf(block_name)!=-1 && line.indexOf(block_name)==line.lastIndexOf(block_name)){
                    var index = this.binarySearch(line_num,0,this.line_counts.length);
                    if (index==-1) return;

                    start = index;
                    var end = this.determine_end(index,block_name,block_name_end);
                    if (!this.manager.struct_command_list[start].startsWith(start_comment)) return;
                    this.manager.struct_command_list[start] = this.manager.struct_command_list[start].substring(start_comment.length);
                    this.manager.struct_command_list[end] = this.manager.struct_command_list[end].substring(0,this.manager.struct_command_list[end].length-end_comment.length);
                }
            }
        }
    }

    //TODO: find [word] and replace with [new_word]
    check_if_search_and_replace(text: String){
        var arr = text.split(" ");
        if (arr.length!=6) return;
        if (arr[0]=="find"){
            console.log("IN HERE TO FIND AND REPLACE");
            var word = arr[1];
            var new_word = arr[5];
            for (var i=0;i<this.manager.struct_command_list.length;i++){
                if (this.manager.struct_command_list[i].indexOf(word)!=-1){
                    this.manager.struct_command_list[i] = this.manager.struct_command_list[i].replace(word,new_word);
                }
            }
        }
    }

    //TODO: typecast variable [variable_name] as [data type] at line [line_num]
    check_if_typecast_variable(text: String){
        var arr = text.split(" ");
        if (arr.length!=8) return;
        if (arr[0]=="typecast" && arr[1]=="variable"){
            console.log("IN HERE to typecast");
            var variable_name = arr[2];
            var data_type = arr[4];
            var line_num = parseInt(arr[7]);
            var index = this.binarySearch(line_num,0,this.line_counts.length);
            var phrase = "#variable "+variable_name;
            var substring_index = this.manager.struct_command_list[index].indexOf(phrase);
            if (substring_index!=-1){
                console.log("got in here: "+this.manager.struct_command_list[index]);
                var line = this.manager.struct_command_list[index]
                
                this.manager.struct_command_list[index] = line.substring(0, substring_index)+"#type "+data_type+" ("+line.substring(substring_index,substring_index+phrase.length)+")"+line.substring(substring_index+phrase.length);
                console.log("DEBUG: "+this.manager.struct_command_list[index]);
                return;
            }
        }
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



}