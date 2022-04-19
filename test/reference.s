default:= #$ff

start:
    lda #$00
    ldx default
l1:
    dex
    bne l1
    beq start
end:
    .w end - start

    .org $FFFC
    .w $00C0
    
    
    
