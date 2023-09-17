#include <stdio.h>
#include <string.h>
#include <stdbool.h>

bool should_pad(unsigned char c) {
    return c >= '(' && c <= '+';
}

char *format_line(char const *line, char *buf) {
    int i, n = 0;
    int k = strlen(line) - 1;
    for (; i < k; i++) {
        unsigned char a = line[i];
        a = a == ',' || a == '\t' ? ' ' : a;
        buf[n++] = a;

        unsigned char b = line[i + 1];
        if ((a != ' ' && should_pad(b))
            || (b != ' ' && should_pad(a))) {
            buf[n++] = ' ';
        }
    }
    buf[n] = line[i];
}



int main() {
    char s[] = "ld (ix+6),h";
    char o[80];
    format_line(s, o);

    printf("%s\n", o);

    return 0;
}

