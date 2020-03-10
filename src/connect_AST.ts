const {spawn} = require('child_process');

async function test_spawn() {
    // cwd is the current working directory. Make sure you update this.
    let cwd = 'C:\\Users\\Lawrence\\Desktop\\talktocode\\talk-to-code\\AST\\src';

    const child = spawn('java', ['ast/ASTParser'], {shell:true, cwd: cwd});
    child.stdin.setEncoding('utf8');
    child.stdin.write('#c_program SampleProgram #include "stdio h";; #create int #variable count #value 5 #dec_end;; #program_end');
    child.stdin.end();

    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (data: string)=>{
        console.log(data)
	});
}

async function test_spawn2() {
    // cwd is the current working directory. Make sure you update this.
    let cwd = 'C:\\Users\\Lawrence\\Desktop';

    const child = spawn('java', ['test'], {shell:true, cwd: cwd});
    child.stdin.write("hello");
    child.stdin.end();

    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (data: string)=>{
        console.log(data)
	});
}

test_spawn();


