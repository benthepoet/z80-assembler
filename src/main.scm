(define *opcodes*
  '(("dec"
     ((#x05 (:r))))
    ("ld"
     ((#x3E (:a :nn))
      (#x06 (:b :nn))))
    ("jr"
     ((#x04 (:nz :n))))
    ("jp"
     ((#x05 (:nn))))
    ("nop"
     ((#x00 ())))))

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
(define *operand* #f)

(define string-empty?
  (lambda (str)
    (string=? str +empty-string+))) 

(define-macro (inc! var)
  `(set! ,var (+ ,var 1)))

(define-macro (pop! var)
  `(let ((head (car ,var))
         (tail (cdr ,var)))
     (set! ,var tail)
     head))

(define-macro (push! val var)
  `(set! ,var (cons ,val ,var)))

(define-macro (string-append! var str)
  `(set! ,var (string-append ,var ,str)))

(define operand-type
  (lambda (class hex)
    (string->symbol (string-append class (number->string (cadr hex)))))) 

(define read-constant
  (lambda ()
    (let ((hex (read-hex (read-word))))
      (if (pair? hex)
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
        (append (list ':nn) hex)))

     (else '()))))

(define read-hex-or-label
  (lambda (word)
    (let ((hex (read-hex word)))
         (if (pair? hex)
             hex
             (let ((symbol (assoc word *symbols*)))
               (cond
                ((pair? symbol)
                 (cadr symbol))
                (else
                 '(:nn #x0000 #x10))))))))
 

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
                    (push! (- (cadr a) (cadr b)) *expression-stack*)))
                 ((string=? word "/")
                  (set! *expression-mode* (not *expression-mode*))
                  (set-operand! (list ':nn (pop! *expression-stack*) #x10)))      
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
                  (set-operand! (read-hex-or-label word)))))
            
            (loop (read-word)))))))

(define set-operand!
  (lambda (hex)
    (set! *operand* hex)
    (push! (car hex) *tokens*)))

(define store-symbol!
  (lambda (label hex)
    (push! (list label hex) *symbols*)))

(define token-equal?
  (lambda (x y)
    (cond
     ((and (equal? x ':n) (equal? y ':nn))
      (if (> (cadr *operand*) #xFF)
          (raise "Operand cannot be greater than $FF")
          #t))
     ((equal? x ':r)
      (list? (member y '(:a :b :c :d :e :h :l))))
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
                 (if (tokens-equal? tokens (reverse *tokens*))
                     (set! *opcode* opcode)
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
    
    (set! *operand* #f)
    (set! *opcode* #f)

    (let ((word (read-word)))
      (if (not (string-empty? word))
          (if (string-match? ':ends word "=")
              (let ((hex (read-constant)))
                 (store-symbol! (substring word 0 (- (string-length word) 1)) hex)
                 (println "Constant: " (number->hex (cadr hex)))
                 (println))
              (begin
                (if (string-match? ':ends word ":")
                    (begin
                      (store-symbol!
                       (substring word 0 (- (string-length word) 1))
                       (list ':nn *location-counter* 16))

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
                            (pp *operand*)
                            (pp *tokens*)
                            (pp *expression-mode*)
                            (pp *expression-stack*)
                            (raise-error "Instruction could not be interpreted"))
                          (begin
                            (pp (append (list *mnemonic*) *tokens*))
                            (println "Location: " (number->hex *location-counter*))
                            (set! *location-counter* (+ *location-counter* 1))
                            (println "Opcode: " (number->hex *opcode*))
                            (if *operand*
                                (begin
                                  (set! *location-counter* (+ *location-counter* (/ (caddr *operand*) #x08)))
                                  (println "Operand: " (number->hex (cadr *operand*)))))
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
                  (let ((bytes (/ (+ length (modulo length 2)) 2)))
                    (list value (arithmetic-shift bytes 3)))))
            
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
(assemble "        jr nz,l1")
(assemble "        jp /$0011 $00F3 -/")

(pp *symbols*)
(pp *expression-stack*)
