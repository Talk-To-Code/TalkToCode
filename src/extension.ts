// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
const {spawn} = require('child_process');

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
	let cwd = 'C:\\Users\\Lawrence\\Desktop\\talktocode\\talk-to-code\\src';
	let cred = 'C:\\Users\\Lawrence\\Desktop\\fyp\\benchmarking\\test_google_cloud\\My-Project-f25f37c6fac1.json';
	
	const child = spawn('node', ['speech_recognizer.js'], {shell:true, cwd: cwd, env: {GOOGLE_APPLICATION_CREDENTIALS: cred}});
	child.stdout.on('data', (data)=>{
		let transcribed_word = data.toString()
		console.log(transcribed_word)
		if (transcribed_word == 'Listening\n') {
			vscode.window.showInformationMessage('Begin Speaking!');
		}
		else {
			write_to_cursor(data.toString());
		}
	});

}

function write_to_cursor(text) {
	let editor = vscode.window.activeTextEditor;
	if (editor) {
		let cursor_position = editor.selection.anchor;
		editor.edit(editBuilder => {
			editBuilder.insert(cursor_position, text);
		});
	}
}

// this method is called when your extension is deactivated
export function deactivate() {}
