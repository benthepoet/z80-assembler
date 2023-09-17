#include <stdio.h>
#include <string.h>

char *format_line(char const *line, char *buf) {
    int n = 0;
    int k = strlen(line);
    for (int i = 0; i < k; i++) {
        unsigned char a = line[i];
        buf[n++] = a;

        int j = i + 1;
        if (j < k) {
            unsigned char b = line[j];
            if ((a != ' ' && (b >= '(' && b <= '+'))
                || (b != ' ' && (a >= '(' && a <= '+'))) {
                buf[n++] = ' ';
            }
        }
    }
}

int main() {
    char s[] = "ld (ix+6),h";
    char o[80];
    format_line(s, o);

    printf("%s\n", o);

    return 0;
}

