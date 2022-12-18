#!/usr/bin/env gsi-script

(define *mnemonics*
  '(("dec" inc-dec)
    ("inc" inc-dec)))

(define *patterns*
  '((:inc-dec-g1
     ((:r1)
      (:lp :hl :rp)
      (:lp :ix :ds :rp)
      (:lp :iy :ds :rp)))
    (:inc-dec-g2
     ((:ss)
      (:ix)
      (:iy)))))

(define +empty-string+ "")

(define *expression-mode* #f)
(define *expression-stack* '())

(define *output-mode* #f)

(define *line-buffer* +empty-string+)
(define *line-cursor* 0)

(define *location-counter* 0)
(define *symbols* '())

(define *mnemonic* +empty-string+)
(define *tokens* '())

(define *opcode* #f)
(define *opcode-offset* 0)
(define *operands* '())
(define *operands-length* 0)

(define string-empty?
  (lambda (str)
    (string=? str +empty-string+))) 

(define-macro (append! val var)
  `(set! ,var (append ,var (list ,val))))

(define-macro (add! var val)
  `(set! ,var (+ ,var ,val)))

(define-macro (inc! var)
  `(add! ,var 1))

(define-macro (pop! var)
  `(let ((head (car ,var))
         (tail (cdr ,var)))
     (set! ,var tail)
     head))

(define-macro (push! val var)
  `(set! ,var (cons ,val ,var)))

(define-macro (string-append! var str)
  `(set! ,var (string-append ,var ,str)))

(define inc-dec
  (lambda ()))
    
