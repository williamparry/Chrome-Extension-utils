var UTILS = {

    // ------------------------------------------------------------------
    // Object Helpers
    // ------------------------------------------------------------------

    OBJ: {

        updateByPath: function(obj, keyStr, value) {
            var keyPath = keyStr.split('.'),
            lastKeyIndex = keyPath.length - 1;
            for (var i = 0; i < lastKeyIndex; ++i) {
                key = keyPath[i];
                if (!(key in obj))
                    obj[key] = {}
                obj = obj[key];
            }
            obj[keyPath[lastKeyIndex]] = value;
        },

        getByPath: function (ob, key) {
            var path = key.split('.'),
                objTraversals = 0;

            function traverse(obj) {
                if (typeof obj == 'object') {
                    for (var y in obj) {
                        if (y == path[objTraversals]) {
                            if (objTraversals == path.length - 1) {
                                return obj[y];
                            } else {
                                objTraversals++;
                                return traverse(obj[y]);
                            }
                        }
                    }
                }
                return null;
            }

            for (var x in ob) {
                if (x == path[objTraversals]) {
                    if (objTraversals == path.length - 1) {
                        return ob[x] || "";
                    } else {
                        objTraversals++;
                        return traverse(ob[x]);
                    }
                }
            }
            return null;
        },

    },

    // ------------------------------------------------------------------
    // Array Helpers
    // ------------------------------------------------------------------

    ARRAY: {

        getIndexByObjectPropertyValue: function (arr, prop, val) {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] == val) {
                    return i;
                } else if (UTILS.OBJ.getByPath(arr[i], prop) == val) {
                    return i;
                }
            }
            return -1;
        }

    },

    // ------------------------------------------------------------------
    // DOM Helpers
    // ------------------------------------------------------------------

    DOM: {

        id: function (e) {
            return document.getElementById(e);
        },

        sel: function (q,c) {
            if(c) {
                return c.querySelectorAll(q)
            }
            return document.querySelectorAll(q);
        },

        create: function (e) {
            return document.createElement(e);
        }

    },

    // ------------------------------------------------------------------
    // Event Dispatcher
    // ------------------------------------------------------------------

    EventDispatcher: function(events) {
        var listeners = [];
        if (events) {
            for (var i = 0; i < events.length; i++) {
                this[events[i]] = events[i];
            }
        }
        this.getListeners = function (title) {
            return listeners[title] || [];
        }
        this.addEventListener = function (title, method, handler) {
            function add(title) {
                if (!listeners[title]) { listeners[title] = []; }
                listeners[title].push({ method: method, handler: handler });
            }
            if (typeof(title) == 'object' && title.length) {
                for(var i = 0; i < title.length; i++) {
                    add(title[i]);
                }
            } else {
                add(title);
            }
            return this;
        };
        this.removeEventListener = function (title, method) {
            if (listeners[title]) {
                for (var i = 0; i < listeners[title].length; i++) {
                    if (listeners[title][i].method == method) {
                        listeners[title].splice(i, 1);
                    }
                }
            }
            return this;
        };
        this.dispatchEvent = function (title, args) {
            if (listeners[title]) {
                for (var i = 0; i < listeners[title].length; i++) {
                    listeners[title][i].method(args);
                }
            }
            return this;
        };
        this.removeAllEventListeners = function () {
            listeners = [];
            return this;
        };
        this.removeEventListenersByHandler = function (title, handler) {
            if (listeners[title]) {
                for (var i = 0; i < listeners[title].length; i++) {
                    if (listeners[title][i].handler == handler) {
                        listeners[title].splice(i, 1);
                    }
                }
            }
            return this;
        };
        return this;
    },

    // ------------------------------------------------------------------
    // Port Messenger
    // ------------------------------------------------------------------

    PortMessenger: function () {

        // Cheating!
        this.__proto__ = new UTILS.EventDispatcher(["CONNECT", "DISCONNECT"]);

        var connectedPorts = {},
            self = this;

        function fmt(portName, cmd) {
            return portName + "." + cmd;
         }

        chrome.extension.onConnect.addListener(function (port) {
            
            // If there is no stored connections for that name
            // Construct an array
            if (!connectedPorts[port.name]) {
                connectedPorts[port.name] = [];
            }

            // Then push the port into the stored connections
            connectedPorts[port.name].push(port);

            // Listen to disconnect and remove from store
            port.onDisconnect.addListener(function () {
                var connectedArray = connectedPorts[port.name],
                connectedIndex = connectedArray.indexOf(port);
                if (connectedIndex !== -1) {
                    connectedArray.splice(connectedIndex, 1);
                    self.dispatchEvent(fmt(port.name, self.DISCONNECT), port.name);
                }
            });

            self.dispatchEvent(fmt(port.name, self.CONNECT), port.name);

            // 2 way

            port.onMessage.addListener(function(msg) {
                self.dispatchEvent(fmt(port.name, msg.CMD), msg.Data);
            })

        });

        this.getConnectedPorts = function(portName) {
            return connectedPorts[portName];
        }

        this.sendMessage = function (portName, message, currentTab) {

            if (connectedPorts[portName] && connectedPorts[portName].length > 0) {
                for (var i = 0; i < connectedPorts[portName].length; i++) {
                    var port = connectedPorts[portName][i];
                    if (currentTab) {
                        chrome.tabs.getSelected(null, function (tab) {
                            if (port.sender.tab && port.sender.tab.id && port.sender.tab.id === tab.id) {
                                port.postMessage(message);
                            }
                        })
                    } else {
                        port.postMessage(message);
                    }

                }
            }
        }
    },

    // ------------------------------------------------------------------
    // Request Messenger
    // ------------------------------------------------------------------

    RequestMessenger: function () {

        // Cheating!
        this.__proto__ = new UTILS.EventDispatcher();

        var self = this;

        chrome.extension.onRequest.addListener(function (msg, sender, responseFunc) {
            
            // Pass it on to the listener to deal with the response
            self.dispatchEvent(msg.CMD, {
                Data: msg.Data,
                Sender: sender,
                ResponseFunc: responseFunc
            })

        });
    },

    // ------------------------------------------------------------------
    // Local Store Data Access Layer
    // ------------------------------------------------------------------

    LocalStoreDAL: function (storage, defaultModel) {

        this.storage = storage;

        if (!localStorage[storage] || typeof localStorage[storage] == 'undefined') {
            localStorage[storage] = JSON.stringify(defaultModel || {});
        }

        this.set = function (key, val) {

            var localData = JSON.parse(localStorage[this.storage]);
            UTILS.OBJ.updateByPath(localData, key, val);
            localStorage[storage] = JSON.stringify(localData);
        };

        this.get = function (key) {
            var localData = JSON.parse(localStorage[this.storage]);
            if (key) {
                return UTILS.OBJ.getByPath(localData, key);
            }
            return localData;
        };

        this.reset = function (newModel) {
            localStorage[this.storage] = JSON.stringify(newModel || {});
        };

        this.delete = function() {
            localStorage.removeItem(this.storage);
        }

    }

}