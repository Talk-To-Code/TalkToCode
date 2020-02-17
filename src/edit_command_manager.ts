import { StructCommandManager } from "./struct_command_manager";
import * as vscode from 'vscode';

export class EditCommandManager {
    manager: StructCommandManager

    constructor(manager: StructCommandManager) {
        this.manager = manager;
    }

    checkAll(transcribedWord: String){
        this.check_if_comment_line(transcribedWord);
        this.check_if_delete_function(transcribedWord);
        this.check_if_delete_line(transcribedWord);
        this.check_if_delete_while(transcribedWord);
        this.check_if_rename_function(transcribedWord);
        this.check_if_rename_variable(transcribedWord);
    }

    check_if_edit_command(text: String){
        var arr = text.split(" ");
        if (arr[0]=="delete" || arr[0]=="rename" || arr[0]=="comment"){
            return true;
        }
        return false;
    }
    
    check_if_delete_while(text: String) {
        var arr = text.split(" ");
        if (arr[0]=="delete" && arr[1]=="block"){
            let editor = vscode.window.activeTextEditor;
            if (editor) {
                let document = editor.document;
                var line_num = parseInt(arr[5])-1;
                var block_name = arr[2];
                var count_whiles = 0;
                if (document.lineAt(line_num).text.startsWith(block_name)){
                    for (var i=line_num;i<document.lineCount;i++){
                        if (i!=line_num && document.lineAt(i).text.startsWith(block_name)){
                            count_whiles++;
                        }
                        if (document.lineAt(i).text.startsWith("#while_end")){
                            if (count_whiles==0){
                                editor.edit (editBuilder =>{
                                    editBuilder.delete(line.range);
                                });
                                break;
                            }
                            else{
                                count_whiles--;
                            }
                        }
                        let line = document.lineAt(i);
                        editor.edit (editBuilder =>{
                            editBuilder.delete(line.range);
                        });
                    }
                }
                this.delete_edit_commands_from_history();
            }
        }
    }
    
    check_if_delete_line(text: String) { 
        var arr = text.split(" ");
        if (arr[0] == "delete" && arr[1]=="line") {
            console.log("IN HERE to delete line");
            let editor = vscode.window.activeTextEditor;
            if (editor) {
                const document = editor.document;
                let line_num = parseInt(arr[2])-1
                let line = document.lineAt(line_num)
                editor.edit (editBuilder =>{
                    editBuilder.delete(line.range);
                });
            }
            this.delete_edit_commands_from_history();
        }
    }
    
    delete_edit_commands_from_history(){
        //manager.struct_command_list.splice(manager.struct_command_list.length-1,manager.struct_command_list.length);
        this.manager.speech_hist.splice(this.manager.speech_hist.length-1,this.manager.speech_hist.length);
    }
    
    check_if_delete_function(text: String) {
        var arr = text.split(" ");
        if (arr[0]=="delete" && arr[1]=="function"){
            console.log("TRYING TO DELETE A FUNCTION");
            let editor = vscode.window.activeTextEditor;
            if (editor) {
                const document = editor.document;
                var functionToDelete = arr[2];
                var start = -1;
                var end = -1;
                var countNestedFunctions = 0;
                var flag = false;
                for (var i=0;i<document.lineCount;i++){
                    let structuredText = document.lineAt(i).text;
                    if (structuredText.startsWith("#function_declare")){
                        var temp = structuredText.split(" ");
                        if (temp[1].toLowerCase==functionToDelete.toLowerCase){
                            start = i;
                            flag = true;
                        }
                        else if (flag==true){
                            countNestedFunctions+=1;
                        }
                        
                    }
                    if (structuredText.startsWith("#function_end")){
                        countNestedFunctions--;
                        if (countNestedFunctions==0) end = i;
                    }
                }
    
                for (var i=start;i<=end;i++){
                    editor.edit (editBuilder =>{
                        editBuilder.delete(document.lineAt(i).range);
                    });
                }
    
            }
            
        }
    
    }
    
    check_if_rename_function(text: String) {
        var arr = text.split(" ");
        if (arr[0]=="rename" && arr[1]=="function") {
            let editor = vscode.window.activeTextEditor;
            if (editor) {
                const document = editor.document;
                var functionToReplace = arr[2];
                var replaceWith = arr[4];
                for (var i=0;i<document.lineCount;i++){
                    let line = document.lineAt(i).text;
                    let text = line.split(" ");
                    for (var j=1;j<text.length;j++){
                        if (text[i]==functionToReplace && text[i-1]=="#function_declare"){
                            text[i] = replaceWith;
                            editor.edit (editBuilder =>{
                                editBuilder.replace(document.lineAt(i).range,text.join(" "));
                        });
                    }
                }
            }
        }
    }
    }
    
    check_if_rename_variable(text:String) {
        var arr = text.split(" ");
        if (arr[0]=="rename" && (arr[1]=="variable" || arr[1]=="variables")){
            let editor = vscode.window.activeTextEditor;
            if (editor) {
                const document = editor.document;
                for (var i=0;i<this.manager.struct_command_list.length;i++){
                    let line = this.manager.struct_command_list[i];
                    let documentLine = document.lineAt(i);
                    let nameToReplace = arr[2];
                    let replaceWith = arr[4];
                    var temp = line.split(" ");
                    var flag = false;
                    for (var j=0;j<temp.length-1;j++){
                        if (temp[j]=="#variable" && (temp[j+1]==nameToReplace|| temp[j+1].startsWith(nameToReplace))){
                            temp[j+1]=replaceWith;
                            flag= true;
                        }
                    }
                    if (flag){
                        this.manager.struct_command_list[i] = temp.join(" ");
                        editor.edit (editBuilder =>{
                            editBuilder.delete(documentLine.range);
                            editBuilder.insert(documentLine.range.start, temp.join(" "));
                        });
                    }
                }
            }
        }
    }
    
    check_if_comment_line(text: String) {
        var arr = text.split(" ");
        if (arr[0]== "comment" && arr[1] == "line"){
            let editor = vscode.window.activeTextEditor;
            if (editor){
                const document = editor.document;
                let line_num = parseInt(arr[2])
                let line = document.lineAt(line_num-1);
                editor.edit (editBuilder => {
                    editBuilder.insert(line.range.start, "#comment");
                    editBuilder.insert(line.range.end,"#end_comment");
                    this.manager.speech_hist[line_num-1]= "#comment"+this.manager.speech_hist[line_num-1]+"#end_comment";
                    this.manager.struct_command_list[line_num-1] = "#comment"+this.manager.struct_command_list[line_num-1]+"#end_comment";
                });
            }	
            
        }
                
    }
    
}