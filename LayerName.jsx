function LayerName(layerName) {
	this.layerName = layerName;
}

LayerName.prototype = {

	/**
	 * Extrae las categorías a las que pertenece una capa. Las categorías están definidas en el nombre de la capa, con el formato:
	 * <nombre arbitrario>#<título categoría 1>:<valor categoría 1>|<título categoría 2>:<valor categoría 2>|...
	 * Añade el resultado a un objeto en la siguiente forma:
	 * {
	 *     <título categoría 1>: <valor categoría 1>,
	 *     <título categoría 2>: <valor categoría 2>
	 * }
	 * @param {String} layerName Nombre de la capa, con el formato previsto.
	 * @param {Object} cats Objeto al que se añadirán las categorías.
	 */
	extractCats: function() {
		var cats = {};
		var nameCats = this.layerName.split("#").pop().split("|");
		for (var i = 0; i < nameCats.length; i++) {
			var nameCat = nameCats[i];
			var nameCatParts = nameCat.split(":");
			cats[nameCatParts[0]] = nameCatParts[1];

		}
		
		return cats;
	},

	extractBracketsContent: function() {
		var result = this.layerName.match(/\[(.*?)\]/);
		if (result) {
			// Devolver el texto entre corchetes
			return result[1];
		} else {
			// Si no se encuentra texto entre corchetes, devolver null
			return null;
		}
	}

	
}