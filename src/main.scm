(define opcodes
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
    ("pha"
     ((#x48 ())))))

(define +empty-string+ "")

(define *first-pass* #t)
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

(define-syntax inc!
  (syntax-rules ()
    ((inc! var)
     (set! var (+ var 1)))))

(define-syntax append!
  (syntax-rules ()
    ((append! var list)
     (set! var (append var list)))))

(define-syntax string-append!
  (syntax-rules ()
    ((set-append! var str)
     (set! var (string-append var str)))))

(define operand-type
  (lambda (pre hex)
    (string->symbol (string-append pre (number->string (cadr hex)))))) 

(define read-constant
  (lambda ()
    (let ((word (read-word)))
      (cond
       ((string-match? ':begins word "#$")
        (let ((hex (hex->number (substring word 2 (string-length word)))))
          (append (list (operand-type ":d" hex)) hex)))

       ((string-match? ':begins word "$")
        (let ((hex (hex->number (substring word 1 (string-length word)))))
          (append (list (operand-type ":a" hex)) hex)))

       (else (raise "Invalid value for constant"))))))

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

(define read-tokens
  (lambda ()
    (let loop ((word (read-word)))
      (if (not (string-empty? word))
          (begin

            (let ((sp (cond
                       ((string=? word "(") ':lp)
                       ((string=? word ")") ':rp)
                       ((string=? word "x") ':x)
                       ((string=? word "y") ':y)
                       (else #f))))
              (if sp
                  (append! *tokens* (list sp))
                  (cond
                    ((string-match? ':begins word "#$")
                     (let ((hex (hex->number (substring word 2 (string-length word)))))
                       (set-operand! (append (list (operand-type ":d" hex)) hex))))

                    ((string-match? ':begins word "$")
                     (let ((hex (hex->number (substring word 1 (string-length word)))))
                       (set-operand! (append (list (operand-type ":a" hex)) hex))))

                    (else
                     (let ((symbol (assoc word *symbols*)))
                       (cond
                        ((pair? symbol)
                         (set! *operand* (cadr symbol))
                         (append! *tokens* (list (car (cadr symbol)))))
                        ((string-match? ':begins word "~")
                         (set-operand! '(:a8 #x00 8)))
                        (else
                         (set-operand! '(:a16 #x0000 16)))))))))
            
            (loop (read-word)))))))

(define set-operand!
  (lambda (hex)
    (set! *operand* hex)
    (append! *tokens* (list (car hex)))))

(define store-symbol!
  (lambda (label hex)
    (append! *symbols* (list (list label hex)))))

(define find-opcode
  (lambda ()
    (let ((table (assoc *mnemonic* opcodes)))
       (if (pair? table)   
          (begin
            (let loop ((pattern (car (cadr table)))
                       (patterns-tail (cdr (cadr table))))
              (let ((opcode (car pattern))
                    (tokens (cadr pattern)))
                (if (equal? tokens *tokens*)
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
    
    (set! *line-buffer* +empty-string+)
    (load-line-buffer line)
    
    (set! *line-cursor* 0)
    (set! *mnemonic* +empty-string+)
    (set! *operand* #f)
    (set! *tokens* '())
    (set! *opcode* #f)

    (let ((word (read-word)))
      (if (not (string-empty? word))
          (if (string-match? ':ends word ":=")
              (let ((hex (read-constant)))
                 (store-symbol! (substring word 0 (- (string-length word) 2)) hex)
                 (println "Constant: " (cadr hex))
                 (println))
              (begin
                (if (string-match? ':ends word ":")
                    (begin
                      (store-symbol!
                       (substring word 0 (- (string-length word) 1))
                       (list ':16 *location-counter* 16))

                      (set! word (read-word))))

                (if (not (string-empty? word))
                    (begin
                      (set! *mnemonic* word)
                      (read-tokens)
                      (pp *tokens*)
                      (find-opcode)
                      (if (not *opcode*)
                          (raise-error "Instruction could not be interpreted")
                          (begin
                            (pp (append (list *mnemonic*) *tokens*))
                            (println "Location: " (number->string *location-counter* #x10))
                            (set! *location-counter* (+ *location-counter* 1))
                            (println "Opcode: " (number->string *opcode* #x10))
                            (if *operand*
                                (begin
                                  (set! *location-counter* (+ *location-counter* (/ (caddr *operand*) 8)))
                                  (println "Operand: " (number->string (cadr *operand*) #x10))))
                            (println)))))))))))

(define char-digit?
  (lambda (c)
    (and (char>=? c #\0)
         (char<=? c #\9))))

(define char-hex-letter?
  (lambda (c)
    (and (char>=? c #\A)
         (char<=? c #\F))))

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
                    (list value (* bytes 8)))))
            
            (raise-error "Invalid hex character"))))))

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

(assemble "default:= #$FF")
(assemble "start:")
(assemble "    lda #$00")
(assemble "    ldx default")
(assemble "l1:")
(assemble "    dex")
(assemble "    bne ~l1")
(assemble "    beq ~start")

(pp *symbols*)
