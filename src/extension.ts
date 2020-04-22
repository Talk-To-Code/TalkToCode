// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { StructCommandManager } from './struct_command_manager'
import { EditCommandManager } from './edit_command_manager';
import { runTestCasesForC, runTestCasesForPy, test_function } from './tester'
import {runEditTests} from './edit_tester'
import { getUserSpecs } from './user_specs'
const {spawn} = require('child_process');

var code_segments = [""];
var cursor_pos = 0;
var count_lines= [0];
var count_speech = [0];
var manager: StructCommandManager;
var editManager: EditCommandManager;

var microphone = true;

var codeBuffer = "";
var errorFlag = false;
var language = "";

var cwd = "";
var ast_cwd = "";
var cred = "";

var datatypes = ["int", "float", "long", "double", "char"];

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

		initUser("archana"); /* Currently only has "lawrence" and "archana" as the users. */
		initManager();
		listen();
		//runEditTests();
		// test_function();
		//runTestCasesForC();
		//runTestCasesForPy();

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
	editManager =  new EditCommandManager(manager,count_lines,count_speech); 
}

function listen() {
	displayCode([""]);
	// env: {GOOGLE_APPLICATION_CREDENTIALS: cred}
	const child = spawn('node', ['speech_recognizer.js'], {shell:true, cwd: cwd});
	child.stdout.on('data', (data: string)=>{
		let transcribed_word = data.toString().trim();
		console.log("TRANSCRIBED WORD: "+transcribed_word);

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
			vscode.window.showInformationMessage("You just said the following edit command: " + transcribed_word);

			console.log(transcribed_word)
			editManager.checkAll(transcribed_word,count_lines);
			displayCode(manager.struct_command_list);
			console.log(manager.managerStatus());
		}

		else if (microphone) {
			vscode.window.showInformationMessage("You just said: " + transcribed_word);
			errorFlag = false;
			codeBuffer = "";

			manager.parse_speech(transcribed_word, count_lines);
			displayCode(manager.struct_command_list);
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
			console.log("error");
			codeBuffer = ""
			errorFlag = true;
		}
	});
}

/* text2 - function prototype, text1 - actual function
Conditions for a function prototype and function:
- one ends with ";", the other ends with "{"
- both start with same data type value
- function name has to be the same

Only function declarations end with "{" and begins with a datatype value
statements that end with ";" and begin with datatype are declaration statements.  However, they do not
include "(" in the second word.
*/
function checkIfFunctionPrototype(text1: string, text2: string){
	if (!text2.endsWith(";")) return false;
	if (!text1.endsWith("{")) return false;

	/* Not needed because blank lines should alr be caught before entering this function call.
	Just as a precaution. */
	if (text1.length < 2 || text2.length < 2) return false;

	text2 = text2.substring(0,text2.length-1);
	text1 = text1.substring(0,text1.length-1);
	text2 = text2.replace(/  +/g, ' ');
	text1 = text1.replace(/  +/g, ' ');

	/* Convert text1 to function prototype for comparision */
	var splitted_text1 = text1.split(" ");
	var splitted_text2 = text2.split(" ");

	if (splitted_text1.length < 2 || splitted_text2.length < 2) return false;
	if (!datatypes.includes(splitted_text1[0]) || !datatypes.includes(splitted_text2[0])) return false;
	if (!splitted_text1[1].includes("(") || !splitted_text2[1].includes("(")) return false;
	if (splitted_text1[0] != splitted_text2[0]) return false;
	if (splitted_text1[1] != splitted_text2[1]) return false;
	else return true;
}

function map_lines_to_code(struct_command_list: string[]){
	console.log(JSON.stringify(code_segments));
	cursor_pos = 0;
	count_lines = [];
	var count =0;
	var j =0;
	var includeStatement = false;
	for (var i=0;i<code_segments.length;i++) {
		console.log(JSON.stringify(code_segments[i]) + " " + i + " " + count);
		includeStatement = false;
		code_segments[i] = code_segments[i].trim();
		if (code_segments[i].startsWith("#include") || code_segments[i].startsWith("import")) includeStatement = true;
		if (includeStatement || code_segments[i] == "\r" || code_segments[i] == "" || code_segments[i] == "\t" || code_segments[i]=="*/"|| code_segments[i]=="/*") {
			count++;
			/* Because cursor position is a blank line in the code so this if-block to detect blank lines is used. 
			Blank line is a struct command "#string \"\";;", hence this blank line will be mapped to that 
			struct command as well. */
			if (!includeStatement && j < struct_command_list.length && struct_command_list[j] == "#string \"\";;") {
				count_lines[j] = count;
				cursor_pos = i;
				j++;
			}
		}
		else if (i< code_segments.length-1 && checkIfFunctionPrototype(code_segments[i+1], code_segments[i])){
			count++;
		}
		else {
			if (struct_command_list[j].startsWith("#string")) cursor_pos = count;
			count++;
			count_lines[j] = count;
			j++;
		}
	}
}

function map_speech_to_struct_command(){
	count_speech = [];
	var count =0;
	var j =0;
	for (var i=0;i<manager.struct_command_list.length;i++){
		var line = manager.struct_command_list[i];
		if (line.startsWith("#comment" || line.indexOf("cursor here")!=-1)|| line.startsWith("#if_branch_end;;")|| line.startsWith("#else_branch_end") || line.startsWith("#function_end;;")|| line.startsWith("#while_end;;")|| line.startsWith("#for_end;;")){
			count++;
		}
		else{
			count_speech[j] = count++;
			j++;
		}
	}
}

function writeToEditor(code: string, struct_command_list: string[]) {
	code_segments = code.split("\n");

	map_lines_to_code(struct_command_list);
	console.log("cursor pos: " + cursor_pos)
	map_speech_to_struct_command();
	
	console.log("LINE_COUNT: "+JSON.stringify(count_lines));
	console.log("SPEECH_COUNT: "+JSON.stringify(count_speech));

	let editor = vscode.window.activeTextEditor;

	if (manager.holding) {
		var line = code_segments[manager.heldline];
		var numTabs = "";
		for (var i = 0; i < line.length; i++) {
			if (line[i] == "\t") numTabs += "\t";
		}

		var speech = manager.curr_speech.join(" ");
		var temp = speech.split(" ");
		if (speech.includes("spell") && speech.includes("end_spell")) {
			var spellIdx = temp.indexOf("spell");
			var spellEndIdx = temp.indexOf("end_spell");
			speech = temp.slice(0, spellIdx).join(" ").trim() + " " + 
			temp.slice(spellIdx + 1, spellEndIdx).join("").trim() + " " + 
			temp.slice(spellEndIdx + 1).join(" ").trim();
		}

		code_segments.splice(manager.heldline - 1, 1, numTabs + speech + " *stay");
		code = code_segments.join("\n");
		cursor_pos = manager.heldline - 1;
	}

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
				if (manager.isLeftRightCalled){
					editor.selection = new vscode.Selection(new vscode.Position(cursor_pos, manager.len_cursor), new vscode.Position(cursor_pos, manager.len_cursor));
				}
				else editor.selection = new vscode.Selection(new vscode.Position(cursor_pos, lineAt.length), new vscode.Position(cursor_pos, lineAt.length));
			}
		})
	}
}


// this method is called when your extension is deactivated
export function deactivate() {}