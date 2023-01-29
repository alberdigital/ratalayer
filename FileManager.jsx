function FileManager(path) {
	this.path = path
}

FileManager.prototype = {

	getFolder: function(_name) {
		var folder = new Folder(this.path + "/" + _name);
		if (!folder.exists) {
			folder.create();
		}
		return folder;
	},

	saveImage: function(_collectionName, _fileName) {
		var saveFile = new File(this.getFolder("build/" + _collectionName + "/images") + "/" + _fileName + ".png");
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
	},

	saveMetadata: function(metadata) {
		var file = new File(this.getFolder("build/" + metadata.collectionName + "/metadata") + "/" + metadata.fileName + ".json");
		file.open("w");
		file.write(JSON.stringify(metadata));
		file.close();
	}
}