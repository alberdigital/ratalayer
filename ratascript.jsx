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

		// Diálogo de entrada.
		var groups = app.activeDocument.layerSets;

		var combinationCounter = new CombinationCounter();
		combinationCounter.init(groups);

		var combinationNum = combinationCounter.countCombinations();

		var w = new Window("dialog", "New collection");
		w.alignChildren = "left";
		w.add("statictext", undefined, "Collection name:");
		var collectionNameInput = w.add("edittext", undefined, "my-collection");
		w.add("statictext", undefined, "There are " + combinationNum + " combinations.");
		w.radioPnl = w.add("panel", undefined, "Generation type");
		w.radioPnl.alignChildren = "left";
		var randomRadio = w.radioPnl.add("radiobutton", undefined, "Only some random images");
		w.numImagesGroup = w.radioPnl.add("group");
		w.numImagesGroup.orientation = "row";
		w.numImagesGroup.add("statictext", undefined, "Num. images:");
		var numImagesInput = w.numImagesGroup.add("edittext", undefined, "5");
		var completeTravRadio = w.radioPnl.add("radiobutton", undefined, "Complete traversal");
		randomRadio.value = true;
		w.buttonGroup = w.add("group");
		w.buttonGroup.orientation = "row";
  		var okButton = w.buttonGroup.add("button", undefined, "Ok");
  		var cancelButton = w.buttonGroup.add("button", undefined, "Cancel");

		// Define the behavior of the buttons
		var startGeneration = true;
		cancelButton.onClick = function () {
			$.writeln("Cancel Button Pressed");
			w.close();
			startGeneration = false;
		}
		w.show();

		if (!startGeneration) {
			return 0;
		}

		var collectionName = collectionNameInput.text;
		var doCompleteTraversal = completeTravRadio.value;
		var numberOfImagesRequired = numImagesInput.text;

		$.writeln("Building collection: " + collectionName + " | complete traversal: " + (doCompleteTraversal ? "yes" : "no") + " | num. images: " + numberOfImagesRequired);
	
		// Inicialización.

		var fileManager = new FileManager(app.activeDocument.path);

		if (!doCompleteTraversal) {
			combinationCounter.setRandomNoRepeat();
		}

		var iterationCounter = 0;
		var imageCounter = 0;

		// Cada iteración genera una imagen.
		do {
			$.writeln("----------------------");
			$.writeln("New combination");

			if (MAX_ITERATIONS != null && iterationCounter++ > MAX_ITERATIONS) {
				break;
			}

			$.writeln(combinationCounter.toString());

			var categoryCompatibilityCheckResult = combinationCounter.checkCategoryCompatibility();
			var cats = categoryCompatibilityCheckResult.cats;
			var combinationIsValid = categoryCompatibilityCheckResult.valid;

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