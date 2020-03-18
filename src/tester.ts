import { StructCommandManager } from './struct_command_manager'
import { fragment_segmenter, parse_statement } from './parse_statements'

export function runTestCases() {

    var test_cases = [[""], [""]];
    test_cases = generate_test_cases("declare_assign");
    runTestCase(test_cases[0], test_cases[1]);

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

    // test_cases = generate_test_cases("jump_statements");
    // runTestCase(test_cases[0], test_cases[1]);

    // test_cases = generate_test_cases("switch_case");
    // runTestCase(test_cases[0], test_cases[1]);

    // test_cases = generate_test_cases("call_function");
    // runTestCase(test_cases[0], test_cases[1]);

}

export function test_function() {
    var test_fragment = "declare int hello world equal 7 < 6";
    console.log(parse_statement(test_fragment, "normal", "c"));
}

function generate_test_cases(cases: string) {
    
    /* First element is the test cases. second element is the correct outputs. */
    var test_cases = [[""], [""]];

    if (cases == "declare_assign") {
        /* Not yet tested for declare float count equals hello world. does not work
        By right, "declare float count equals hello" should not work as well since hello was not declared */
        test_cases[0] = ["hello equals test symbol point value symbol point hello world"];
        
        test_cases[1] = [""];
    }

    else if (cases == "jump_statements") {
        test_cases[0] = ["declare integer i", "return i equal 2"];
        test_cases[1] = ["#create int #variable i #dec_end;;","return #paramater #assign #variable i #with #value 2;;",
        "#comment #value \" cursor here \";; #comment_end;;"];
    }

    else if (cases == "if_block") {
        test_cases[0] = ["declare integer hello equal 4", "begin if hello greater than 5", 
        "declare integer i equal 4", "i equals 6", "begin if", "i", "equals", "4", 
        "declare integer count equal 6", "step out", "step out", "else",
        "hello equals 4"];

        test_cases[1] = ["#create int #variable hello #value 4 #dec_end;;",
        "if #condition #variable hello > #value 5 #if_branch_start",
        "#create int #variable i #value 4 #dec_end;;","#assign #variable i #with #value 6;;",
        "if #condition #variable i == #value 4 #if_branch_start",
        "#create int #variable count #value 6 #dec_end;;","#if_branch_end;;","#if_branch_end",
        "#else_branch_start","#assign #variable hello #with #value 4;;","#comment #value \" cursor here \";; #comment_end;;","#else_branch_end;;"];
    }
    else if (cases == "for_loop") {
        test_cases[0] = ["declare integer i", 
        "begin Loop condition i equal 0 condition i less than 5 condition i plus plus",
        "declare integer hello equals 5"];

        test_cases[1] = ["#create int #variable i #dec_end;;", 
        "for #condition #assign #variable i #with #value 0 #condition #variable i < #value 5 #condition #post #variable i ++ #for_start",
        "#create int #variable hello #value 5 #dec_end;;","#comment #value \" cursor here \";; #comment_end;;","#for_end;;"];
    }

    else if (cases == "create_function") {
        test_cases[0] = ["create function find maximum with return type integer with parameter integer array numbers with parameter integer length begin"];
        test_cases[1] = ["#function_declare findMaximum int #parameter_a #dimension 1 int #array numbers #parameter #type int length #function_start", 
        "#comment #value \" cursor here \";; #comment_end;;", "#function_end;;"];
    }

    else if (cases == "while_loop") {
        test_cases[0] = ["declare integer first equal 1", "declare integer second equal 3", 
        "while first not equal second"];
        test_cases[1] = ["#create int #variable first #value 1 #dec_end;;",
        "#create int #variable second #value 3 #dec_end;;",
        "while #condition #variable first != #variable second #while_start",
        "#comment #value \" cursor here \";; #comment_end;;","#while_end;;"];
    }

    else if (cases == "do_while_loop") {
        test_cases[0] = ["declare integer first equal 1", "declare integer second equal 1", 
        "declare integer hello equals 4", "do while first not equal second", "hello equal 5"];
        test_cases[1] = ["#create int #variable first #value 1 #dec_end;;",
        "#create int #variable second #value 1 #dec_end;;","#create int #variable hello #value 4 #dec_end;;",
        "do #condition #variable first != #variable second #while_start",
        "#assign #variable hello #with #value 5;;","#comment #value \" cursor here \";; #comment_end;;","#while_end;;"];
    }
    
    else if (cases == "switch_case") {
        test_cases[0] = ["declare integer hello equal 5", "begin switch hello", "case 2", "step out", "case 5"];
        test_cases[1] = ["#create int #variable hello #value 5 #dec_end;;",
        "switch #condition #variable hello","case #value 2 #case_start","#case_end",
        "case #value 5 #case_start","#comment #value \" cursor here \";; #comment_end;;","#case_end;;"];
    }

    else if (cases == "call_function") {
        test_cases[0] = ["call function print f parameter string enter two numbers end string end function"];
        test_cases[0] = ["call function end function"]
        test_cases[1] = ["#function printf(#parameter #value \"enter 2 numbers\");;", "#comment #value \" cursor here \";; #comment_end;;"];
    }

    return test_cases
}

/* Run and compare my output and correct output using test cases. */
function runTestCase(test_cases: string[], correct_output: string[]) {
    var test_manager = new StructCommandManager("c");
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

