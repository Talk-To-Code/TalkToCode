import { simpleStatement } from './struct_command'

var variable_types = ["int", "long", "float", "double", "boolean", "char", "string", "void"];

var operators = ["plus", "divide", "multiply", "minus", ">", ">=", "<", "<=", "!=", "==", "||", "&&", "&", "|"]
var arithmetic_operator = ["plus", "divide", "multiply", "minus"];
var c_infix_operator = [">", ">=", "<", "<=", "!=", "==", "||", "&&", "&", "|"];
var postfix_prefix_operator = ["++", "--"];

/* E.g. hello world -> helloWorld */
export function joinName(name_arr: string[]) {
    var var_name = "";
    if (name_arr.length == 1) return name_arr.join(" ");
    if (name_arr[0] == "dot") var_name = name_arr.slice(1).join(".");
    else if (name_arr[0] == "underscore") var_name = name_arr.slice(1).join("_");
    else {
        var_name = name_arr[0].toLowerCase();
        var i;
        for (i = 1; i < name_arr.length; i++) {
            /* Change first letter to capital */
            var toAdd = name_arr[i][0].toUpperCase() + name_arr[i].slice(1);
            var_name = var_name + toAdd;
        }
    }
    return var_name;
}

/* Maps "or" to "||", "and" to "&&" and so on. */
function mapArithmeticOperator(operator: string) {
    operator = operator.replace("plus", "+");
    operator = operator.replace("divide", "/");
    operator = operator.replace("minus", "-");
    operator = operator.replace("multiply", "*");

    return operator;
}

/* Purpose of this function is to parse any potential statement into the structured command. */
/* Returns class statement. */
export function parse_statement(text: string, typeOfStatement: string, language: string) {
    var statementType = determine_type(text, typeOfStatement);
    switch(statementType) {
        case "declare":
            if (language == "c") return parse_declare_c(text);
            else return parse_declare_py(text);
        case "assign":
            return parse_assignment(text);
        case "infix":
            return parse_infix(text);
        case "postfix": // For now just postfix man.
            return parse_postfix(text);
        case "return":
            return parse_return(text);
        case "break":
            return parse_break();
        case "continue":
            return parse_continue();
        case "function":
            return parse_function(text);
        default:
            var statement = new simpleStatement();
            statement.logError("Does not match any statement format.");
            return statement;
    }
}

function determine_type(text: string, typeOfStatement: string) {
    var splitted_text = text.split(" ");
    if (typeOfStatement == "infix") return "infix";
    else if (splitted_text[0] == "declare") return "declare";
    else if (splitted_text[0] == "return") return "return";
    else if (splitted_text[0] == "continue") return "continue";
    else if (splitted_text[0] == "break") return "break";
    else if (splitted_text[0] == "call") return "function";
    else if (splitted_text.includes("equal")) return "assign";
    else if (splitted_text.some(x=>postfix_prefix_operator.includes(x))) return "postfix";
    else return "not ready.";
}

function parse_continue() {
    var statement = new simpleStatement();
    statement.isContinue = true;
    statement.parsedStatement = "continue;;"
    return statement;
}

function parse_break() {
    var statement = new simpleStatement();
    statement.isBreak = true;
    statement.parsedStatement = "break;;"
    return statement;
}

