#include <stdio.h>

void my_function();
void my_function(){
	printf("Welcome to my function. Feel at home.\n");

	return;

}

int  main(){
	printf("Main function.\n");

	my_function();

	printf("Back in function main.\n");

	return 0;

}

