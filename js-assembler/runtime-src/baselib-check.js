// Helper functions for argument checking.

(function(baselib) {
    var exports = {};
    baselib.check = exports;


    var makeCheckArgumentType = function(predicate, predicateName) {
	return function(MACHINE, callerName, position) {
	    testArgument(
		MACHINE,
		predicateName,
		predicate,
		MACHINE.env[MACHINE.env.length - 1 - position],
		position,
		callerName);
	    return MACHINE.env[MACHINE.env.length - 1 - position];
	}
    };


    // testArgument: (X -> boolean) X number string string -> boolean
    // Produces true if val is true, and otherwise raises an error.
    var testArgument = function(MACHINE,
				expectedTypeName,
				predicate, 			    
				val, 
				index, 
				callerName) {
	if (predicate(val)) {
	    return true;
	} else {
	    plt.baselib.exceptions.raiseArgumentTypeError(MACHINE, 
                                                          callerName,
                                                          expectedTypeName,
				                          index,
				                          val);
	}
    };


    //var checkOutputPort = makeCheckArgumentType()




    //////////////////////////////////////////////////////////////////////


    exports.testArgument = testArgument;
    exports.makeCheckArgumentType = makeCheckArgumentType;
    //exports.checkOutputPort = checkOutputPort;



})(this['plt'].baselib);