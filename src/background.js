/// <reference path="vsdoc/utils-1.3-vsdoc.js" />
/// <reference path="vsdoc/chrome-vsdoc.js" />
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

	chrome.tabs.create({
		url: 'http://www.reddit.com/'
	}, function (tab) {

		chrome.tabs.onUpdated.addListener(function (tabId, info) {

			if (info.status == "complete") {

				if (tabId == tab.id) {
					UTILS.Tab.toImage(null, "inject/Tab.toImage.js", null).addEventListener('EVENT_COMPLETE', function (img) {
						chrome.tabs.remove(tab.id);
						msg.ResponseFunc({
							Data: { img: img }
						});

					});

				}
			}
		});

	});

});