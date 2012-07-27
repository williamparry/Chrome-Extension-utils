// ------------------------------------------------------------------
// Event Dispatcher
// ------------------------------------------------------------------

module("Event Dispatcher");

test("Get Listeners", function() {

	expect(1);

	var evtD = new UTILS.EventDispatcher(['EVENT']);

	evtD.addEventListener(evtD.EVENT, function() {});
	evtD.addEventListener(evtD.EVENT, function() {});

	ok(evtD.getListeners(evtD.EVENT).length == 2);

});


test("Add one function to multiple events", function() {

	expect(2);

	var evtD = new UTILS.EventDispatcher(['EVENT_1', 'EVENT_2']);

	evtD.addEventListener([evtD.EVENT_1, evtD.EVENT_2], function(e) {
		ok(true, "Event called");
	});
	
	evtD.dispatchEvent(evtD.EVENT_1);
	evtD.dispatchEvent(evtD.EVENT_2);

});

test("Dispatch single event", function() {

	expect(2);

	var evtD = new UTILS.EventDispatcher(['EVENT']);
	evtD.addEventListener(evtD.EVENT, function(e) {
		ok(true, "Event called");
		ok(e == "test", "Event data is correct");
	});
	evtD.dispatchEvent(evtD.EVENT, "test");

});

test("Dispatch multiple events", function() {

	expect(2);

	var evtD = new UTILS.EventDispatcher(['EVENT_1', 'EVENT_2']);
	evtD.addEventListener(evtD.EVENT_1, function() {
			ok(true, "Event 1 called");
		})
		.addEventListener(evtD.EVENT_2, function() {
			ok(true, "Event 2 called");
		})
	evtD.dispatchEvent(evtD.EVENT_1);
	evtD.dispatchEvent(evtD.EVENT_2);
});

test("Remove single event", function() {

	expect(0);

	var evtD = new UTILS.EventDispatcher(['EVENT']),
		func = function() {
			ok(false, "Event should have been removed");
		}

	evtD.addEventListener(evtD.EVENT, func);
	evtD.removeEventListener(evtD.EVENT, func)
	evtD.dispatchEvent(evtD.EVENT);

});

test("Remove all events", function() {

	expect(1);

	var evtD = new UTILS.EventDispatcher(['EVENT_1', 'EVENT_2']);

	evtD.addEventListener(evtD.EVENT_1, function() {});
	evtD.addEventListener(evtD.EVENT_2, function() {});
	evtD.removeAllEventListeners();

	ok(evtD.getListeners().length == 0, "Events removed");

});

// ------------------------------------------------------------------
// Local Store Data Access Layer
// ------------------------------------------------------------------

module("Local Store Data Access Layer");

test("LocalStoreDAL", function() {

	var DAL = new UTILS.LocalStoreDAL("TestDAL", {
		a: {
			b: {
				c: 5
			}
		}
	});
	
	// get set

	ok(DAL.get("a.b.c") == 5, "Default model setting");

	DAL.set("a.b.c", 6);

	ok(DAL.get("a.b.c") == 6, "Nested object setting string");

	DAL.set("a.b.c", {d: 7});

	ok(DAL.get("a.b.c.d") == 7, "Nested object setting object");

	DAL.set("a.b", {c: 5});

	ok(DAL.get("a.b.c") == 5, "Resetting nested object");

	// reset

	DAL.reset({b: 5});

	ok(DAL.get('b') == 5, "Reset with model");

	DAL.reset();

	ok(DAL.get('b') == null, "Reset with no model");

	// delete

	DAL.delete();

	ok(localStorage["TestDAL"] == null, "Delete");

});


// ------------------------------------------------------------------
// Port Messenger
// ------------------------------------------------------------------

module("Port Messenger");

asyncTest("Connect", function() {
	
	expect(1);

	var connectTestPort = chrome.extension.connect({ name: "connectTestPort" });
	connectTestPort.onMessage.addListener(function (msg) {	
		ok(true, "Connect");
		connectTestPort.disconnect();
		start();
	});


});

asyncTest("Disconnect", function() {
	
	expect(1);

	// Test that the port before disconnected

	var disconnectTestPort = chrome.extension.connect({ name: "disconnectTestPort" });

	disconnectTestPort.onMessage.addListener(function (msg) {
		ok(msg.Data.length == 0, "Disconnect");
		disconnectTestPort.disconnect();
		start();
	});


});


asyncTest("Message background page", function() {
	
	expect(1);

	// Test that the port before disconnected

	var messageBackgroundTestPort = chrome.extension.connect({ name: "messageBackgroundTestPort" });

	messageBackgroundTestPort.onMessage.addListener(function (msg) {
		ok(msg.Data == "marco polo", "Message reciprocated");
		messageBackgroundTestPort.disconnect();
		start();
	});

	messageBackgroundTestPort.postMessage({CMD: "doTest", Data: "marco"})

});

// ------------------------------------------------------------------
// Request Messenger
// ------------------------------------------------------------------

module("Request Messenger");

asyncTest("Send and receive", function() {

	expect(1);

	chrome.extension.sendRequest({
		CMD: "doRequestTest",
		Data: "marco"
	}, function(msg) {
		ok(msg.Data == "marco polo", "Message reciprocated");
		start();
	});

});


// ------------------------------------------------------------------
// DOM tools
// ------------------------------------------------------------------

module("DOM tools");

test("Select by id", function() {

	expect(1);

	ok(UTILS.DOM.id("idTest").innerHTML === "idTest");

});

test("Select by query global", function() {

	expect(1);

	ok(UTILS.DOM.sel("div[role='banner'] .selTestContent")[0].innerHTML === "selTest");

});

test("Select by query contextual", function() {

	expect(1);

	ok(UTILS.DOM.sel(".selTestContent", UTILS.DOM.id("selTest"))[0].innerHTML === "selTest");

});

test("Create element", function() {

	expect(1);
	
	ok(UTILS.DOM.create("div").nodeName === "DIV");

});
