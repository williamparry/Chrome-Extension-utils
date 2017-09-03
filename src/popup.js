window.onload = function() {
	
	var tabToImage = document.getElementById("tab-to-image");
	var unitTests = document.getElementById("unit-tests");

	tabToImage.onclick = function() {
		
		chrome.extension.sendMessage({
			CMD: "doTabToImage"
		}, function (msg) {	
			
		});
		
	};

	unitTests.onclick = function() {

		window.open("main.html");
		
	};

}