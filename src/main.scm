(define *opcodes*
  '(("dec"
     ((#x05 (:r1))
      (#xDD2B (:ix))
      (#xFD2B (:iy))))
    ("ld"
     ((#x40 (:r1 :r2))
      (#x06 (:r1 :n))
      (#x46 (:r1 :hl))
      (#xDD46 (:r1 :lp :ix :n :rp))
      (#xFD46 (:r1 :lp :iy :n :rp))
      (#x70 (:lp :hl :rp :r2))
      (#xDD70 (:lp :ix :n :rp :r2))
      (#xFD70 (:lp :iy :n :rp :r2))
      (#x36 (:lp :hl :rp :n))
      (#xDD36 (:lp :ix :n :rp :n2))
      (#xFD36 (:lp :iy :n :rp :n2))
      (#x0A (:a :lp :bc :rp))))
    ("jr"
     ((#x04 (:nz :n))))
    ("jp"
     ((#x05 (:nn))))
    ("nop"
     ((#x00 ())))))

(define table-r
  '((:b 0)
    (:c 1)
    (:d 2)
    (:e 3)
    (:h 4)
    (:l 5)
    (:a 7)))

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

(define list->hex
  (lambda (l)
    (let loop ((s "")
               (head (car l))
               (tail (cdr l)))
      (string-append! s (number->hex head))
      (if (pair? tail)
          (begin
            (string-append! s " ")
            (loop s (car tail) (cdr tail)))
          s))))

(define operand-type
  (lambda (class hex)
    (string->symbol (string-append class (number->string (cadr hex)))))) 

(define read-constant
  (lambda ()
    (let ((hex (read-hex (read-word))))
      (if hex
          hex
          (raise "Invalid value for constant")))))

(define read-word
  (lambda ()
    (let ((word +empty-string+)
          (length (string-length *line-buffer*)))
      (let loop ((i *line-cursor*))        
        (if (or (>= i length)
                (char-whitespace? (string-ref *line-buffer* i)))
            (begin
              (if (> (- i *line-cursor*) 0)
                  (begin
                    (set! word (substring *line-buffer* *line-cursor* i))
                    (set! *line-cursor* i)))
              (inc! *line-cursor*)))

        (if (not (string-empty? word))
            word
            (if (<= i length)
                (loop (+ i 1))
                word))))))

(define read-hex
  (lambda (word)
    (cond
     ((string-match? ':begins word "$")
      (let ((hex (hex->number (substring word 1 (string-length word)))))
        hex))

     (else #f))))

(define read-hex-or-label
  (lambda (word)
    (let ((hex (read-hex word)))
         (if hex
             hex
             (let ((symbol (assoc word *symbols*)))
               (if (pair? symbol)
                   (cadr symbol)
                   #x0000))))))
 
(define read-tokens
  (lambda ()
    (let loop ((word (read-word)))
      (if (not (string-empty? word))
          (begin

            (if *expression-mode*
            
                (cond
                 ((string=? word "-")
                  (let ((a (pop! *expression-stack*))
                        (b (pop! *expression-stack*)))
                    (push! (- a b) *expression-stack*)))
                 ((string=? word "/")
                  (set! *expression-mode* (not *expression-mode*))
                  (push-operand! (pop! *expression-stack*)))      
                 (else
                  (let ((value (read-hex-or-label word)))
                    (push! value *expression-stack*))))
            
                (cond
                 ((string=? word "/") (set! *expression-mode* (not *expression-mode*)))
                 ((string=? word "(") (push! ':lp *tokens*))
                 ((string=? word ")") (push! ':rp *tokens*))
                 ((string=? word "a") (push! ':a *tokens*))
                 ((string=? word "b") (push! ':b *tokens*))
                 ((string=? word "c") (push! ':c *tokens*))
                 ((string=? word "d") (push! ':d *tokens*))
                 ((string=? word "e") (push! ':e *tokens*))
                 ((string=? word "h") (push! ':h *tokens*))
                 ((string=? word "l") (push! ':l *tokens*))
                 ((string=? word "i") (push! ':i *tokens*))
                 ((string=? word "r") (push! ':r *tokens*))
                 ((string=? word "z") (push! ':z *tokens*))
                 ((string=? word "af") (push! ':af *tokens*))
                 ((string=? word "bc") (push! ':bc *tokens*))
                 ((string=? word "de") (push! ':de *tokens*))
                 ((string=? word "hl") (push! ':hl *tokens*))
                 ((string=? word "ix") (push! ':ix *tokens*))
                 ((string=? word "iy") (push! ':iy *tokens*))
                 ((string=? word "sp") (push! ':sp *tokens*))
                 ((string=? word "nc") (push! ':nc *tokens*))
                 ((string=? word "nz") (push! ':nz *tokens*))
                 ((string=? word "af'") (push! ':af- *tokens*))
                 (else
                  (push-operand! (read-hex-or-label word)))))
            
            (loop (read-word)))))))

(define push-operand!
  (lambda (hex)
    (append! hex *operands*)
    (push! ':nn *tokens*)))

(define store-symbol!
  (lambda (label hex)
    (push! (list label hex) *symbols*)))

(define token-equal?
  (lambda (x y)
    (cond
     ((and (equal? x ':n) (equal? y ':nn))
      (pp *operands*)
      (if (and (pair? *operands*) (<= (car *operands*) #xFF))
          (begin
            (inc! *operands-length*)
            #t)
          #f))
     ((and (equal? x ':n2) (equal? y ':nn))
      (if (and (= (length *operands*) 2) (<= (cadr *operands*) #xFF))
          (begin
            (inc! *operands-length*)
            #t)
          #f))
     ((and (equal? x ':nn) (equal? y ':nn))
      (add! *operands-length* 2)
      #t)
     ((equal? x ':r1)
      (let ((r (assoc y table-r)))
        (if (list? r)
            (begin
              (add! *opcode-offset* (arithmetic-shift (cadr r) 3))
              #t)
            #f)))
     ((equal? x ':r2)
      (let ((r (assoc y table-r)))
        (if (list? r)
            (begin
              (add! *opcode-offset* (cadr r))
              #t)
            #f)))
     (else
      (equal? x y)))))

(define tokens-equal?
  (lambda (expected actual)
    (if (= (length expected) (length actual))
        (if (= (length expected) 0)
            #t
            (let loop ((i 0)
                       (x (list-ref expected 0))
                       (y (list-ref actual 0)))
              (cond
               ((not (token-equal? x y)) #f)
               ((= i (- (length expected) 1)) #t)
               (else
                (loop (+ i 1)
                      (list-ref expected (+ i 1))
                      (list-ref actual (+ i 1)))))))
        #f)))

(define find-opcode
  (lambda ()
    (let ((table (assoc *mnemonic* *opcodes*)))
       (if (pair? table)   
           (begin
             (let loop ((pattern (car (cadr table)))
                        (patterns-tail (cdr (cadr table))))
               (let ((opcode (car pattern))
                     (tokens (cadr pattern)))
                 (set! *opcode-offset* 0)
                 (set! *operands-length* 0)
                 (if (tokens-equal? tokens (reverse *tokens*))
                     (set! *opcode* (+ opcode *opcode-offset*))
                     (if (pair? patterns-tail)
                         (loop (car patterns-tail) (cdr patterns-tail)))))))
          (raise "Unable to find opcode for mnemonic")))))                

(define load-line-buffer
  (lambda (line)
    (let loop ((i 0)
               (c (string-ref line 0))
               (last-c #\space))
         (cond
          ((char=? c #\,) (string-append! *line-buffer* " "))
          ((char=? c #\+) (string-append! *line-buffer* " "))
          ((char=? c #\/) (string-append! *line-buffer* " / "))
          ((char=? c #\() (string-append! *line-buffer* " ( "))
          ((char=? c #\)) (string-append! *line-buffer* " ) "))
          ((not (and (char-whitespace? c) (char-whitespace? last-c)))
           (string-append! *line-buffer* (string c))))

         (if (< i (- (string-length line) 1))
             (loop (+ i 1) (string-ref line (+ i 1)) c)))
      
    (pp *line-buffer*)))

(define raise-error
  (lambda (error)
    (raise (string-append "Assembler error: " error))))

(define assemble
  (lambda (line)

    (set! *expression-mode* #f)
    (set! *expression-stack* '())
    
    (set! *line-cursor* 0)
    (set! *line-buffer* +empty-string+)
    (load-line-buffer line)
    
    (set! *mnemonic* +empty-string+)
    (set! *tokens* '())
    
    (set! *opcode* #f)
    (set! *operands* '())
    
    (let ((word (read-word)))
      (if (not (string-empty? word))
          (if (string-match? ':ends word "=")
              (let ((constant (read-constant)))
                 (store-symbol! (substring word 0 (- (string-length word) 1)) constant)
                 (println "Constant: " (number->hex constant))
                 (println))
              (begin
                (if (string-match? ':ends word ":")
                    (begin
                      (store-symbol!
                       (substring word 0 (- (string-length word) 1))
                       *location-counter*)

                      (println "Label: " (number->hex *location-counter*))
                      (println)
                      
                      (set! word (read-word))))

                (if (not (string-empty? word))
                    (begin
                      (set! *mnemonic* word)
                      (read-tokens)
                      (find-opcode)
                      (if (not *opcode*)
                          (begin
                            (pp *operands*)
                            (pp *tokens*)
                            (pp *expression-mode*)
                            (pp *expression-stack*)
                            (raise-error "Instruction could not be interpreted"))
                          (begin
                            (pp (append (list *mnemonic*) (reverse *tokens*)))
                            (println "Location: " (number->hex *location-counter*))
                            ; FIX FOR OPCODE SIZE
                            (inc! *location-counter*)
                            (println "Opcode: " (number->hex *opcode*))
                            (if (pair? *operands*)
                                (begin
                                  (add! *location-counter* *operands-length*)
                                  (println "Operands Length:" *operands-length*)
                                  (println "Operands: " (list->hex *operands*))))
                            (println)))))))))))

(define char-digit?
  (lambda (c)
    (and (char>=? c #\0) (char<=? c #\9))))

(define char-hex-letter?
  (lambda (c)
    (and (char>=? c #\A) (char<=? c #\F))))

(define hex->number
  (lambda (str)
    (let ((length (string-length str))
          (value 0))
      
      (if (string-empty? str)
          (raise-error "Input string is empty"))
      
      (let loop ((i 0)  
                 (c (string-ref str 0)))
        
        (if (or (char-digit? c)
                (char-hex-letter? c))
              
            (let ((nibble 0))
              (if (char-digit? c)
                  (set! nibble (- (char->integer c) 48))
                  (set! nibble (- (char->integer c) 55)))
              
              (set! value (bitwise-ior (arithmetic-shift value 4) nibble))
              (inc! i)

              (if (< i length)
                  (loop i (string-ref str i))
                  value))
            
            (raise-error "Invalid hex character"))))))

(define number->hex
  (lambda (num)
    (number->string num #x10)))

(define string-match?
  (lambda (type str p)
    (let ((sl (string-length str))
          (pl (string-length p)))
      (if (> pl sl)
          #f
          (case type
            ((:begins) (string=? p (substring str 0 pl)))
            ((:ends) (string=? p (substring str (- sl pl) sl)))
            (else (raise "Unrecognized match type")))))))

(assemble "default= $FF")
(assemble "start:  nop")
(assemble "        ld a,$00")
(assemble "        ld b,default")
(assemble "l1:")
(assemble "        dec b")
(assemble "        ld h,l")
(assemble "        ld a,hl")
(assemble "        ld a,(ix+$FF)")
(assemble "        ld b,(iy+$FF)")
(assemble "        ld (hl),a")
(assemble "        ld (ix+$80),a")
(assemble "        ld (iy+$80),a")
(assemble "        ld (ix+$10),$FE")
(assemble "        ld (iy+$20),$ED")
(assemble "        ld a,(bc)")
(assemble "        dec ix")
(assemble "        dec iy")
(assemble "        jr nz,l1")
(assemble "        jp /$0011 $00F3 -/")

(pp *symbols*)
