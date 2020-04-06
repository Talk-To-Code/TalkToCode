import { StructCommandManager } from './struct_command_manager'
import { fragment_segmenter, parse_statement } from './parse_statements'

export function runTestCasesForC() {

    var test_cases = [[""], [""]];

    test_cases = generate_test_cases_c("tester");
    runTestCase(test_cases[0], test_cases[1], "c");

    test_cases = generate_test_cases_c("declare1");
    runTestCase(test_cases[0], test_cases[1], "c");

    test_cases = generate_test_cases_c("declare2");
    runTestCase(test_cases[0], test_cases[1], "c");

    test_cases = generate_test_cases_c("declare3");
    runTestCase(test_cases[0], test_cases[1], "c");

    test_cases = generate_test_cases_c("declare4");
    runTestCase(test_cases[0], test_cases[1], "c");

    test_cases = generate_test_cases_c("return1");
    runTestCase(test_cases[0], test_cases[1], "c");

    test_cases = generate_test_cases_c("assign1");
    runTestCase(test_cases[0], test_cases[1], "c");

    test_cases = generate_test_cases_c("assign2");
    runTestCase(test_cases[0], test_cases[1], "c");

    test_cases = generate_test_cases_c("if_block1");
    runTestCase(test_cases[0], test_cases[1], "c");

    test_cases = generate_test_cases_c("if_block2");
    runTestCase(test_cases[0], test_cases[1], "c");

    test_cases = generate_test_cases_c("for_loop");
    runTestCase(test_cases[0], test_cases[1], "c");

    test_cases = generate_test_cases_c("create_function");
    runTestCase(test_cases[0], test_cases[1], "c");
    
    test_cases = generate_test_cases_c("while_loop");
    runTestCase(test_cases[0], test_cases[1], "c");

    test_cases = generate_test_cases_c("do_while_loop");
    runTestCase(test_cases[0], test_cases[1], "c");

    test_cases = generate_test_cases_c("switch_case");
    runTestCase(test_cases[0], test_cases[1], "c");

    test_cases = generate_test_cases_c("structure");
    runTestCase(test_cases[0], test_cases[1], "c");

    test_cases = generate_test_cases_c("complex_fragments");
    runTestCase(test_cases[0], test_cases[1], "c");
}

export function runTestCasesForPy() {
    var test_cases = [[""], [""]];

    test_cases = generate_test_cases_py("declare1");
    runTestCase(test_cases[0], test_cases[1], "py");

    test_cases = generate_test_cases_py("declare2");
    runTestCase(test_cases[0], test_cases[1], "py");

    test_cases = generate_test_cases_py("declare3");
    runTestCase(test_cases[0], test_cases[1], "py");

    test_cases = generate_test_cases_py("return1");
    runTestCase(test_cases[0], test_cases[1], "py");

    test_cases = generate_test_cases_py("for_loop");
    runTestCase(test_cases[0], test_cases[1], "py");

    test_cases = generate_test_cases_py("create_function");
    runTestCase(test_cases[0], test_cases[1], "py");

    test_cases = generate_test_cases_py("create_class");
    runTestCase(test_cases[0], test_cases[1], "py");
}

export function test_function() {
    var test_fragment = "declare integer hello";
    console.log(parse_statement(test_fragment, "normal", "c"));
}

