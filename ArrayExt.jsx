function ArrayExt(array) {
	this.array = array;
}

ArrayExt.prototype = {

	contains: function(str) {
		for (var i = 0; i < this.array.length; i++) {
			if (this.array[i] == str) {
				return true;
			}
		}
		return false;
	}

};