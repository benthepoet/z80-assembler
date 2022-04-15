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
    lda #$00
    ldx default
:   dex ; Unnamed label
    bne -: ; Reverse reference to nearest unnamed label
    beq start ; Branch to named label

.org $FFFC ; Indicate location in memory
.w $00C0 ; Add word to memory 
    
```