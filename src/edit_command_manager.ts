import { StructCommandManager } from "./struct_command_manager";
import * as vscode from 'vscode';

export class EditCommandManager {
    manager: StructCommandManager
    code_segments: string[]
    line_counts: number[]
    cut_copy_buffer: string[]

    constructor(manager: StructCommandManager, code_segments: string[], line_counts: number[]) {
        this.manager = manager;
        this.code_segments = code_segments;
        this.line_counts = line_counts;
        this.cut_copy_buffer = [""];
    }

    checkAll(transcribedWord: String, code_segments:string[], line_counts: number[]){
        this.code_segments = code_segments;
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
    }

    check_if_edit_command(text: String){
        var arr = text.toLowerCase().split(" ");
        if (arr[0]=="delete" || arr[0]=="rename" || arr[0]=="comment" || arr[0]=="insert"|| arr[0]=="cut"|| arr[0]=="paste" || arr[0]=="copy"){
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
                var count_block = 0;
                 if (line.startsWith(block_name)){
                    var index = this.binarySearch(line_num,0,this.line_counts.length);
                    if (index==-1) return;

                    start = index;
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
                    this.manager.splice(start,(end-start)+1);
                }
            }
        }
    }

    //WORKS NOT ON BLOCKS
     check_if_comment_line(text: String) {
        var arr = text.split(" ");
        if (arr[0]== "comment" && arr[1] == "line"){
            console.log("IN HERE COMMENTING LINE");
            let line_num = parseInt(arr[2]);
            var index = this.binarySearch(line_num,0,this.line_counts.length);
            if (index!=-1){
                this.manager.struct_command_list[index] = "#comment " + this.manager.struct_command_list[index] + " #comment_end;;"
            }
        }      
    }

    //WORKS
    check_if_comment_block(text:String){
        var arr = text.split(" ");
        if (arr[0]=="comment" && arr[1]=="block"){
            console.log("IN HERE TO COMMENT BLOCK: "+text);
            let editor = vscode.window.activeTextEditor;
            if (editor) {
                let document = editor.document;
                var line_num = parseInt(arr[5]);
                var line = document.lineAt(line_num-1).text.trimLeft();
                var start = -1;
                var end = -1;
                var block_name = (arr[2]=="else")? "#else_branch_start": arr[2];
            
                var block_name_end = (arr[2] == "if" || arr[2] == "else")? "#"+arr[2]+"_branch_end": "#"+arr[2]+"_end";
                var count_block = 0;
                if (line.startsWith(block_name)){
                    var index = this.binarySearch(line_num,0,this.line_counts.length);
                    if (index==-1) return;

                    start = index;
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
                    console.log("START: "+start+" END: "+end);
                    this.manager.struct_command_list[start] = "#comment " +  this.manager.struct_command_list[start]
                    this.manager.struct_command_list[end] = this.manager.struct_command_list[end] + " #comment_end;;";  
                    console.log("START OF BLOCK: "+this.manager.struct_command_list[start]);
                    console.log("END OF BLOCK: "+this.manager.struct_command_list[end]);
                }
            }
        }
    }

    //WORKS
    check_if_rename_function(text: String) {
        var arr = text.split(" ");
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
        if (arr[0]=="paste"){
            console.log("IN HERE TO PASTE ABOVE/BELOW LINE");
            var line_num = parseInt(arr[3]);
            var index = this.binarySearch(line_num,0,this.line_counts.length);
            if (arr[1]=="above"){
                console.log("GOT INTO ABOVE");
                this.manager.struct_command_list.splice(index,0,...this.cut_copy_buffer);
                for (var i=0;i<this.manager.struct_command_list.length;i++){
                    console.log("DEBUG IN PASTE: "+i);
                    console.log(this.manager.struct_command_list[i]);
                    console.log(this.cut_copy_buffer[0]);
                }
            }
            else if (arr[1]=="below"){
                console.log("GOT INTO BELOW");
                this.manager.struct_command_list.splice(index+1,0,...this.cut_copy_buffer);
                for (var i=0;i<this.manager.struct_command_list.length;i++){
                    console.log("DEBUG IN PASTE: "+i);
                    console.log(this.manager.struct_command_list[i]);
                    console.log(this.cut_copy_buffer[0]);
                }
            }
        }
    }

    //WORKS
    check_if_cut_line(text: String){
        var arr = text.split(" ");
        if (arr[0] == "cut" && arr[1]=="line") {
            console.log("IN HERE to cut line");
            this.cut_copy_buffer=[""]
            let line_num = parseInt(arr[2]);
            var index = this.binarySearch(line_num,0,this.line_counts.length);
            if (index!=-1){
                this.cut_copy_buffer[0] = this.manager.struct_command_list[index];
                this.manager.struct_command_list.splice(index,1);
            }
        }
    }

    //WORKS
    check_if_copy_line(text: String){
        var arr = text.split(" ");
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
                var count_block = 0;
                 if (line.startsWith(block_name)){
                    var index = this.binarySearch(line_num,0,this.line_counts.length);
                    if (index==-1) return;

                    start = index;
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
                var count_block = 0;
                 if (line.startsWith(block_name)){
                    var index = this.binarySearch(line_num,0,this.line_counts.length);
                    if (index==-1) return;

                    start = index;
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

                    for (var j=start;j<=end;j++){
                        this.cut_copy_buffer[j-start]=this.manager.struct_command_list[j];
                    }
                    this.manager.struct_command_list.splice(start,(end-start)+1);
                }
            }
        }
    }

    //WORKS
    check_if_insert_before_line(text: String) {
        var arr = text.split(" ");
        var temp = 0;
        if (arr[0]=="insert" && arr[1]=="before"){
            console.log("GOT IN HERE TO INSERT");
                let line_num = parseInt(arr[3]);
                let index = this.binarySearch(line_num,0,this.line_counts.length);
                this.manager.struct_command_list.splice(index,0,"#comment #value \" insert here \";; #comment_end;;");
                this.manager.curr_index = index;
        }
    }

    check_if_insert_before_block(text: String){

    }


    
}