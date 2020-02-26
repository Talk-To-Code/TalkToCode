import sys

def main():
	n, c = 0, 2

	print("Enter an integer\n")

	n = input()

	if(n == 2):
		print("Prime number.\n")


	else:
		for c in range(2, n):
			if(n % c == 0):
				break




		if(c != n):
			print("Not prime.\n")


		else:
			print("Prime number.\n")






	return 

