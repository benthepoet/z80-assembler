reg1 = $25
dw2 = $a752

jr start
dec a
jr $00
start: ld hl,dw2
add a,reg1
inc hl
jp po,$2f01
ld a,$FF
loop:
dec a
jr nz,loop
