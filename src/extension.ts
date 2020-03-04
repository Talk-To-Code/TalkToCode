// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { StructCommandManager } from './struct_command_manager'
import { initUser } from './user_specs'
import { runTestCases } from './tester'
const {spawn} = require('child_process');

var manager = new StructCommandManager();
var codeBuffer = "";
var errorFlag = false;

var cwd = "";
var cred = "";

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

		var userSpecs = initUser("lawrence");
		cwd = userSpecs[0];
		cred = userSpecs[1];
		listen();
		// console.log("testing");
		// runTestCases();

	});

	context.subscriptions.push(disposable);
}

function listen() {
	const child = spawn('node', ['speech_recognizer.js'], {shell:true, cwd: cwd, env: {GOOGLE_APPLICATION_CREDENTIALS: cred}});
	child.stdout.on('data', (data: string)=>{
		let transcribed_word = data.toString().trim();

		if (transcribed_word == 'Listening') vscode.window.showInformationMessage('Begin Speaking!');
		else {
			vscode.window.showInformationMessage("You just said: " + transcribed_word);
			errorFlag = false;
			codeBuffer = "";

			manager.parse_speech(transcribed_word);
			developerMode(manager.struct_command_list, manager.speech_hist, manager.curr_speech, manager.curr_index);
			// displayCode(manager.struct_command_list);
		}
	});
}

function displayStructCommands(struct_command_list: string[]) {
	let editor = vscode.window.activeTextEditor;

	/* Set up commands to insert */
	let commands = ""
	let i
	for (i=0; i<struct_command_list.length; i++) {
		commands += struct_command_list[i] + "\r"
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

function developerMode(struct_command_list: string[], speech_hist: string[][], curr_speech: string[], curr_idx: number) {
	console.log("updating");
	
	let toDisplay = "Current Speech: " + JSON.stringify(curr_speech) + '\n';
	toDisplay += "Current index: " + curr_idx + '\n';
	toDisplay += "//////////////////////////////////Structured Command List:";
	toDisplay += "//////////////////////////////////\n";
	
	for (var i = 0; i < struct_command_list.length; i++) {
		toDisplay += "[" + i + "]" + struct_command_list[i] + '\n';
	}
	toDisplay += "//////////////////////////////////Speech History List:";
	toDisplay += "//////////////////////////////////\n";

	for (var i = 0; i < speech_hist.length; i++) {
		toDisplay += "[" + i + "]" + JSON.stringify(speech_hist[i]) + '\n';
	}

	writeToEditor(toDisplay);
}

function displayCode(struct_command_list: string[]) {
	/* Set up commands to insert */
	let commands = '#c_program SampleProgram #include "stdio h";; '
	for (var i=0; i<struct_command_list.length; i++) commands += struct_command_list[i] + "\n"
	commands += ' #program_end';
    const other_child = spawn('java', ['ast/ASTParser'], {shell:true, cwd: cwd});
	other_child.stdin.setEncoding('utf8');

    other_child.stdin.write(commands);
    other_child.stdin.end();

    other_child.stdout.setEncoding('utf8');
    other_child.stdout.on('data', (data: string)=>{
		codeBuffer += data;

        if (data.includes("AST construction complete") && !errorFlag) {
            var data_segments = codeBuffer.split("#include");
			var idxOfAST = data_segments[1].indexOf("ASTNode");
			codeBuffer = ""; // clear code stream
			writeToEditor("#include" + data_segments[1].slice(0, idxOfAST));
		}
		else if (data.includes("Not Supported Syntax Format")) {
			codeBuffer = ""
			errorFlag = true;
		}
	});
}

function writeToEditor(code: string) {
	let editor = vscode.window.activeTextEditor;
	if (editor) {
		/* Get range to delete */
		var lineCount = editor.document.lineCount;
		var start_pos = new vscode.Position(0, 0);
		var end_pos = new vscode.Position(lineCount, 0);
		var range = new vscode.Range(start_pos, end_pos);
		editor.edit(editBuilder => {
			editBuilder.delete(range);
			editBuilder.insert(start_pos, code);
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
