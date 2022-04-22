(define-macro (inc! var)
  `(set! ,var (+ ,var 1)))

(define a 2)
(inc! a)
(pp a)
