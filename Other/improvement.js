// a key map of allowed keys
var allowedKeys = {
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
  65: 'a',
  66: 'b'
};

// the 'official' Konami Code sequence
var konamiCode = ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right', 'b', 'a'];

// a variable to remember the 'position' the user has reached so far.
var konamiCodePosition = 0;

// add keydown event listener
document.addEventListener('keydown', function(e) {
  // get the value of the key code from the key map
  var key = allowedKeys[e.keyCode];
  // get the value of the required key from the konami code
  var requiredKey = konamiCode[konamiCodePosition];

  // compare the key with the required key
  if (key == requiredKey) {

    // move to the next key in the konami code sequence
    konamiCodePosition++;

    // if the last key is reached, activate cheats
    if (konamiCodePosition == konamiCode.length) {
      whaphamFloat();
      konamiCodePosition = 0;
    }
  } else {
    konamiCodePosition = 0;
  }
});
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


var currentStyle = "styles.css";
async function whaphamFloat() {
  if(document.getElementById("whapham")){
    var whapham = document.getElementById("whapham")
  }else{
    var whapham = document.body.appendChild(document.createElement("img"));
    whapham.id = "whapham"
    whapham.classList.add("whapham")
    whapham.onclick = () => swapStyleSheet();
  }
  if(currentStyle == "styles.css") {
	  whapham.src = "Other/images/whapham_head.png";
  } else if (currentStyle == "whapham.css") {
	  whapham.src = "Other/images/flaming_text.gif";
  }
  whapham.style.display = "block";
  whapham.className = "whapham";
  await sleep(3000);
  whapham.className = "";
  whapham.style.display = "none";
 }
 
document.onkeyup=function(e){
  if(!e.altKey){
    return false;
  }
  var audio = new Audio();
	if(e.key=="w") {
    audio.src = "Other/SlideWhistleDown.wav"
	}
  if(e.key=="s") {
    audio.src = "Other/SlideWhistleUp.wav";
  }
  audio.play();
  return true;
}