function generate_test_cases_c(cases: string) {
    
    /* First element is the test cases. second element is the correct outputs. */
    var test_cases = [[""], [""]];

    if (cases == "tester") {
        test_cases[0] = ["hello array index 2 equals call function hello parameter 1 parameter call function hello world end function end function"];

        test_cases[1] = [""];
    }

    if (cases == "declare1") {
        test_cases[0] = ["declare integer hello", "declare", "integer", "hello", "declare", "integer hello",
        "declare integer", "hello"];
        
        test_cases[1] = ["#create int #variable hello #dec_end;;","#create int #variable hello #dec_end;;",
        "#create int #variable hello #dec_end;;","#create int #variable hello #dec_end;;","#string \"\";;"]
    }
    /* more complex declare statement. test the extending feature with "plus" */
    else if (cases == "declare2") {
        test_cases[0] = ["declare integer hello world", "equals 5", "declare integer hello", "equals goodbye", "plus 2",
        "declare integer hello equals 5", "plus 4", "plus 3"];
        
        test_cases[1] = ["#create int #variable helloWorld #value 5 #dec_end;;",
        "#create int #variable hello #variable goodbye + #value 2 #dec_end;;",
        "#create int #variable hello #value 5 + #value 4 + #value 3 #dec_end;;","#string \"\";;"];
    }

    /* declare statements with array declaration. */
    else if (cases == "declare3") {
        test_cases[0] = ["declare integer array hello size 5", "declare integer", "array", "hello", "size 5",
        "declare integer array hello size 5 equals make array parameter 5 parameter 6",
        "declare integer array hello size 5", "equals make array parameter 5 parameter 6"];
        
        test_cases[1] = ["#create int #array #variable hello #indexes 5 #index_end #dec_end;;",
        "#create int #array #variable hello #indexes 5 #index_end #dec_end;;",
        "#create int #array #variable hello #indexes 5 #index_end { #array #parameter #value 5 #parameter #value 6 } #dec_end;;",
        "#create int #array #variable hello #indexes 5 #index_end { #array #parameter #value 5 #parameter #value 6 } #dec_end;;","#string \"\";;"]
    }

    /* declare statement with complex fragments */
    else if (cases == "declare4") {
        test_cases[0] = ["declare integer hello world", "equals", "hello array index 5",
        "declare integer hello equals goodbye array index 10", "plus 5",
        "declare integer hello equals greeting symbol point hello",
        "declare integer hello equals greeting symbol point test symbol point testing",
        "declare integer hello equals greeting symbol point call function hello end function"];
        
        test_cases[1] = ["#create int #variable helloWorld #array hello #indexes #value 5 #index_end #dec_end;;",
        "#create int #variable hello #array goodbye #indexes #value 10 #index_end + #value 5 #dec_end;;",
        "#create int #variable hello #access #variable greeting #variable hello #access_end #dec_end;;",
        "#create int #variable hello #access #variable greeting #variable test #variable testing #access_end #dec_end;;",
        "#create int #variable hello #access #variable greeting #function hello() #access_end #dec_end;;",
        "#string \"\";;"];
    }

    else if (cases == "return1") {
        test_cases[0] = ["return", "return hello", "return hello equals 6"];
        test_cases[1] = ["return;;","return #parameter #variable hello;;",
        "return #parameter #assign #variable hello #with #value 6;;","#string \"\";;"];
    }

    else if (cases == "assign1") {
        test_cases[0] = ["hello equals 5", "hello", "equals", "5", "hello equals", "5",
        "hello world equals goodbye world", "hello", "world", "equals", "goodbye world",
        "hello world equals", "goodbye world"];

        test_cases[1] = ["#assign #variable hello #with #value 5;;","#assign #variable hello #with #value 5;;",
        "#assign #variable hello #with #value 5;;","#assign #variable helloWorld #with #variable goodbyeWorld;;",
        "#assign #variable helloWorld #with #variable goodbyeWorld;;",
        "#assign #variable helloWorld #with #variable goodbyeWorld;;","#string \"\";;"];
    }

    /* test assign with more complicated fragments */
    else if (cases == "assign2") {
        test_cases[0] = ["hello array index 5 equals 5", "hello array", "index", "5", "equals 5",
        "hello array index 2 equals call function hello parameter 1 end function",
        "hello array index 2 equals call function hello parameter 1 parameter hello world end function",
        "hello array index 2 equals call function hello parameter 1 parameter call function hello world end function end function"];

        test_cases[1] = ["#assign #array hello #indexes #value 5 #index_end #with #value 5;;",
        "#assign #array hello #indexes #value 5 #index_end #with #value 5;;",
        "#assign #array hello #indexes #value 2 #index_end #with #function hello( #parameter #value 1);;",
        "#assign #array hello #indexes #value 2 #index_end #with #function hello( #parameter #value 1 #parameter #variable helloWorld);;",
        "#assign #array hello #indexes #value 2 #index_end #with #function hello( #parameter #value 1 #parameter #function helloWorld());;",
        "#string \"\";;"]
    }

    else if (cases == "if_block1") {
        test_cases[0] = ["declare integer hello equal 4", "begin if hello greater than 5", 
        "declare integer i equal 4", "i equals 6", "begin if", "i equals", "4", 
        "declare integer count equal 6", "exit block", "exit block", "else",
        "hello equals 4"];

        test_cases[1] = ["#create int #variable hello #value 4 #dec_end;;",
        "if #condition #variable hello > #value 5 #if_branch_start",
        "#create int #variable i #value 4 #dec_end;;","#assign #variable i #with #value 6;;",
        "if #condition #variable i == #value 4 #if_branch_start","#create int #variable count #value 6 #dec_end;;","#if_branch_end;;",
        "#if_branch_end","#else_branch_start","#assign #variable hello #with #value 4;;","#string \"\";;",
        "#else_branch_end;;"];
    }
    /* test the full if, else if, else */
    else if (cases == "if_block2") {
        test_cases[0] = ["begin if hello greater than 5 bit and hello less than 10",
        "begin if hello and goodbye", "exit block", "exit block", "else if afternoon", "exit block", "else"];

        test_cases[1] = ["if #condition #variable hello > #value 5 & #variable hello < #value 10 #if_branch_start",
        "if #condition #variable hello && #variable goodbye #if_branch_start","#if_branch_end;;",
        "#if_branch_end","else if #condition #variable afternoon #elseIf_branch_start","#elseIf_branch_end",
        "#else_branch_start","#string \"\";;","#else_branch_end;;"];
    }

    else if (cases == "for_loop") {
        test_cases[0] = ["declare integer i", 
        "begin Loop condition i equal 0 condition i less than 5 condition i plus plus",
        "declare integer hello equals 5"];

        test_cases[1] = ["#create int #variable i #dec_end;;",
        "for #condition #assign #variable i #with #value 0 #condition #variable i < #value 5 #condition #post #variable i ++ #for_start",
        "#create int #variable hello #value 5 #dec_end;;","#string \"\";;","#for_end;;"];
    }

    else if (cases == "create_function") {
        test_cases[0] = ["create function hello with return type integer begin", "exit block",
        "create function hello", "with return type", "float", "begin", "exit block",
        "create function hello with return type integer parameter integer hello begin", "exit block",
        "create function hello with return type integer parameter integer array hello begin", "exit block",
        "create function hello with return type integer parameter integer array dimension 2 hello begin", "exit block",
        "create function hello with return type integer parameter integer hello parameter float goodbye begin"];

        test_cases[1] = ["#function_declare hello int #function_start","#function_end;;",
        "#function_declare hello float #function_start","#function_end;;",
        "#function_declare hello int #parameter #type int hello #function_start","#function_end;;",
        "#function_declare hello int #parameter_a #dimension 1 int #array hello #function_start","#function_end;;",
        "#function_declare hello int #parameter_a #dimension 2 int #array hello #function_start","#function_end;;",
        "#function_declare hello int #parameter #type int hello #parameter #type float goodbye #function_start","#string \"\";;","#function_end;;"];
    }

    else if (cases == "while_loop") {
        test_cases[0] = ["while first not equal second"];
        test_cases[1] = ["while #condition #variable first != #variable second #while_start",
        "#string \"\";;","#while_end;;"];
    }

    else if (cases == "do_while_loop") {
        test_cases[0] = ["do while first not equal second", "hello equal 5"];
        test_cases[1] = ["do #condition #variable first != #variable second #while_start",
        "#assign #variable hello #with #value 5;;","#string \"\";;","#while_end;;"];
    }
    
    else if (cases == "switch_case") {
        test_cases[0] = ["begin switch hello", "case 2", "hello equals 5", "exit block", "case 5"];
        test_cases[1] = ["switch #condition #variable hello","case #value 2 #case_start",
        "#assign #variable hello #with #value 5;;","#case_end","case #value 5 #case_start",
        "#string \"\";;","#case_end;;"];
    }

    else if (cases == "structure") {
        test_cases[0] = ["create structure greeting", "declare integer hello", "declare integer goodbye", "exit block"];

        test_cases[1] = ["#struct_declare greeting #struct_start","#create int #variable hello #dec_end;;",
        "#create int #variable goodbye #dec_end;;","#struct_end;;","#string \"\";;"];
    }

    else if (cases == "complex_fragments") {
        test_cases[0] = ["hello equal call function testing end function symbol point call function hello end function",
        "hello equal call function testing parameter call function testing end function end function",
        "hello equal call function testerer parameter call function testing parameter call function tested end function end function end function",
        "hello equal call function testerer parameter call function testing parameter call function tested end function end function parameter call function hello end function end function",
        "hello equal call function testing parameter call function testing end function parameter 5 end function",
        "hello equal call function testing parameter call function testing end function symbol point testing end function",
        "hello equal call function testing parameter call function testing end function symbol point call function testing end function end function"];

        test_cases[1] = ["#assign #variable hello #with #access #function testing() #function hello() #access_end;;",
        "#assign #variable hello #with #function testing( #parameter #function testing());;",
        "#assign #variable hello #with #function testerer( #parameter #function testing( #parameter #function tested()));;",
        "#assign #variable hello #with #function testerer( #parameter #function testing( #parameter #function tested()) #parameter #function hello());;",
        "#assign #variable hello #with #function testing( #parameter #function testing() #parameter #value 5);;",
        "#assign #variable hello #with #function testing( #parameter #access #function testing() #variable testing #access_end);;",
        "#assign #variable hello #with #function testing( #parameter #access #function testing() #function testing() #access_end);;",
        "#string \"\";;"];
    }

    return test_cases
}

