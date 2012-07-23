// ------------------------------------------------------------------
// EventDispatcher
// ------------------------------------------------------------------

module("EventDispatcher");

test("Get Listeners", function() {

	expect(1);

	var evtD = new EventDispatcher(['EVENT']);

	evtD.addEventListener(evtD.EVENT, function() {});
	evtD.addEventListener(evtD.EVENT, function() {});

	ok(evtD.getListeners(evtD.EVENT).length == 2);

});


test("Add one function to multiple events", function() {

	expect(2);

	var evtD = new EventDispatcher(['EVENT_1', 'EVENT_2']);

	evtD.addEventListener([evtD.EVENT_1, evtD.EVENT_2], function(e) {
		ok(true, "Event called");
	});
	
	evtD.dispatchEvent(evtD.EVENT_1);
	evtD.dispatchEvent(evtD.EVENT_2);

});

test("Dispatch single event", function() {

	expect(2);

	var evtD = new EventDispatcher(['EVENT']);
	evtD.addEventListener(evtD.EVENT, function(e) {
		ok(true, "Event called");
		ok(e == "test", "Event data is correct");
	});
	evtD.dispatchEvent(evtD.EVENT, "test");

});

test("Dispatch multiple events", function() {

	expect(2);

	var evtD = new EventDispatcher(['EVENT_1', 'EVENT_2']);
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

	var evtD = new EventDispatcher(['EVENT']),
		func = function() {
			ok(false, "Event should have been removed");
		}

	evtD.addEventListener(evtD.EVENT, func);
	evtD.removeEventListener(evtD.EVENT, func)
	evtD.dispatchEvent(evtD.EVENT);

});

test("Remove all events", function() {

	expect(1);

	var evtD = new EventDispatcher(['EVENT_1', 'EVENT_2']);

	evtD.addEventListener(evtD.EVENT_1, function() {});
	evtD.addEventListener(evtD.EVENT_2, function() {});
	evtD.removeAllEventListeners();

	ok(evtD.getListeners().length == 0, "Events removed");

});

// ------------------------------------------------------------------
// LocalStoreDAL
// ------------------------------------------------------------------

module("LocalStoreDAL");

test("LocalStoreDAL", function() {

	var DAL = new LocalStoreDAL("TestDAL", {
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
// PortMessenger
// ------------------------------------------------------------------

module("PortMessenger");

var portMessenger = new PortMessenger(),
	testPort;

asyncTest("Connect", function() {
	
	expect(1);

	portMessenger.addListener("testPort", "onConnect", function() {
		alert('a');
		ok(true, "Connect");
		start();
	});

	testPort = chrome.extension.connect({ name: "testPort" });
	console.log(portMessenger)
	console.log(testPort)

});

test("Send and receive Message", function() {

});