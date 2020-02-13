// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { StructCommandManager } from './struct_command_manager'
import { generate_test_cases } from './tester'
import { write } from 'fs';
import { strict } from 'assert';
const {spawn} = require('child_process');

var manager = new StructCommandManager();

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "talk-to-code" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.helloWorld', () => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('coding by dictation!');
		listen();
		// var tests = generate_test_cases("for loop")
		
		// var i
		// for (i = 0; i < tests.length; i++) {
		// 	manager.parse_speech(tests[i]);
		// 	console.log(manager.struct_command_list)
		// }

	});

	context.subscriptions.push(disposable);
}


function listen() {

	// cwd is the current working directory. Make sure you update this.
	let cwd = '/Users/Archana/Desktop/TalkToCode/src';
    // cred is the credential json from google you have to obtain to use their speech engine.
    let cred = '/Users/Archana/Desktop/TalkToCode-f3a307e35758.json';
	const child = spawn('node', ['speech_recognizer.js'], {shell:true, cwd: cwd});
	child.stdout.on('data', (data: string)=>{
		let transcribed_word = data.toString().trim();

		if (transcribed_word == 'Listening') vscode.window.showInformationMessage('Begin Speaking!');
		else {
			vscode.window.showInformationMessage("You just said: " + transcribed_word);

			console.log(JSON.stringify(manager.curr_speech))

			if (transcribed_word == "show me the document") showTextDocument();

			else if (transcribed_word == "show me the code") displayCode(manager.struct_command_list)

			else if (check_if_edit_command(transcribed_word)){
				check_if_delete_line(transcribed_word);
				check_if_delete_function(transcribed_word);
				check_if_comment_line(transcribed_word);
				check_if_rename_variable(transcribed_word);
				check_if_rename_function(transcribed_word);
			}

			else {
				manager.parse_speech(transcribed_word)
				displayStructCommands(manager.struct_command_list)
			}
		}
	});

}

function check_if_edit_command(text: String){
	var arr = text.split(" ");
	if (arr[0]=="delete" || arr[0]=="rename" || arr[0]=="comment"){
		return true;
	}
	return false;
}

function check_if_delete_line(text: String) { 
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
		delete_edit_commands_from_history();
	}
}

function delete_edit_commands_from_history(){
	//manager.struct_command_list.splice(manager.struct_command_list.length-1,manager.struct_command_list.length);
	manager.speech_hist.splice(manager.speech_hist.length-1,manager.speech_hist.length);
}

function check_if_delete_function(text: String) {
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

function check_if_rename_function(text: String) {
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

function check_if_rename_variable(text:String) {
	var arr = text.split(" ");
	if (arr[0]=="rename" && (arr[1]=="variable" || arr[1]=="variables")){
		let editor = vscode.window.activeTextEditor;
		if (editor) {
			const document = editor.document;
			for (var i=0;i<manager.struct_command_list.length;i++){
				let line = manager.struct_command_list[i];
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
					manager.struct_command_list[i] = temp.join(" ");
					editor.edit (editBuilder =>{
						editBuilder.delete(documentLine.range);
						editBuilder.insert(documentLine.range.start, temp.join(" "));
					});
				}
			}
		}
	}
}

function check_if_comment_line(text: String) {
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
				manager.speech_hist[line_num-1]="#comment"+manager.speech_hist[line_num-1]+"#end_comment";
                manager.struct_command_list[line_num-1] = "#comment"+manager.struct_command_list[line_num-1]+"#end_comment";
			});
		}	
		
	}
			
}


function displayStructCommands(struct_command_list) {
	let editor = vscode.window.activeTextEditor;
	console.log("IN HERE DISPLAYING COMMANDS");

	/* Set up commands to insert */
	let commands = ""
	let i
	for (i=0; i<struct_command_list.length; i++) {
		commands += struct_command_list[i] + "\r"
		console.log(struct_command_list[i])
	}

	if (editor) {
		/* Get range to delete */
		var lineCount = editor.document.lineCount
		var start_pos = new vscode.Position(0, 0)
		var end_pos = new vscode.Position(lineCount, 0)
		var range = new vscode.Range(start_pos, end_pos)

		editor.edit(editBuilder => {
			editBuilder.delete(range)
			editBuilder.insert(start_pos, commands)
		});
	}

}

function displayCode(struct_command_list) {
	let editor = vscode.window.activeTextEditor;

	/* Set up commands to insert */
	let commands = '#c_program SampleProgram #include "stdio h";; '
	let i
	for (i=0; i<struct_command_list.length; i++) {
		commands += struct_command_list[i] + "\n"
	}

	commands += ' #program_end';

	console.log(commands)

	let cwd = '/Users/Archana/TalkToCode/AST/src';

    const other_child = spawn('java', ['ast/ASTParser'], {shell:true, cwd: cwd});
	other_child.stdin.setEncoding('utf8');
	

    other_child.stdin.write(commands);
    other_child.stdin.end();

    other_child.stdout.setEncoding('utf8');
    other_child.stdout.on('data', (data)=>{
		console.log(data)

        if (data.includes("AST construction complete")) {
            var code = "#include"
            var data_segments = data.split("#include")

            var idxOfAST = data_segments[1].indexOf("ASTNode")

            data_segments[1] = data_segments[1].slice(0, idxOfAST)

            code += data_segments[1];
			writeToEditor(code)
        }

	});

}

function writeToEditor(code: string) {
	let editor = vscode.window.activeTextEditor;
	if (editor) {
		/* Get range to delete */
		var lineCount = editor.document.lineCount
		var start_pos = new vscode.Position(0, 0)
		var end_pos = new vscode.Position(lineCount, 0)
		var range = new vscode.Range(start_pos, end_pos)
		console.log("hello there")
		console.log(code)
		editor.edit(editBuilder => {
			editBuilder.delete(range)	
			editBuilder.insert(start_pos, code)
		});
	}
}



function showTextDocument() {
	let editor = vscode.window.activeTextEditor;
	if (editor) {
		console.log(editor.document.getText())
	}
}


// this method is called when your extension is deactivated
export function deactivate() {}