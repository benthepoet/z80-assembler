#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>

#define BUF_SIZE 2 << 7
#define WORD_SIZE 2 << 4
#define MAX_TOKENS 2 << 3

typedef unsigned char byte;

typedef struct MnemonicFixed {
    char name[4];
    byte prefix;
    byte opcode;
} MnemonicFixed;

typedef struct Line {
    char buf[BUF_SIZE];
    int curs;
    char mnem[WORD_SIZE];
    char word[WORD_SIZE];
    char tokens[MAX_TOKENS][WORD_SIZE];
    int tcnt;
    int prefix;
    byte opcode;
} Line;

MnemonicFixed mnemonics0[] = {
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

bool matches(Line *ln, int i, const char *pattern, int prefix, int opcode) {
    return true;
}

void set_opcode(Line *ln, int prefix, byte opcode) {
    ln->prefix = prefix;
    ln->opcode = opcode;
}

bool add_adc_sub_sbc_group_1(Line *ln) {
    int i = 0;
    if (strcmp(ln->tokens[i++], "a") == 0
        && (matches(ln, i, "r2", 0x00, 0x80)
        || matches(ln, i, "n", 0x00, 0xc0)
        || matches(ln, i, "( hl )", 0x00, 0x86)
        || matches(ln, i, "( ix + dp )", 0x00, 0xDD)
        || matches(ln, i, "( iy + dp )", 0x00, 0xFD))) {
        return true;
    }

    return false;
}

void read_next(Line *ln) {
    int i = 0;
    int k = strlen(ln->buf);

    // Eat up any whitespace
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
        printf("%s", ln->word);
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
            for (int i = 0; i < 10; i++) {
                MnemonicFixed mnem = mnemonics0[i];
                if (!strcmp(ln.mnem, mnem.name)) {
                    printf("Prefix: %02x, Opcode: %02x\n", mnem.prefix, mnem.opcode);
                }
            }
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

