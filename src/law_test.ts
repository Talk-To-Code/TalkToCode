var text = "----"

text = text.replace(/\+/g, "plus");
text = text.replace(/-/g, "minus");
text = text.replace(/\*/g, "multiply");
text = text.replace(/\//g, "divide");

text = text.replace(/bit and/g, "bit_and");
text = text.replace(/bit or/g, "bit_or");
console.log(text)