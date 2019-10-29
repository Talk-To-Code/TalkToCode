// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { clean } from './clean_text';
import { get_struct } from './text2struct';
const {spawn} = require('child_process');

var current_speech = ""
var speech_hist = [""]
var variable_list = [""]

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

	});

	context.subscriptions.push(disposable);
}


function listen() {

	// cwd is the current working directory. Make sure you update this.
	
	let cwd = 'C:\\Users\\Lawrence\\Desktop\\talktocode\\talk-to-code\\src';
	// cred is the credential json from google you have to obtain to use their speech engine.
	let cred = 'C:\\Users\\Lawrence\\Desktop\\fyp\\benchmarking\\test_google_cloud\\My-Project-f25f37c6fac1.json';
	const child = spawn('node', ['speech_recognizer.js'], {shell:true, cwd: cwd, env: {GOOGLE_APPLICATION_CREDENTIALS: cred}});
	child.stdout.on('data', (data: string)=>{
		let transcribed_word = data.toString().trim();

		if (transcribed_word == 'Listening') vscode.window.showInformationMessage('Begin Speaking!');
		else {
			console.log("Transcribed word: " + transcribed_word)
			transcribed_word = clean(transcribed_word);

			/* Current command for undo */
			if (transcribed_word == 'scratch that') {
				console.log(speech_hist)
				if (speech_hist.length > 0) {
					var prev_speech = speech_hist[speech_hist.length-1];
					speech_hist.pop();
					undo_prev_command(prev_speech);
					current_speech = prev_speech;
				}
			}
			/* Current command for next line */
			else if (transcribed_word == "skip") {
				speech_hist.push("skip");
				next_line();
			}
			else {
				/* update prev speech in the case of a future undo */
				speech_hist.push(current_speech);

				/* concat latest speech with current line of speech */
				current_speech = current_speech + " " + transcribed_word;
				var struct_command = get_struct(current_speech.trim(), variable_list);

				if (struct_command[0] == "Not ready") {	
					display_current_command(current_speech, struct_command[2]);
				}
				else {
					display_current_command(struct_command[0], struct_command[2]);
					/* Adds new variables to the variable list. */
					
					concat_variable_list(struct_command[1]);
					if (struct_command[2]) next_line();
				}
			}
		}
	});

}

function check_if_delete_line(text: String) { 
	var arr = text.split(" ");
	if (arr[0] == "delete" && arr[1]=="line") {
		console.log("deleting line...");
		let editor = vscode.window.activeTextEditor;
		if (editor) {
			const document = editor.document;
			let line_num = parseInt(arr[2])
			let line = document.lineAt(line_num)
			editor.edit (editBuilder =>{
				editBuilder.delete(line.range)
			});
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
			let line = document.lineAt(line_num)
			editor.edit (editBuilder => {
				editBuilder.insert(line.range.start, "// ")
			});
		}	
	}
		
}


function display_current_command(text: any, newline: any) {

	let editor = vscode.window.activeTextEditor;
	if (editor) {
		// Current line being edited
		let curr_line = editor.selection.anchor.line;
		let current_range = editor.document.lineAt(curr_line).range;
		console.log("length of text: " + text.length);

		if (newline) text = text + "\n";

		editor.edit(editBuilder => {
			editBuilder.replace(current_range, text);
		});

		/* Select the whole line */
		if (!newline){
			editor.selection = new vscode.Selection(curr_line, 0, curr_line, text.length);
		}
		/* Move cursor to new line */
		else {
			let cursor = editor.selection.active;
			let new_anchor = new vscode.Position(cursor.line+1, 0);
			editor.selection = new vscode.Selection(new_anchor, new_anchor);
		}
		
	}
}

function undo_prev_command(text: string) {

	let editor = vscode.window.activeTextEditor;
	if (editor) {
		// Current line being edited
		let curr_line = editor.selection.anchor.line;
		// Declare new range for editBuilder to replace
		let current_range = editor.document.lineAt(curr_line).range;
		editor.edit(editBuilder => {
			editBuilder.replace(current_range, text);
		});
		// Select the whole line
		editor.selection = new vscode.Selection(curr_line, 0, curr_line, text.length);
	}
}

function next_line() {
	let editor = vscode.window.activeTextEditor;
	if (editor) {
		/* Current line being edited */
		let eol_position = editor.selection.active;
		editor.edit(editBuilder => {
			editBuilder.insert(eol_position, "\r\n");
		});
		current_speech = "";
		/* Unselect previous line */
		let cursor = editor.selection.active;
		let new_anchor = new vscode.Position(cursor.line+1, 0);
		editor.selection = new vscode.Selection(new_anchor, new_anchor);
	}
}


function concat_variable_list(var_list: any) {
	if (var_list.length > 0) {
		let i;
		for (i = 0; i < var_list.length; i++) {
			if (var_list[i].length > 0 && !variable_list.includes(var_list[i])) {
				variable_list.push(var_list[i]);
			}
		}
	}
	console.log("variable list");
	console.log(variable_list);
}


// this method is called when your extension is deactivated
export function deactivate() {}