/* E.g. 
declare <var_type> <var name>
declare <var_type> array <var name> size <literal>
declare <var_type> <var name> equal <var_name>
declare <var_type> <var name> equal <literal>
declare <var_type> <var name> equal <complex fragment> */
function parse_declare_c(text: string) {
    var statement = new simpleStatement();
    statement.isDeclare = true;
    statement.parsedStatement = "#create";

    var splitted_text = text.split(" ");
    /* Check if var type mentioned. */
    if (!variable_types.includes(splitted_text[1])){
        statement.logError("var type is not mentioned.");
        return statement;
    } 
    /* Check if var type is the last word mentioned. */
    if (splitted_text.length == 2) {
        statement.logError("var type is the last word mentioned.");
        return statement;
    }
    
    else statement.parsedStatement += " " + splitted_text[1]; // Add var_tpye. 
    /* Check for array declaration. */
    if (splitted_text.includes("array") && !splitted_text.includes("equal")) {
        if (!splitted_text.includes("size")) {
            statement.logError("Size was not mentioned.");
            return statement;
        }
        if (splitted_text.indexOf("size") == splitted_text.length-1) {
            statement.logError("size is the last word.");
            return statement;
        }
        statement.parsedStatement += " " + parse_array_d(splitted_text.slice(3).join(" "));
    }
    else {
        /* Check if Equal is mentioned. */
        if (splitted_text.includes("equal")) {
            var equal_idx = splitted_text.indexOf("equal");
            if (equal_idx == splitted_text.length-1) {
                statement.logError("equal was last word mentioned.");
                return statement;
            }
            var fragment1 = fragment_segmenter(splitted_text.slice(2, equal_idx));
            var fragment2 = fragment_segmenter(splitted_text.slice(equal_idx + 1));

            if (fragment1[0] == "not ready") {
                statement.logError(fragment1[1]);
                return statement;
            }

            if (fragment2[0] == "not ready") {
                statement.logError(fragment2[1]);
                return statement;
            }
            statement.parsedStatement += " " + fragment1[1] + " " + fragment2[1];
        }
        else {
            var fragment = fragment_segmenter(splitted_text.slice(2));
            if (fragment[0] == "not ready") {
                statement.logError(fragment[1]);
                return statement;
            }
            statement.parsedStatement += " " + fragment[1];
        }
    }
    statement.parsedStatement += " #dec_end;;";
    return statement;
}

/* Parse array when doing daclaration.
E.g. array number size 100 -> #array #variable number #indexes #value 100 #index_end #dec_end;;
*/
function parse_array_d(text: string) {
    var splitted_text = text.split(" ");
    var size_idx = splitted_text.indexOf("size");
    var parsed_results = "#array #variable";
    parsed_results += " " + joinName(splitted_text.slice(0, size_idx));
    parsed_results += " #indexes #value " + splitted_text.slice(size_idx+1).join(" ") + " #indexes_end";
    
    return parsed_results;  
}

/* E.g. Have to initialise, so "equal" is a must.
declare <var name> equal <var_name>
declare <var name> equal <literal>
declare <var name> equal <complex fragment>
declare list <var name> with (<parameter> <literal>)? */
function parse_declare_py(text: string) {
    var statement = new simpleStatement();
    statement.isDeclare = true;
    statement.parsedStatement = "#create";

    var splitted_text = text.split(" ");

    /* Equal not mentioned or is the last word mentioned. */
    if (!splitted_text.includes("equal") || splitted_text[splitted_text.length-1] == "equal") {
        statement.logError("variable not initialised");
        return statement;
    }

    var equal_idx = splitted_text.indexOf("equal");
    var fragment1 = fragment_segmenter(splitted_text.slice(1, equal_idx));
    var fragment2 = fragment_segmenter(splitted_text.slice(equal_idx + 1));
    if (fragment1[0] == "not ready") {
        statement.logError(fragment1[1]);
        return statement;
    }
    if (fragment2[0] == "not ready") {
        statement.logError(fragment2[1]);
        return statement;
    }
    statement.parsedStatement += " " + fragment1[1] + " " + fragment2[1];
    return statement;
}

function parse_return(text: string) {
    var statement = new simpleStatement();
    statement.isReturn = true;
    statement.parsedStatement = "return #paramater";
    var splitted_text = text.split(" ");
    /* Return has an assign statement */
    if (splitted_text.includes("equal")) {
        var assign_statement = parse_assignment(splitted_text.slice(1).join(" "));
        if (assign_statement.hasError) return assign_statement;
        else statement.parsedStatement += " " + assign_statement.parsedStatement; // assign statement alr has its own ";;"
    }
    /* returning a variable or literal */
    else {
        var fragment = fragment_segmenter(splitted_text.slice(1));
        if (fragment[0] == "not ready") {
            statement.logError(fragment[1]);
            return statement;
        }
        statement.parsedStatement += " " + fragment[1] + ";;";
    }
    return statement;
}

function parse_assignment(text: string) {
    var statement = new simpleStatement();
    statement.isAssign = true;
    var splitted_text = text.split(" ");
    var equal_idx = splitted_text.indexOf("equal");

    if (equal_idx == splitted_text.length-1) {
        statement.logError("equal was last word mentioned.");
        return statement;
    }

    var fragment1 = fragment_segmenter(splitted_text.slice(0, equal_idx));
    var fragment2 = fragment_segmenter(splitted_text.slice(equal_idx + 1));

    if (fragment1[0] == "not ready" || fragment2[0] == "not ready") {
        statement.logError(fragment1[1]);
        return statement;
    }
    statement.parsedStatement = "#assign " + fragment1[1] + " #with " + fragment2[1] + ";;";
    return statement;
}


