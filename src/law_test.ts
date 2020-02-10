// console.log("equal equal equal".replace(/equal/g, "bar"))

// module.exports = {

//     hello: function() {
//         console.log("hello from another file.")
//     }

// }

var arr1 = ["apple", "orange"]
var arr2 = ["papaya", "carrot"]
var arr3 = ["apple", "cucumber"]

console.log(arr3.some(x=>arr1.includes(x)))


