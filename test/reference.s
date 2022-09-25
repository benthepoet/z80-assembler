default= $FF

start:
    ld a,$00
    ld b,default
l1:
    dec b
    jr nz,l1
    jp start
end:
    
    
