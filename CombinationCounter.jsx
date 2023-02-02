/**
 * Gestiona un array en el que cada posición indica la capa iterada dentro de cada grupo.
 * Se inicializa con todas las posiciones a 0. Dispone de dos métodos para cambiar las capas activas: increment() y setRandom().
 * increment() permite recorrer todas las posibles combinaciones, incrementando las capas de una en una para todos los grupos.
 * setRandom() permite establecer una capa activa aleatoria (con pesos) para cada grupo.
 */
function CombinationCounter() {
	this.maxRandomAttempts = 500;
	this.numGroups = 0;
	this.groups = [];
	this.randomGeneratedLog = [];
}

CombinationCounter.prototype = {

	init: function(psGroups) {
		this.combinationLog = [];
		this.numGroups = psGroups.length;
		for (var g = 0; g < this.numGroups; g++) {
			var psGroup = psGroups[g];

			var layers = [];
			for (var l = 0; l < psGroup.layers.length; l++) {

				var psLayer = psGroup.layers[l];
				var layerName = psLayer.name;

				// Extrae el peso de cada capa.
				var weightStr = new LayerName(layerName).extractBracketsContent(layerName);
				var weight = weightStr == null ? 1 : parseInt(weightStr);

				layers.push({
					layerName: layerName,
					weight: weight,
					cats: new LayerName(layerName).extractCats()
				});
			}

			this.groups[g] = {
				groupName: psGroups[g].name,
				currentLayer: 0,
				layers: layers
			}
		}
	},

	reset: function() {
		for (var g = 0; g < this.numGroups; g++) {
			this.groups[g].currentLayer = 0;
		}
	},

	/**
	 * Itera los grupos para comprobar si la combinación de capas es válida. Será válida si las categorías de todas las capas son compatibles.
	 * @returns Un objeto con la siguiente estructura:
	 *    {
	 *       valid: <true o false dependiendo de si las categorías de la combinación son compatibles>
	 *       cats: <Si la combinación es válida, la lista de categorías y sus valores. null si las categorías de la combinación no son compatibles>
	 *    }
	 */
	checkCategoryCompatibility: function() {
		var combinationIsValid = true;
		var cats = {};
		for (var g = 0; g < this.groups.length; g++) {
			var group = this.groups[g];

			// Selecciona la capa activa de este grupo.
			var layer = group.layers[group.currentLayer];

			// Comprueba si las categorías de esta capa son compatibles con las de capas anteriores.
			for (var catTitle in layer.cats) {
				var catValue = layer.cats[catTitle];
				if (catTitle in cats && cats[catTitle] != catValue) {
					// La capa no es válida, así que la combinación tampoco. Termina devolviendo null.
					combinationIsValid = false;
					break;
				}
			}

			// No sigue iterando los grupos.
			if (!combinationIsValid) {
				break;
			}

			// Si la imagen es válida, añade las nuevas categorías.
			for (var catTitle in layer.cats) {
				if (!(catTitle in cats)) {
					cats[catTitle] = layer.cats[catTitle];
				}
			}

		}

		return {
			valid: combinationIsValid,
			cats: combinationIsValid ? cats : null
		};

	},

	countCombinations: function() {
		var result = 1;
		for (var g = 0; g < this.numGroups; g++) {
			var group = this.groups[g];
			result *= group.layers.length;
		}
		return result;
	},

	countValidCombinations: function() {
		this.reset();
		var count = 0;

		do {
			if (this.checkCategoryCompatibility().valid) {
				count++;
			}
		} while (this.increment());

		return count;
	},

	getCurrentLayer: function(groupIndex) {
		return this.groups[groupIndex].currentLayer;
	},

	incrementGroup: function(groupIndex) {
		if (groupIndex < 0) {
			return false;
		}

		if (this.groups[groupIndex].currentLayer >= this.groups[groupIndex].layers.length - 1) {
			this.groups[groupIndex].currentLayer = 0;
			return this.incrementGroup(groupIndex - 1);
		}

		this.groups[groupIndex].currentLayer++;
		return true;
	},

	/**
	 * Incrementa el contador de capas mientras haya capas disponibles.
	 * @returns true si pudo incrementar, false en otro caso.
	 */
	increment: function() {
		return this.incrementGroup(this.numGroups - 1);
	},

	/**
	 * Establece una capa activa al azar en cada grupo, respetando los pesos indicados en el nombre
	 * de cada capa (entre corchetes).
	 */
	setRandom: function() {

		for (var g = 0; g < this.numGroups; g++) {
			var group = this.groups[g];

			// Obtén el total de pesos.
			var totalWeight = 0;
			for (var l = 0; l < group.layers.length; l++) {
				totalWeight += group.layers[l].weight;
			}

			// Generar un número aleatorio entre 0 y el total de pesos
			var randNum = Math.random() * totalWeight;

			// Recorrer la lista de objetos
			var accumulated = 0;
			for (var l = 0; l < group.layers.length; l++) {
				accumulated += group.layers[l].weight;
				if (accumulated >= randNum) {
					group.currentLayer = l;
					break;
				}
			}
		}
	},

	setRandomNoRepeat: function() {
		var attempts = 0;

		do {
			this.setRandom();
			attempts++;

			// Anota en un log para evitar repetir.
			var newCombinationFound = false;
			var hash = this.toHash();
			if (!new ArrayExt(this.randomGeneratedLog).contains(hash)) {
				newCombinationFound = true;
				if (this.checkCategoryCompatibility().valid) {
					this.randomGeneratedLog.push(hash);
				}
			}
		} while (!newCombinationFound && attempts < this.maxRandomAttempts);

		if (!newCombinationFound && attempts >= this.maxRandomAttempts) {
			return false;
		}
		return true;
	},

	toString: function() {
		var groupStrs = [];
		for (var g = 0; g < this.groups.length; g++) {
			var group = this.groups[g];
			groupStrs.push(group.groupName + ": " + group.currentLayer + "/" + group.layers.length);
		}
		return groupStrs.join(", ");
	},

	toHash: function() {
		var groupStrs = [];
		for (var g = 0; g < this.groups.length; g++) {
			var group = this.groups[g];
			groupStrs.push(group.currentLayer);
		}
		return groupStrs.join(", ");
	}

};