/* Infix can simply be a fragment. E.g. if (flag) {}
Infix can accept continuous comparison and segmenting operators. E.g. if (5 < hello < 4) {} or
if (hello && goodbye) {}
Infix includes arithmetic, segmenting and comparison operators.
It can also come in parenthesis as well.*/
function parse_infix(text: string) {
    var statement = new simpleStatement();
    statement.isInfix = true;
    var splitted_text = text.split(" ");

    /* Add spaces around parenthesis. Parenthesis can now be separated by split(" ") */
    text = text.replace(/\(/g, " ( ").replace(/\)/g, " ) ").trim();
    text = text.replace(/end string/g, "end_string");
    text = text.replace(/  +/g, ' ');
    var splitted_text = text.split(" ");

    /* List to keep track of segments. Same length as splitted_text. 
    "(" are marked by -1, ")" are marked by -2, arithmetic operators are marked by -3 and infix operators
    are marked by -4.
    The fragments are grouped by number. 
    For e.g. ["(", "hello", ")", ">", "(", "hello", "world", ")"] -> [-1, 0, -2, -4, -1, 1, 1, -2]
    "hello" is grouped by 0, while "hello world" is grouped by 1. */
    var segment_positions = [];
    var within_string = false; // flag to make sure "()" and "+ - * /" within strings are ignored.
    var operator_flag = false;
    var segment_counter = 0;
    var stack = [];
    /* 
    Check for the validity of () and segmenting and comparison operators.
    arithmetic and infix operators cannot be to the right of "(" or to the left of ")". E.g. (<hello) is wrong.
    arithmetic and infix operators cannot be at the start or end of segments.
    */
    if (arithmetic_operator.includes(splitted_text[0]) || 
    arithmetic_operator.includes(splitted_text[splitted_text.length-1]) ||
    c_infix_operator.includes(splitted_text[0]) || 
    c_infix_operator.includes(splitted_text[splitted_text.length-1])) {
            
        statement.logError("arithmetic, comparison or segmenting operators at either start or end of fragment.");
        return statement;
    }
    
    for (var i = 0; i < splitted_text.length; i++) {
        /* Setting within_string flag. */
        if (splitted_text[i] == "string") {
            segment_positions.push(segment_counter);
            within_string = true;
            operator_flag = false;
        }
        else if (splitted_text[i] == "end_string") {
            segment_positions.push(segment_counter);
            within_string = false;
            operator_flag = false;
        }
        /* Handle parenthesis. */
        else if (splitted_text[i] == "(") {
            operator_flag = false;
            if (within_string) segment_positions.push(segment_counter);
            else {
                stack.push(splitted_text[i]);
                segment_positions.push(-1);
            }
        }
        else if (splitted_text[i] == ")") {
            operator_flag = false;
            if (within_string) segment_positions.push(segment_counter);
            if (stack.length == 0 || stack[stack.length-1] != "(")  {
                statement.logError("grouping error. unbalanced parenthesis.");
                return statement;
            }

            /* Ensure not at the last element. */
            if (i != splitted_text.length-1) {
                if (splitted_text[i+1] != ")" && !operators.includes(splitted_text[i+1])) {
                    statement.logError("grouping error. Closing bracket or operator expected.");
                    return statement;
                }
            }
            stack.pop();
            segment_positions.push(-2);
        }
        /* Handle arithmetic, comparison and segmenting positions and segmenting of fragments */
        else if (arithmetic_operator.includes(splitted_text[i]) || c_infix_operator.includes(splitted_text[i])) {
            if (within_string) segment_positions.push(segment_counter);
            else {
                if (operator_flag) {
                    statement.logError("Operators cannot be in continuous order.");
                    return statement;
                }
                /* Check if arithmetic position is legal. */
                if (splitted_text[i-1] == "(") {
                    statement.logError("Operators at either start or end of fragment.");
                    return statement;
                } 
                if (splitted_text[i+1] == ")") {
                    statement.logError("Operators at either start or end of fragment.");
                    return statement;
                }
                segment_counter += 1;
                if (arithmetic_operator.includes(splitted_text[i])) segment_positions.push(-3);
                else segment_positions.push(-4);
                operator_flag = true;
            }
        }
        else {
            operator_flag = false;
            segment_positions.push(segment_counter);
        }
    }
    if (stack.length > 0) {
        statement.logError("grouping error. Unbalanced parenthesis.");
        return statement;
    }

    /* Divide into segments of fragments. */
    var segments = []; /* List of fragments. Type: string[] */
    var curr_counter = -5; /* Position groupings are from -4 to positive numbers. Starting number
    should not match any of them. */
    var expect_var = false; /* True when expecting a variable within a bracket. */
    for (var i = 0; i < segment_positions.length; i++) {
        /* Same group number. */
        if (segment_positions[i] == curr_counter) {
            segments[segments.length-1] += " " + splitted_text[i];
        }
        /* Do not include parenthesis or arithmetic operators. */
        else if (segment_positions[i] == -1) {
            expect_var = true;
            continue;
        }
        else if (segment_positions[i] == -2) {
            if (expect_var) {
                statement.logError("Empty fragment.");
                return statement;
            }
        }
        else if (segment_positions[i] == -3 || segment_positions[i] == -4) continue;
        /* segment_positions[i] != curr_counter. New group. */
        else {
            expect_var = false;
            curr_counter = segment_positions[i];
            segments.push(splitted_text[i]);
        }
    }

    /* Parse segments */
    for (var i = 0; i < segments.length; i++) {
        var fragment: string[] = parse_fragment(segments[i].split(" "));
        if (fragment[0] == "not ready") {
            statement.logError("fragment error. " + fragment[1]);
            return statement;
        }
        segments[i] = fragment[1];
    }

    /* Putting it all together */
    var final_fragment = "";
    var segment_add = -1;
    for (var i = 0; i < segment_positions.length; i++) {
        /* arithmetic operator. */
        if (segment_positions[i] == -3) {
            final_fragment += " " + mapArithmeticOperator(splitted_text[i]);
        }
        else if (segment_positions[i] < 0) {
            final_fragment += " " + splitted_text[i];
        }
        else if (segment_positions[i] != segment_add) {
            segment_add = segment_positions[i];
            final_fragment += " " + segments[segment_positions[i]];
        }
    }
    final_fragment = final_fragment.replace(/  +/g, ' ').trim();
    statement.parsedStatement = final_fragment;
    return statement;
}

