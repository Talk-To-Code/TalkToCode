console.log("hello   sucker".split("").join(" ").replace(/  +/g, ' '))

// console.log(getSpelling("spell hello end_spell"))


// function getSpelling(input_speech) {

//     if (!input_speech.includes("end_spell")) {
//         console.log("not done spelling");
//         return;
//     }
//     var temp = input_speech.split(" ");
//     var spellIdx = temp.indexOf("spell");
//     var spellEndIdx = temp.indexOf("end_spell");

//     console.log(spellIdx)
//     console.log(spellEndIdx)

//     if (spellIdx > spellEndIdx) {
//         console.log("wrong order");
//         return;
//     }

//     var spelledWord = temp.slice(spellIdx + 1, spellEndIdx);
//     if (spelledWord.length == 0) {
//         console.log("Spelled word not mentioned");
//         return;
//     }

//     return  (temp.slice(0, spellIdx).join(" ") + " " + spelledWord.join("") + " " + 
//                     temp.slice(spellEndIdx+1).join(" ")).trim();
// }