function generate_test_cases_py(cases: string) {
    var test_cases = [[""], [""]];
    if (cases == "declare1") {
        test_cases[0] = ["declare hello equals 5", "declare hello equals hello", "declare hello equals hello world",
        "declare hello world equals hello world"];

        test_cases[1] = ["#create #variable hello #value 5 #dec_end;;",
        "#create #variable hello #variable hello #dec_end;;",
        "#create #variable hello #variable helloWorld #dec_end;;",
        "#create #variable helloWorld #variable helloWorld #dec_end;;","#string \"\";;"];
    }

    else if (cases == "declare2") {
        test_cases[0] = ["declare hello equals make list parameter 5 parameter 2",
        "declare", "hello", "equals", "5", 
        "declare hello equals call function get greeting parameter morning end function",
        "declare hello equals greeting array index 5",
        "declare hello equals greeting symbol point test array index 5"];

        test_cases[1] = ["#create #variable hello { #list #parameter #value 5 #parameter #value 2 } #dec_end;;",
        "#create #variable hello #value 5 #dec_end;;","#create #variable hello #function getGreeting( #parameter #variable morning) #dec_end;;",
        "#create #variable hello #array greeting #indexes #value 5 #index_end #dec_end;;",
        "#create #variable hello #access #variable greeting #array test #indexes #value 5 #index_end #access_end #dec_end;;",
        "#string \"\";;"];
    }

    else if (cases == "declare3") {
        test_cases[0] = ["declare hello equals make dictionary key 5 value 2 key 10 value 3"];

        test_cases[1] = ["#create #variable hello { #dictionary #key 5 #value #value 2 #key 10 #value #value 3 } #dec_end;;",
        "#string \"\";;"];
    }

    else if (cases == "return1") {
        test_cases[0] = ["return", "return hello", "return parameter hello", "return parameter hello parameter goodbye",
        "return hello equals string what is up end string"];
        
        test_cases[1] = ["return;;","return #parameter #variable hello;;",
        "return #parameter #variable hello;;","return #parameter #variable hello #parameter #variable goodbye;;",
        "return #parameter #assign #variable hello #with #value \"what is up\";;","#string \"\";;"];
    }

    else if (cases == "for_loop") {
        test_cases[0] = ["begin loop parameter element in list", "exit block",
        "begin loop parameter key parameter value in my dict symbol point call function items end function"];

        test_cases[1] = ["for #parameter #variable element #variable list #for_start","#for_end;;",
        "for #parameter #variable key #parameter #variable value #access #variable myDict #function items() #access_end #for_start",
        "#string \"\";;","#for_end;;"];
    }

    else if (cases == "create_function") {
        test_cases[0] = ["create function hello begin", "exit block",
        "create function hello parameter greeting begin", "exit block",
        "create function hello parameter hello world begin", "exit block"];

        test_cases[1] = ["#function_declare hello #function_start","#function_end;;",
        "#function_declare hello #parameter greeting #function_start","#function_end;;",
        "#function_declare hello #parameter helloWorld #function_start","#function_end;;","#string \"\";;"];
    }

    else if (cases == "create_class") {
        test_cases[0] = ["create class greeting", "exit block", "create class hello with parent greeting"];

        test_cases[1] = ["class greeting #class_start","#class_end;;",
        "class hello #parent greeting #class_start","#string \"\";;","#class_end;;"];
    }

    return test_cases;
}

/* Run and compare my output and correct output using test cases. */
function runTestCase(test_cases: string[], correct_output: string[], language: string) {
    var test_manager = new StructCommandManager(language, false);
    var i;
    for (i = 0; i < test_cases.length; i++) {
        test_manager.parse_speech(test_cases[i], []);
    }

    var output = test_manager.struct_command_list;

    /* To compare JS arrays. Convert to JSON */
    if (JSON.stringify(output) != JSON.stringify(correct_output)) {
        console.log(test_manager.managerStatus());
        console.log("### ERROR ###");
        console.log(JSON.stringify(output));
        console.log(JSON.stringify(correct_output));
    }
    else {
        console.log("### PASSED ###");
    }
}

