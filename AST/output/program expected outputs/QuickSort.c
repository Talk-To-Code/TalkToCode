#include <stdio.h>

void quicksort(int [], int , int );
void quicksort(int  X[], int  first, int  last){
	int  pivot, j, temp, i;

	if(first < last) {
	pivot  =  first;
	i  =  first;
	j  =  last;
	while (i < j){
	while (X[i] <= X[pivot] && i < last){
	i++;

}

	while (X[j] > X[pivot]){
	j--;

}

	if(i < j) {
	temp  =  X[i];
	X[i]  =  X[j];
	X[j]  =  temp;
	}

}
	temp  =  X[pivot];
	X[pivot]  =  X[j];
	X[j]  =  temp;
	quicksort(X,first,j - 1);
	quicksort(X,j + 1,last);
	}

}

int  main(){
	int  size, i, X[100];

	printf("Enter size of the array: ");

	scanf("%d",&size);

	printf("Enter %d elements: ",size);

	for (i  =  0;i < size;i++){
	scanf("%d",&X[i]);

}

	quicksort(X,0,size - 1);

	printf("Sorted elements: ");

	for (i  =  0;i < size;i++){
	printf(" %d",X[i]);

}

	return 0;

}

