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

			// Extrae el peso de cada capa.
			var layerWeights = [];
			for (var l = 0; l < psGroup.layers.length; l++) {
				var layer = psGroup.layers[l];
				var layerName = layer.name;
				var weightStr = new LayerName(layerName).extractBracketsContent(layerName);
				var weight = weightStr == null ? 1 : parseInt(weightStr);
				layerWeights.push(weight);
			}

			this.groups[g] = {
				groupName: psGroups[g].name,
				currentLayer: 0,
				numLayers: psGroups[g].layers.length,
				layerWeights: layerWeights
			}
		}
	},

	reset: function() {
		for (var g = 0; g < this.numGroups; g++) {
			this.groups[g].currentLayer = 0;
		}
	},

	countCombinations: function() {
		this.reset();
		var count = 0;
		while (this.increment()) count ++;
		return count;
	},

	getCurrentLayer: function(groupIndex) {
		return this.groups[groupIndex].currentLayer;
	},

	incrementGroup: function(groupIndex) {
		if (groupIndex < 0) {
			return false;
		} 

		if (this.groups[groupIndex].currentLayer >= this.groups[groupIndex].numLayers - 1) {
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
			for (var l = 0; l < group.numLayers; l++) {
				totalWeight += group.layerWeights[l];
			}

			// Generar un número aleatorio entre 0 y el total de pesos
			var randNum = Math.random() * totalWeight;

			// Recorrer la lista de objetos
			var accumulated = 0;
			for (var l = 0; l < group.numLayers; l++) {
				accumulated += group.layerWeights[l];
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
			var hash = this.toString();
			if (!new ArrayExt(this.randomGeneratedLog).contains(hash)) {
				newCombinationFound = true;
				this.randomGeneratedLog.push(hash);
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
			var groupState = this.groups[g];
			groupStrs.push(groupState.groupName + ": " + groupState.currentLayer + "/" + groupState.numLayers);
		}
		return groupStrs.join(", ");
	}

};
