// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { clean } from './clean_text';
import { get_struct } from './text2struct';
import { print } from 'util';
const {spawn} = require('child_process');

var current_speech = ""
var speech_hist = [""]
var printed_length = 0 // used for undo and replace

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

			if (transcribed_word == 'scratch that') {
				console.log(speech_hist)
				if (speech_hist.length > 0) {
					var prev_speech = speech_hist[speech_hist.length-1];
					speech_hist.pop();
					undo_prev_command(prev_speech);
					current_speech = prev_speech;
				}
			}
			else {
				/* update prev speech in the case of a future undo */
				speech_hist.push(current_speech);

				/* concat latest speech with current line of speech */
				current_speech = current_speech + " " + transcribed_word;
				var struct_command = get_struct(current_speech.trim());
				if (struct_command == "Not ready") {
					display_current_command(current_speech);
					printed_length = current_speech.length;
				}
				else {
					display_current_command(struct_command);
					printed_length = struct_command.length;
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


function display_current_command(text: string) {

	let editor = vscode.window.activeTextEditor;
	if (editor) {
		// Current line being edited
		let curr_line = editor.selection.anchor.line;

		editor.edit(editBuilder => {

			// Declare new range for editBuilder to replace
			var start_position = new vscode.Position(curr_line, 0);
			var end_position = new vscode.Position(curr_line, text.length);
			var current_range = new vscode.Range(start_position, end_position);
			editBuilder.replace(current_range, text);
		});
		// Select the whole line
		editor.selection = new vscode.Selection(curr_line, 0, curr_line, text.length);
	}
}

function undo_prev_command(text: string) {

	let editor = vscode.window.activeTextEditor;
	if (editor) {
		// Current line being edited
		let curr_line = editor.selection.anchor.line;

		editor.edit(editBuilder => {

			// Declare new range for editBuilder to replace
			var start_position = new vscode.Position(curr_line, 0);
			var end_position = new vscode.Position(curr_line, printed_length);
			var current_range = new vscode.Range(start_position, end_position);
			editBuilder.replace(current_range, text);
		});
		// Select the whole line
		editor.selection = new vscode.Selection(curr_line, 0, curr_line, text.length);
	}
}


// this method is called when your extension is deactivated
export function deactivate() {}
