#include <stdio.h>

typedef struct point {
	int x, y;
} point;

int  main(){
	point p;

	p.x = 1;

	p.y = 2;

	printf("%d\n",p.x);

	printf("%d\n",p.y);

	return 0;

}

