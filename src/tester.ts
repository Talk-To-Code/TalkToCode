export function generate_test_cases(cases: string) {
    
    var test_cases = [""]

    if (cases == "declare")
        test_cases = ["declare", "integer", "hello", "equals 5", "begin if hello greater than 5"]

    else if (cases == "if block")
        test_cases = ["begin if hello greater than 5", "declare integer count", "equals 5"]

    else if (cases == "assign")
        test_cases = ["declare integer hello equals 5", "hello equals 2"]

    return test_cases
}