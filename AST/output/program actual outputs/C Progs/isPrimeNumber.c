#include <stdio.h>

int main(){
	int n, c;

	printf("Enter an integer\n");

	scanf("%d", &n);

	if(n == 2) {
		printf("Prime number.\n");
	}
	else {
		for (c = 2;c <= n - 1;c++){
			if(n % c == 0) {
				break;
			}


		}
		if(c != n) {
			printf("Not prime.\n");
		}
		else {
			printf("Prime number.\n");
		}

	}


	return 0;

}

