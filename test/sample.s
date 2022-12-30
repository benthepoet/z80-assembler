reg1= $25
dw23= $a752

dec a
jr $00
ld hl,dw23
add a,reg1
inc hl
jp po,$2f01

