//@include "./lib/json2.js"
//@include "./ArrayExt.jsx"
//@include "./LayerName.jsx"
//@include "./FileManager.jsx"
//@include "./CombinationCounter.jsx"

(function() {

	var MAX_ITERATIONS = null;

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

	function main() {

		var fileManager = new FileManager(app.activeDocument.path);

		var groups = app.activeDocument.layerSets;

		var combinationCounter = new CombinationCounter();
		combinationCounter.init(groups);

		var collectionName = prompt("What is the name of your collection?", "collection");
		if (collectionName == null) {
			return 0;
		}

		var combinationNum = combinationCounter.countCombinations();
		var doCompleteTraversalStr = prompt("There are " + combinationNum + " combinations. Do you want to do a complete traversal (s/n)?", "n");
		if (doCompleteTraversalStr == null) {
			return 0;
		}
		var doCompleteTraversal = doCompleteTraversalStr.toUpperCase() == "S";

		var numberOfImagesRequired = 0;
		if (!doCompleteTraversal) {
			numberOfImagesRequired = prompt("How many random images do you want to generate?", 10);
			if (numberOfImagesRequired == null) {
				return 0;
			}
		}

		$.writeln("Building collection: " + collectionName);
	
		if (!doCompleteTraversal) {
			combinationCounter.setRandomNoRepeat();
		}

		var iterationCounter = 0;
		var imageCounter = 0;

		// Cada iteración genera una imagen.
		do {
			$.writeln("----------------------");
			$.writeln("New combination");

			var combinationIsValid = true;

			if (MAX_ITERATIONS != null && iterationCounter++ > MAX_ITERATIONS) {
				break;
			}

			$.writeln(combinationCounter.toString());

			// Itera los grupos para comprobar si la combinación de capas es válida. Será válida si las categorías de todas las capas son compatibles.
			var cats = {};
			for (var g = 0; g < groups.length; g++) {
				var group = groups[g];

				// Selecciona la capa activa de este grupo.
				var layerIndex = combinationCounter.getCurrentLayer(g)
				var layer = group.layers[layerIndex];
				
				// Comprueba si las categorías de esta capa son compatibles con las de capas anteriores.
				var layerCats = new LayerName(layer.name).extractCats();
				for (var catTitle in layerCats) {
					var catValue = layerCats[catTitle];
					if (catTitle in cats && cats[catTitle] != catValue) {
						// La capa no es válida, así que la imagen tampoco.
						combinationIsValid = false;
						break;
					}
				}

				// No sigue iterando los grupos.
				if (!combinationIsValid) {
					break;
				}

				// Si la imagen es válida, añade las nuevas categorías.
				for (var catTitle in layerCats) {
					if (!(catTitle in cats)) {
						cats[catTitle] = layerCats[catTitle];
					}
				}

			}

			$.writeln("Combination categories: " + JSON.stringify(cats));
			$.writeln("Valid image? " + (combinationIsValid ? "yes" : "no"));

			if (combinationIsValid) {

				// Resetea los grupos e itera para activar solo la capa activa de cada grupo. 
				resetLayers(groups);
				for (var g = 0; g < groups.length; g++) {
					var group = groups[g];
					var layerIndex = combinationCounter.getCurrentLayer(g)
					var layer = group.layers[layerIndex];
					layer.visible = true;
				}
				
				imageCounter++;

				// Guarda la imagen.
				var fileName = collectionName + imageCounter;
				$.writeln("Saving image: " + fileName);
				fileManager.saveImage(collectionName, fileName);

				// Genera metadatos.
				var layersNames = {};
				for (var g = 0; g < groups.length; g++) {
					var group = groups[g];
					var layerIndex = combinationCounter.getCurrentLayer(g)
					var layer = group.layers[layerIndex];
					layersNames[group.name] = layer.name
				}

				var metadata = {
					collectionName: collectionName,
					fileName: fileName,
					layers: layersNames,
					categories: cats
				};
				fileManager.saveMetadata(metadata);

			}
			
			// Siguiente combinación.
			var finished = false;
			if (doCompleteTraversal) {
				finished = !combinationCounter.increment();
			} else {
				var randomCombinationFound = combinationCounter.setRandomNoRepeat();
				if (!randomCombinationFound) {
					alert("Cannot find a new combination after " + combinationCounter.maxRandomAttempts + " attempts.");
				}
				finished = !randomCombinationFound || imageCounter == numberOfImagesRequired;
			}

		} while (!finished)

		return "Finished: " + collectionName;
	}

	return main();

})();