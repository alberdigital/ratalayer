//@include "./lib/json2.js"
//@include "./ArrayExt.jsx"
//@include "./LayerName.jsx"
//@include "./FileManager.jsx"
//@include "./CombinationCounter.jsx"

(function() {

	var MAX_COMBINATIONS = 50000;
	var MAX_NOT_VALID_IN_A_ROW = 10000;

	/**
	 * Hace visibles todos los grupos y oculta todas las capas.
	 * @param _groups Los grupos de primer nivel del documento.
	 */
	function resetLayers(_groups) {
		$.writeln("Reset layers");
		for (var i = 0; i < _groups.length; i++) {
			_groups[i].visible = true;
			for (var j = 0; j < _groups[i].layers.length; j++) {
				if (_groups[i].layers[j].visible) {
					_groups[i].layers[j].visible = false;
				}
			}
		}
	}

	function formatNumber(num) {
		return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}

	function main() {

		// Diálogo de entrada.
		var groups = app.activeDocument.layerSets;

		var combinationCounter = new CombinationCounter();
		combinationCounter.init(groups);

		// If there are too many combinations to analyze, counting the number of valid combinations
		// would take too long. In that case, only inform the number of combinations.
		var combinationNum = combinationCounter.countCombinations();
		var combinationNumText, inDepthGenerationRadioText;

		if (combinationNum > MAX_COMBINATIONS) {
			combinationNumText = "There are " + formatNumber(combinationNum) + " combinations.";
			inDepthGenerationRadioText =  "In-depth generation (up to " + formatNumber(MAX_COMBINATIONS) + " combinations).";
		} else {
			var validCombinationNum = combinationCounter.countValidCombinations();
			inDepthGenerationRadioText =  "In-depth generation.";
			combinationNumText = "There are " + formatNumber(validCombinationNum) + " valid combinations."
		}

		var w = new Window("dialog", "New collection");
		w.alignChildren = "left";
		w.add("statictext", undefined, "Collection name:");
		var collectionNameInput = w.add("edittext", undefined, "my-collection");
		w.add("statictext", undefined, combinationNumText);

		var tabPanel = w.add("tabbedpanel");
		tabPanel.alignChildren = "left";

		var tabRandom = tabPanel.add("tab", undefined, "Random");
		tabRandom.alignChildren = "left";

		var numImagesGroup = tabRandom.add("group");
		numImagesGroup.orientation = "row";
		numImagesGroup.add("statictext", undefined, "Num. images:");
		var numImagesInput = numImagesGroup.add("edittext", undefined, "5");

		var tabDepth = tabPanel.add("tab", undefined, "In-depth");
		tabDepth.alignChildren = "left";

		var randomStartGroup = tabDepth.add("group");
		randomStartGroup.orientation = "row";
		var randomStartCheckbox = randomStartGroup.add("checkbox", undefined, "Random start");

		var maxImagesGroup = tabDepth.add("group");
		maxImagesGroup.orientation = "row";
		maxImagesGroup.add("statictext", undefined, "Max. images (empty to generate all):");
		var maxImagesInput = maxImagesGroup.add("edittext", undefined, "10");

		tabPanel.selection = 0;

		w.buttonGroup = w.add("group");
		w.buttonGroup.orientation = "row";
  		w.buttonGroup.add("button", undefined, "Ok");
  		var cancelButton = w.buttonGroup.add("button", undefined, "Cancel");

		// Define the behavior of the buttons.
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
		var doInDepthGeneration = tabPanel.selection.text == tabDepth.text;
		var maxImages = doInDepthGeneration
				? (maxImagesInput.text === "" ? null : parseInt(maxImagesInput.text))
				: (numImagesInput.text === "" ? 1 : parseInt(numImagesInput.text));
		var randomStart = randomStartCheckbox.value;

		$.writeln("Building collection: " + collectionName
				+ " | in-depth generation: " + (doInDepthGeneration ? "yes" : "no")
				+ " | max images: " + maxImages
				+ " | random start: " + (randomStart ? "yes" : "no"));

		// Inicialización.

		var fileManager = new FileManager(app.activeDocument.path);

		if (!doInDepthGeneration || randomStart) {
			combinationCounter.setRandomNoRepeat();
		}

		var imageCounter = 0;
		var notValidInARowCounter = 0;

		// Resetea los grupos, dejando todas las capas desactivadas.
		resetLayers(groups);

		// Cada iteración genera una imagen.
		do {
			$.writeln("----------------------");
			$.writeln("New combination");
			$.writeln(combinationCounter.toString());

			var combinationIsValid = combinationCounter.checkCategoryCompatibility();
			var cats = combinationCounter.getCategories();

			$.writeln("Combination categories: " + JSON.stringify(cats));
			$.writeln("Valid image? " + (combinationIsValid ? "yes" : "no"));

			if (combinationIsValid) {

				// Itera para activar solo la capa activa de cada grupo.
				$.writeln("Activating layers");
				for (var g = 0; g < groups.length; g++) {
					var group = groups[g];
					var layerIndex = combinationCounter.getCurrentLayer(g)
					var layer = group.layers[layerIndex];
					layer.visible = true;
				}

				imageCounter++;
				notValidInARowCounter = 0;

				// Guarda la imagen.
				var fileName = collectionName + imageCounter;
				$.writeln("Saving image: " + fileName);
				fileManager.saveImage(collectionName, fileName);

				// Desactiva solamente las capas que había activado, por eficiencia.
				$.writeln("Deactivating layers");
				for (var g = 0; g < groups.length; g++) {
					var group = groups[g];
					var layerIndex = combinationCounter.getCurrentLayer(g)
					var layer = group.layers[layerIndex];
					layer.visible = false;
				}

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

			} else {
				notValidInARowCounter++;
				if (notValidInARowCounter > MAX_NOT_VALID_IN_A_ROW) {
					alert("Too many attempts without finding any valid combinations (more than "
							+  formatNumber(MAX_NOT_VALID_IN_A_ROW) + ").")
					break;
				}
			}

			// Siguiente combinación.
			if (maxImages != null && imageCounter >= maxImages) {
				break;
			}

			if (doInDepthGeneration) {
				if (!combinationCounter.incrementOneValidCombination()) {
					break;
				}
			} else {
				var randomCombinationFound = combinationCounter.setRandomNoRepeat();
				if (!randomCombinationFound) {
					alert("Cannot find a new combination after " + combinationCounter.maxRandomAttempts + " attempts.");
					break;
				}
			}

		} while (true)

		return "Finished: " + collectionName;
	}

	return main();

})();