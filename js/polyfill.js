if(typeof Object.create !== 'function') {
	Object.create = function(object) {
		function F() {};
		F.prototype = object;
		return new F();
	};
}