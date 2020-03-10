import sys

def printStar():
	print("  *  \n")

	print("*****\n")

	print(" *** \n")

	print("*****\n")

	print("  *  \n")


def printTriangle(a):
	i, j, k = 0, 0, 0

	for i in range(a + 1):
		for j in range(a + 1):
			print(" ")

		for k in range(2 * i + 1):
			print("*")

		print("\n")


def printRectangle(n, l):
	i, j = 0, 0

	for i in range(n):
		while (j < l):
			if(i == 0 or i == n - 1):
				print("*")

			else:
				if(j == 0 or j == l - 1):
					print("*")

				else:
					print(" ")

			j -= 1

		print("\n")


def main():
	a = ""

	print("Enter a number\n")

	a = input()

	print("a = " + a + "\n")

	if(a == 0):
		printStar()

	else:
		if(a == 1):
			printTriangle(5)

		else:
			if(a == 2):
				printRectangle(4, 5)

			else:
				if(a == 3):
					print("END\n")

	return 


