    default= #$ff

start:
    lda #$00
    ldx default
l1:
    dex
    bne l1
    beq start

    .org $FFFC
    .w $00C0
    
    
    
