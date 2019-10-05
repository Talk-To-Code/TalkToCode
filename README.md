# talk-to-code README

This is the README for your extension "talk-to-code".

## Features

The extension can simply be used by running it from the Command Palette (`Ctrl Shit P`).
The Command for enabling the Talk To Code extension is "Hello World" for now.

## Requirements

I am currently using :
* Node JS version    : 10.16.3.
* NPM version        : 6.11.3 
* google-cloud/speech: 3.3.0  (`npm install --save @google-cloud/speech`)
* node-record-lpcm16 : 1.0.1  (`npm install node-record-lpcm16`)

> You do not need to run the above npm commands. running `npm install` from command prompt should help you install the packages automatically. Make sure you run the command within the project root directory.

Sox is required for node-record-lpcm16.

For Windows users, download the [binaries](https://sourceforge.net/projects/sox/files/sox/14.4.1/) here.
> get sox-14.4.1-win32.exe. The latest version 14.4.2 is not compatible with Windows 10.

For mac OS users, running `brew install sox` should suffice.

## Starting Up

Within VSCode editor, go to root directory and debug the code with `F5`. This will run the extension in a new Extension Development Host Window.

Open the Command Palette (`Ctrl Shift P`) and search for the command "Hello World".

## Resources

[Tutorial for creating extension](https://code.visualstudio.com/api/get-started/your-first-extension)

