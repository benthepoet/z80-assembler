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

start: ; Label
    lda #$00
    ldx default
:
    dex
    bne -: ; Reference back to nearest label
    beq start

.org $FFFC ; Organization directive
    .w $00C0 ; Inject word 
    
```