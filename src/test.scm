(define-macro (inc! var)
  `(set! ,var (+ ,var 1)))

(define byte-count
  (lambda (n)
    (let loop ((i 0)
               (x n))
      (set! x (arithmetic-shift x -8))
      (inc! i)
      (if (= x 0)
          i
          (loop i x)))))
            
          
