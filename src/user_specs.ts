
export function getUserSpecs(username: string) {
    var ast_cwd = "";
    var cwd = "";
    var cred = "";
    if (username == "lawrence") {
        ast_cwd = 'C:\\Users\\Lawrence\\Desktop\\talktocode\\talk-to-code\\AST\\src';
        cwd = 'C:\\Users\\Lawrence\\Desktop\\talktocode\\talk-to-code\\src';
        cred = 'C:\\Users\\Lawrence\\Desktop\\fyp\\benchmarking\\test_google_cloud\\My-Project-f25f37c6fac1.json';
    }

    else if (username == "archana") {
        ast_cwd = '/Users/Archana/Desktop/TalkToCode/AST/src';
        cwd = '/Users/Archana/Desktop/TalkToCode/src';
        cred = '/Users/Archana/Desktop/TalkToCode-f3a307e35758.json';
    }

    // For new user
    /*
    else if (username == "new name") {
        ast_cwd = "path to src folder of AST in the main src folder";
        cwd = "path to current src folder";
        cred = "path to the google credentials file";
    }
    */
    return [cwd, cred, ast_cwd];
}