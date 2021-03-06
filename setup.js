var soundFiles = [], sounds = [], editing = true, soundDirectory;
let db;
const request = indexedDB.open("Database");
request.onsuccess = event=>{
	db=event.target.result;
	db.onerror = e => console.error("Database error: " + e.target.errorCode)
}
request.onupgradeneeded = event => {
	db = event.target.result;
	const objectStore = db.createObjectStore("directory", {autoIncrement: true})
	objectStore.transaction.oncomplete = e => {
		const directoryObjectStore = db.transaction("directory", "readwrite").objectStore("directory");
		directoryObjectStore.add(undefined);
	}
}
async function saveSounds(saveData = JSON.stringify(sounds)) {
	saveFile = await soundDirectory.getFileHandle("sounds.json", { create: true })
	fileWrite = await saveFile.createWritable()
	await fileWrite.write(saveData)
	await fileWrite.close()
	editing = false;
	loadSounds();
}
function saveButtonClick() {
	document.getElementById('saveStatus').innerHTML = 'Saving...';
	document.getElementById("saveAllButton").disabled = true;
	document.body.classList.add("saving")
	saveSounds().then(() => {
		document.getElementById('saveStatus').innerHTML = 'Done!';
		document.getElementById("saveAllButton").disabled = false;
		document.body.classList.remove("saving")
	})
}
function editSounds() {
	editing = true;
	loadSounds(["edit"]);
}
function editSingleSound(sound) {
	sound.elem.replaceWith(sound.createTableRow(document.getElementById("soundTBody"), true))
	addActions(sound.elem, ["edit"]);
}
async function loadJSON() {
	var savedSounds = await saveFile.text().then(e => JSON.parse(e, (key, val) => !isNaN(key) && !Array.isArray(val) ? Object.assign(new Sound(), val) : val))
	//Parses JSON data while replacing replacing object literals with Sounds
	savedSounds = savedSounds.filter((e, i) => sounds.map(e => e.file.name).includes(e.file))
	for (var i of savedSounds) {
		i.file = await (await soundDirectory.getFileHandle(i.file)).getFile();
	}
	sounds.map((e, i) => {
		if (!savedSounds.map(a => a.file.name).includes(e.file.name)) {
			savedSounds.push(e)
		}
	})
	sounds = savedSounds
}
function loadSounds(blockActions) {
	var table = document.getElementById("soundTBody")
	for (var i in sounds) {
		var row = sounds[i].createTableRow(table, editing)
		if (table.children[i]) {
			table.children[i].replaceWith(row)
		} else {
			table.appendChild(row)
		}
		addActions(row, blockActions)
	}
}
function startRearrange(sound) {
	alert(`Click on a row to put ${sound.name} below, or click on the rearrange button again to cancel`)
	sound.elem.classList.add("reArring")
	sound.elem.querySelector(".reArrButton").classList.add("active")
	document.querySelectorAll("button:not(.active)").forEach(e=>e.disabled=true)
	document.querySelector("table").classList.add("reArr")
	document.querySelectorAll("tr").forEach(e => e.onmousedown = function (event) {
		if (event.path.some(e => e.matches && (e.matches("button") || e.matches(".reArring")))) {
			return;
		}
		var fromIndex = sound.elem.rowIndex - 1
		var toIndex = event.path.find(e => e.tagName == "TR").rowIndex
		if(toIndex>fromIndex){
			toIndex--
		}
		sounds.splice(toIndex, 0, sounds.splice(fromIndex, 1)[0]);
		endRearrange();
	})
}
function endRearrange() {
	document.querySelector(".reArrButton.active").classList.remove("active");
	document.querySelectorAll("button").forEach(e=>e.disabled = false);
	document.querySelector("tr.reArring").classList.remove("reArring")
	document.querySelector("table").classList.remove("reArr");
	document.querySelectorAll("tr").forEach(e => e.onmousedown = null);
	saveSounds();
}
function addActions(elem, blockActions = []) {
	var cell = document.createElement("td");
	cell.prop = "actions";
	cell.setAttribute("prop", "actions");
	if (elem.querySelector("[prop=actions]")) {
		elem.replaceChild(cell, elem.querySelector("[prop=actions]"))
	} else {
		elem.appendChild(cell)
	}
	function addResetButton() {
		var resetButton = cell.appendChild(document.createElement("button"))
		resetButton.classList.add("resetButton")
		resetButton.title = "Reset to saved values"
		resetButton.innerText = "↺"
		resetButton.onclick = e => {
			var sound = e.target.parentElement.parentElement.sound;
			sound.elem.replaceWith(sound.createTableRow(document.getElementById("soundTBody")));
			addActions(sound.elem);
		}
	}
	function addEditButton() {
		var editButton = cell.appendChild(document.createElement("button"))
		editButton.classList.add("editButton")
		editButton.title = "Edit"
		editButton.innerText = "🖉"
		editButton.onclick = e => editSingleSound(e.target.parentElement.parentElement.sound)
	}
	function addSaveButton() {
		var saveButton = cell.appendChild(document.createElement("button"))
		saveButton.classList.add("saveButton")
		saveButton.title = "Save"
		saveButton.innerText = "🖫"
		saveButton.onclick = () => saveButtonClick()
	}
	function addVolumeMirrorButton() {
		var volumeMirrorButton = cell.appendChild(document.createElement("button"))
		volumeMirrorButton.classList.add("volumeMirrorButton")
		volumeMirrorButton.title = "Save current volume"
		volumeMirrorButton.innerText = "🕪🖫"
		volumeMirrorButton.onclick = e => { e.target.parentElement.parentElement.sound.setProp("volume", e.target.parentElement.parentElement.sound.audioElem.volume * 100); if (!editing) { saveButtonClick() } }
	}
	function addSoundVolumeMirrorButton() {
		var soundVolumeMirrorButton = cell.appendChild(document.createElement("button"))
		soundVolumeMirrorButton.classList.add("soundVolumeMirrorButton")
		soundVolumeMirrorButton.title = "Set current volume to saved volume"
		soundVolumeMirrorButton.innerText = "🖫 → 🕪"
		soundVolumeMirrorButton.onclick = e => e.target.parentElement.parentElement.sound.audioElem.volume = e.target.parentElement.parentElement.sound.volume / 100;
	}
	function addStartMirrorButton() {
		var startMirrorButton = cell.appendChild(document.createElement("button"))
		startMirrorButton.classList.add("startMirrorButton")
		startMirrorButton.title = "Save current time"
		startMirrorButton.innerText = "◷🖫"
		startMirrorButton.onclick = e => { e.target.parentElement.parentElement.sound.setProp("start", e.target.parentElement.parentElement.sound.audioElem.currentTime); if (!editing) { saveButtonClick() } }
	}
	function addTimeMirrorButton() {
		var timeMirrorButton = cell.appendChild(document.createElement("button"))
		timeMirrorButton.classList.add("timeMirrorButton")
		timeMirrorButton.title = "Set audio time to saved time"
		timeMirrorButton.innerText = "🖫 → ◷"
		timeMirrorButton.onclick = e => e.target.parentElement.parentElement.sound.audioElem.currentTime = e.target.parentElement.parentElement.sound.start;
	}
	function addDeleteButton() {
		var deleteButton = cell.appendChild(document.createElement("button"))
		deleteButton.classList.add("deleteButton")
		deleteButton.title = "Delete this sound effect"
		deleteButton.innerText = "🗑"
		deleteButton.onclick = e => { if (confirm(`Are you sure you want to delete ${elem.sound.name}?`)) { deleteSound(elem.sound) } };
	}
	function addReArrButton() {
		var reArrButton = cell.appendChild(document.createElement("button"))
		reArrButton.classList.add("reArrButton")
		reArrButton.title = "Rearrange this row"
		reArrButton.innerText = "⇅"
		reArrButton.onclick = e => e.target.classList.contains("active")?endRearrange():startRearrange(elem.sound)
	}
	if (!blockActions.includes("reset")) {
		addResetButton()
	}
	if (!blockActions.includes("edit")) {
		addEditButton()
	}
	if (!blockActions.includes("save")) {
		addSaveButton()
	}
	if (!blockActions.includes("volumeMirror")) {
		addVolumeMirrorButton()
	}
	if (!blockActions.includes("soundVolumeMirror")) {
		addSoundVolumeMirrorButton()
	}
	if (!blockActions.includes("startMirror")) {
		addStartMirrorButton()
	}
	if (!blockActions.includes("timeMirror")) {
		addTimeMirrorButton()
	}
	if (!blockActions.includes("reArr")) {
		addReArrButton()
	}
	if (!blockActions.includes("delete")) {
		addDeleteButton()
	}
}
async function openDir() {
	startDir = "desktop";
	var objectStore = db.transaction(["directory"], "readonly").objectStore("directory");
	const request = objectStore.get(1)
	request.onsuccess = async event => {
		if (event.target.result != undefined) {
			startDir = event.target.result
		}
		soundDirectory = await window.showDirectoryPicker({ id: "sounds", mode: "readwrite", startIn: startDir });
		objectStore = db.transaction(["directory"], "readwrite").objectStore("directory");
		const requestUpdate = objectStore.put(soundDirectory, 1)
		requestUpdate.onsuccess = e => openFiles();
	}
}
async function openFiles() {
	document.getElementById("openFilesButton").classList.remove("unopened");
	if (await soundDirectory.queryPermission({ mode: "readwrite" }) != "granted") {
		await soundDirectory.requestPermission({ mode: "readwrite" })
	}
	for await (i of soundDirectory.values()) {
		await i.getFile().then(e => e.type.startsWith("audio") ? sounds.push(new Sound(e, e.name)) : e.type == "application/json" ? saveFile = e : e)
		//if file is not JSON, add it to sound file directory, otherwise store it in config var
	}
	if (typeof saveFile !== "undefined") {
		await loadJSON()
		editing = false;
	} else {
		await saveSounds()
		editing = true;
	}
	return loadSounds()
}
async function uploadFile() {
	document.getElementById("uploadFileButton").disabled = true;
	newFiles = await window.showOpenFilePicker({ multiple: true });
	for (i in newFiles) {
		newFiles[i] = await newFiles[i].getFile()
		if (!sounds.some(e => e.file.name == newFiles[i].name)) {
			var newFileHandle = await soundDirectory.getFileHandle(newFiles[i].name, { create: true })
			var newFileWritable = await newFileHandle.createWritable()
			await newFileWritable.write(newFiles[i])
			await newFileWritable.close()
		}
		newFiles[i] = new Sound(newFiles[i])
	}
	sounds = sounds.concat(newFiles);
	saveSounds()
	document.getElementById("uploadFileButton").disabled = false;
}
async function deleteSound(sound) {
	await soundDirectory.removeEntry(sound.file.name)
	sound.elem.remove()
	sounds.splice(sounds.indexOf(sound), 1)
	saveSounds()
}