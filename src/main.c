#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>

#define BUF_SIZE 2 << 7
#define WORD_SIZE 2 << 4
#define MAX_TOKENS 2 << 3

enum token_lookup {
    zero = 0x00,
    one = 0x01,
    two = 0x02,
    three = 0x03,
    four = 0x04,
    five = 0x05,
    six = 0x06,
    seven = 0x07,
    a = 0x08,
    b = 0x09,
    c = 0x0a,
    d = 0x0b,
    e = 0x0c,
    h = 0x0d,
    l = 0x0e,
    bc = 0x0f,
    de = 0x10,
    hl = 0x11,
    ix = 0x12,
    iy = 0x13,
    sp = 0x14,
    n = 0x15,
    nn = 0x16,
    i = 0x17,
    r = 0x18,
    lp = 0x19,
    rp = 0x1a,
    eq = 0x1b,
    pl = 0x1c,
    af = 0x1d,
    afp = 0x1e,
    nz = 0x1f,
    z = 0x20,
    nc = 0x21,
    cr = 0x22,
    po = 0x23,
    pe = 0x24,
    p = 0x25,
    m = 0x26
};

typedef unsigned char byte;

typedef struct Mnemonic0 {
    char name[4];
    byte prefix;
    byte opcode;
} Mnemonic;

typedef struct Line {
    char buf[BUF_SIZE];
    int curs;
    char mnem[WORD_SIZE];
    char word[WORD_SIZE];
    char tokens[MAX_TOKENS][WORD_SIZE];
    int tcnt;
} Line;

Mnemonic mnemonics[] = {
    { .name = "daa", .prefix = 0x00, .opcode = 0x27 },
    { .name = "cpl", .prefix = 0x00, .opcode = 0x2f },
    { .name = "neg", .prefix = 0xed, .opcode = 0x44 },
    { .name = "ccf", .prefix = 0x00, .opcode = 0x3f },
    { .name = "scf", .prefix = 0x00, .opcode = 0x37 },
    { .name = "nop", .prefix = 0x00, .opcode = 0x00 },
    { .name = "halt", .prefix = 0x00, .opcode = 0x76 },
    { .name = "di", .prefix = 0x00, .opcode = 0xf3 },
    { .name = "ei", .prefix = 0x00, .opcode = 0xfb },
    { .name = "exx", .prefix = 0x00, .opcode = 0xd9 },
};

bool is_unpadded(byte a, byte b) {
    return a != ' ' && b >= '(' && b <= '+';
}

byte normalize_whitespace(byte b) {
    return b == ',' || b == '\t' || b == '\n' ? ' ' : b;
}

void read_next(Line *ln) {
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

void push_token(Line *ln) {
    strcpy(ln->tokens[ln->tcnt++], ln->word);
}

void parse_line(Line *ln) {
    ln->curs = 0;
    ln->tcnt = 0;
    ln->mnem[0] = '\0';

    read_next(ln);

    if (ln->word[strlen(ln->word) - 1] == ':') {
        printf("Label %s\n", ln->word);
        read_next(ln);
    }

    if (strcmp(ln->word, "") != 0) {
        printf("Mnemonic %s\n", ln->word);
        strcpy(ln->mnem, ln->word);
    }

    read_next(ln);
    while (strcmp(ln->word, "") != 0) {
        printf("%s ", ln->word);
        push_token(ln);
        read_next(ln);
    }

    printf("\nFound %d tokens\n", ln->tcnt);
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

    Line ln;

    while (fgets(buf, BUF_SIZE, fp)) {
        format_line(buf, ln.buf);
        parse_line(&ln);

        if (strlen(ln.mnem) == 0) {
            continue;
        }

        if (ln.tcnt == 0) {
            printf("Searching for '%s'\n", ln.mnem);
        }
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

