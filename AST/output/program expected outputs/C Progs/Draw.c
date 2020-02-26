#include <stdio.h>

void printStar();
void printStar(){
	printf("  *  \n");

	printf("*****\n");

	printf(" *** \n");

	printf("*****\n");

	printf("  *  \n");

}

void printTriangle(int );
void printTriangle(int  a){
	int i, j, k;

	for (i = 0;i <= a;i++){
		for (j = a;j >= 0;j--){
			printf(" ");

		}

		for (k = 0;k < 2 * i + 1;k++){
			printf("*");

		}

		printf("\n");

	}

}

void printRectangle(int , int );
void printRectangle(int  n, int  l){
	int i, j;

	for (i = 0;i < n;i++){
		for (j = 0;j < l;j--){
			if(i == 0 || i == n - 1) {
				printf("*");
			}
			else {
				if(j == 0 || j == l - 1) {
					printf("*");
				}
				else {
					printf(" ");
				}

			}


		}

		printf("\n");

	}

}

int  main(){
	int a;

	LOOP:

	printf("Enter a number\n");

	scanf("%d", &a);

	printf("a = %d\n", a);

	switch (a) {
		case 0:
			printStar();
			break;

		case 1:
			printTriangle(5);
			break;

		case 2:
			printRectangle(4, 5);
			break;

		case 3:
			printf("END\n");
			break;

		default:
			goto LOOP;

	}

	return 0;

}