function parse_postfix(text: string) {
    var statement = new simpleStatement();
    statement.isPostfix = true;
    var splitted_text = text.split(" ");
    statement.parsedStatement = "#post #variable " + splitted_text[0] + " " + splitted_text[1] + ";;";
    return statement;
}

function parse_function(text: string) {
    var statement = new simpleStatement();
    statement.isFunction = true;
    var fragment = fragment_segmenter(text.split(" "));
    if (fragment[0] == "not ready") {
        statement.logError(fragment[1]);
        return statement;
    }
    statement.parsedStatement = fragment[1] + ";;";
    return statement;
}

/* Fragments can appear within parenthesis or separated by arithmetic operations. 
Before parsing can be done, first segment them then parse each individual segments.

Returns list as [<status>, <parsed_result>] 
<status> - "ready" or "not ready"
<parsed_result> - the successfully parsed result. */
export function fragment_segmenter(splitted_text: string[]) {
    if (splitted_text.length == 0) return ["not ready", "empty fragment."];
    if (JSON.stringify(splitted_text) == JSON.stringify([""])) return ["not ready", "empty fragment."];
    if (splitted_text.some(x=>c_infix_operator.includes(x))) return ["not ready", "infix operator detected"];

    /* Begin processing to separate fragments based on arithmetic operators. */
    var text = splitted_text.join(" ");
    /* Add spaces around parenthesis. Parenthesis can now be separated by split(" ") */
    text = text.replace(/\(/g, " ( ").replace(/\)/g, " ) ").trim();
    text = text.replace(/end string/g, "end_string");
    text = text.replace(/  +/g, ' ');
    splitted_text = text.split(" ");
    
    /* List to keep track of segments. Same length as splitted_text. 
    "(" are marked by -1, ")" are marked by -2 and arithmetic operators are marked by -3.
    The fragments are grouped by number. 
    For e.g. ["(", "hello", ")", "+", "(", "hello", "world", ")"] -> [-1, 0, -2, -3, -1, 1, 1, -2]
    "hello" is grouped by 0, while "hello world" is grouped by 1. */
    var segment_positions = [];
    var within_string = false; // flag to make sure "()" and "+ - * /" within strings are ignored.
    var operator_flag = false;
    var segment_counter = 0;
    var stack = [];
    /* 
    Check for the validity of () and arithmetic operators.
    arithmetic operators cannot be to the right of "(" or to the left of ")". E.g. (+hello) is wrong.
    arithmetic operators cannot be at the start or end of segments.
    */
    if (arithmetic_operator.includes(splitted_text[0]) || 
        arithmetic_operator.includes(splitted_text[splitted_text.length-1])) {
            return ["not ready", "arithmetic operators at either start or end of fragment."];
        }
    for (var i = 0; i < splitted_text.length; i++) {
        /* Setting within_string flag. */
        if (splitted_text[i] == "string") {
            operator_flag = false;
            segment_positions.push(segment_counter);
            within_string = true;
        }
        else if (splitted_text[i] == "end_string") {
            operator_flag = false;
            segment_positions.push(segment_counter);
            within_string = false;
        }
        /* Handle parenthesis. */
        else if (splitted_text[i] == "(") {
            operator_flag = false;
            if (within_string) segment_positions.push(segment_counter);
            else {
                stack.push(splitted_text[i]);
                segment_positions.push(-1);
            }
        }
        else if (splitted_text[i] == ")") {
            operator_flag = false;
            if (within_string) segment_positions.push(segment_counter);
            if (stack.length == 0 || stack[stack.length-1] != "(") 
                return ["not ready", "grouping error. unbalanced parenthesis."];

            /* Ensure not at the last element. */
            if (i != splitted_text.length-1) {
                if (splitted_text[i+1] != ")" && !arithmetic_operator.includes(splitted_text[i+1])) 
                    return ["not ready", "grouping error. Closing bracket or arithmetic operation expected."];
            }
            stack.pop();
            segment_positions.push(-2);
        }
        /* Handle arithmetic positions and segmenting of fragments */
        else if (arithmetic_operator.includes(splitted_text[i])) {
            if (within_string) segment_positions.push(segment_counter);
            else {
                if (operator_flag) {
                    return ["not ready", "arithmetic operators are not continuous."];
                }
                /* Check if arithmetic position is legal. */
                if (splitted_text[i-1] == "(") return ["not ready", "arithmetic operators at either start or end of fragment."];
                if (splitted_text[i+1] == ")") return ["not ready", "arithmetic operators at either start or end of fragment."];
                segment_counter += 1;
                segment_positions.push(-3);
                operator_flag = true;
            }
        }
        else {
            segment_positions.push(segment_counter);
            operator_flag = false;
        }
    }
    if (stack.length > 0) return ["not ready", "grouping error. Unbalanced parenthesis."];

    /* Divide into segments of fragments. */
    var segments = []; /* List of fragments. Type: string[] */
    var curr_counter = -4; /* Position groupings are from -3 to positive numbers. Starting number
    should not match any of them. */
    var expect_var = false; /* True when expecting a variable within a bracket. */
    for (var i = 0; i < segment_positions.length; i++) {
        /* Same group number. */
        if (segment_positions[i] == curr_counter) {
            segments[segments.length-1] += " " + splitted_text[i];
        }
        /* Do not include parenthesis or arithmetic operators. */
        else if (segment_positions[i] == -1) {
            expect_var = true;
            continue;
        }
        else if (segment_positions[i] == -2) {
            if (expect_var) return ["not ready", "empty fragment."];
        }
        else if (segment_positions[i] == -3) continue;
        /* segment_positions[i] != curr_counter. New group. */
        else {
            expect_var = false;
            curr_counter = segment_positions[i];
            segments.push(splitted_text[i]);
        }
    }

    /* Parse segments */
    for (var i = 0; i < segments.length; i++) {
        var fragment: string[] = parse_fragment(segments[i].split(" "));
        if (fragment[0] == "not ready") return ["not ready", "fragment error. " + fragment[1]];
        segments[i] = fragment[1];
    }

    /* Putting it all together */
    var final_fragment = "";
    var segment_add = -1;
    for (var i = 0; i < segment_positions.length; i++) {
        /* arithmetic operator. */
        if (segment_positions[i] == -3) {
            final_fragment += " " + mapArithmeticOperator(splitted_text[i]);
        }
        else if (segment_positions[i] < 0) {
            final_fragment += " " + splitted_text[i];
        }
        else if (segment_positions[i] != segment_add) {
            segment_add = segment_positions[i];
            final_fragment += " " + segments[segment_positions[i]];
        }
    }
    final_fragment = final_fragment.replace(/  +/g, ' ').trim();
    return ["ready", final_fragment];
}

