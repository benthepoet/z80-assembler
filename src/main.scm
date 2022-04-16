(define mnemonics
  '(("adc"
     ((:d8) #x69)
     ((:a8) #x65)
     ((:a8 :x) #x75)
     ((:a16) #x6D)
     ((:a16 :x) #x7D)
     ((:a16 :y) #x79)
     ((:lp :a16 :x :rp) #x61)
     ((:lp :a16 :rp :y) #x71))
    ("inx"
     (() #xE8))
    ("iny"
     (() #xC8)) 
    ("lda"
     ((:a8) #xA5)
     ((:a8 :x) #xB5)
     ((:a16) #xAD)
     ((:a16 :x) #xBD)
     ((:a16 :y) #xB9)
     ((:lp :a16 :x :rp) #xA1)
     ((:lp :a16 :rp :y) #xB1))
    ("pha"
     (() #x48))))

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

(define-syntax set-append!
  (syntax-rules ()
    ((set-append! var str)
     (set! var (string-append var str)))))

(define operand-type
  (lambda (pre pair)
    (list (string->symbol (string-append pre (number->string (cadr pair)))) (car pair))))

(define read-constant
  (lambda ()
    (let ((word (read-word)))
      (cond
       ((string-match? ':begins word "#$")
        (let ((hex (hex->number (substring word 2 (string-length word)))))
          (operand-type ":d" hex)))

       ((string-match? ':begins word "$")
        (let ((hex (hex->number (substring word 1 (string-length word)))))
          (operand-type ":a" hex)))

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
                  (set! *tokens* (append *tokens* (list sp)))
                  (cond
                    ((string-match? ':begins word "#$")
                     (let ((hex (hex->number (substring word 2 (string-length word)))))
                       (set-operand! ":d" hex)))

                    ((string-match? ':begins word "$")
                     (let ((hex (hex->number (substring word 1 (string-length word)))))
                       (set-operand! ":a" hex))))))
            
            (loop (read-word)))))))

(define set-operand!
  (lambda (type hex)
    (set! *operand* hex)
    (set! *tokens*
          (append *tokens*
                  (list (car (operand-type type hex)))))))

(define store-constant!
  (lambda (label pair)
    (set! *symbols*
          (append *symbols*
                  (list label (car pair) (cadr pair))))))
                   
(define store-label!
  (lambda (label)
    (set! *symbols* (append *symbols* (list label ':a16 *location-counter*)))))

(define find-opcode
  (lambda ()
    (let loop ((table (car mnemonics))
               (tables-tail (cdr mnemonics)))
      (let ((mnemonic (car table))
            (patterns (cdr table)))
        (if (string=? mnemonic *mnemonic*)
            (begin
              (let p-loop ((pattern (car patterns))
                           (patterns-tail (cdr patterns)))
                (let ((tokens (car pattern))
                      (opcode (cadr pattern)))
                  (if (equal? tokens *tokens*)
                      (set! *opcode* opcode)
                      (if (pair? patterns-tail)
                          (p-loop (car patterns-tail) (cdr patterns-tail)))))))))
                     
      (if (pair? tables-tail)
          (loop (car tables-tail) (cdr tables-tail))))))

(define load-line-buffer
  (lambda (line)
    (let loop ((i 0)
               (c (string-ref line 0)))
         (cond
          ((char=? c #\,) (set-append! *line-buffer* " "))
          ((char=? c #\() (set-append! *line-buffer* " ( "))
          ((char=? c #\)) (set-append! *line-buffer* " ) "))
          (#t
           (set-append! *line-buffer* (string c))))

         (if (< i (- (string-length line) 1))
             (loop (+ i 1) (string-ref line (+ i 1)))))
      
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
                 (pp hex)
                 (store-constant! word hex)
                 (println "Constant: " (cadr hex))
                 (println))
              (begin
                (if (string-match? ':ends word ":")
                    (begin
                        (store-label! word)
                        (set! word (read-word))))

                (if (not (string-empty? word))
                    (begin
                      (set! *mnemonic* word)
                      (read-tokens)
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
                                  (set! *location-counter* (+ *location-counter* (/ (cadr *operand*) 8)))
                                  (println "Operand: " (number->string (car *operand*) #x10))))
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

(assemble "value:= #$00")
(assemble "addr:= $30FB")
(assemble "adc #$FE")
(assemble "lda $FF00")
(assemble "loop: lda $10,x")
(assemble "lda $AF12,y")
(assemble "lda ($B23F,x)")
(assemble "wait:")
(assemble "lda ($0020),y")
(assemble "pha")

(pp *symbols*)
