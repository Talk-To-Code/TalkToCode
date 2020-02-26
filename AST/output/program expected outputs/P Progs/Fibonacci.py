import sys

def main():
	n, first, second, next, c = 0, 0, 1, 0, 0

	print("Enter the number of terms\n")

	n = input()

	print("First " + n + " terms of Fibonacci series are :-\n")

	for c in range(n):
		if(c <= 1):
			next = c


		else:
			next = first + second

			first = second

			second = next




		print(next + "\n")


	return 