/* Returns list as [<status>, <parsed_result>] 
<status> - "ready" or "not ready"
<parsed_result> - the successfully parsed result. */
function parse_fragment(splitted_text: string[]) {

    if (splitted_text.length == 0) return ["not ready", "empty fragment"];

    if (splitted_text.length == 1) {
        /* Is a number! Not Not a number. */
        if (!isNaN(Number(splitted_text[0]))) return ["ready", "#value " + splitted_text[0]];
        else return ["ready", "#variable " + splitted_text[0]];
    }
    /* Look out for "end function". */
    else if (splitted_text[0] == "call") {
        if (splitted_text[1] != "function") return ["not ready", "function not mentioned."];
        /* Minimal format is "call function" <function name> "end function". */
        if (splitted_text.length <= 4) return ["not ready", "no function name mentioned."];
        if (splitted_text.slice(splitted_text.length-2).join(" ") != "end function")
            return ["not ready", "end function not mentioned."];

        splitted_text.splice((splitted_text.length-2));

        if (!splitted_text.includes("parameter")) {
            /* Not sure if the terminator should be there. since it will be used in assign statement as well.*/
            var function_name = joinName(splitted_text.slice(2))
            if (function_name == "printF") function_name = "printf";
            if (function_name == "scanF") function_name = "scanf";
            return ["ready", "#function " + function_name + "()"];
        }
        else {
            /* There are parameters. */
            var parameter_blocks = splitted_text.join(" ").split("parameter");
            parameter_blocks = parameter_blocks.map(x=>x.trim());
            var function_name = joinName(parameter_blocks[0].split(" ").slice(2));
            if (function_name == "printF") function_name = "printf";
            if (function_name == "scanF") function_name = "scanf";
            var parsed_result = "#function " + function_name + "(";
            for (var i = 1; i < parameter_blocks.length; i++) {
                var fragment: string[] = parse_fragment(parameter_blocks[i].split(" "));
                if (fragment[0] == "not ready") 
                    return ["not ready", "parameter fragment wrong. " + fragment[1]];
                parsed_result += "#parameter " + fragment[1];
            }
            parsed_result += ")";
            return ["ready", parsed_result];
        }
    }

    else if (splitted_text[0] == "string") {
        /* string literal has to include ["string", <actual string>, "end", "string"], which requires
        a minimum of 4 words. */
        if (splitted_text.length < 4) return ["not ready", "no value mentioned."];
        if (splitted_text[splitted_text.length-1] != "end_string")
            return ["not ready", "last 2 words are not end string"];

        return ["ready", "#value \"" + splitted_text.slice(1, splitted_text.length-1).join(" ") + "\""];
    }
    else if (splitted_text.includes("array")) {
        /* array fragment has to include [<var_name>, "array", "index", <value>] which requires a minimum
        of 4 words. */
        if (splitted_text.length < 4) return ["not ready", "array fragment missing some values."];
        if (!splitted_text.includes("index")) return ["not ready", "index was not mentioned."];
        if (splitted_text.indexOf("array") == 0) return ["not ready", "no variable name mentioned."];

        var arrayIdx = splitted_text.indexOf("array");
        var var_name = joinName(splitted_text.slice(0, arrayIdx));

        var indexIdx = splitted_text.indexOf("index");
        if (indexIdx != arrayIdx + 1) return ["not ready", "index is wrong position."];
        var fragment: string[] = parse_fragment(splitted_text.slice(indexIdx+1));
        if (fragment[0] == "not ready") 
            return ["not ready", "parameter fragment wrong. " + fragment[1]];

        return ["ready", "#array " + var_name + " #indexes " + fragment[1] + " #index_end"];
    }
    return ["ready", "#variable " + joinName(splitted_text)];
}
