// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { StructCommandManager } from './struct_command_manager'
import { generate_test_cases } from './tester'
import { write } from 'fs';
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
	let cwd = 'C:\\Users\\Lawrence\\Desktop\\talktocode\\talk-to-code\\src';
	// cred is the credential json from google you have to obtain to use their speech engine.
	let cred = 'C:\\Users\\Lawrence\\Desktop\\fyp\\benchmarking\\test_google_cloud\\My-Project-f25f37c6fac1.json';
	const child = spawn('node', ['speech_recognizer.js'], {shell:true, cwd: cwd, env: {GOOGLE_APPLICATION_CREDENTIALS: cred}});
	child.stdout.on('data', (data: string)=>{
		let transcribed_word = data.toString().trim();

		if (transcribed_word == 'Listening') vscode.window.showInformationMessage('Begin Speaking!');
		else {
			vscode.window.showInformationMessage("You just said: " + transcribed_word);

			if (transcribed_word == "show me the document") showTextDocument();

			else if (transcribed_word == "show me the code") displayCode(manager.struct_command_list)

			else {
				manager.parse_speech(transcribed_word)
				displayStructCommands(manager.struct_command_list)
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


function displayStructCommands(struct_command_list) {
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

	let cwd = 'C:\\Users\\Lawrence\\Desktop\\talktocode\\talk-to-code\\AST\\src';

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
