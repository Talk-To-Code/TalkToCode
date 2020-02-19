import { StructCommandManager } from './struct_command_manager'

export function runTestCases() {

    var test_cases = [[""], [""]];

    // test_cases = generate_test_cases("declare_assign");
    // runTestCase(test_cases[0], test_cases[1]);

    // test_cases = generate_test_cases("if_block");
    // runTestCase(test_cases[0], test_cases[1]);

    // test_cases = generate_test_cases("for_loop");
    // runTestCase(test_cases[0], test_cases[1]);

    // test_cases = generate_test_cases("create_function");
    // runTestCase(test_cases[0], test_cases[1]);
    
    // test_cases = generate_test_cases("while_loop");
    // runTestCase(test_cases[0], test_cases[1]);

    // test_cases = generate_test_cases("do_while_loop");
    // runTestCase(test_cases[0], test_cases[1]);

    // test_cases = generate_test_cases("switch_case");
    // runTestCase(test_cases[0], test_cases[1]);

    // test_cases = generate_test_cases("jump_statements");
    // runTestCase(test_cases[0], test_cases[1]);

    test_cases = generate_test_cases("call_function");
    runTestCase(test_cases[0], test_cases[1]);

}

function generate_test_cases(cases: string) {
    
    /* First element is the test cases. second element is the correct outputs. */
    var test_cases = [[""], [""]];

    if (cases == "declare_assign") {
        /* Not yet tested for declare float count equals hello world. does not work
        By right, "declare float count equals hello" should not work as well since hello was not declared */
        test_cases[0] = ["declare integer", "hello world", "equal 5", "hello world equals 4",
        "declare float", "count", "equals hello",
        "declare integer first equals 10"];

        test_cases[1] = ["#create int #variable helloWorld #value 5 #dec_end;;", 
        "#assign #variable helloWorld #with #value 4;;", 
        "#create float #variable count #variable hello #dec_end;;",
        "#create int #variable first #value 10 #dec_end;;", ""];
    }

    else if (cases == "jump_statements") {
        test_cases[0] = ["return i equal 2"];

        test_cases[1] = ["return #paramater #assign #variable i #with #value 2;;",""];
    }

    else if (cases == "if_block") {
        test_cases[0] = ["begin if hello greater than 5", "declare integer i equal 4", "i equals 6",
        "begin if", "i", "equals", "4", "declare count equal 6"];

        test_cases[1] = ["if #condition #variable hello > #value 5 #if_branch_start",
        "#create int #variable i #value 4 #dec_end;;","#assign #variable i #with #value 6;;",
        "if #condition #variable i == #value 4 #if_branch_start","declare count equal 6","#if_branch_end;;",
        "#if_branch_end;;"];
    }
    else if (cases == "for_loop") {
        test_cases[0] = ["begin Loop condition I equal 0 condition I less than 5 condition I plus plus",
        "declare integer hello equals 5"];
        test_cases[1] = ["for #condition #assign #variable I #with #value 0 #condition #variable I < #value 5 #condition #post #variable I ++ #for_start",
        "#create int #variable hello #value 5 #dec_end;;","","#for_end;;"];
    }

    else if (cases == "create_function") {
        test_cases[0] = ["create function find maximum with return type integer with parameter integer array numbers with parameter integer length begin"];
        test_cases[1] = ["#function_declare findMaximum int #parameter_a #dimension 1 int #array numbers #parameter int length #function_start", "", "#function_end;;"];
    }

    else if (cases == "while_loop") {
        test_cases[0] = ["while first not equal second"];
        test_cases[1] = ["while #condition #variable first != #variable second #while_start","","#while_end;;"];
    }

    else if (cases == "do_while_loop") {
        test_cases[0] = ["do while first not equal second", "hello equal 5"];
        test_cases[1] = ["do #condition #variable first != #variable second #while_start", "#assign #variable hello #with #value 5;;", 
        "","#while_end;;"];
    }
    
    else if (cases == "switch_case") {
        test_cases[0] = ["begin switch hello", "case 2 hello equal 5"];
        test_cases[1] = ["switch #condition #variable hello case #value 2 #case_start #assign #variable hello #with #value 5;; #case_end;;"];
    }

    else if (cases == "call_function") {
        test_cases[0] = ["call function print f parameter string enter two numbers end string end function"];
        // test_cases[0] = ["call function print f"]
        test_cases[1] = [""];
    }

    return test_cases
}

/* Run and compare my output and correct output using test cases. */
function runTestCase(test_cases: string[], correct_output: string[]) {
    var test_manager = new StructCommandManager();
    var i;
    for (i = 0; i < test_cases.length; i++) {
        test_manager.parse_speech(test_cases[i]);
    }

    var output = test_manager.struct_command_list;

    /* To compare JS arrays. Convert to JSON */
    if (JSON.stringify(output) != JSON.stringify(correct_output)) {
        console.log("### ERROR ###");
        console.log(JSON.stringify(output));
        console.log(JSON.stringify(correct_output));
    }
}

