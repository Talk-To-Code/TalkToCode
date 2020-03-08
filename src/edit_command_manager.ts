import { StructCommandManager } from "./struct_command_manager";
import * as vscode from 'vscode';

export class EditCommandManager {
    manager: StructCommandManager
    code_segments: string[]
    line_counts: []

    constructor(manager: StructCommandManager, code_segments: string[], line_counts: []) {
        this.manager = manager;
        this.code_segments = code_segments;
        this.line_counts = line_counts;
    }

    checkAll(transcribedWord: String, code_segments:string[], count_lines: []){
        this.code_segments = code_segments;
        this.line_counts  = count_lines;
        this.check_if_delete_line(transcribedWord);
        this.check_if_delete_function(transcribedWord);
        this.check_if_delete_block(transcribedWord);
        this.check_if_comment_line(transcribedWord);
        this.check_if_comment_block(transcribedWord);
        this.check_if_rename_function(transcribedWord);
        this.check_if_rename_variable(transcribedWord);
        this.check_if_insert_before_block(transcribedWord);
    }

    check_if_edit_command(text: String){
        var arr = text.split(" ");
        if (arr[0]=="delete" || arr[0]=="rename" || arr[0]=="comment" || arr[0]=="insert"){
            return true;
        }
        return false;
    }

    //WORKS
    check_if_delete_line(text: String) { 
        var arr = text.toLowerCase().split(" ");
        if (arr[0] == "delete" && arr[1]=="line") {
            console.log("IN HERE to delete line");
            let editor = vscode.window.activeTextEditor;
            if (editor) {
                const document = editor.document;
                let line_num = parseInt(arr[2])-1;
                var index = this.code_segments.findIndex(obj => obj==document.lineAt(line_num).text);
                if (index!=-1){
                    this.manager.struct_command_list.splice(index,1);
                 }
            }
        }
    }

    //WORKS
    check_if_delete_function(text: String) {
        var arr = text.toLowerCase().split(" ");
        if (arr[0]=="delete" && arr[1]=="function"){
            console.log("TRYING TO DELETE A FUNCTION");
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
            this.manager.struct_command_list.splice(start,(end-start)+1);
        } 
    }
    
    //WORKS : Delete block [block-name] at line [line-number]
    check_if_delete_block(text: String) {
        var arr = text.split(" ");
        if (arr[0]=="delete" && arr[1]=="block"){
            console.log("IN HERE TO DELETE A BLOCK");
            let editor = vscode.window.activeTextEditor;
            if (editor) {
                let document = editor.document;
                var line_num = parseInt(arr[5])-1;
                var line = document.lineAt(line_num).text.trimLeft();
                var start = -1;
                var end = -1;
                var block_name = (arr[2]=="else")? "#else_branch_start": arr[2];
            
                var block_name_end = (arr[2] == "if" || arr[2] == "else")? "#"+arr[2]+"_branch_end": "#"+arr[2]+"_end";
                var count_block = 0;
                 if (line.startsWith(block_name)){
                    var index = this.code_segments.findIndex(obj => obj==document.lineAt(line_num).text);
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
                    this.manager.struct_command_list.splice(start,(end-start)+1);
                }
            }
        }
    }

     //WORKS BUT DOESNT WORK ON FIRST LINES OF BLOCKS
     check_if_comment_line(text: String) {
        var arr = text.toLowerCase().split(" ");
        if (arr[0]== "comment" && arr[1] == "line"){
            console.log("IN HERE COMMENTING LINE");
            let editor = vscode.window.activeTextEditor;
            if (editor){
                const document = editor.document;
                let line_num = parseInt(arr[2])-1;
                var index = this.code_segments.findIndex(obj => obj==document.lineAt(line_num).text);
                if (index!=-1){
                    this.manager.struct_command_list[index] = "#comment " + this.manager.struct_command_list[index] + " #comment_end;;"
                }
            }
        }      
    }

    // WORKS BUT BUG BECAUSE OF CURSOR COMMENT
    check_if_comment_block(text:String){
        var arr = text.split(" ");
        if (arr[0]=="comment" && arr[1]=="block"){
            let editor = vscode.window.activeTextEditor;
            if (editor) {
                let document = editor.document;
                var line_num = parseInt(arr[5])-1;
                var line = document.lineAt(line_num).text.trimLeft();
                var start = -1;
                var end = -1;
                var block_name = (arr[2]=="else")? "#else_branch_start": arr[2];
            
                var block_name_end = (arr[2] == "if" || arr[2] == "else")? "#"+arr[2]+"_branch_end": "#"+arr[2]+"_end";
                var count_block = 0;
                 if (line.startsWith(block_name)){
                    var index = this.code_segments.findIndex(obj => obj==document.lineAt(line_num).text);
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
                  
                    if (!this.manager.struct_command_list[start].startsWith("#comment")){
                            this.manager.struct_command_list[start] = "#comment " + line 
                    this.manager.struct_command_list[end] = line + " #comment_end;;";  
                    }
                }
            }
        }
    }

    //WORKS
    check_if_rename_function(text: String) {
        var arr = text.toLowerCase().split(" ");
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



    check_if_insert_before_block(text: String) {
        var arr = text.toLowerCase().split(" ");
        var temp = 0;
        if (arr[0]=="insert" && arr[1]=="before"){
            console.log("GOT IN HERE TO INSERT");
            let editor = vscode.window.activeTextEditor;
            if (editor){
                const document = editor.document;
                let line_num = parseInt(arr[6])-1;
                let block_name = arr[2];

                const position = editor.selection.active;

                var newPosition = position.with(line_num, 0);

                editor.edit(editBuilder =>{
                    editBuilder.insert(document.lineAt(line_num).range.start,"\n")
                })

                var newSelection = new vscode.Selection(newPosition, newPosition);
                editor.selection = newSelection;
                temp = this.manager.curr_index;
                this.manager.curr_index=line_num;
                
            }
        }
    }    
}