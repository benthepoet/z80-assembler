(define types
  '(:label
    :mnemonic
    :word
    :register))

(define mnemonics
  '(("adc")
    ("lda")))

(define lines
  '())

(define read-word
  (lambda ()
    (let ((word "")
          (length (string-length +input-buffer+)))
      (let loop ((i +input-cursor+))
          (if (or (= i length)
                  (char-whitespace? (string-ref +input-buffer+ i)))
              (begin
                (if (> (- i +input-cursor+) 0)
                    (begin
                      (set! word (substring +input-buffer+ +input-cursor+ i))
                      (process-word word)
                      (set! +input-cursor+ i)))
                (set! +input-cursor+ (+ +input-cursor+ 1))))
          (if (and (< i length)
                   (string=? word ""))
              (loop (+ i 1)))))))

(define assemble
  (lambda (line)
    (println line)))
