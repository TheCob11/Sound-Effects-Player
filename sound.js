class Sound {
	constructor(file, name = file ? file.name : "", page = 0, ref = "", volume = 100, start = 0, notes = "") {
		this.page = page
		this.ref = ref
		this.name = name
		this.file = file
		this.volume = volume
		this.start = start
		this.notes = notes
	}
	setProp(prop, val) {
		this[prop] = val
		if (this.elem) {
			if (this.input) {
				this.elem.querySelector(`[prop=${prop}] input`).value = this[prop];
			} else {
				this.elem.querySelector(`[prop=${prop}]`).innerText = this[prop];
			}
			if (prop == "volume") {
				this.audioElem.volume = this[prop] / 100
			}
			if (prop == "start" && this.audioElem.paused) {
				this.audioElem.currentTime = this[prop]
			}
		}
	}
	createTableRow(table, input = false) {
		this.elem = document.createElement("tr")
		this.elem.sound = this
		this.elem.classList.add("soundRow")
		this.input = input;
		for (var i of table.previousElementSibling.children[0].children) {
			var cell = this.elem.appendChild(document.createElement("td"))
			cell.prop = i.getAttribute("prop")
			cell.setAttribute("prop", cell.prop)
			if (cell.prop == "actions") {
				continue
			} else if (cell.prop == "currentVol") {
				cell.innerText = this.audioElem.volume * 100
				continue
			} else if (cell.prop == "currentTime") {
				cell.innerText = this.audioElem.currentTime
				continue
			} else if (cell.prop == "file") {
				if (this.audioElem) {
					cell.appendChild(this.audioElem)
					this.audioElem.load();
				} else {
					this.audioElem = cell.appendChild(document.createElement("audio"))
					this.audioElem.src = URL.createObjectURL(this.file)
					this.audioElem.controls = true
					this.audioElem.preload = "metadata"
					this.audioElem.load();
					this.audioElem.onloadedmetadata = () => {
						this.elem.querySelector("[prop =currentVol").innerText = this.audioElem.volume * 100;
						this.elem.querySelector("[prop=currentTime]").innerText = this.audioElem.currentTime;
						if (this.input) {
							this.elem.querySelector("[prop =start").firstElementChild.max = this.audioElem.duration;
							this.elem.querySelector("[prop =volume").firstElementChild.value = this.audioElem.volume * 100;
						};
					}
					this.audioElem.onvolumechange = () => {
						this.elem.querySelector("[prop=currentVol").innerText = this.audioElem.volume * 100;
					}
					this.audioElem.ontimeupdate = () => {
						this.elem.querySelector("[prop=currentTime]").innerText = this.audioElem.currentTime;
					}
				}
				this.audioElem.currentTime = this.start || 0;
				this.audioElem.volume = this.volume / 100;
			} else if (this.input) {
				var cellInput = cell.appendChild(document.createElement("input"))
				cellInput.value = this[cell.prop]
				if (typeof this[cell.prop] == "number") {
					cellInput.type = "number"
					cellInput.step = "any"
					if (cell.prop == "volume" || cell.prop == "start") {
						cellInput.min = 0;
						cellInput.max = 100;
						if (cell.prop == "start" && this.audioElem.readyState >= 1) {
							cellInput.max = this.audioElem.duration;
						}
					}
				}
				cellInput.oninput = e => {
					if (!e.target.validity.valid || !e.target.parentElement.prop) {
						return
					}
					var prop = e.target.parentElement.prop
					this[prop] = e.target.type == "number" ? e.target.valueAsNumber : e.target.value;
					if (prop == "volume") {
						this.audioElem.volume = this[prop] / 100;
					} else if (prop == "start" && this.audioElem.paused) {
						this.audioElem.currentTime = this[prop];
					}
				}
			} else {
				cell.innerText = this[cell.prop]
			}
		}
		this.audioElem.load();
		return this.elem
	}
	toJSON() {
		var reduced = {}
		for (i in this) {
			if (i == "file") {
				reduced[i] = this[i].name
			} else if (i == "elem" || i == "audioElem") {
				continue
			} else {
				reduced[i] = this[i]
			}
		}
		return reduced
	}
	async factorFade(factor = .95) {
		if (this.audioElem.readyState != 4) {
			return;
		}
		this.fadeFactor = factor;
		this.fadeStarted = Date.now();
		if(this.audioElem.paused){
			this.audioElem.play();
		}
		return new Promise(resolve => {
			this.fade = setInterval(() => {
				if (this.audioElem.volume <= .01) {
					this.audioElem.volume = 0;
					this.audioElem.pause()
					clearInterval(this.fade);
					resolve(Date.now() - this.fadeStarted);
				} else {
					this.audioElem.volume *= factor;
				}
			}, 50)
		})
	}
	async timeFade(time=4.5) {
		return await this.factorFade((.99 / (100 * this.audioElem.volume)) ** (50 / (1000 * time - 50)))
	}
}