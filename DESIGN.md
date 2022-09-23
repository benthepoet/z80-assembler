Tokens

* org
* label
* constant
* mnemonic
* d8 (8-bit literal)
* a8 (8-bit address)
* a16 (16-bit address)
* left/right paren
* register

```assembly

default= #$FF ; Constant

start: ; Named label
    ld a,#$00
    ld b,default
l1: dec b 
    jr nz,l1 
    jmp start ; Branch to named label

    .org $FFFC ; Indicate location in memory
    .w $00C0 ; Add word to memory 
    
```

### Tables

Mnemomic Table
---------------
| Length (1 byte) | Mnemonic (n bytes) | Pattern table address (2 bytes) |

Pattern Table
---------------
| Pattern Length (1 byte) | Pattern (n bytes) | Opcode Length (1 byte) | Opcode (n bytes) | Function (1 byte) |

**ADD** (40 bytes)
| Pattern Length | Pattern | Opcode Length | Opcode | Function |
| ------ | ------- | ------ | -------- | ------ |
| 2 | Ar | 1 | 00 | 00 | 
| 2 | An | 1 | 00 | 00 | 
| 4 | A(HL) | 1 | 00 | 00 | 
| 5 | A(IXd) | 2 | 0000 | 00 | 
| 5 | A(IYd) | 2 | 0000 | 00 | 

**CPI** (5 bytes)
| Pattern Length | Pattern | Opcode Length | Opcode | Function |
| ------ | ------- | ------ | -------- | ------ |
| 0 | | 2 | EDA1 | 00 |

**CPIR** (5 bytes)
| Pattern Length | Pattern | Opcode Length | Opcode | Function |
| ------ | ------- | ------ | -------- | ------ |
| 0 | | 2 | EDB1 | 00 |

**CPD** (5 bytes)
| Pattern Length | Pattern | Opcode Length | Opcode | Function |
| ------ | ------- | ------ | -------- | ------ |
| 0 | | 2 | EDA9 | 00 |

**CPDR** (5 bytes)
| Pattern Length | Pattern | Opcode Length | Opcode | Function |
| ------ | ------- | ------ | -------- | ------ |
| 0 | | 2 | EDB9 | 00 |

**LDI** (5 bytes)
| Pattern Length | Pattern | Opcode Length | Opcode | Function |
| ------ | ------- | ------ | -------- | ------ |
| 0 | | 2 | EDA0 | 00 |

**LDIR** (5 bytes)
| Pattern Length | Pattern | Opcode Length | Opcode | Function |
| ------ | ------- | ------ | -------- | ------ |
| 0 | | 2 | EDB0 | 00 |

**LDD** (5 bytes)
| Pattern Length | Pattern | Opcode Length | Opcode | Function |
| ------ | ------- | ------ | -------- | ------ |
| 0 | | 2 | EDA8 | 00 |

**LDDR** (5 bytes)
| Pattern Length | Pattern | Opcode Length | Opcode | Function |
| ------ | ------- | ------ | -------- | ------ |
| 0 | | 2 | EDB8 | 00 |
