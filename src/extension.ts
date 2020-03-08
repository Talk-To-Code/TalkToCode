// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { StructCommandManager } from './struct_command_manager'
import { runTestCases } from './tester'
import { EditCommandManager } from './edit_command_manager';
import { compress_name } from './compress_name';
const {spawn} = require('child_process');

var code_segments = [""];
var count_lines = [];
var manager = new StructCommandManager();
var editManager = new EditCommandManager(manager, code_segments, count_lines);
var codeBuffer = "";
var errorFlag = false;

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
		// console.log("testing");
		// runTestCases();

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

			else if (editManager.check_if_edit_command(transcribed_word)){
				console.log("IN HERE TO EDIT");
				editManager.checkAll(transcribed_word, code_segments);
				console.log("DONE CHECKING ALL EDITS");
				displayStructCommands(manager.struct_command_list);
				console.log("DONE WITH DISPLAYING STRUCTURED COMMAND")
				displayCode(manager.struct_command_list)
				console.log("DONE WITH DISPLAYING CODE")
			}

			else {
				console.log("IN HERE TO PARSE STUFF");
				errorFlag = false;
				codeBuffer = "";

				manager.parse_speech(transcribed_word)
				displayStructCommands(manager.struct_command_list)
				displayCode(manager.struct_command_list)
			}
		}
	});
}

function displayStructCommands(struct_command_list: string[]) {
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

function displayCode(struct_command_list: string[]) {
	/* Set up commands to insert */
	let commands = '#c_program SampleProgram #include "stdio h";; '
	for (var i=0; i<struct_command_list.length; i++) commands += struct_command_list[i] + "\n"
	commands += ' #program_end';

	console.log(commands)

	let cwd = '/Users/Archana/Desktop/TalkToCode/AST/src';

    const other_child = spawn('java', ['ast/ASTParser'], {shell:true, cwd: cwd});
	other_child.stdin.setEncoding('utf8');

    other_child.stdin.write(commands);
    other_child.stdin.end();

    other_child.stdout.setEncoding('utf8');
    other_child.stdout.on('data', (data: string)=>{
		codeBuffer += data;

        if (data.includes("AST construction complete") && !errorFlag) {
			var data_segments = codeBuffer.split("#include");
			console.log("DEBUG IN EXTENSION: "+data_segments);
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

function checkIfFunctionPrototype(text1: string, text2: string){
	if (text2.endsWith(";")){
		text2 = text2.substring(0,text2.length-1); 
	} 
	if (text1.indexOf(text2)!=-1){
		return true;
	}
}

function map_lines_to_code(){
	var count =0;
	var j =0;
	for (var i=0;i<code_segments.length;i++){
		if (code_segments[i].startsWith("#include") || code_segments[i]==""){
			count++;
		}
		else if (i< code_segments.length-1 && checkIfFunctionPrototype(code_segments[i+1], code_segments[i])){
			count++;
		}
		else {
			count++;
			count_lines[j]=count;
			j++;
		}
	}
}

function writeToEditor(code: string) {
	var commands = code.split("\n");
	code_segments=[];
    for (var i = 0;i < commands.length; i++) {
        code_segments.push(commands[i]);
	}
	for (var i=0;i<code_segments.length;i++){
		console.log("DEBUG IN CODE SEGMENT: "+i)
		console.log(code_segments[i]);
	}
	for (var j=0;j<manager.struct_command_list.length;j++){
		console.log("DEBUG STRUCT COMMANDS: "+j);
		console.log(manager.struct_command_list[j]);
	}
	map_lines_to_code();

	for (var k=0;k<count_lines.length;k++){
		console.log("DEBUG THE LINE COUNTS: "+k);
		console.log(count_lines[k]);
	}
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