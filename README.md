# talk-to-code README

This is the README for your extension "talk-to-code".

## Features

The extension can simply be used by running it from the Command Palette (`Ctrl Shit P`).
The Command for enabling the Talk To Code extension is "Hello World" for now.

## Requirements

We are currently using :
* VSCode version     : 1.39.1 (If you are using a version older than 1.18.1, it might not work.)
* Node JS version    : 10.16.3 (Make sure Node JS is updated. google-cloud speech requires updated version.)
* NPM version        : 6.11.3 
* google-cloud/speech: 3.3.0  (`npm install --save @google-cloud/speech`)
* node-record-lpcm16 : 1.0.1  (`npm install node-record-lpcm16`)

> You do not need to run the above npm commands. running `npm install` from command prompt should help you install the packages automatically. Make sure you run the command within the project root directory.

Sox is required for node-record-lpcm16. Make sure sox is in the environment variables.
> For e.g. I added the following path to the PATH variables 'C:\Program Files (x86)\sox-14-4-1'.

For Windows users, download the [binaries](https://sourceforge.net/projects/sox/files/sox/14.4.1/) here.
> get sox-14.4.1-win32.exe. The latest version 14.4.2 is not compatible with Windows 10.

For mac OS users, running `brew install sox` should suffice.

## Credentials

Generate the credentials json file from Google.
https://cloud.google.com/docs/authentication/getting-started

## Starting Up

First go to `src\user_specs.ts`, add new user and fill in the paths as shown below:

```
else if (username == "name_of_user") {
        ast_cwd = '/Users/Path/Path2/TalkToCode/AST/src';
        cwd = '/Users/Path/Path2/TalkToCode/src';
        cred = '/Users/Path/Path2/creds.json'; (the path to the google credentials in .json format that you have downloaded)
    }
```

Then proceed to `src\extensions.ts` and change the user's name in the argument of the initUser() function. Use
the name that you added in the `src\user_specs.ts`.

Finally, debug the code with `F5`. This will run the extension in a new Extension Development Host Window.
Open up a new file.

Open the Command Palette (`Ctrl Shift P`) and search for the command "Hello World".

## Resources

[Tutorial for creating extension](https://code.visualstudio.com/api/get-started/your-first-extension)

