/*global plt*/
/*jslint unparam: true, sub: true, vars: true, white: true, nomen: true, plusplus: true, maxerr: 50, indent: 4 */

// Arity structure
(function (baselib) {
    'use strict';
    var exports = {};
    baselib.primitives = exports;


    //////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////
    // We try to isolate the effect of external modules: all the identifiers we
    // pull from external modules should be listed here, and should otherwise not
    // show up outside this section!
    var isNumber = baselib.numbers.isNumber;

    var isProcedure = baselib.functions.isProcedure;
    var isReal = baselib.numbers.isReal;
    var isInexact = baselib.numbers.isInexact;
    var isComplex = baselib.numbers.isComplex;
    var isRational = baselib.numbers.isRational;
    var isBytes = baselib.bytes.isBytes;

    var isNatural = baselib.numbers.isNatural;
    var isPair = baselib.lists.isPair;
    var isList = baselib.lists.isList;
    var isChar = baselib.chars.isChar;
    var isVector = baselib.vectors.isVector;
    var isString = baselib.strings.isString;
    var isSymbol = baselib.symbols.isSymbol;
    var isKeyword = baselib.keywords.isKeyword;
    var isBox = baselib.boxes.isBox;
    var isStruct = baselib.structs.isStruct;
    var isStructType = baselib.structs.isStructType;
    var equals = baselib.equality.equals;

    var NULL = baselib.lists.EMPTY;
    var VOID = baselib.constants.VOID_VALUE;

    var makeFloat = baselib.numbers.makeFloat;
    var makeComplex = baselib.numbers.makeComplex;
    var makeComplexPolar = baselib.numbers.makeComplexPolar;

    var makeSymbol = baselib.symbols.makeSymbol;

    var makeBox = baselib.boxes.makeBox;

    var makeVector = baselib.vectors.makeVector;
    var makeList = baselib.lists.makeList;
    var makePair = baselib.lists.makePair;

    var finalizeClosureCall = baselib.functions.finalizeClosureCall;
    var makePrimitiveProcedure = baselib.functions.makePrimitiveProcedure;
    var makeClosure = baselib.functions.makeClosure;


    // Other helpers
    var withArguments = baselib.withArguments;
    var toDomNode = baselib.format.toDomNode;



    // Exceptions and error handling.
    var raise = baselib.exceptions.raise;
    var raiseContractError = baselib.exceptions.raiseContractError;
    var raiseDivisionByZeroError = baselib.exceptions.raiseDivisionByZeroError;
    var raiseArgumentTypeError = baselib.exceptions.raiseArgumentTypeError;
    var raiseArityMismatchError = baselib.exceptions.raiseArityMismatchError;



    var testArgument = baselib.check.testArgument;

    var checkOutputPort = baselib.check.checkOutputPort;
    var checkInputPort = baselib.check.checkInputPort;
    var checkString = baselib.check.checkString;
    var checkSymbolOrString = baselib.check.checkSymbolOrString;
    var checkMutableString = baselib.check.checkMutableString;
    var checkSymbol = baselib.check.checkSymbol;
    var checkByte = baselib.check.checkByte;
    var checkChar = baselib.check.checkChar;
    var checkProcedure = baselib.check.checkProcedure;
    var checkNumber = baselib.check.checkNumber;
    var checkReal = baselib.check.checkReal;
    var checkNonNegativeReal = baselib.check.checkNonNegativeReal;
    var checkNatural = baselib.check.checkNatural;
    var checkNaturalOrFalse = baselib.check.checkNaturalOrFalse;
    var checkNaturalInRange = baselib.check.checkNaturalInRange;
    var checkInteger = baselib.check.checkInteger;
    var checkIntegerForChar = baselib.check.makeCheckArgumentType(
        function(x) {
            return (baselib.numbers.isInteger(x) &&
                    ((baselib.numbers.lessThanOrEqual(0, x) &&
                      baselib.numbers.lessThanOrEqual(x, 55295))
                     ||
                     (baselib.numbers.lessThanOrEqual(57344, x) &&
                      baselib.numbers.lessThanOrEqual(x, 1114111))));
        },
        'integer'
    );
    var checkRational = baselib.check.checkRational;
    var checkPair = baselib.check.checkPair;
    var checkList = baselib.check.checkList;
    var checkListofChars = baselib.check.makeCheckListofArgumentType(isChar, 'character');
    var checkListofPairs = baselib.check.makeCheckListofArgumentType(isPair, 'pair');
    var checkVector = baselib.check.checkVector;
    var checkBox = baselib.check.checkBox;
    var checkMutableBox = baselib.check.checkMutableBox;
    var checkInspector = baselib.check.checkInspector;
    var checkPlaceholder = baselib.check.checkPlaceholder;
    var checkSrcloc = baselib.check.checkSrcloc;
    var checkContinuationPromptTag = baselib.check.checkContinuationPromptTag;
    var checkContinuationMarkSet = baselib.check.checkContinuationMarkSet;
    var checkExn = baselib.check.checkExn;
    var checkHash = baselib.check.checkHash;
    var checkMutableHash = baselib.check.checkMutableHash;
    var checkImmutableHash = baselib.check.checkImmutableHash;

    // Just for consistency with the other names, we provide checkAny, which
    // doesn't really do any checking.
    var checkAny = function(M, name, offset) {
        return M.e[M.e.length-1-offset];
    };

    var checkPromptTag = baselib.check.makeCheckArgumentType(
        baselib.contmarks.isContinuationPromptTag,
        'prompt tag');

    var PromptFrame = baselib.frames.PromptFrame;

    //////////////////////////////////////////////////////////////////////





    // Primitives are the set of primitive values.  Not all primitives
    // are coded here; several of them (including call/cc) are injected by
    // the bootstrapping code in compiler/boostrapped-primitives.rkt
    var Primitives = {};

    var installPrimitiveProcedure = function (name, arity, f) {
        Primitives[name] = makePrimitiveProcedure(name, arity, f);
    };

    var installPrimitiveClosure = function (name, arity, f) {
        Primitives[name] = makeClosure(name, arity, f, []);
    };


    var installPrimitiveConstant = function (name, v) {
        Primitives[name] = v;
    };



    installPrimitiveConstant('pi', baselib.numbers.pi);
    installPrimitiveConstant('e', baselib.numbers.e);
    installPrimitiveConstant('null', NULL);
    installPrimitiveConstant('true', true);
    installPrimitiveConstant('false', false);
    installPrimitiveConstant('eof', baselib.constants.EOF_VALUE);


    installPrimitiveConstant('exception-handler-key',
                             baselib.paramz.exceptionHandlerKey);
    installPrimitiveConstant('parameterization-key',
                             baselib.paramz.parameterizationKey);
    installPrimitiveConstant('break-enabled-key',
                             baselib.paramz.breakEnabledKey);


    var gensymCounter = 0;
    installPrimitiveProcedure(
        'gensym',
        makeList(0, 1),
        function(M) {
            var baseName = "g";
            if (M.a === 1) {
                baseName = checkSymbolOrString(M, 'gensym', 0).toString();
            }
            gensymCounter++;
            return new baselib.symbols.Symbol(baseName + gensymCounter);
        });


    installPrimitiveProcedure(
        'display',
        makeList(1, 2),
        function (M) {
            var firstArg = M.e[M.e.length - 1];
            var outputPort = M.params.currentOutputPort;
            if (M.a === 2) {
                outputPort = checkOutputPort(M, 'display', 1);
            }
            outputPort.writeDomNode(M, toDomNode(firstArg, 'display'));
            return VOID;
        });

    installPrimitiveProcedure(
        'write',
        makeList(1, 2),
        function (M) {
            var firstArg = M.e[M.e.length - 1];
            var outputPort = M.params.currentOutputPort;
            if (M.a === 2) {
                outputPort = checkOutputPort(M, 'write', 1);
            }
            outputPort.writeDomNode(M, toDomNode(firstArg, 'write'));
            return VOID;
        });

    installPrimitiveProcedure(
        'write-byte',
        makeList(1, 2),
        function (M) {
            var firstArg = checkByte(M, 'write-byte', 0);
            var outputPort = M.params.currentOutputPort;
            if (M.a === 2) {
                outputPort = checkOutputPort(M, 'display', 1);
            }
            outputPort.writeDomNode(M, toDomNode(String.fromCharCode(firstArg), 'display'));
            return VOID;
        });


    installPrimitiveProcedure(
        'newline', makeList(0, 1),
        function (M) {
            var outputPort = M.params.currentOutputPort;
            if (M.a === 1) {
                outputPort = checkOutputPort(M, 'newline', 1);
            }
            outputPort.writeDomNode(M, toDomNode("\n", 'display'));
            return VOID;
        });

    installPrimitiveProcedure(
        'displayln',
        makeList(1, 2),
        function (M){
            var firstArg = M.e[M.e.length-1];
            var outputPort = M.params.currentOutputPort;
            if (M.a === 2) {
                outputPort = checkOutputPort(M, 'displayln', 1);
            }
            outputPort.writeDomNode(M, toDomNode(firstArg, 'display'));
            outputPort.writeDomNode(M, toDomNode("\n", 'display'));
            return VOID;
        });



    installPrimitiveProcedure(
        'format',
        baselib.arity.makeArityAtLeast(1),
        function (M) {
            var args = [], i, formatString;
            formatString = checkString(M, 'format', 0).toString();
            for(i = 1; i < M.a; i++) {
                args.push(M.e[M.e.length - 1 - i]);
            }
            return baselib.format.format(formatString, args, 'format');
        });


    installPrimitiveProcedure(
        'printf',
        baselib.arity.makeArityAtLeast(1),
        function (M) {
            var args = [], i, formatString, result, outputPort;
            formatString = checkString(M, 'printf', 0).toString();
            for(i = 1; i < M.a; i++) {
                args.push(M.e[M.e.length - 1 - i]);
            }
            result = baselib.format.format(formatString, args, 'format');
            outputPort = M.params.currentOutputPort;
            outputPort.writeDomNode(M, toDomNode(result, 'display'));
            return VOID;
        });


    installPrimitiveProcedure(
        'fprintf',
        baselib.arity.makeArityAtLeast(2),
        function (M) {
            var args = [], i, formatString, outputPort, result;
            outputPort = checkOutputPort(M, 'fprintf', 0);
            formatString = checkString(M, 'fprintf', 1).toString();
            for(i = 2; i < M.a; i++) {
                args.push(M.e[M.e.length - 1 - i]);
            }
            result = baselib.format.format(formatString, args, 'format');
            outputPort.writeDomNode(M, toDomNode(result, 'display'));
            return VOID;
        });



    installPrimitiveProcedure(
        'current-print',
        makeList(0, 1),
        function (M) {
            if (M.a === 1) {
                M.params['currentPrint'] =
                    checkProcedure(M, 'current-print', 0);
                return VOID;
            } else {
                return M.params['currentPrint'];
            }
        });


    installPrimitiveProcedure(
        'current-print-mode',
        makeList(0, 1),
        function (M) {
            if (M.a === 1) {
                M.params['print-mode'] = checkString(M, 'print-mode', 0);
                return VOID;
            } else {
                return M.params['print-mode'];
            }
        });


    installPrimitiveProcedure(
        'current-output-port',
        makeList(0, 1),
        function (M) {
            if (M.a === 1) {
                M.params['currentOutputPort'] =
                    checkOutputPort(M, 'current-output-port', 0);
                return VOID;
            } else {
                return M.params['currentOutputPort'];
            }
        });



    installPrimitiveProcedure(
        'current-error-port',
        makeList(0, 1),
        function (M) {
            if (M.a === 1) {
                M.params['currentErrorPort'] =
                    checkOutputPort(M, 'current-output-port', 0);
                return VOID;
            } else {
                return M.params['currentOutputPort'];
            }
        });



    installPrimitiveProcedure(
        'current-input-port',
        makeList(0, 1),
        function (M) {
            if (M.a === 1) {
                M.params['currentInputPort'] =
                    checkInputPort(M, 'current-input-port', 0);
                return VOID;
            } else {
                return M.params['currentInputPort'];
            }
        });



    installPrimitiveClosure(
        'read-byte',
        makeList(0, 1),
        function(M) {
            var inputPort = M.params['currentInputPort'];
            if (M.a === 1) {
                inputPort = checkInputPort(M, 'read-byte', 0);
            }
            return plt.runtime.PAUSE(function(restart) {
                inputPort.callWhenReady(M, function() {
                    restart(function(MACHINE) {
                        plt.runtime.finalizeClosureCall(MACHINE,
                                                        inputPort.readByte(MACHINE));
                    });
                });
            });
        });



    installPrimitiveProcedure(
        '=',
        baselib.arity.makeArityAtLeast(2),
        function (M) {
	    var i;
            var firstArg = checkNumber(M, '=', 0), secondArg;
            for (i = 1; i < M.a; i++) {
                secondArg = checkNumber(M, '=', i);
                if (! (baselib.numbers.equals(firstArg, secondArg))) {
                    return false;
                }
            }
            return true;
        });


    installPrimitiveProcedure(
        '=~',
        3,
        function (M) {
            var x = checkReal(M, '=~', 0);
            var y = checkReal(M, '=~', 1);
            var range = checkNonNegativeReal(M, '=~', 2);
            return baselib.numbers.lessThanOrEqual(
                baselib.numbers.abs(baselib.numbers.subtract(x, y)),
                range);
        });



    var makeChainingBinop = function (predicate, name) {
        return function (M) {
            var firstArg = checkNumber(M, name, 0), secondArg, i;
            for (i = 1; i < M.a; i++) {
                secondArg = checkNumber(M, name, i);
                if (! (predicate(firstArg, secondArg))) {
                    return false;
                }
                firstArg = secondArg;
            }
            return true;
        };
    };

    installPrimitiveProcedure(
        '<',
        baselib.arity.makeArityAtLeast(2),
        makeChainingBinop(baselib.numbers.lessThan, '<'));


    installPrimitiveProcedure(
        '>',
        baselib.arity.makeArityAtLeast(2),
        makeChainingBinop(baselib.numbers.greaterThan, '>'));


    installPrimitiveProcedure(
        '<=',
        baselib.arity.makeArityAtLeast(2),
        makeChainingBinop(baselib.numbers.lessThanOrEqual, '<='));


    installPrimitiveProcedure(
        '>=',
        baselib.arity.makeArityAtLeast(2),
        makeChainingBinop(baselib.numbers.greaterThanOrEqual, '>='));


    installPrimitiveProcedure(
        '+',
        baselib.arity.makeArityAtLeast(0),
        function (M) {
            var result = 0;
            var i = 0;
            for (i = 0; i < M.a; i++) {
                result = baselib.numbers.add(
                    result,
                    checkNumber(M, '+', i));
            }
            return result;
        });


    installPrimitiveProcedure(
        '*',
        baselib.arity.makeArityAtLeast(0),
        function (M) {
            var result = 1;
            var i = 0;
            for (i=0; i < M.a; i++) {
                result = baselib.numbers.multiply(
                    result,
                    checkNumber(M, '*', i));
            }
            return result;
        });

    installPrimitiveProcedure(
        '-',
        baselib.arity.makeArityAtLeast(1),
        function (M) {
            if (M.a === 1) {
                return baselib.numbers.subtract(
                    0,
                    checkNumber(M, '-', 0));
            }
            var result = checkNumber(M, '-', 0), i;
            for (i = 1; i < M.a; i++) {
                result = baselib.numbers.subtract(
                    result,
                    checkNumber(M, '-', i));
            }
            return result;
        });

    installPrimitiveProcedure(
        '/',
        baselib.arity.makeArityAtLeast(1),
        function (M) {
            var result = checkNumber(M, '/', 0), i;
            for (i = 1; i < M.a; i++) {
                result = baselib.numbers.divide(
                    result,
                    checkNumber(M, '/', i));
            }
            return result;
        });

    installPrimitiveProcedure(
        'add1',
        1,
        function (M) {
            var firstArg = checkNumber(M, 'add1', 0);
            return baselib.numbers.add(firstArg, 1);
        });


    installPrimitiveProcedure(
        'sub1',
        1,
        function (M) {
            var firstArg = checkNumber(M, 'sub1', 0);
            return baselib.numbers.subtract(firstArg, 1);
        });


    installPrimitiveProcedure(
        'zero?',
        1,
        function (M) {
            var firstArg = M.e[M.e.length-1];
            return baselib.numbers.equals(firstArg, 0);
        });


    installPrimitiveProcedure(
        'cons',
        2,
        function (M) {
            var firstArg = M.e[M.e.length-1];
            var secondArg = M.e[M.e.length-2];
            return makePair(firstArg, secondArg);
        });


    installPrimitiveProcedure(
        'list',
        baselib.arity.makeArityAtLeast(0),
        function (M) {
            var result = NULL, i;
            for (i = 0; i < M.a; i++) {
                result = makePair(M.e[M.e.length - (M.a - i)],
                                  result);
            }
            return result;
        });

    installPrimitiveProcedure(
        'list*',
        baselib.arity.makeArityAtLeast(1),
        function (M) {
            var result = checkAny(M, 'list*', M.a - 1), i;
            for (i = M.a - 2; i >= 0; i--) {
                result = makePair(M.e[M.e.length - 1 - i],
                                  result);
            }
            return result;
        });


    installPrimitiveProcedure(
        'list-ref',
        2,
        function (M) {
            var lst = checkList(M, 'list-ref', 0);
            var index = checkNaturalInRange(M, 'list-ref', 1,
                                            0, baselib.lists.length(lst));
            return baselib.lists.listRef(lst, baselib.numbers.toFixnum(index));
        });

    installPrimitiveProcedure(
        'unsafe-car',
        1,
        function (M) {
            var firstArg = checkAny(M, 'unsafe-car', 0);
            return firstArg.first;
        });
    installPrimitiveProcedure(
        'unsafe-cdr',
        1,
        function (M) {
            var firstArg = checkAny(M, 'unsafe-cdr', 0);
            return firstArg.rest;
        });
    installPrimitiveProcedure(
        'car',
        1,
        function (M) {
            var firstArg = checkPair(M, 'car', 0);
            return firstArg.first;
        });
    installPrimitiveProcedure(
        'cdr',
        1,
        function (M) {
            var firstArg = checkPair(M, 'cdr', 0);
            return firstArg.rest;
        });

    //////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////
    // The code from this point up to the end of the c**r functions
    // is autogenerated by whalesong/generate-c-star-d.rkt.
    //
    // Don't modify this code manually: rather, edit the generator and
    // inject the content back in here.
    // Too bad we don't have macros in JavaScript...

    installPrimitiveProcedure(
        'caar',
        1,
        function(M) {
            var x = M.e[M.e.length-1];
            if (isPair(x)&&isPair(x.first)) {
                return x.first.first;
            } else {
                raiseArgumentTypeError(M, "caar", "caarable value", 0, x);
            }
        });
    installPrimitiveProcedure(
        'cdar',
        1,
        function(M) {
            var x = M.e[M.e.length-1];
            if (isPair(x)&&isPair(x.first)) {
                return x.first.rest;
            } else {
                raiseArgumentTypeError(M, "cdar", "cdarable value", 0, x);
            }
        });
    installPrimitiveProcedure(
        'cadr',
        1,
        function(M) {
            var x = M.e[M.e.length-1];
            if (isPair(x)&&isPair(x.rest)) {
                return x.rest.first;
            } else {
                raiseArgumentTypeError(M, "cadr", "cadrable value", 0, x);
            }
        });
    installPrimitiveProcedure(
        'cddr',
        1,
        function(M) {
            var x = M.e[M.e.length-1];
            if (isPair(x)&&isPair(x.rest)) {
                return x.rest.rest;
            } else {
                raiseArgumentTypeError(M, "cddr", "cddrable value", 0, x);
            }
        });
    installPrimitiveProcedure(
        'caaar',
        1,
        function(M) {
            var x = M.e[M.e.length-1];
            if (isPair(x)&&isPair(x.first)&&isPair(x.first.first)) {
                return x.first.first.first;
            } else {
                raiseArgumentTypeError(M, "caaar", "caaarable value", 0, x);
            }
        });
    installPrimitiveProcedure(
        'cdaar',
        1,
        function(M) {
            var x = M.e[M.e.length-1];
            if (isPair(x)&&isPair(x.first)&&isPair(x.first.first)) {
                return x.first.first.rest;
            } else {
                raiseArgumentTypeError(M, "cdaar", "cdaarable value", 0, x);
            }
        });
    installPrimitiveProcedure(
        'cadar',
        1,
        function(M) {
            var x = M.e[M.e.length-1];
            if (isPair(x)&&isPair(x.first)&&isPair(x.first.rest)) {
                return x.first.rest.first;
            } else {
                raiseArgumentTypeError(M, "cadar", "cadarable value", 0, x);
            }
        });
    installPrimitiveProcedure(
        'cddar',
        1,
        function(M) {
            var x = M.e[M.e.length-1];
            if (isPair(x)&&isPair(x.first)&&isPair(x.first.rest)) {
                return x.first.rest.rest;
            } else {
                raiseArgumentTypeError(M, "cddar", "cddarable value", 0, x);
            }
        });
    installPrimitiveProcedure(
        'caadr',
        1,
        function(M) {
            var x = M.e[M.e.length-1];
            if (isPair(x)&&isPair(x.rest)&&isPair(x.rest.first)) {
                return x.rest.first.first;
            } else {
                raiseArgumentTypeError(M, "caadr", "caadrable value", 0, x);
            }
        });
    installPrimitiveProcedure(
        'cdadr',
        1,
        function(M) {
            var x = M.e[M.e.length-1];
            if (isPair(x)&&isPair(x.rest)&&isPair(x.rest.first)) {
                return x.rest.first.rest;
            } else {
                raiseArgumentTypeError(M, "cdadr", "cdadrable value", 0, x);
            }
        });
    installPrimitiveProcedure(
        'caddr',
        1,
        function(M) {
            var x = M.e[M.e.length-1];
            if (isPair(x)&&isPair(x.rest)&&isPair(x.rest.rest)) {
                return x.rest.rest.first;
            } else {
                raiseArgumentTypeError(M, "caddr", "caddrable value", 0, x);
            }
        });
    installPrimitiveProcedure(
        'cdddr',
        1,
        function(M) {
            var x = M.e[M.e.length-1];
            if (isPair(x)&&isPair(x.rest)&&isPair(x.rest.rest)) {
                return x.rest.rest.rest;
            } else {
                raiseArgumentTypeError(M, "cdddr", "cdddrable value", 0, x);
            }
        });
    installPrimitiveProcedure(
        'caaaar',
        1,
        function(M) {
            var x = M.e[M.e.length-1];
            if (isPair(x)&&isPair(x.first)&&isPair(x.first.first)&&isPair(x.first.first.first)) {
                return x.first.first.first.first;
            } else {
                raiseArgumentTypeError(M, "caaaar", "caaaarable value", 0, x);
            }
        });
    installPrimitiveProcedure(
        'cdaaar',
        1,
        function(M) {
            var x = M.e[M.e.length-1];
            if (isPair(x)&&isPair(x.first)&&isPair(x.first.first)&&isPair(x.first.first.first)) {
                return x.first.first.first.rest;
            } else {
                raiseArgumentTypeError(M, "cdaaar", "cdaaarable value", 0, x);
            }
        });
    installPrimitiveProcedure(
        'cadaar',
        1,
        function(M) {
            var x = M.e[M.e.length-1];
            if (isPair(x)&&isPair(x.first)&&isPair(x.first.first)&&isPair(x.first.first.rest)) {
                return x.first.first.rest.first;
            } else {
                raiseArgumentTypeError(M, "cadaar", "cadaarable value", 0, x);
            }
        });
    installPrimitiveProcedure(
        'cddaar',
        1,
        function(M) {
            var x = M.e[M.e.length-1];
            if (isPair(x)&&isPair(x.first)&&isPair(x.first.first)&&isPair(x.first.first.rest)) {
                return x.first.first.rest.rest;
            } else {
                raiseArgumentTypeError(M, "cddaar", "cddaarable value", 0, x);
            }
        });
    installPrimitiveProcedure(
        'caadar',
        1,
        function(M) {
            var x = M.e[M.e.length-1];
            if (isPair(x)&&isPair(x.first)&&isPair(x.first.rest)&&isPair(x.first.rest.first)) {
                return x.first.rest.first.first;
            } else {
                raiseArgumentTypeError(M, "caadar", "caadarable value", 0, x);
            }
        });
    installPrimitiveProcedure(
        'cdadar',
        1,
        function(M) {
            var x = M.e[M.e.length-1];
            if (isPair(x)&&isPair(x.first)&&isPair(x.first.rest)&&isPair(x.first.rest.first)) {
                return x.first.rest.first.rest;
            } else {
                raiseArgumentTypeError(M, "cdadar", "cdadarable value", 0, x);
            }
        });
    installPrimitiveProcedure(
        'caddar',
        1,
        function(M) {
            var x = M.e[M.e.length-1];
            if (isPair(x)&&isPair(x.first)&&isPair(x.first.rest)&&isPair(x.first.rest.rest)) {
                return x.first.rest.rest.first;
            } else {
                raiseArgumentTypeError(M, "caddar", "caddarable value", 0, x);
            }
        });
    installPrimitiveProcedure(
        'cdddar',
        1,
        function(M) {
            var x = M.e[M.e.length-1];
            if (isPair(x)&&isPair(x.first)&&isPair(x.first.rest)&&isPair(x.first.rest.rest)) {
                return x.first.rest.rest.rest;
            } else {
                raiseArgumentTypeError(M, "cdddar", "cdddarable value", 0, x);
            }
        });
    installPrimitiveProcedure(
        'caaadr',
        1,
        function(M) {
            var x = M.e[M.e.length-1];
            if (isPair(x)&&isPair(x.rest)&&isPair(x.rest.first)&&isPair(x.rest.first.first)) {
                return x.rest.first.first.first;
            } else {
                raiseArgumentTypeError(M, "caaadr", "caaadrable value", 0, x);
            }
        });
    installPrimitiveProcedure(
        'cdaadr',
        1,
        function(M) {
            var x = M.e[M.e.length-1];
            if (isPair(x)&&isPair(x.rest)&&isPair(x.rest.first)&&isPair(x.rest.first.first)) {
                return x.rest.first.first.rest;
            } else {
                raiseArgumentTypeError(M, "cdaadr", "cdaadrable value", 0, x);
            }
        });
    installPrimitiveProcedure(
        'cadadr',
        1,
        function(M) {
            var x = M.e[M.e.length-1];
            if (isPair(x)&&isPair(x.rest)&&isPair(x.rest.first)&&isPair(x.rest.first.rest)) {
                return x.rest.first.rest.first;
            } else {
                raiseArgumentTypeError(M, "cadadr", "cadadrable value", 0, x);
            }
        });
    installPrimitiveProcedure(
        'cddadr',
        1,
        function(M) {
            var x = M.e[M.e.length-1];
            if (isPair(x)&&isPair(x.rest)&&isPair(x.rest.first)&&isPair(x.rest.first.rest)) {
                return x.rest.first.rest.rest;
            } else {
                raiseArgumentTypeError(M, "cddadr", "cddadrable value", 0, x);
            }
        });
    installPrimitiveProcedure(
        'caaddr',
        1,
        function(M) {
            var x = M.e[M.e.length-1];
            if (isPair(x)&&isPair(x.rest)&&isPair(x.rest.rest)&&isPair(x.rest.rest.first)) {
                return x.rest.rest.first.first;
            } else {
                raiseArgumentTypeError(M, "caaddr", "caaddrable value", 0, x);
            }
        });
    installPrimitiveProcedure(
        'cdaddr',
        1,
        function(M) {
            var x = M.e[M.e.length-1];
            if (isPair(x)&&isPair(x.rest)&&isPair(x.rest.rest)&&isPair(x.rest.rest.first)) {
                return x.rest.rest.first.rest;
            } else {
                raiseArgumentTypeError(M, "cdaddr", "cdaddrable value", 0, x);
            }
        });
    installPrimitiveProcedure(
        'cadddr',
        1,
        function(M) {
            var x = M.e[M.e.length-1];
            if (isPair(x)&&isPair(x.rest)&&isPair(x.rest.rest)&&isPair(x.rest.rest.rest)) {
                return x.rest.rest.rest.first;
            } else {
                raiseArgumentTypeError(M, "cadddr", "cadddrable value", 0, x);
            }
        });
    installPrimitiveProcedure(
        'cddddr',
        1,
        function(M) {
            var x = M.e[M.e.length-1];
            if (isPair(x)&&isPair(x.rest)&&isPair(x.rest.rest)&&isPair(x.rest.rest.rest)) {
                return x.rest.rest.rest.rest;
            } else {
                raiseArgumentTypeError(M, "cddddr", "cddddrable value", 0, x);
            }
        });

    // End autogenerated code.
    //////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////


    installPrimitiveProcedure(
        'pair?',
        1,
        function (M) {
            var firstArg = M.e[M.e.length-1];
            return isPair(firstArg);
        });


    installPrimitiveProcedure(
        'list?',
        1,
        function (M) {
            return isList(M.e[M.e.length -1]);
        });


    installPrimitiveProcedure(
        'set-car!',
        2,
        function (M) {
            var firstArg = checkPair(M, 'set-car!', 0);
            var secondArg = M.e[M.e.length-2];
            firstArg.first = secondArg;
            return VOID;
        });


    installPrimitiveProcedure(
        'set-cdr!',
        2,
        function (M) {
            var firstArg = checkPair(M, 'set-car!', 0);
            var secondArg = M.e[M.e.length-2];
            firstArg.rest = secondArg;
            return VOID;
        });

    installPrimitiveProcedure(
        'not',
        1,
        function (M) {
            var firstArg = M.e[M.e.length-1];
            return (firstArg === false);
        });


    installPrimitiveProcedure(
        'null?',
        1,
        function (M) {
            var firstArg = M.e[M.e.length-1];
            return firstArg === NULL;
        });


    installPrimitiveProcedure(
        'vector?',
        1,
        function (M) {
            var firstArg = M.e[M.e.length-1];
            return isVector(firstArg);
        });

    installPrimitiveProcedure(
        'vector',
        baselib.arity.makeArityAtLeast(0),
        function (M) {
            var i;
            var result = [];
            for (i = 0; i < M.a; i++) {
                result.push(M.e[M.e.length-1-i]);
            }
            var newVector = makeVector(result);
            return newVector;
        });


    installPrimitiveProcedure(
        'make-vector',
        makeList(1, 2),
        function (M) {
            var value = 0;
            var length = baselib.numbers.toFixnum(
                checkNatural(M, 'make-vector', 0));
            if (M.a === 2) {
                value = M.e[M.e.length - 2];
            }
            var arr = [];
	    var i;
            for(i = 0; i < length; i++) {
                arr[i] = value;
            }
            return makeVector(arr);
        });

    installPrimitiveProcedure(
        'vector->list',
        1,
        function (M) {
            var elts = checkVector(M, 'vector->list', 0).elts;
            var i;
            var result = NULL;
            for (i = 0; i < elts.length; i++) {
                result = makePair(elts[elts.length - 1 - i], result);
            }
            return result;
        });

    installPrimitiveProcedure(
        'list->vector',
        1,
        function (M) {
            var firstArg = checkList(M, 'list->vector', 0);
            var result = [];
            while (firstArg !== NULL) {
                result.push(firstArg.first);
                firstArg = firstArg.rest;
            }
            return makeVector(result);
        });


    installPrimitiveProcedure(
        'vector-ref',
        2,
        function (M) {
            var elts = checkVector(M, 'vector-ref', 0).elts;
            var index = baselib.numbers.toFixnum(
                checkNaturalInRange(M, 'vector-ref', 1, 0, elts.length));
            return elts[index];
        });


    installPrimitiveProcedure(
        'vector-set!',
        3,
        function (M) {
            var elts = checkVector(M, 'vector-set!', 0).elts;
            // FIXME: check out-of-bounds vector
            var index = baselib.numbers.toFixnum(
                checkNaturalInRange(M, 'vector-set!', 1,
                                    0, elts.length));
            var val = M.e[M.e.length - 1 - 2];
            elts[index] = val;
            return VOID;
        });


    installPrimitiveProcedure(
        'vector-length',
        1,
        function (M) {
            return checkVector(M, 'vector-length', 0).elts.length;
        });



    installPrimitiveProcedure(
        'make-string',
        makeList(1, 2),
        function (M) {
            var value = String.fromCharCode(0);
            var length = baselib.numbers.toFixnum(
                checkNatural(M, 'make-string', 0));
            if (M.a === 2) {
                value = checkChar(M, 'make-string', 1).val;
            }
            var arr = [];
	    var i;
            for(i = 0; i < length; i++) {
                arr[i] = value;
            }
            return baselib.strings.makeMutableString(arr);
        });

    installPrimitiveProcedure(
        'substring',
        makeList(2, 3),
        function(M) {
            var str = checkString(M, 'substring', 0).toString();
            var start = baselib.numbers.toFixnum(checkNatural(M, 'substring', 1));
            var end = str.length;
            if (M.a === 3) {
                end = baselib.numbers.toFixnum(checkNatural(M, 'substring', 2));
            }
            return baselib.strings.makeMutableString((str.substring(start, end)).split(""));
        });

    installPrimitiveProcedure(
        'string-copy',
        1,
        function(M) {
            var str = checkString(M, 'substring', 0).toString();
            return baselib.strings.makeMutableString(str.substring(0, str.length).split(""));
        });


    installPrimitiveProcedure(
        'list->string',
        1,
        function (M) {
            var firstArg = checkListofChars(M, 'list->string', 0);
            var result = [];
            while (firstArg !== NULL) {
                result.push(firstArg.first.val);
                firstArg = firstArg.rest;
            }
            return result.join('');
        });


    installPrimitiveProcedure(
        'string',
        baselib.arity.makeArityAtLeast(0),
        function (M) {
            var i;
            var chars = [];
            for (i = 0; i < M.a; i++) {
                chars.push(checkChar(M, 'string', i).val);
            }
            return chars.join('');
        });


    installPrimitiveProcedure(
        'string->list',
        1,
        function (M) {
            var str = checkString(M, 'string->list', 0).toString();
            var i;
            var result = NULL;
            for (i = str.length - 1; i >= 0; i--) {
                result = makePair(baselib.chars.makeChar(str.charAt(i)), result);
            }
            return result;
        });



    installPrimitiveProcedure(
        'string-set!',
        3,
        function (M) {
            var str = checkMutableString(M, 'string-set!', 0);
            var k = checkNatural(M, 'string-set!', 1);
            var ch = checkChar(M, 'string-set!', 2);
	    str.set(baselib.numbers.toFixnum(k), ch.val);
            return VOID;
        });





    installPrimitiveProcedure(
        'symbol?',
        1,
        function (M) {
            var firstArg = M.e[M.e.length-1];
            return isSymbol(firstArg);
        });

    installPrimitiveProcedure(
        'symbol->string',
        1,
        function (M) {
            var firstArg = checkSymbol(M, 'symbol->string', 0);
            return firstArg.toString();
        });

    installPrimitiveProcedure(
        'keyword?',
        1,
        function (M) {
            var firstArg = M.e[M.e.length-1];
            return isKeyword(firstArg);
        });

    installPrimitiveProcedure(
        'keyword->string',
        1,
        function (M) {
            var firstArg = checkSymbol(M, 'keyword->string', 0);
            return firstArg.toString();
        });

    installPrimitiveProcedure(
        'string=?',
        baselib.arity.makeArityAtLeast(1),
        function (M) {
            var s = checkString(M, 'string=?', 0).toString();
	    var i;
            for (i = 1; i < M.a; i++) {
                if (s !== checkString(M, 'string=?', i).toString()) {
                    return false;
                }
            }
            return true;
        });


    installPrimitiveProcedure(
        'string<=?',
        baselib.arity.makeArityAtLeast(1),
        function (M) {
            var s = checkString(M, 'string<=?', 0).toString();
	    var i;
            for (i = 1; i < M.a; i++) {
                if ((s <= checkString(M, 'string<=?', i).toString()) === false) {
                    return false;
                }
            }
            return true;
        });

    installPrimitiveProcedure(
        'string<?',
        baselib.arity.makeArityAtLeast(1),
        function (M) {
            var s = checkString(M, 'string<?', 0).toString();
	    var i;
            for (i = 1; i < M.a; i++) {
                if ((s < checkString(M, 'string<?', i).toString()) === false) {
                    return false;
                }
            }
            return true;
        });

    installPrimitiveProcedure(
        'string>=?',
        baselib.arity.makeArityAtLeast(1),
        function (M) {
            var s = checkString(M, 'string>=?', 0).toString();
	    var i;
            for (i = 1; i < M.a; i++) {
                if ((s >= checkString(M, 'string>=?', i).toString()) === false) {
                    return false;
                }
            }
            return true;
        });

    installPrimitiveProcedure(
        'string>?',
        baselib.arity.makeArityAtLeast(1),
        function (M) {
            var s = checkString(M, 'string>?', 0).toString();
	    var i;
            for (i = 1; i < M.a; i++) {
                if ((s > checkString(M, 'string>?', i).toString()) === false) {
                    return false;
                }
            }
            return true;
        });


    installPrimitiveProcedure(
        'string-ci=?',
        baselib.arity.makeArityAtLeast(1),
        function (M) {
            var s = checkString(M, 'string-ci=?', 0).toString().toUpperCase();
	    var i;
            for (i = 1; i < M.a; i++) {
                if (s !== checkString(M, 'string-ci=?', i).toString().toUpperCase()) {
                    return false;
                }
            }
            return true;
        });


    installPrimitiveProcedure(
        'string-ci<=?',
        baselib.arity.makeArityAtLeast(1),
        function (M) {
            var s = checkString(M, 'string-ci<=?', 0).toString().toUpperCase();
	    var i;
            for (i = 1; i < M.a; i++) {
                if ((s <= checkString(M, 'string-ci<=?', i).toString().toUpperCase()) === false) {
                    return false;
                }
            }
            return true;
        });

    installPrimitiveProcedure(
        'string-ci<?',
        baselib.arity.makeArityAtLeast(1),
        function (M) {
            var s = checkString(M, 'string-ci<?', 0).toString().toUpperCase();
	    var i;
            for (i = 1; i < M.a; i++) {
                if ((s < checkString(M, 'string-ci<?', i).toString().toUpperCase()) === false) {
                    return false;
                }
            }
            return true;
        });

    installPrimitiveProcedure(
        'string-ci>=?',
        baselib.arity.makeArityAtLeast(1),
        function (M) {
            var s = checkString(M, 'string-ci>=?', 0).toString().toUpperCase();
	    var i;
            for (i = 1; i < M.a; i++) {
                if ((s >= checkString(M, 'string-ci>=?', i).toString().toUpperCase()) === false) {
                    return false;
                }
            }
            return true;
        });

    installPrimitiveProcedure(
        'string-ci>?',
        baselib.arity.makeArityAtLeast(1),
        function (M) {
            var s = checkString(M, 'string-ci>?', 0).toString().toUpperCase();
	    var i;
            for (i = 1; i < M.a; i++) {
                if ((s > checkString(M, 'string-ci>?', i).toString().toUpperCase()) === false) {
                    return false;
                }
            }
            return true;
        });


    installPrimitiveProcedure(
        'string-append',
        baselib.arity.makeArityAtLeast(0),
        function (M) {
            var buffer = [];
            var i;
            for (i = 0; i < M.a; i++) {
                buffer.push(checkString(M, 'string-append', i).toString());
            }
            return buffer.join('');
        });

    installPrimitiveProcedure(
        'string-length',
        1,
        function (M) {
            var firstArg = checkString(M, 'string-length', 0).toString();
            return firstArg.length;
        });


    installPrimitiveProcedure(
        'string-ref',
        2,
        function (M) {
            var firstArg = checkString(M, 'string-ref', 0).toString();
            var index = baselib.numbers.toFixnum(
                checkNaturalInRange(M, 'string-ref', 1,
                                    0, firstArg.length));
            return baselib.chars.makeChar(firstArg.charAt(index));
        });



    installPrimitiveProcedure(
        'string?',
        1,
        function (M) {
            return isString(M.e[M.e.length - 1]);
        });


    installPrimitiveProcedure(
        'number->string',
        1,
        function (M) {
            return checkNumber(M, 'number->string', 0).toString();
        });


    installPrimitiveProcedure(
        'string->symbol',
        1,
        function (M) {
            return makeSymbol(checkString(M, 'string->symbol', 0).toString());
        });


    installPrimitiveProcedure(
        'string->number',
        1,
        function (M) {
            return baselib.numbers.fromString(
                checkString(M, 'string->number', 0).toString());
        });


    installPrimitiveProcedure(
        'boolean?',
        1,
        function(M) {
            var v = M.e[M.e.length - 1];
            return (v === true || v === false);
        });


    installPrimitiveProcedure(
        'char?',
        1,
        function(M) {
            return isChar(M.e[M.e.length -1 ]);
        });


    var makeCharComparator = function(name, cmp) {
        return function(M) {
            var s = checkChar(M, name, 0).val;
	    var i;
            for (i = 1; i < M.a; i++) {
                if (!(cmp(s, checkChar(M, name, i).val))) {
                    return false;
                }
            }
            return true;
        };
    };

    installPrimitiveProcedure(
        'char>?',
        baselib.arity.makeArityAtLeast(2),
        makeCharComparator('char>?',
                           function(x, y) {
                               return x > y;
                           }));

    installPrimitiveProcedure(
        'char>=?',
        baselib.arity.makeArityAtLeast(2),
        makeCharComparator('char>=?',
                           function(x, y) {
                               return x >= y;
                           }));

    installPrimitiveProcedure(
        'char<?',
        baselib.arity.makeArityAtLeast(2),
        makeCharComparator('char<?',
                           function(x, y) {
                               return x < y;
                           }));

    installPrimitiveProcedure(
        'char<=?',
        baselib.arity.makeArityAtLeast(2),
        makeCharComparator('char<=?',
                           function(x, y) {
                               return x <= y;
                           }));

    installPrimitiveProcedure(
        'char=?',
        baselib.arity.makeArityAtLeast(2),
        makeCharComparator('char=?',
                           function(x, y) {
                               return x === y;
                           }));

    installPrimitiveProcedure(
        'char-ci>?',
        baselib.arity.makeArityAtLeast(2),
        makeCharComparator('char-ci>?',
                           function(x, y) {
                               return x.toUpperCase() > y.toUpperCase();
                           }));

    installPrimitiveProcedure(
        'char-ci>=?',
        baselib.arity.makeArityAtLeast(2),
        makeCharComparator('char-ci>=?',
                           function(x, y) {
                               return x.toUpperCase() >= y.toUpperCase();
                           }));

    installPrimitiveProcedure(
        'char-ci<?',
        baselib.arity.makeArityAtLeast(2),
        makeCharComparator('char-ci<?',
                           function(x, y) {
                               return x.toUpperCase() < y.toUpperCase();
                           }));

    installPrimitiveProcedure(
        'char-ci<=?',
        baselib.arity.makeArityAtLeast(2),
        makeCharComparator('char-ci<=?',
                           function(x, y) {
                               return x.toUpperCase() <= y.toUpperCase();
                           }));

    installPrimitiveProcedure(
        'char-ci=?',
        baselib.arity.makeArityAtLeast(2),
        makeCharComparator('char-ci=?',
                           function(x, y) {
                               return x.toUpperCase() === y.toUpperCase();
                           }));



    installPrimitiveProcedure(
        'char->integer',
        1,
        function(M) {
            return checkChar(M, 'char->integer', 0).val.charCodeAt(0);
        });

    installPrimitiveProcedure(
        'integer->char',
        1,
        function(M) {
            var ch = baselib.numbers.toFixnum(checkIntegerForChar(M, 'integer->char', 0));
            return baselib.chars.makeChar(String.fromCharCode(ch));
        });

    installPrimitiveProcedure(
        'char-upcase',
        1,
        function(M) {
            var ch = checkChar(M, 'char=?', 0).val;
            return baselib.chars.makeChar(ch.toUpperCase());
        });

    installPrimitiveProcedure(
        'char-downcase',
        1,
        function(M) {
            var ch = checkChar(M, 'char=?', 0).val;
            return baselib.chars.makeChar(ch.toLowerCase());
        });

    installPrimitiveProcedure(
        'char-numeric?',
        1,
        function(M) {
            var val = checkChar(M, 'char-numeric?', 0).val;
            return val >= '0' && val <= '9';
        });

    installPrimitiveProcedure(
        'char-alphabetic?',
        1,
        function(M) {
            var val = checkChar(M, 'char-alphabetic?', 0).val;
            return ((val >= 'a' && val <= 'z') ||
                    (val >= 'A' && val <= 'Z'));
        });

    var whitespaceRegexp = new RegExp("^\\s*$");
    installPrimitiveProcedure(
        'char-whitespace?',
        1,
        function(M) {
            var val = checkChar(M, 'char-whitespace?', 0).val;
            return val.match(whitespaceRegexp ? true : false);
      });


    installPrimitiveProcedure(
        'char-upper-case?',
        1,
        function(M) {
            var val = checkChar(M, 'char-upper-case?', 0).val;
            return val === val.toUpperCase();
      });

    installPrimitiveProcedure(
        'char-lower-case?',
        1,
        function(M) {
            var val = checkChar(M, 'char-lower-case?', 0).val;
            return val === val.toLowerCase();
      });


    installPrimitiveProcedure(
        'box',
        1,
        function (M) {
            var firstArg = M.e[M.e.length-1];
            return makeBox(firstArg);
        });

    installPrimitiveProcedure(
        'unbox',
        1,
        function (M) {
            var firstArg = checkBox(M, 'unbox', 0);
            return firstArg.ref();
        });

    installPrimitiveProcedure(
        'set-box!',
        2,
        function (M) {
            var firstArg = checkMutableBox(M, 'set-box!', 0);
            var secondArg = M.e[M.e.length-2];
            firstArg.set(secondArg);
            return VOID;
        });

    installPrimitiveProcedure(
        'void',
        baselib.arity.makeArityAtLeast(0),
        function (M) {
            return VOID;
        });


    installPrimitiveProcedure(
        'random',
        makeList(0, 1),
        function (M) {
            if (M.a === 0) {
                return makeFloat(Math.random());
            } else {
                var n = checkNatural(M, 'random', 0);
                return Math.floor(Math.random() * baselib.numbers.toFixnum(n));
            }
        });


    installPrimitiveProcedure(
        'eq?',
        2,
        function (M) {
            var firstArg = M.e[M.e.length-1];
            var secondArg = M.e[M.e.length-2];
            return firstArg === secondArg;
        });

    installPrimitiveProcedure(
        'eqv?',
        2,
        function (M) {
            var firstArg = M.e[M.e.length-1];
            var secondArg = M.e[M.e.length-2];
            return baselib.equality.eqv(firstArg, secondArg);
        });



    installPrimitiveProcedure(
        'equal?',
        2,
        function (M) {
            var firstArg = M.e[M.e.length-1];
            var secondArg = M.e[M.e.length-2];
            return equals(firstArg, secondArg);
        });


    // This definition of apply will take precedence over the
    // implementation of apply in the boostrapped-primitives.rkt,
    // since it provides nicer error handling.
    var applyImplementation = function (M) {
        if(--M.cbt < 0) {
            throw applyImplementation;
        }
        var proc = checkProcedure(M, 'apply', 0);
        M.e.pop();
        M.a--;
        checkList(M, 'apply', M.a - 1);
        M.spliceListIntoStack(M.a - 1);
        M.p = proc;
        if (baselib.arity.isArityMatching(proc.racketArity, M.a)) {
            return proc.label(M);
        } else {
            raiseArityMismatchError(M, proc, M.a);
        }
    };

    installPrimitiveClosure(
        'apply',
        baselib.arity.makeArityAtLeast(2),
        applyImplementation);


    // FIXME: The definition of call-with-values is in
    // bootstrapped-primitives.rkt.  We may want to replace it with an
    // explicitly defined one here.





    installPrimitiveProcedure(
        'procedure?',
        1,
        function (M) {
            return isProcedure(M.e[M.e.length - 1]);
        });

    installPrimitiveProcedure(
        'procedure-arity-includes?',
        2,
        function (M) {
            var proc = checkProcedure(M, 'procedure-arity-includes?', 0);
            var a = checkNatural(M, 'procedure-arity-includes?', 1);
            return baselib.arity.isArityMatching(proc.racketArity, a);
        });

    installPrimitiveProcedure(
        'procedure-arity',
        1,
        function (M) {
            var proc = checkProcedure(M, 'procedure-arity-includes?', 0);
            return proc.racketArity;
        });


    installPrimitiveProcedure(
        'procedure-rename',
        2,
        function (M) {
            var proc = checkProcedure(M, 'procedure-rename', 0);
            var name = checkSymbol(M, 'procedure-rename', 1);
            return baselib.functions.renameProcedure(proc, name);
        });



    installPrimitiveProcedure(
        'member',
        2,
        function (M) {
            var x = M.e[M.e.length-1];
            var lst = M.e[M.e.length-2];
            while (true) {
                if (lst === NULL) {
                    return false;
                }
                if (! isPair(lst)) {
                    raiseArgumentTypeError(M,
                                           'member',
                                           'list',
                                           1,
                                           M.e[M.e.length - 1 - 1]);
                }
                if (equals(x, (lst.first))) {
                    return lst;
                }
                lst = lst.rest;
            }
        });


    installPrimitiveProcedure(
        'reverse',
        1,
        function (M) {
            var rev = NULL;
            var lst = M.e[M.e.length-1];
            while(lst !== NULL) {
                rev = makePair(testArgument(M, 'pair', isPair, lst, 0, 'reverse').first,
                               rev);
                lst = lst.rest;
            }
            return rev;
        });

    installPrimitiveProcedure(
        'void?',
        1,
        function(M) {
            return M.e[M.e.length -1] === VOID;
        });


    installPrimitiveProcedure(
        'box?',
        1,
        function(M) {
            return isBox(M.e[M.e.length -1]);
        });


    installPrimitiveProcedure(
        'eof-object?',
        1,
        function(M) {
            return M.e[M.e.length -1] === baselib.constants.EOF_VALUE;
        });

    installPrimitiveProcedure(
	'number?',
	1,
	function(M) {
	    return isNumber(M.e[M.e.length - 1]);
	});

    installPrimitiveProcedure(
	'real?',
	1,
	function(M) {
	    return isReal(M.e[M.e.length - 1]);
	});

    installPrimitiveProcedure(
	'inexact?',
	1,
	function(M) {
	    return isInexact(M.e[M.e.length - 1]);
	});

    installPrimitiveProcedure(
	'complex?',
	1,
	function(M) {
	    return isComplex(M.e[M.e.length - 1]);
	});

    installPrimitiveProcedure(
        'bytes?',
        1,
        function(M) {
            return isBytes(M.e[M.e.length-1]);
        });

    installPrimitiveProcedure(
	'byte?',
	1,
	function(M) {
	    var v = M.e[M.e.length - 1];
            if(!isNatural(v)) { return false; }
            v = baselib.numbers.toFixnum(v);
            return v >= 0 && v < 256;
	});

    installPrimitiveProcedure(
	'rational?',
	1,
	function(M) {
	    return isRational(M.e[M.e.length - 1]);
	});

    installPrimitiveProcedure(
        'even?',
        1,
        function(M) {
            var n = checkInteger(M, 'even?', 0);
            return baselib.numbers.equals(0, baselib.numbers.modulo(n, 2));
        });

    installPrimitiveProcedure(
        'odd?',
        1,
        function(M) {
            var n = checkInteger(M, 'odd?', 0);
            return baselib.numbers.equals(1, baselib.numbers.modulo(n, 2));
        });


    installPrimitiveProcedure(
        'positive?',
        1,
        function(M) {
            var n = checkReal(M, 'positive?', 0);
            return baselib.numbers.greaterThan(n, 0);
        });

    installPrimitiveProcedure(
        'negative?',
        1,
        function(M) {
            var n = checkReal(M, 'negative?', 0);
            return baselib.numbers.lessThan(n, 0);
        });


    installPrimitiveProcedure(
        'inexact->exact',
        1,
        function (M) {
            return baselib.numbers.toExact(
                checkNumber(M, 'inexact->exact', 0));
        });

    installPrimitiveProcedure(
        'exact->inexact',
        1,
        function (M) {
            return baselib.numbers.toInexact(
                checkNumber(M, 'exact->inexact', 0));
        });

    installPrimitiveProcedure(
        'abs',
        1,
        function (M) {
            return baselib.numbers.abs(
                checkNumber(M, 'abs', 0));
        });

    installPrimitiveProcedure(
        'acos',
        1,
        function (M) {
            return baselib.numbers.acos(
                checkNumber(M, 'acos', 0));
        });


    installPrimitiveProcedure(
        'asin',
        1,
        function (M) {
            return baselib.numbers.asin(
                checkNumber(M, 'asin', 0));
        });

    installPrimitiveProcedure(
        'sin',
        1,
        function (M) {
            return baselib.numbers.sin(
                checkNumber(M, 'sin', 0));
        });



    installPrimitiveProcedure(
        'sinh',
        1,
        function (M) {
            return baselib.numbers.sinh(
                checkNumber(M, 'sinh', 0));
        });


    installPrimitiveProcedure(
        'tan',
        1,
        function (M) {
            return baselib.numbers.tan(
                checkNumber(M, 'tan', 0));
        });


    installPrimitiveProcedure(
        'atan',
        makeList(1, 2),
        function (M) {
            if (M.a === 1) {
                return baselib.numbers.atan(
                    checkNumber(M, 'atan', 0));
            } else {
                return makeFloat(
                    Math.atan2(
                        baselib.numbers.toFixnum(checkNumber(M, 'atan', 0)),
                        baselib.numbers.toFixnum(checkNumber(M, 'atan', 1))));
            }
        });


    installPrimitiveProcedure(
        'angle',
        1,
        function (M) {
            return baselib.numbers.angle(
                checkNumber(M, 'angle', 0));
        });

    installPrimitiveProcedure(
        'magnitude',
        1,
        function (M) {
            return baselib.numbers.magnitude(
                checkNumber(M, 'magnitude', 0));
        });

    installPrimitiveProcedure(
        'conjugate',
        1,
        function (M) {
            return baselib.numbers.conjugate(
                checkNumber(M, 'conjugate', 0));
        });




    installPrimitiveProcedure(
        'cos',
        1,
        function (M) {
            return baselib.numbers.cos(
                checkNumber(M, 'cos', 0));
        });


    installPrimitiveProcedure(
        'cosh',
        1,
        function (M) {
            return baselib.numbers.cosh(
                checkNumber(M, 'cosh', 0));
        });

    installPrimitiveProcedure(
        'gcd',
        baselib.arity.makeArityAtLeast(1),
        function (M) {
            var args = [], i, x;
            for (i = 0; i < M.a; i++) {
                args.push(checkNumber(M, 'gcd', i));
            }
            x = args.shift();
            return baselib.numbers.gcd(x, args);
        });

    installPrimitiveProcedure(
        'lcm',
        baselib.arity.makeArityAtLeast(1),
        function (M) {
            var args = [], i, x;
            for (i = 0; i < M.a; i++) {
                args.push(checkNumber(M, 'lcm', i));
            }
            x = args.shift();
            return baselib.numbers.lcm(x, args);
        });




    installPrimitiveProcedure(
        'exp',
        1,
        function (M) {
            return baselib.numbers.exp(
                checkNumber(M, 'exp', 0));
        });


    installPrimitiveProcedure(
        'expt',
        2,
        function (M) {
            return baselib.numbers.expt(
                checkNumber(M, 'expt', 0),
                checkNumber(M, 'expt', 1));
        });

    installPrimitiveProcedure(
        'exact?',
        1,
        function (M) {
            return baselib.numbers.isExact(
                checkNumber(M, 'exact?', 0));
        });


    installPrimitiveProcedure(
        'integer?',
        1,
        function (M) {
            return baselib.numbers.isInteger(M.e[M.e.length - 1]);
        });

    installPrimitiveProcedure(
        'exact-integer?',
        1,
        function (M) {
            return (baselib.numbers.isInteger(M.e[M.e.length - 1]) &&
                    baselib.numbers.isExact(M.e[M.e.length - 1]));
        });

    installPrimitiveProcedure(
        'exact-nonnegative-integer?',
        1,
        function (M) {
            return isNatural(M.e[M.e.length - 1]);
        });



    installPrimitiveProcedure(
        'imag-part',
        1,
        function (M) {
            return baselib.numbers.imaginaryPart(
                checkNumber(M, 'imag-part', 0));
        });


    installPrimitiveProcedure(
        'real-part',
        1,
        function (M) {
            return baselib.numbers.realPart(
                checkNumber(M, 'real-part', 0));
        });


    installPrimitiveProcedure(
        'make-polar',
        2,
        function (M) {
            return makeComplexPolar(
                checkReal(M, 'make-polar', 0),
                checkReal(M, 'make-polar', 1));
        });


    installPrimitiveProcedure(
        'make-rectangular',
        2,
        function (M) {
            return makeComplex(
                checkReal(M, 'make-rectangular', 0),
                checkReal(M, 'make-rectangular', 1));
        });

    installPrimitiveProcedure(
        'modulo',
        2,
        function (M) {
            return baselib.numbers.modulo(
                checkInteger(M, 'modulo', 0),
                checkInteger(M, 'modulo', 1));
        });


    installPrimitiveProcedure(
        'remainder',
        2,
        function (M) {
            return baselib.numbers.remainder(
                checkInteger(M, 'remainder', 0),
                checkInteger(M, 'remainder', 1));
        });


    installPrimitiveProcedure(
        'quotient',
        2,
        function (M) {
            return baselib.numbers.quotient(
                checkInteger(M, 'quotient', 0),
                checkInteger(M, 'quotient', 1));
        });



    installPrimitiveProcedure(
        'floor',
        1,
        function (M) {
            return baselib.numbers.floor(
                checkReal(M, 'floor', 0));
        });


    installPrimitiveProcedure(
        'ceiling',
        1,
        function (M) {
            return baselib.numbers.ceiling(
                checkReal(M, 'ceiling', 0));
        });


    installPrimitiveProcedure(
        'round',
        1,
        function (M) {
            return baselib.numbers.round(
                checkReal(M, 'round', 0));
        });


    installPrimitiveProcedure(
        'truncate',
        1,
        function (M) {
            var n = checkReal(M, 'truncate', 0);
            if (baselib.numbers.lessThan(n, 0)) {
                return baselib.numbers.ceiling(n);
            } else {
                return baselib.numbers.floor(n);
            }
        });


    installPrimitiveProcedure(
        'numerator',
        1,
        function (M) {
            return baselib.numbers.numerator(
                checkRational(M, 'numerator', 0));
        });


    installPrimitiveProcedure(
        'denominator',
        1,
        function (M) {
            return baselib.numbers.denominator(
                checkRational(M, 'denominator', 0));
        });


    installPrimitiveProcedure(
        'log',
        1,
        function (M) {
            return baselib.numbers.log(
                checkNumber(M, 'log', 0));
        });


    installPrimitiveProcedure(
        'sqr',
        1,
        function (M) {
            return baselib.numbers.sqr(
                checkNumber(M, 'sqr', 0));
        });




    installPrimitiveProcedure(
        'sqrt',
        1,
        function (M) {
            return baselib.numbers.sqrt(
                checkNumber(M, 'sqrt', 0));
        });



    installPrimitiveProcedure(
        'integer-sqrt',
        1,
        function (M) {
            return baselib.numbers.integerSqrt(
                checkInteger(M, 'integer-sqrt', 0));
        });



    installPrimitiveProcedure(
        'sgn',
        1,
        function (M) {
            return baselib.numbers.sign(
                checkInteger(M, 'sgn', 0));
        });


    installPrimitiveProcedure(
        'min',
        baselib.arity.makeArityAtLeast(1),
        function(M) {
            var i;
            var next;
            var currentMin = checkReal(M, 'min', 0);
            for (i = 1; i < M.a; i++) {
                next = checkReal(M, 'min', i);
                if (baselib.numbers.lessThan(next, currentMin)) {
                    currentMin = next;
                }
            }
            return currentMin;
        });

    installPrimitiveProcedure(
        'max',
        baselib.arity.makeArityAtLeast(1),
        function(M) {
            var i;
            var next;
            var currentMax = checkReal(M, 'min', 0);
            for (i = 1; i < M.a; i++) {
                next = checkReal(M, 'min', i);
                if (baselib.numbers.greaterThan(next, currentMax)) {
                    currentMax = next;
                }
            }
            return currentMax;
        });






    installPrimitiveProcedure(
        'error',
        baselib.arity.makeArityAtLeast(1),
        function (M) {
	    var i;
            if (M.a === 1) {
                var sym = checkSymbol(M, 'error', 1);
                raise(M, baselib.exceptions.makeExnFail(sym.toString(),
                                                        M.captureContinuationMarks()));
            }

            if (isString(M.e[M.e.length - 1])) {
                var vs = [];
                for (i = 1; i < M.a; i++) {
                    vs.push(baselib.format.format("~e", [M.e[M.e.length - 1 - i]]));
                }
                raise(M, baselib.exceptions.makeExnFail(M.e[M.e.length - 1].toString() +
                                                        ": " +
                                                        vs.join(' '),
                                                        M.captureContinuationMarks()));
            }

            if (isSymbol(M.e[M.e.length - 1])) {
                var fmtString = checkString(M, 'error', 1);
                var args = [M.e[M.e.length - 1]];
                for (i = 2; i < M.a; i++) {
                    args.push(M.e[M.e.length - 1 - i]);
                }
                raise(M, baselib.exceptions.makeExnFail(
                    baselib.format.format('~s: ' + fmtString.toString(),
                                          args),
                    M.captureContinuationMarks()));
            }

            // Fall-through
            raiseArgumentTypeError(M, 'error', 'symbol or string', 0, M.e[M.e.length - 1]);
        });


    installPrimitiveProcedure(
        'raise',
        makeList(1, 2),
        function(M) {
            var v = M.e[M.e.length - 1];
            // At the moment, not using the continuation barrier yet.
            // var withBarrier = M.e[M.e.length - 2];
            raise(M, v);
        });



    installPrimitiveProcedure(
        'raise-mismatch-error',
        3,
        function (M) {
            var name = checkSymbol(M, 'raise-mismatch-error', 0);
            var message = checkString(M, 'raise-mismatch-error', 0);
            var val = M.e[M.e.length - 1 - 2];
            raise(M, baselib.exceptions.makeExnFail(
		baselib.format.format("~a: ~a~e",
                                      [name,
                                       message,
                                       val]),
                M.captureContinuationMarks()));
        });


    installPrimitiveProcedure(
        'raise-type-error',
        baselib.arity.makeArityAtLeast(3),
        function (M) {
            var name = checkSymbol(M, 'raise-type-error', 0);
            var expected = checkString(M, 'raise-type-error', 1);
            if (M.a === 3) {
                raiseArgumentTypeError(M,
                                       name,
                                       expected,
                                       void(0),
                                       M.e[M.e.length - 1 - 2]);
            } else {
                raiseArgumentTypeError(M,
                                       name,
                                       expected,
                                       checkNatural(M, 'raise-type-error', 2),
                                       M.e[M.e.length - 1 - 2]);
            }
        });



    installPrimitiveProcedure(
        'make-exn',
        2,
        function(M) {
            var message = checkString(M, 'make-exn', 0);
            var marks = checkContinuationMarkSet(M, 'make-exn', 1);
            return baselib.exceptions.makeExn(message, marks);
        });


    installPrimitiveConstant(
        'struct:exn:fail',
        baselib.exceptions.ExnFail);


    installPrimitiveConstant(
        'prop:exn:srclocs',
        baselib.structs.propExnSrcloc);


    installPrimitiveProcedure(
        'make-exn:fail',
        2,
        function(M) {
            var message = checkString(M, 'make-exn:fail', 0);
            var marks = checkContinuationMarkSet(M, 'make-exn:fail', 1);
            return baselib.exceptions.makeExnFail(message, marks);
        });


    installPrimitiveProcedure(
        'make-exn:fail:contract',
        2,
        function(M) {
            var message = checkString(M, 'make-exn:fail:contract', 0);
            var marks = checkContinuationMarkSet(M, 'make-exn:fail:contract', 1);
            return baselib.exceptions.makeExnFailContract(message, marks);
        });


    installPrimitiveProcedure(
        'make-exn:fail:contract:arity',
        2,
        function(M) {
            var message = checkString(M, 'make-exn:fail:contract:arity', 0);
            var marks = checkContinuationMarkSet(M, 'make-exn:fail:contract:arity', 1);
            return baselib.exceptions.makeExnFailContractArity(message, marks);
        });

    installPrimitiveProcedure(
        'make-exn:fail:contract:variable',
        2,
        function(M) {
            var message = checkString(M, 'make-exn:fail:contract:variable', 0);
            var marks = checkContinuationMarkSet(M, 'make-exn:fail:contract:variable', 1);
            return baselib.exceptions.makeExnFailContractVariable(message, marks);
        });

    installPrimitiveProcedure(
        'make-exn:fail:contract:divide-by-zero',
        2,
        function(M) {
            var message = checkString(M, 'make-exn:fail:contract:divide-by-zero', 0);
            var marks = checkContinuationMarkSet(M, 'make-exn:fail:contract:divide-by-zero', 1);
            return baselib.exceptions.makeExnFailContractDivisionByZero(message, marks);
        });

    installPrimitiveProcedure(
        'exn:fail?',
        1,
        function(M) {
            return baselib.exceptions.isExnFail(M.e[M.e.length-1]);
        });

    installPrimitiveProcedure(
        'exn:fail:contract?',
        1,
        function(M) {
            return baselib.exceptions.isExnFailContract(M.e[M.e.length-1]);
        });

    installPrimitiveProcedure(
        'exn:fail:contract:arity?',
        1,
        function(M) {
            return baselib.exceptions.isExnFailContractArity(M.e[M.e.length-1]);
        });


    installPrimitiveProcedure(
        'exn-message',
        1,
        function(M) {
            var exn = checkExn(M, 'exn-message', 0);
            return baselib.exceptions.exnMessage(exn);
        });

    installPrimitiveProcedure(
        'exn-continuation-marks',
        1,
        function(M) {
            var exn = checkExn(M, 'exn-continuation-marks', 0);
            return baselib.exceptions.exnContMarks(exn);
        });


    installPrimitiveProcedure(
        'current-continuation-marks',
        makeList(0, 1),
        function(M) {
            var promptTag = baselib.contmarks.DEFAULT_CONTINUATION_PROMPT_TAG;
            if (M.a === 1) {
                promptTag = checkContinuationPromptTag(M, 'current-continuation-marks', 0);
            }
            var contMarks = M.captureContinuationMarks(promptTag);
            return contMarks;
        });

    installPrimitiveProcedure(
        'continuation-mark-set->list',
        makeList(2, 3),
        function(M) {
            var marks = checkContinuationMarkSet(M, 'continuation-mark-set->list', 0);
            var key = checkAny(M, 'continuation-mark-set->list', 1);
            var promptTag = baselib.contmarks.DEFAULT_CONTINUATION_PROMPT_TAG;
            if (M.a === 3) {
                promptTag = checkContinuationPromptTag(M, 'current-continuation-marks', 2);
            }
            return marks.ref(key, promptTag);
        });



    installPrimitiveClosure(
        'make-struct-type',
        makeList(4, 5, 6, 7, 8, 9, 10, 11),
        function (M) {
            withArguments(
                M,
                4,
                [false,
                 NULL,
                 false,
                 false,
                 NULL,
                 false,
                 false],
                function (name,
                          superType,
                          initFieldCount,
                          autoFieldCount,
                          autoV,
                          props,
                          inspector,  // FIXME: currently ignored
                          procSpec,   // FIXME: currently ignored
                          immutables, // FIXME: currently ignored
                          guard,      // FIXME: currently ignored
                          constructorName
                         ) {
                    var structType = baselib.structs.makeStructureType(
                        name,
                        superType,
                        initFieldCount,
                        autoFieldCount,
                        autoV,
                        //inspector,
                        //procSpec,
                        //immutables,
                        guard,
                        props);

                    var constructorValue =
                        makePrimitiveProcedure(
                            constructorName,
                            initFieldCount + (superType ? superType.numberOfArgs : 0),
                            function (M) {
                                var args = M.e.slice(M.e.length - M.a).reverse();
                                return structType.constructor(args);
                            });

                    var predicateValue =
                        makePrimitiveProcedure(
                            name.toString() + "?",
                            1,
                            function (M) {
                                return structType.predicate(M.e[M.e.length - 1]);
                            });

                    var accessorValue =
                        makePrimitiveProcedure(
                            name.toString() + "-accessor",
                            2,
                            function (M) {
                                return structType.accessor(
                                    M.e[M.e.length - 1],
                                    baselib.numbers.toFixnum(M.e[M.e.length - 2]));
                            });
                    accessorValue.structType = structType;

                    var mutatorValue =
                        makePrimitiveProcedure(
                            name.toString() + "-mutator",
                            3,
                            function (M) {
                                return structType.mutator(
                                    M.e[M.e.length - 1],
                                    baselib.numbers.toFixnum(M.e[M.e.length - 2]),
                                    M.e[M.e.length - 3]);
                            });
                    mutatorValue.structType = structType;


                    finalizeClosureCall(M,
                                        structType,
                                        constructorValue,
                                        predicateValue,
                                        accessorValue,
                                        mutatorValue);
                });
        });

    installPrimitiveProcedure(
        'struct?',
        1,
        function(M) {
            return isStruct(M.e[M.e.length - 1]);
        });

    installPrimitiveProcedure(
        'struct-type?',
        1,
        function(M) {
            return isStructType(M.e[M.e.length - 1]);
        });

    installPrimitiveProcedure(
        'current-inspector',
        makeList(0, 1),
        function (M) {
            if (M.a === 1) {
                M.params['currentInspector'] =
                    checkInspector(M, 'current-inspector', 0);
                return VOID;
            } else {
                return M.params['currentInspector'];
            }
        }
    );


    installPrimitiveProcedure(
        'make-struct-field-accessor',
        makeList(2, 3),
        function (M){
            var structType = M.e[M.e.length - 1].structType;
            var index = M.e[M.e.length - 2];
            var name;
            if (M.a === 3) {
                name = structType.name + "-" + M.e[M.e.length - 3].toString();
            } else {
                name = structType.name + "-" + 'field' + index;
            }
            var checkStruct = baselib.check.makeCheckArgumentType(structType.predicate,
                                                                  structType.name);
            return makePrimitiveProcedure(
                name,
                1,
                function (M) {
                    var aStruct = checkStruct(M, name, 0);
                    return structType.accessor(
                        aStruct,
                        baselib.numbers.toFixnum(index));
                });
        });


    installPrimitiveProcedure(
        'make-struct-field-mutator',
        makeList(2, 3),
        function (M){
            var structType = M.e[M.e.length - 1].structType;
            var index = M.e[M.e.length - 2];
            var name;
            if (M.a === 3) {
                name = "set-" + structType.name + "-" + M.e[M.e.length - 3].toString() + "!";
            } else {
                name = "set-" + structType.name + "-" + 'field' + index + "!";
            }
            var checkStruct = baselib.check.makeCheckArgumentType(structType.predicate,
                                                                  structType.name);
            return makePrimitiveProcedure(
                name,
                2,
                function (M) {
                    var aStruct = checkStruct(M, name, 0);
                    structType.mutator(
                        aStruct,
                        baselib.numbers.toFixnum(index),
                        M.e[M.e.length - 2]);
                    return VOID;
                });
        });


    installPrimitiveProcedure(
        'make-placeholder',
        1,
        function(M) {
            var v = M.e[M.e.length - 1];
            return baselib.placeholders.makePlaceholder(v);
        });


    installPrimitiveProcedure(
        'placeholder-set!',
        2,
        function(M) {
            var placeholder = checkPlaceholder(M, 'placeholder-set!', 0);
            var val = M.e[M.e.length - 2];
            placeholder.set(val);
            return VOID;
        });


    installPrimitiveProcedure(
        'make-reader-graph',
        1,
        function(M) {
            var x = M.e[M.e.length - 1];
            return baselib.readergraph.readerGraph(x,
                                                   baselib.hashes.makeLowLevelEqHash(),
                                                   0);
        });




    installPrimitiveProcedure(
        'srcloc',
        5,
        function(M) {
            var source = M.e[M.e.length - 1];
            var line = checkNaturalOrFalse(M, 'srcloc', 1);
            var column = checkNaturalOrFalse(M, 'srcloc', 2);
            var position = checkNaturalOrFalse(M, 'srcloc', 3);
            var span = checkNaturalOrFalse(M, 'srcloc', 4);
            return baselib.srclocs.makeSrcloc(source, line, column, position, span);
        });

    installPrimitiveProcedure(
        'make-srcloc',
        5,
        function(M) {
            var source = M.e[M.e.length - 1];
            var line = checkNaturalOrFalse(M, 'make-srcloc', 1);
            var column = checkNaturalOrFalse(M, 'make-srcloc', 2);
            var position = checkNaturalOrFalse(M, 'make-srcloc', 3);
            var span = checkNaturalOrFalse(M, 'make-srcloc', 4);
            return baselib.srclocs.makeSrcloc(source, line, column, position, span);
        });

    installPrimitiveProcedure(
        'srcloc?',
        1,
        function(M) {
            return baselib.srclocs.isSrcloc(M.e[M.e.length - 1]);
        });

    installPrimitiveProcedure(
        'srcloc-source',
        1,
        function(M) {
            return baselib.srclocs.srclocSource(checkSrcloc(M, 'srcloc-source', 0));
        });

    installPrimitiveProcedure(
        'srcloc-line',
        1,
        function(M) {
            return baselib.srclocs.srclocLine(checkSrcloc(M, 'srcloc-line', 0));
        });

    installPrimitiveProcedure(
        'srcloc-column',
        1,
        function(M) {
            return baselib.srclocs.srclocColumn(checkSrcloc(M, 'srcloc-column', 0));
        });


    installPrimitiveProcedure(
        'srcloc-position',
        1,
        function(M) {
            return baselib.srclocs.srclocPosition(checkSrcloc(M, 'srcloc-position', 0));
        });


    installPrimitiveProcedure(
        'srcloc-span',
        1,
        function(M) {
            return baselib.srclocs.srclocSpan(checkSrcloc(M, 'srcloc-span', 0));
        });



    installPrimitiveProcedure(
        'make-continuation-prompt-tag',
        makeList(0, 1),
        function(M) {
            var sym;
            if (M.a === 1) {
                sym = checkSymbol(M, "make-continuation-prompt-tag", 0);
                return new baselib.contmarks.ContinuationPromptTag(sym.toString());
            }
            return new baselib.contmarks.ContinuationPromptTag(false);
        });

    installPrimitiveProcedure(
        'continuation-prompt-tag?',
        1,
        function(M) {
            return baselib.contmarks.isContinuationPromptTag(M.e[M.e.length - 1]);
        });



    installPrimitiveProcedure(
        'default-continuation-prompt-tag',
        0,
        function(M) {
            return baselib.contmarks.DEFAULT_CONTINUATION_PROMPT_TAG;
        });

    installPrimitiveProcedure(
        'current-inexact-milliseconds',
        0,
        function(M) {
            return makeFloat((new Date()).valueOf());
        });


    installPrimitiveProcedure(
        'current-seconds',
        0,
        function() {
            return Math.floor( (new Date()).getTime() / 1000 );
        });


    // initializeHash: (listof pair) WhalesongHashtable -> WhalesongHashtable
    var initializeHash = function(lst, hash) {
	while (lst !== NULL) {
	    hash.put(lst.first.first, lst.first.rest);
	    lst = lst.rest;
	}
	return hash;
    };

    var initializeImmutableHash = function(lst, hash) {
	while (lst !== NULL) {
	    hash = hash.functionalPut(lst.first.first, lst.first.rest);
	    lst = lst.rest;
	}
	return hash;
    };


    installPrimitiveProcedure(
        'hash?',
        1,
        function(M) {
            return baselib.hashes.isHash(checkAny(M, 'hash?', 0));
        });
    installPrimitiveProcedure(
        'hash-equal?',
        1,
        function(M) {
            return baselib.hashes.isHashEqual(checkAny(M, 'hash-equal?', 0));
        });
    installPrimitiveProcedure(
        'hash-eq?',
        1,
        function(M) {
            return baselib.hashes.isHashEq(checkAny(M, 'hash-eq?', 0));
        });
    installPrimitiveProcedure(
        'hash-eqv?',
        1,
        function(M) {
            return baselib.hashes.isHashEqv(checkAny(M, 'hash-eqv?', 0));
        });


    installPrimitiveProcedure(
        'make-hasheq',
        makeList(0, 1),
        function(M) {
            var lst = NULL;
            if (M.a === 1) {
                lst = checkListofPairs(M, 'make-hasheq', 0);
            }
            return initializeHash(lst, plt.baselib.hashes.makeEqHashtable());
        });

    installPrimitiveProcedure(
        'make-hasheqv',
        makeList(0, 1),
        function(M) {
            var lst = NULL;
            if (M.a === 1) {
                lst = checkListofPairs(M, 'make-hasheqv', 0);
            }
            return initializeHash(lst, plt.baselib.hashes.makeEqvHashtable());
        });

    installPrimitiveProcedure(
        'make-hash',
        makeList(0, 1),
        function(M) {
            var lst = NULL;
            if (M.a === 1) {
                lst = checkListofPairs(M, 'make-hash', 0);
            }
            return initializeHash(lst, plt.baselib.hashes.makeEqualHashtable());
        });

    installPrimitiveProcedure(
        'hash-copy',
        1,
        function(M) {
            var hash = checkMutableHash(M, 'hash-copy', 0);
            return hash.clone();
        });
    
    installPrimitiveProcedure(
        'hash-count',
        1,
        function(M) {
            return checkHash(M, 'hash-count', 0).size();
        });

    installPrimitiveProcedure(
        'hash',
        baselib.arity.makeArityAtLeast(0),
        function(M) {
            var lst = NULL, i;
            for(i = 0; i < M.a; i+=2) {
                if (i+1 < M.a) {
                    lst = makePair(makePair(checkAny(M, 'hash', i), checkAny(M, 'hash', i + 1)),
                                   lst);
                } else {
                    raiseContractError(
                        M,
                        baselib.format.format(
                            "hash: key does not have a value (i.e., an odd number of arguments were provided): ~e",
                            [checkAny(M, 'hash', i)]));
                }
            }
            return initializeImmutableHash(lst, plt.baselib.hashes.makeImmutableEqualHashtable());
        });

    installPrimitiveProcedure(
        'hasheq',
        baselib.arity.makeArityAtLeast(0),
        function(M) {
            var lst = NULL, i;
            for(i = 0; i < M.a; i+=2) {
                if (i+1 < M.a) {
                    lst = makePair(makePair(checkAny(M, 'hasheq', i), checkAny(M, 'hasheq', i + 1)),
                                   lst);
                } else {
                    raiseContractError(
                        M,
                        baselib.format.format(
                            "hasheq: key does not have a value (i.e., an odd number of arguments were provided): ~e",
                            [checkAny(M, 'hasheq', i)]));
                }
            }
            return initializeImmutableHash(lst, plt.baselib.hashes.makeImmutableEqHashtable());
        });

    installPrimitiveProcedure(
        'hasheqv',
        baselib.arity.makeArityAtLeast(0),
        function(M) {
            var lst = NULL, i;
            for(i = 0; i < M.a; i+=2) {
                if (i+1 < M.a) {
                    lst = makePair(makePair(checkAny(M, 'hasheqv', i), checkAny(M, 'hasheqv', i + 1)),
                                   lst);
                } else {
                    raiseContractError(
                        M,
                        baselib.format.format(
                            "hasheqv: key does not have a value (i.e., an odd number of arguments were provided): ~e",
                            [checkAny(M, 'hasheqv', i)]));
                }
            }
            return initializeImmutableHash(lst, plt.baselib.hashes.makeImmutableEqvHashtable());
        });

    installPrimitiveProcedure(
        'make-immutable-hasheq',
        makeList(0, 1),
        function(M) {
            var lst = NULL;
            if (M.a === 1) {
                lst = checkListofPairs(M, 'make-immutable-hasheq', 0);
            }
            return initializeImmutableHash(lst, plt.baselib.hashes.makeImmutableEqHashtable());
        });

    installPrimitiveProcedure(
        'make-immutable-hasheqv',
        makeList(0, 1),
        function(M) {
            var lst = NULL;
            if (M.a === 1) {
                lst = checkListofPairs(M, 'make-immutable-hasheqv', 0);
            }
            return initializeImmutableHash(lst, plt.baselib.hashes.makeImmutableEqvHashtable());
        });

    installPrimitiveProcedure(
        'make-immutable-hash',
        makeList(0, 1),
        function(M) {
            var lst = NULL;
            if (M.a === 1) {
                lst = checkListofPairs(M, 'make-immutable-hash', 0);
            }
            return initializeImmutableHash(lst, plt.baselib.hashes.makeImmutableEqualHashtable());
        });

    installPrimitiveClosure(
        'hash-ref',
        makeList(2, 3),
        function(M) {
            var hash = checkHash(M, 'hash-ref', 0);
            var key = checkAny(M, 'hash-ref', 1);
            var thunkOrFailVal;
            if (M.a === 3) {
                thunkOrFailVal = checkAny(M, 'hash-ref', 2);
            }
            if (hash.containsKey(key)) {
                finalizeClosureCall(M, hash.get(key));
            } else {
                if (M.a === 2) {
                    raiseContractError(
                        M,
                        baselib.format.format("hash-ref: no value found for key: ~e",
                                           [key]));
                } else {
                    if (isProcedure(thunkOrFailVal)) {
                        M.p = thunkOrFailVal;
                        M.e.length -= M.a;
                        M.a = 0;
                        baselib.functions.rawApply(M);
                    } else {
                        finalizeClosureCall(M, thunkOrFailVal);
                    }
                }
            }
        });

    installPrimitiveProcedure(
        'hash-has-key?',
        2,
        function(M) {
            var hash = checkHash(M, 'hash-ref', 0);
            var key = checkAny(M, 'hash-ref', 1);
            return hash.containsKey(key);
        });

    installPrimitiveProcedure(
        'hash-set!',
        3,
        function(M){ 
            var hash = checkMutableHash(M, 'hash-set!', 0);
            var key = checkAny(M, 'hash-set!', 1);
            var value = checkAny(M, 'hash-set!', 2);
            hash.put(key, value);
            return VOID;
        });

    installPrimitiveProcedure(
        'hash-set',
        3,
        function(M){ 
            var hash = checkImmutableHash(M, 'hash-set', 0);
            var key = checkAny(M, 'hash-set', 1);
            var value = checkAny(M, 'hash-set', 2);
            return hash.functionalPut(key, value);
        });


    installPrimitiveProcedure(
        'hash-remove!',
        2,
        function(M){ 
            var hash = checkMutableHash(M, 'hash-remove!', 0);
            var key = checkAny(M, 'hash-remove!', 1);
            hash.remove(key);
            return VOID;
        });


    installPrimitiveProcedure(
        'hash-remove',
        2,
        function(M){ 
            var hash = checkImmutableHash(M, 'hash-remove', 0);
            var key = checkAny(M, 'hash-remove', 1);
            return hash.functionalRemove(key);
        });

    installPrimitiveProcedure(
        'hash-keys',
        1,
        function(M) {
            var hash = checkHash(M, 'hash-keys', 0);
            return baselib.lists.arrayToList(hash.keys());
        });

    installPrimitiveProcedure(
        'hash-values',
        1,
        function(M) {
            var hash = checkHash(M, 'hash-values', 0);
            return baselib.lists.arrayToList(hash.values());
        });

    installPrimitiveProcedure(
        'hash-has-key?',
        2,
        function(M){
            var hash = checkHash(M, 'hash-has-key?', 0);
            var key = checkAny(M, 'hash-has-key?', 1);
            return hash.containsKey(key);
        });

    installPrimitiveProcedure(
        'equal-hash-code',
        1,
        function(M) {
            return baselib.hashes.getEqualHashCode(checkAny(M, 'equal-hash-code', 0));
        });


    // The default prompt handler for a given prompt tag will assume
    // it's consuming a zero-argument thunk, and will call it in a
    // context where that prompt has been reestablished.
    var makeDefaultPromptHandler = function(promptTag) {
        return makeClosure(
            "default-prompt-handler",
            1,
            function(M) {
                var proc = checkProcedure(M, 'default-prompt-tag', 0);
                M.e.pop();
                M.p = proc;
                M.a = 0;
                M.addPrompt(promptTag, false, M.e.length);
                baselib.functions.rawApply(M);
            },
            []);
    };


    // FIXME: we should be able to take in an arbitrary continuation
    // as an optional second argument!
    //
   // I need to change the representation of continuations to be able to
    // detect this at runtime.
    installPrimitiveProcedure(
        'continuation-prompt-available?',
        1,
        function(M) {
            var promptTag = checkPromptTag(M, 'continuation-prompt-available?', 0);
            var i;
            for (i = 0; i < M.c.length; i++) {
                var frame = M.c[i];
                if (frame instanceof PromptFrame && frame.tag === promptTag) {
                    return true;
                }
            }
            return false;
        });



    // The default abort prompt handler consumes a thunk and applies
    // it, in a context where a new prompt has been initialized.
    var defaultPromptHandler =
        makeDefaultPromptHandler(baselib.contmarks.DEFAULT_CONTINUATION_PROMPT_TAG);
        

    installPrimitiveClosure(
        'abort-current-continuation',
        baselib.arity.makeArityAtLeast(1),
        function(M) {
            var promptTag = checkPromptTag(M, 'abort-current-continuation', 0);
            var vals = [];
            var frame;
            var i;
            for(i = 1; i < M.a; i++) {
                vals.push(M.e[M.e.length - 1 - i]);
            }
            
            // First, find the continuation prompt.
            while(true) {
                frame = M.c.pop();
                if (frame instanceof PromptFrame && frame.tag === promptTag) {
                    break;
                } else if (M.c.length === 0) {
                    raiseContractError(
                        M,
                        baselib.format.format("continuation includes no prompt with the given tag", []));
                }
            }
            // Shrink the environment to what was observed when the
            // PromptFrame was installed, and then set up the call
            // to the prompt's abort handler.
            M.e.length = frame.envLength;
            M.p = frame.handler || defaultPromptHandler;
            M.a = vals.length;
            for (i = 0; i < vals.length; i++) {
                M.e.push(vals[vals.length - i - 1]);
            }
            baselib.functions.rawApply(M);
        });

 
    installPrimitiveClosure(
        'call-with-continuation-prompt',
        baselib.arity.makeArityAtLeast(1),
        function(M) {
            var proc, promptTag, handler, i;
            proc = checkProcedure(M, 'call-with-continuation-prompt', 0);
            if (M.a >= 2) {
                promptTag = checkPromptTag(M, 'call-with-continuation-prompt', 1);
            } else {
                promptTag = baselib.contmarks.DEFAULT_CONTINUATION_PROMPT_TAG;
            }
            if (M.a >= 3) {
                if (M.e[M.e.length - 1 - 3] === false) {
                    handler = false;
                } else {
                    handler = checkProcedure(M, 'call-with-continuation-prompt', 2);
                }
            } else {
                if (promptTag === baselib.contmarks.DEFAULT_CONTINUATION_PROMPT_TAG) {
                    handler = defaultPromptHandler;
                } else {
                    handler = makeDefaultPromptHandler(promptTag);
                }
            }
            M.p = proc;
            if (M.a >= 1) { M.e.pop(); } // the test is redundant, but I want the parallelism.
            if (M.a >= 2) { M.e.pop(); }
            if (M.a >= 3) { M.e.pop(); }
            M.a = Math.max(M.a - 3, 0);

            // subtle: the prompt's environment is the one _after_ the current call!
            // That's why we need to do M.e.length - M.a: the environment currently
            // has extra values due to us calling the prompt's procedure here.
            M.addPrompt(promptTag, handler, M.e.length - M.a); 

            baselib.functions.rawApply(M);
        });




    exports['Primitives'] = Primitives;
    exports['installPrimitiveProcedure'] = installPrimitiveProcedure;
    exports['installPrimitiveClosure'] = installPrimitiveClosure;
    exports['installPrimitiveConstant'] = installPrimitiveConstant;

}(this.plt.baselib));
