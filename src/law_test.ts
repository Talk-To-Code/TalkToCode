var arr = ["hello", "goodbye"]

var arr2 = [];
arr2.push(arr[0])
arr2.push(arr[1])

arr[0] = "evening"
console.log(arr2)