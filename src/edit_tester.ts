import { StructCommandManager } from './struct_command_manager'
import {EditCommandManager} from './edit_command_manager'

let existing_code = ["#create int #variable first #value 1 #dec_end;;"
    ,"#create int #variable hello #value 6 #dec_end;;"
    ,"#create int #variable third #dec_end;;"
    ,"if #condition #variable hello > #variable first #if_branch_start"
    ,"#assign #variable hello #with #variable first;;"
    ,"#if_branch_end;;"
    ,"#function subtract();;"
    ,"#function_declare subtract int #function_start"
    ,"#string \"\";;"
    ,"#function_end;;"
];

var existing_speech = ["declare int first equal 1", "declare int hello equal 6", "declare int third",
    "begin if hello greater than first", "hello equal first","exit block","call function subtract end function",
    "create function subtract with return type int begin"];

var speech_count = [0,1,2,3,4,6,7];
var line_count = [3,5,7,9,10,11,14,17,18,20];

var start_comment = "#comment ";
var end_comment= " #comment_end;;";
var insert_cursor = "#string \"\";;";

export function runEditTests() {

    var test_cases;

    test_cases = generate_test_cases("delete_line");
    runEditTest(test_cases.command,test_cases.expected);

    test_cases = generate_test_cases("delete_function");
    runEditTest(test_cases.command, test_cases.expected);

    test_cases = generate_test_cases("comment_line");
    runEditTest(test_cases.command,test_cases.expected);

    test_cases = generate_test_cases("uncomment_line");
    runEditTest(test_cases.command,test_cases.expected);

    test_cases = generate_test_cases("rename_variable")
    runEditTest(test_cases.command,test_cases.expected);

    test_cases = generate_test_cases("rename_function");
    runEditTest(test_cases.command,test_cases.expected);

    test_cases = generate_test_cases("cut_line");
    runEditTest(test_cases.command, test_cases.expected);

    test_cases = generate_test_cases("copy_line");
    runEditTest(test_cases.command, test_cases.expected);

    test_cases = generate_test_cases("typecast_variable");
    runEditTest(test_cases.command, test_cases.expected);

    test_cases = generate_test_cases("paste_above");
    runEditTest(test_cases.command, test_cases.expected);

    test_cases = generate_test_cases("paste_below");
    runEditTest(test_cases.command, test_cases.expected);

    test_cases = generate_test_cases("insert_before_line");
    runEditTest(test_cases.command, test_cases.expected);

    test_cases = generate_test_cases("insert_before_block");
    runEditTest(test_cases.command, test_cases.expected);

    test_cases = generate_test_cases("search_and_replace");
    runEditTest(test_cases.command, test_cases.expected);
}


function generate_test_cases(cases: String){
    var command  = "";
    var expected = [...existing_code];

    if (cases=="delete_line"){
        command = "delete line 5";
        expected.splice(1,1);
    }

    else if (cases=="comment_line"){
        command = "comment line 5";
        expected[1] = start_comment + expected[1] + end_comment
    }

    else if (cases=="rename_variable"){
        command = "rename variable hello to goodbye";
        expected[1] = "#create int #variable goodbye #value 6 #dec_end;;";
        expected[3] = "if #condition #variable goodbye > #variable first #if_branch_start";
        expected[4] = "#assign #variable goodbye #with #variable first;;"
    }

    else if (cases =="uncomment_line"){

        command = "uncomment line 7";
        expected[2] = "#create int #variable third #dec_end;;";
    }

    else if (cases=="rename_function"){
        command = "rename function subtract to addition";
        expected[6] = "#function addition();;";
        expected[7] = "#function_declare addition int #function_start"

    }
    else if (cases =="cut_line"){
        command = "cut line 5";
        expected = expected.splice(1,1);

    }

    else if (cases == "copy_line"){
        command = "copy line 3";
        expected = ["#create int #variable first #value 1 #dec_end;;"];
    }

    else if (cases == "delete_function"){
        command = "delete function subtract";
        expected.splice(7,3);
        expected.push("#string \"\";;");
    }

    else if (cases == "typecast_variable"){
        command = "typecast variable first as float at line 10";
        expected[4] = "#assign #variable hello #with #type float (#variable first);;"
    }

    else if (cases == "paste_above"){
        command = "paste above line 5";
        var temp = ["if #condition #variable second > #variable first #if_branch_start"
        ,"#assign #variable second #with #variable first;;"
        ,"#if_branch_end;;"];

        expected.splice(1,0,...temp);
    }

    else if (cases== "paste_below"){
        command = "paste below line 5";
        var temp = ["if #condition #variable second > #variable first #if_branch_start"
        ,"#assign #variable second #with #variable first;;"
        ,"#if_branch_end;;"];

        expected.splice(2,0,...temp);
    }

    else if (cases=="insert_before_line") {
        command = "insert before line 5";
        expected.splice(1,0,insert_cursor);
    }

    else if (cases =="insert_before_block"){
        command = "insert before if block";
        expected.splice(3,0,insert_cursor);
    }

    else if (cases == "search_and_replace"){
        command = "find first and replace with third";
        expected[0] = "#create int #variable third #value 1 #dec_end;;";
        expected[3] = "if #condition #variable hello > #variable third #if_branch_start";
        expected[4] = "#assign #variable hello #with #variable third;;";
    }

    return {command,expected};
}

function runEditTest(command: string, correct_output: string[]) {
    var test_manager = new StructCommandManager("c",false);
    var edit_manager = new EditCommandManager(test_manager,line_count,speech_count);
    for (var i=0;i<existing_speech.length;i++){
        test_manager.parse_speech(existing_speech[i], []);
    }

    if (command.startsWith("uncomment")){
        test_manager.struct_command_list[2] = start_comment+test_manager.struct_command_list[2] +end_comment;
    }

    if (command.startsWith("paste")){
        edit_manager.cut_copy_struct_buffer = ["if #condition #variable second > #variable first #if_branch_start"
        ,"#assign #variable second #with #variable first;;"
        ,"#if_branch_end;;"];
    }

    edit_manager.checkAll(command,line_count);

    var output = test_manager.struct_command_list;

    if (command.startsWith("cut") || command.startsWith("copy")){
        are_arrays_equal(edit_manager.cut_copy_struct_buffer,correct_output);
    }
    else 
        are_arrays_equal(output,correct_output);
    
}

/* To compare JS arrays. Convert to JSON */
function are_arrays_equal(arr1: String[], arr2: String[]){
    if (JSON.stringify(arr1) != JSON.stringify(arr2)) {
        print_error(arr1,arr2);
    }
    else if (JSON.stringify(arr1)==JSON.stringify(arr2)){
        console.log("### PASSED TEST ###")
    }
}

function print_error(actual: String[], expected: String[]){
    console.log("### ERROR ###");
    console.log("ACTUAL OUTPUT: ");
    console.log(JSON.stringify(actual));
    console.log("EXPECTED OUTPUT: ");
    console.log(JSON.stringify(expected));
}