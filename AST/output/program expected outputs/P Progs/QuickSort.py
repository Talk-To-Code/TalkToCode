import sys

def quicksort(X, first, last):
	pivot, j, temp, i = 0, 0, 0, 0

	if(first < last):
		pivot = first

		i = first

		j = last

		while (i < j):
			while (X[i] <= X[pivot] and i < last):
				i += 1

			while (X[j] > X[pivot]):
				j -= 1

			if(i < j):
				temp = X[i]

				X[i] = X[j]

				X[j] = temp

		temp = X[pivot]

		X[pivot] = X[j]

		X[j] = temp

		quicksort(X, first, j - 1)

		quicksort(X, j + 1, last)


size, X = 0, []

size = int(input("Enter size of the array: "))

print("Enter %d elements: " % size)

for i in range(size):
	X.append(int(input()))


quicksort(X, 0, size - 1)

print("Sorted elements: ")

for i in range(size):
	print("%d" % X[i])


