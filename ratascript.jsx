//@include "./lib/json2.js"

function main() {

	var MAX_ITERATIONS = 10000;

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

	function getFolder(_name) {
		var path = app.activeDocument.path;
		var folder = new Folder(path + "/" + _name);
		if (!folder.exists) {
			folder.create();
		}
		return folder;
	}

	function saveImage(_name) {
		var saveFile = new File(getFolder("build/images") + "/" + _name + ".png");
		exportOptions = new ExportOptionsSaveForWeb();
		exportOptions.format = SaveDocumentType.PNG;
		exportOptions.PNG24 = false;
		exportOptions.transparency = true;
		exportOptions.interlaced = false;
		app.activeDocument.exportDocument(
			saveFile,
			ExportType.SAVEFORWEB,
			exportOptions
		);
	}

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
	function extractCats(layerName) {
		var cats = {};
		var nameCats = layerName.split("#").pop().split("|");
		for (var i = 0; i < nameCats.length; i++) {
			var nameCat = nameCats[i];
			var nameCatParts = nameCat.split(":");
			cats[nameCatParts[0]] = nameCatParts[1];

		}
		
		return cats;
	}


	// --------------------------------------------

	// var continueConfirmation = confirm(
	//   "You are about to use the Ratascript art generator. Are you sure you want to continue?"
	// );

	//var name = prompt("What is the name of your collection?", "my-collection");
	var collectionName = "ratas";

	$.writeln("Generando ratas: " + collectionName);

	var groups = app.activeDocument.layerSets;

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

		getCurrentLayer: function(groupIndex) {
			return this.groupStates[groupIndex].currentLayer;
		},

		incrementGroup: function(groupIndex) {
			if (groupIndex < 0) {
				return false;
			} 

			if (this.groupStates[groupIndex].currentLayer >= this.groupStates[groupIndex].numLayers - 1) {
				this.groupStates[groupIndex].currentLayer = 0;
				return this.incrementGroup(groupIndex - 1);
			} 

			this.groupStates[groupIndex].currentLayer++;
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

	var iterationCounter = 0;
	var imageCounter = 0;

	// Cada iteración genera una imagen.
	do {
		$.writeln("----------------------");
		$.writeln("Iniciando nueva imagen");

		var combinationIsValid = true;

		if (iterationCounter++ > MAX_ITERATIONS) {
			break;
		}

		$.writeln(layerCounter.toString());

		// Itera los grupos para comprobar si la combinación de capas es válida. Será válida si las categorías de todas las capas son compatibles.
		var cats = {};
		for (var g = 0; g < groups.length; g++) {
			var group = groups[g];

			// Selecciona la capa activa de este grupo.
			var layerIndex = layerCounter.getCurrentLayer(g)
			var layer = group.layers[layerIndex];
			
			// Comprueba si las categorías de esta capa son compatibles con las de capas anteriores.
			var layerCats = extractCats(layer.name);
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

		$.writeln("Categorías de la imagen: " + JSON.stringify(cats));
		$.writeln("Imagen válida: " + (combinationIsValid ? "sí" : "no"));

		if (!combinationIsValid) {
			continue;
		}
		
		// Resetea los grupos e itera activar solo la capa activa de cada grupo. 
		resetLayers(groups);
		for (var g = 0; g < groups.length; g++) {
			var group = groups[g];
			var layerIndex = layerCounter.getCurrentLayer(g)
			var layer = group.layers[layerIndex];
			layer.visible = true;
		}
		
		imageCounter++;
		var imageName = collectionName + imageCounter;

		$.writeln("Guardando imagen: " + imageName);
		saveImage(imageName);
		

	} while (layerCounter.increment())

	return "Finished: " + collectionName;


}

main();