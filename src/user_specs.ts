
export function initUser(username: string) {
    var cwd = "";
    var cred = "";
    if (username == "lawrence") {
        cwd = 'C:\\Users\\Lawrence\\Desktop\\talktocode\\talk-to-code\\src';
        cred = 'C:\\Users\\Lawrence\\Desktop\\fyp\\benchmarking\\test_google_cloud\\My-Project-f25f37c6fac1.json';
    }

    else if (username == "archana") {
        cwd = '/Users/Archana/Desktop/TalkToCode/src';
        cred = '/Users/Archana/Desktop/TalkToCode-f3a307e35758.json';
    }

    return [cwd, cred];
}