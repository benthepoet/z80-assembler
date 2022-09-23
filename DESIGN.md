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
| Length (1 byte) | Pattern (n bytes) | Opcode (2 bytes) | Function (1 byte) |
