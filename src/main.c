#include <stdio.h>
#include <string.h>
#include <stdbool.h>

typedef unsigned char byte;

bool is_unpadded(byte a, byte b) {
    return a != ' ' && b >= '(' && b <= '+';
}

byte normalize_whitespace(byte b) {
    return b == ',' || b == '\t' ? ' ' : b;
}

char *format_line(char const *line, char *buf) {
    byte i, n = 0;
    int k = strlen(line) - 1;
    for (; i < k; i++) {
        byte a = normalize_whitespace(line[i]);
        byte b = normalize_whitespace(line[i + 1]);
        
        if (a == ' ' && b == a) {
            continue;
        } else if (a == ';') {
            break;
        }
        
        buf[n++] = a;
        
        if (is_unpadded(a, b) || is_unpadded(b, a)) {
            buf[n++] = ' ';
        }
    }

    if (line[i] != ';' && line[i] != ' ') {
        buf[n++] = line[i];
    } else if (i > 0 && line[i - 1] == ' ') {
        n--;
    }
    buf[n] = '\0';
}

int main() {
    char s[] = "ld (ix+d),h ";
    char o[32];
    format_line(s, o);

    printf("%s | %d\n", o, strlen(o));

    return 0;
}

