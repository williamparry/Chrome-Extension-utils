// http://stackoverflow.com/questions/10473932/browser-html-force-download-of-image-from-src-dataimage-jpegbase64
function downloadURI(uri) {

	// atob to base64_decode the data-URI
	var image_data = atob(uri.split(',')[1]);
	// Use typed arrays to convert the binary data to a Blob
	var arraybuffer = new ArrayBuffer(image_data.length);
	var view = new Uint8Array(arraybuffer);
	for (var i=0; i<image_data.length; i++) {
		view[i] = image_data.charCodeAt(i) & 0xff;
	}
	var blob = new Blob([arraybuffer], {type: 'application/octet-stream'});


	// Use the URL object to create a temporary URL
	var url = window.URL.createObjectURL(blob);
	
	var iframe = document.createElement("iframe");
	
	iframe.src = url;
	
	document.body.appendChild(iframe);
	
	setTimeout(function() {
		document.body.removeChild(iframe);
	}, 1000);

}


var portMessenger = new UTILS.PortMessenger(),
	requestMessenger = new UTILS.RequestMessenger();

// ------------------------------------------------------------------
// Port Messenger
// ------------------------------------------------------------------

portMessenger.addEventListener("connectTestPort.CONNECT", function(portName) {
	portMessenger.sendMessage("connectTestPort", {
		Name: "Connect",
		Data: true
	});
});

portMessenger.addEventListener("disconnectTestPort.CONNECT", function(portName) {
	portMessenger.sendMessage("disconnectTestPort", {
		Name: "Disconnect",
		Data: portMessenger.getConnectedPorts("connectTestPort")
	});
});

portMessenger.addEventListener("messageBackgroundTestPort.doTest", function(msg) {
	portMessenger.sendMessage("messageBackgroundTestPort", {
		Name: "Message",
		Data: msg + " polo"
	});
})

// ------------------------------------------------------------------
// Request Messenger
// ------------------------------------------------------------------

requestMessenger.addEventListener("doRequestTest", function(msg) {
	msg.ResponseFunc({
		Name: "Message",
		Data: msg.Data + " polo"
	});
});


// ------------------------------------------------------------------
// Proxy for Tab
// ------------------------------------------------------------------

requestMessenger.addEventListener("doTabToImage", function (msg) {
	
	chrome.tabs.getCurrent(function(tab) {
	
		UTILS.Tab.toImage(null, "inject/Tab.toImage.js", null).addEventListener('EVENT_COMPLETE', function (img) {
		
			downloadURI(img);

		});
	
	});
	
});