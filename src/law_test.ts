var string_arr = ['hello', 'world', 'hello', 'equal', 'last'];

string_arr.splice(2, 2);

console.log(string_arr);

string_arr.splice(2, 0, "second last");
console.log(string_arr);