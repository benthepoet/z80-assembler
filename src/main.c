#include <stdio.h>
#include <string.h>
#include <stdbool.h>

#define BUF_SIZE 2 << 7

typedef unsigned char byte;

typedef struct LineState {
    char buf[BUF_SIZE];
    int curs;
    char mnem[BUF_SIZE];
    char word[BUF_SIZE];
    char *toks[];
} LineState;

bool is_unpadded(byte a, byte b) {
    return a != ' ' && b >= '(' && b <= '+';
}

byte normalize_whitespace(byte b) {
    return b == ',' || b == '\t' || b == '\n' ? ' ' : b;
}

void read_next(LineState *ln) {
    int i = 0;
    int k = strlen(ln->buf);
    while (ln->buf[ln->curs] == ' ' && ln->curs < k) {
        ln->curs++;
    }

    while (ln->buf[ln->curs] != ' ' && ln->curs < k) {
        ln->word[i++] = ln->buf[ln->curs++];
    }

    ln->word[i] = '\0';
}

void tokenize_line(char const *buf) {

}

void format_line(char const *buf, char *fmt) {
    byte i, n = 0;
    int k = strlen(buf) - 1;
    for (; i < k; i++) {
        byte a = normalize_whitespace(buf[i]);
        byte b = normalize_whitespace(buf[i + 1]);
        
        if (a == ' ' && b == a) {
            continue;
        } else if (a == ';') {
            break;
        }
        
        fmt[n++] = a;
        
        if (is_unpadded(a, b) || is_unpadded(b, a)) {
            fmt[n++] = ' ';
        }
    }

    if (buf[i] != ';') {
        fmt[n++] = normalize_whitespace(buf[i]);
    }
    fmt[n] = '\0';
}

int read_lines(char *file) {
    char buf[BUF_SIZE];
    char fmt[BUF_SIZE];

    FILE *fp = fopen(file, "r");
    if (fp == NULL) {
        perror("Error opening file");
        return -1;
    }

    while (fgets(buf, BUF_SIZE, fp)) {
        LineState ln = { .curs = 0 };
        format_line(buf, ln.buf);
        printf("%s\n", ln.buf);

        read_next(&ln);
        while (strlen(ln.word) != 0) {
            printf("%s ", ln.word);
            read_next(&ln);
        }

        printf("\n");
    }

    fclose(fp);
    return 0;
}

int main(int argc, char *argv[]) {
    if (argc == 2) {
        return read_lines(argv[1]);
    }

    fprintf(stderr, "%s", "Error argmuent: No filename supplied\n");
    return -1;
}

