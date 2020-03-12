fileName = input("Enter name of file to be opened: ")

with open(fileName, "r+") as f:
	print(f.read())

	newLine = input("Enter new content: ")

	f.write(newLine + "\n")


