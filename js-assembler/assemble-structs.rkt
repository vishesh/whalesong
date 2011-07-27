#lang typed/racket/base

(provide (all-defined-out))


(require "../compiler/il-structs.rkt")



;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Assembly

(define-struct: BasicBlock ([name : Symbol] 
                            [stmts : (Listof StraightLineStatement)]
                            [jump : Jump]) 
  #:transparent)




(define-struct: ComputedJump ([label : (U  Reg
                                          ModuleEntry
                                          CompiledProcedureEntry)])
  #:transparent)
(define-struct: DirectJump ([label : Symbol])
  #:transparent)
(define-struct: ConditionalJump ([op : PrimitiveTest]
                                 [true-label : Symbol]
                                 [false-label : Symbol])
  #:transparent)

(define-type Jump (U ComputedJump
                     DirectJump
                     ConditionalJump
                     False))