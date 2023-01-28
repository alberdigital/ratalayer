function main() {

	var MAX_ITERATIONS = 10;

	/**
	 * Hace visibles todos los grupos y oculta todas las capas.
	 * @param _groups Los grupos de primer nivel del documento.
	 */
	function resetLayers(_groups) {
		for (var i = 0; i < _groups.length; i++) {
			_groups[i].visible = true;
			for (var j = 0; j < _groups[i].layers.length; j++) {
				_groups[i].layers[j].visible = false;
			}
		}
	}


	// --------------------------------------------

	// var continueConfirmation = confirm(
	//   "You are about to use the Ratascript art generator. Are you sure you want to continue?"
	// );

	//var name = prompt("What is the name of your collection?", "My collection");
	var name = "My collection";

	$.writeln("Generando ratas: " + name);

	var groups = app.activeDocument.layerSets;
	resetLayers(groups);

	// Un array en el que cada posición indica la capa iterada dentro de cada grupo.
	// Se inicializa con todas las posiciones a 0.
	var layerCounter = {
		numGroups: 0,
		groupStates: [],

		init: function(_groups) {
			this.numGroups = _groups.length;
			for (var g = 0; g < this.numGroups; g++) {
				this.groupStates[g] = {
					groupName: _groups[g].name,
					currentLayer: 0,
					numLayers: _groups[g].layers.length
				}
			}
		},

		incrementGroup: function(g) {
			if (g < 0) {
				return false;
			} 

			if (this.groupStates[g].currentLayer >= this.groupStates[g].numLayers - 1) {
				this.groupStates[g].currentLayer = 0;
				return this.incrementGroup(g - 1);
			} 

			this.groupStates[g].currentLayer++;
			return true;
		},

		/**
		 * Incrementa el contador de capas mientras haya capas disponibles.
		 * @returns true si pudo incrementar, false en otro caso.
		 */
		increment: function() {
			return this.incrementGroup(this.numGroups - 1);
		},

		toString: function() {
			var groupStrs = [];
			for (var g = 0; g < this.groupStates.length; g++) {
				var groupState = this.groupStates[g];
				groupStrs.push(groupState.groupName + ": " + groupState.currentLayer + "/" + groupState.numLayers);
			}
			return groupStrs.join(", ");
		}

	}

	layerCounter.init(groups);

	var securityCounter = 0;

	do {

		if (securityCounter++ > MAX_ITERATIONS) {
			break;
		}

		// Reinicia las categorías de esta imagen.
		var cats = {};

		$.writeln(layerCounter.toString());

		// // Itera los grupos para tomar una capa de cada grupo. 
		// for (var g = 0; g < groups.length; g++) {
		// 	var group = groups[g];
		// 	$.writeln(group.name);

		// 	// Incrementa la capa hasta llegara una válida.
		// 	var layerFound = false;
		// 	while (!layerFound) {

				
		// 		var layer = group.layers[layerCounter[g]]
		// 		if (true) { // TODO si la capa tiene las categorías válidas.
		// 			layerFound = true;
		// 			layer.visible = true
		// 		}
		// 	}

		// 	// // Itera las capas del grupo. Debe hacer visible una sola imagen de cada grupo.
		// 	// for (var l = 0; l < group.layers.length; l++) {
		// 	// 	var layer = group.layers[l];
		// 	// 	$.writeln("-" + layer.name);

		// 	// 	// Extrae las categorías (elementos del nombre, separados por "|" y con prefijo "<letra>:").
		// 	// 	var cats = layer.name.split("#").pop().split("|");
		// 	// 	$.writeln("#cats: " + cats.join(", "));
		// 	// }
		// }

	} while (layerCounter.increment())

	return "Finished: " + name;


}

main();