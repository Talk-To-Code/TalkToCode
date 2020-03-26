// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { StructCommandManager } from './struct_command_manager'
import { EditCommandManager } from './edit_command_manager';
import { runTestCasesForC, runTestCasesForPy, test_function } from './tester'
import { getUserSpecs } from './user_specs'
const {spawn} = require('child_process');

var code_segments = [""];
var cursor_pos = 0;
var count_lines= [0];
var manager: StructCommandManager;
var editManager: EditCommandManager;

var microphone = true;

var codeBuffer = "";
var errorFlag = false;
var language = "";

var cwd = "";
var ast_cwd = "";
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

		initUser("lawrence"); /* Currently only has "lawrence" and "archana" as the users. */
		initManager();
		listen();
		// test_function();
		// runTestCasesForC();
		// runTestCasesForPy();

	});
	context.subscriptions.push(disposable);
}

function initUser(user: string) {
	var userSpecs = getUserSpecs(user);
	cwd = userSpecs[0];
	cred = userSpecs[1];
	ast_cwd = userSpecs[2];
}

function initManager() {
	language = "c";

	manager = new StructCommandManager(language, true);
	editManager =  new EditCommandManager(manager, code_segments, count_lines);
}

function listen() {
	// env: {GOOGLE_APPLICATION_CREDENTIALS: cred}
	const child = spawn('node', ['speech_recognizer.js'], {shell:true, cwd: cwd, env: {GOOGLE_APPLICATION_CREDENTIALS: cred}});
	child.stdout.on('data', (data: string)=>{
		let transcribed_word = data.toString().trim();

		if (transcribed_word == 'Listening') vscode.window.showInformationMessage('Begin Speaking!');

		else if (transcribed_word == "microphone off" || transcribed_word == "sleep" || transcribed_word == "go to sleep") {
			microphone = false;
			vscode.window.showInformationMessage("microphone asleep");
		}

		else if (transcribed_word == "microphone on" || transcribed_word == "wake up") {
			microphone = true;
			vscode.window.showInformationMessage("microphone active");
		}

		else if (microphone && editManager.check_if_edit_command(transcribed_word)) {
			console.log(transcribed_word)
			console.log("IN HERE TO EDIT");
			editManager.checkAll(transcribed_word, code_segments,count_lines);
			// writeToEditor(manager.managerStatus());
			displayCode(manager.struct_command_list);
			console.log(manager.managerStatus())
		}

		else if (microphone) {
			vscode.window.showInformationMessage("You just said: " + transcribed_word);
			errorFlag = false;
			codeBuffer = "";

			manager.parse_speech(transcribed_word);
			// writeToEditor(manager.managerStatus());
			displayCode(manager.struct_command_list);
			console.log(manager.managerStatus())
		}
	});
}

function displayCode(struct_command_list: string[]) {
	/* Set up commands to insert */
	let commands = '#c_program SampleProgram #include "stdio.h";; ';
	if (language == "c") commands = '#c_program SampleProgram #include "stdio.h";; ';
	else if (language == "py") commands = '#p_program SampleProgram #include "sys";; ';

	for (var i=0; i<struct_command_list.length; i++) commands += struct_command_list[i] + "\n"
	commands += ' #program_end';
    const other_child = spawn('java', ['ast/ASTParser 1'], {shell:true, cwd: ast_cwd});
	other_child.stdin.setEncoding('utf8');

    other_child.stdin.write(commands);
	other_child.stdin.end();

    other_child.stdout.setEncoding('utf8');
    other_child.stdout.on('data', (data: string)=>{
		codeBuffer += data;

        if (data.includes("AST construction complete") && !errorFlag) {
			var code = codeBuffer.split("ASTNode")[0].trimLeft();
			codeBuffer = ""; // clear code stream
			writeToEditor(code, struct_command_list);
		}
		else if (data.includes("Not Supported Syntax Format")) {
			console.log("error")
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

function map_lines_to_code(struct_command_list: string[]){
	cursor_pos = 0;
	count_lines = [];
	var count =0;
	var j =0;
	var includeStatement = false;
	for (var i=0;i<code_segments.length;i++) {
		includeStatement = false;
		if (code_segments[i].startsWith("#include") || code_segments[i].startsWith("import")) includeStatement = true;

		if (includeStatement || code_segments[i] == "\r" || code_segments[i] == "" || code_segments[i] == "\t") {
			count++;
			/* Because cursor position is a blank line in the code so this if-block to detect blank lines is used. 
			Blank line is a struct command "#string \"\";;", hence this blank line will be mapped to that 
			struct command as well. */
			if (!includeStatement && j < struct_command_list.length && struct_command_list[j] == "#string \"\";;") {
				count_lines[j] = count;
				cursor_pos = count;
				j++;
			}
		}
		else if (i< code_segments.length-1 && checkIfFunctionPrototype(code_segments[i+1], code_segments[i])){
			count++;
		}
		else {
			if (struct_command_list[j].startsWith("#string")) cursor_pos = count;
			count++;
			count_lines[j]=count;
			j++;
		}
	}
}

function writeToEditor(code: string, struct_command_list: string[]) {
	console.log(code)
	code_segments = code.split("\n");
	map_lines_to_code(struct_command_list);
	// for (var i=0;i<count_lines.length;i++) {
	// 	console.log("DEBUG LINE COUNTS: ");
	// 	console.log(count_lines[i]);
	// }
	console.log("cursor position: " + cursor_pos);
	console.log(JSON.stringify(code));

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
		}).then(() => {
			/* Because editBuilder is a callback function, cursor position cannot be set (it will be outdated) without then().
			then() is called when the callback function is done editing. */
			if (editor) {
				var lineAt = editor.document.lineAt(cursor_pos).text;
				if (lineAt.startsWith("\t") || lineAt == "}") {
					cursor_pos -= 1;
				}
				editor.selection = new vscode.Selection(new vscode.Position(cursor_pos, lineAt.length), new vscode.Position(cursor_pos, lineAt.length));
			}
		})
	}
}


// this method is called when your extension is deactivated
export function deactivate() {}