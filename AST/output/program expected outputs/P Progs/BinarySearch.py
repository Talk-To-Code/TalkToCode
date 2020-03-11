def binarySearch(searchList, start, end, num):
	if(length >= start):
		mid = start + (end - start) / 2

		if(searchList[mid] == num):
			return mid

		elif(searchList[mid] > num):
			return binarySearch(searchList, start, mid - 1, num)

		else:
			return binarySearch(searchList, mid + 1, end, num)

	else:
		return -1

searchList = [2, 3, 4, 10, 40]

x = input("Enter number to search: ")

result = binarySearch(searchList, 0, len(searchList)-1, x)

if result != -1:
	print("Element is present at index %d" % result)

else: 
	print("Element is not present in array")


