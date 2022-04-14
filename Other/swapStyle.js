 function swapStyleSheet() {
	if(currentStyle == "styles.css") {
		if(document.getElementById("whaphamStyle")){
			document.getElementById("whaphamStyle").disabled = false;
		}else{
			var whaphamStyle = document.head.appendChild(document.createElement("link"))
			whaphamStyle.id = "whaphamStyle"
			whaphamStyle.rel= "stylesheet"
			whaphamStyle.href = "Other/whapham.css"
		}
		currentStyle = "whapham.css"
	} else if(currentStyle == "whapham.css") {
		document.getElementById("whaphamStyle").disabled = true;
		currentStyle = "styles.css"
	}
}