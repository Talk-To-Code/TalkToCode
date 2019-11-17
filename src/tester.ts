export function generate_test_cases(cases: string) {
    
    var test_cases = [""]

    if (cases == "declare")
        test_cases = ["declare integer", "hello world"]

    else if (cases == "if block")
        test_cases = ["begin if hello world greater than 5"]

    else if (cases == "assign")
        test_cases = ["declare integer hello equals 5", "hello equals 2"]

    else if (cases == "for loop")
        test_cases = ["begin Loop condition I equal 0 condition I less than 5 condition I plus plus"]

    return test_cases
}