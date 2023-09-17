#include <stdio.h>
#include <string.h>
#include <stdbool.h>

typedef unsigned char byte;

bool need_padding(byte a, byte b) {
    return a != ' ' && b >= '(' && b <= '+';
}

char *format_line(char const *line, char *buf) {
    byte i, n = 0;
    int k = strlen(line) - 1;
    for (; i < k; i++) {
        byte a = line[i];
        byte b = line[i + 1];
        a = a == ',' || a == '\t' ? ' ' : a;

        if (a == b && a == ' ') {
            continue;
        }
        
        buf[n++] = a;
        
        if (need_padding(a, b) || need_padding(b, a)) {
            buf[n++] = ' ';
        }
    }
    buf[n++] = line[i];
    buf[n] = '\0';
}



int main() {
    char s[] = "ld     (ix+6)   ,h";
    char o[32];
    format_line(s, o);

    printf("%s\n", o);

    return 0;
}

