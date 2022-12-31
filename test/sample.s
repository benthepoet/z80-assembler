reg1 = $25
dw2 = $a752

dec a
jr $00
ld hl,dw2
add a,reg1
inc hl
jp po,$2f01
ld a,$FF
loop:
dec a
jp nz,loop
