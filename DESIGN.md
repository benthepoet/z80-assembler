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

:default #$FF

.start
    lda #$00
    ldx :default
.loop
    dex
    bne .loop
    beq .start

```