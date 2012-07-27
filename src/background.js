var portMessenger = new PortMessenger(),
	requestMessenger = new RequestMessenger();

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