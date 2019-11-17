export function generate_test_cases(cases: string) {
    
    var test_cases = [""]

    if (cases == "declare")
        test_cases = ["declare integer", "hello world"]

    else if (cases == "if block")
        test_cases = ["begin if hello world greater than 5"]

    else if (cases == "assign")
        test_cases = ["declare integer hello equals 5", "hello equals 2"]

    return test_cases
}