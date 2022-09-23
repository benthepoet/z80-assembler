### Reference Example

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

### Assembly Logic
* Read mnemonic
* Lookup pattern table for mnemonic
* Read tokens
* Search pattern table for match
* Assemble opcode
* Insert opcode
* Read next line

### Pattern Classes
* `r`
   * `B`
   * `C`
   * `D`
   * `E`
   * `H`
   * `L`
   * `A`
* `rr`
   * `BC`
   * `DE`
   * `HL`
   * `SP`
* `r'`
* `s`
   * Superclass, breakdown
* `ss` 
   * `BC`
   * `DE`
   * `HL`
   * `SP`
* `qq`
   * `BC`
   * `DE`
   * `HL`
   * `AF`
* `d`
   * `8-bit displacement`
* `n`
* `nn`
* `e`
   * `8-bit displacement`
* `m`
   * Superclass, breakdown
* `pp`
   * `BC`
   * `DE`
   * `IX`
   * `SP`
* `b`
   * `0-7`
* `cc`
   * `NZ`
   * `Z`
   * `NC`
   * `C`
   * `PO`
   * `PE`
   * `P`
   * `M`

### Tables

Mnemomic Table
---------------
| Table Length (1 byte) |
| Mnemonic Length (1 byte) | Mnemonic (n bytes) | Pattern table address (2 bytes) |

Pattern Table
---------------
| Table Length (1 byte) |
| Pattern Length (1 byte) | Pattern (n bytes) | Opcode Length (1 byte) | Opcode (n bytes) | Function (1 byte) |

**ADD** (1 + 40 bytes)
| Pattern Length | Pattern | Opcode Length | Opcode | Function |
| ------ | ------- | ------ | -------- | ------ |
| 2 | Ar | 1 | 00 | 00 | 
| 2 | An | 1 | 00 | 00 | 
| 4 | A(HL) | 1 | 00 | 00 | 
| 5 | A(IXd) | 2 | 0000 | 00 | 
| 5 | A(IYd) | 2 | 0000 | 00 | 

**CPI** (1 + 5 bytes)
| Pattern Length | Pattern | Opcode Length | Opcode | Function |
| ------ | ------- | ------ | -------- | ------ |
| 0 | | 2 | EDA1 | 00 |

**CPIR** (1 + 5 bytes)
| Pattern Length | Pattern | Opcode Length | Opcode | Function |
| ------ | ------- | ------ | -------- | ------ |
| 0 | | 2 | EDB1 | 00 |

**CPD** (1 + 5 bytes)
| Pattern Length | Pattern | Opcode Length | Opcode | Function |
| ------ | ------- | ------ | -------- | ------ |
| 0 | | 2 | EDA9 | 00 |

**CPDR** (1 + 5 bytes)
| Pattern Length | Pattern | Opcode Length | Opcode | Function |
| ------ | ------- | ------ | -------- | ------ |
| 0 | | 2 | EDB9 | 00 |

**LDI** (1 + 5 bytes)
| Pattern Length | Pattern | Opcode Length | Opcode | Function |
| ------ | ------- | ------ | -------- | ------ |
| 0 | | 2 | EDA0 | 00 |

**LDIR** (1 + 5 bytes)
| Pattern Length | Pattern | Opcode Length | Opcode | Function |
| ------ | ------- | ------ | -------- | ------ |
| 0 | | 2 | EDB0 | 00 |

**LDD** (1 + 5 bytes)
| Pattern Length | Pattern | Opcode Length | Opcode | Function |
| ------ | ------- | ------ | -------- | ------ |
| 0 | | 2 | EDA8 | 00 |

**LDDR** (1 + 5 bytes)
| Pattern Length | Pattern | Opcode Length | Opcode | Function |
| ------ | ------- | ------ | -------- | ------ |
| 0 | | 2 | EDB8 | 00 |

**PUSH** (1 + 21 bytes)
| Pattern Length | Pattern | Opcode Length | Opcode | Function |
| ------ | ------- | ------ | -------- | ------ |
| 1 | qq | 1 | C5 | 01 |
| 1 | IX | 2 | DDE5 | 00 |
| 1 | IY | 2 | FDE5 | 00 |

**POP** (1 + 21 bytes)
| Pattern Length | Pattern | Opcode Length | Opcode | Function |
| ------ | ------- | ------ | -------- | ------ |
| 1 | qq | 1 | C1 | 01 |
| 1 | IX | 2 | DDE1 | 00 |
| 1 | IY | 2 | FDE1 | 00 |
