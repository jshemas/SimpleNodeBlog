/**
 * validate var
 * @param string var - user input
 * @param function callback
 */
exports.validateVar = function(inputVar, callback) {
	if ( inputVar == null || inputVar.length < 1 ) {
		return true;
	} else {
		return false;
	};
};
