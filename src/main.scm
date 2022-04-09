(define mnemonics
  '(("adc")
    ("lda"
     ((:a8) 00)
     ((:a8 :x) 00))))

(define lines
  '())

(define +line-buffer+ "")
(define +line-cursor+ 0)
(define +mnemonic+ "")
(define +operand+ #f)
(define +tokens+ '())

(define is-hex
  (lambda (str)
    (if (or (not (or (= (string-length str) 3) (= (string-length str) 5)))
            (not (char=? (string-ref str 0) #\$)))
        (raise "Invalid hex format")
        (let loop ((i 1)
                   (length (string-length str))
                   (c (string-ref str 1)))
          (if (or (and (char>=? c #\0)
                       (char<=? c #\9))
                  (and (char>=? c #\A)
                       (char<=? c #\F)))
              (begin
                (set! i (+ i 1))
                (if (< i length)
                    (loop i length (string-ref str i))))
              (raise "Invalid hex character"))))))

(define read-word
  (lambda ()
    (let ((word "")
          (length (string-length +line-buffer+)))
      (let loop ((i +line-cursor+))
        (if (> +line-cursor+ length)
            word
            (begin
              (if (or (= i length)
                      (char-whitespace? (string-ref +line-buffer+ i)))
                  (begin
                    (if (> (- i +line-cursor+) 0)
                        (begin
                          (set! word (substring +line-buffer+ +line-cursor+ i))
                          (set! +line-cursor+ i)))
                    (set! +line-cursor+ (+ +line-cursor+ 1))))
              (if (and (< i length)
                       (string=? word ""))
                  (loop (+ i 1))
                  word)))))))

(define read-tokens
  (lambda ()
    (let loop ((word (read-word)))
      (if (not (string=? word ""))
          (begin
            (if (string=? word "x")
                (set! +tokens+ (cons +tokens+ ':x)))
            (if (char=? (string-ref word 0) #\$)
                (set! +tokens+ (cons +tokens+ ':a8)))
            (loop (read-word)))))))

(define assemble
  (lambda (line)
    (set! +line-buffer+ line)
    (set! +line-cursor+ 0)
    (let ((mnemonic (read-word)))
      (if (not (string=? mnemonic ""))
          (begin
            (set! +mnemonic+ mnemonic)
            (read-tokens)
            (println +mnemonic+ +tokens+))))))     

(define hex->number
  (lambda (str)
    (let ((l (string-length str))
          (v 0))
      
      (if (= l 0)
          (raise "Input was empty."))
      
      (if (> (modulo l 2) 0)
          (raise "Hex characters must be in pairs."))

      (let loop ((i 0)  
                 (c (string-ref str 0)))
          (if (or (and (char>=? c #\0)
                       (char<=? c #\9))
                  (and (char>=? c #\A)
                       (char<=? c #\F)))
              (begin
                (set! v (bitwise-ior (arithmetic-shift v 4) c))
                (set! i (+ i 1))
                (if (< i l)
                    (loop i (string-ref str i))))
              (raise "Invalid hex character"))))))

(hex->number "00FF")

(is-hex "$09F0")
(assemble "lda $00")
(assemble "lda $00 x")
