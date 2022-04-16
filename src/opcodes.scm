(define *opcodes*
  '(("adc"
     ((#x69 (:d8))
      (#x65 (:a8))
      (#x75 (:a8 :x))
      (#x6D (:a16))
      (#x7D (:a16 :x))
      (#x79 (:a16 :y))
      (#x61 (:lp :a16 :x :rp))
      (#x71 (:lp :a16 :rp :y))))
    ("beq"
     ((#xF0 (:a8))))
    ("bne"
     ((#xD0 (:a8))))
    ("dex"
     ((#xCA ())))
    ("inx"
     ((#xE8 ())))
    ("iny"
     ((#xC8 ())))
    ("jmp"
     ((#x4C (:a16))
      (#x6C (:lp :a16 :rp))))
    ("lda"
     ((#xA9 (:d8))
      (#xA5 (:a8))
      (#xB5 (:a8 :x))
      (#xAD (:a16))
      (#xBD (:a16 :x))
      (#xB9 (:a16 :y))
      (#xA1 (:lp :a16 :x :rp))
      (#xB1 (:lp :a16 :rp :y))))
    ("ldx"
     ((#xA2 (:d8))
      (#xAE (:a16))))
    ("nop"
     ((#xEA ())))
    ("pha"
     ((#x48 ())))
    ("php"
     ((#x08 ())))
    ("pla"
     ((#x68 ())))
    ("plp"
     ((#x28 ())))
    ("rti"
     ((#x40 ())))
    ("rts"
     ((#x60 ())))
    ("sec"
     ((#x38 ())))
    ("sed"
     ((#xF8 ())))
    ("sei"
     ((#x78 ())))))
