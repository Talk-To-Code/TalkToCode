var name = `#function printf(#parameter #value "enter the numbers of elements : ");; `
if (name.includes("#function")) {
    var funct_name = name.split(" ")[1];
    var idxParam = funct_name.indexOf("(");
    funct_name = funct_name.slice(0, idxParam);
    console.log(funct_name)
}



