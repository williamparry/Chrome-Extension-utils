var UTILS = {

    // ------------------------------------------------------------------
    // Object Helpers
    // ------------------------------------------------------------------

    OBJ: {

        updateByPath: function (obj, keyStr, value) {
            var keyPath = keyStr.split('.'),
            lastKeyIndex = keyPath.length - 1;
            for (var i = 0; i < lastKeyIndex; ++i) {
                key = keyPath[i];
                if (!(key in obj))
                    obj[key] = {};
                obj = obj[key];
            }
            obj[keyPath[lastKeyIndex]] = value;
        },

        getByPath: function (obj, key, remaining) {
            if ( remaining === undefined ) {
                remaining = key.split('.');
            }
            var current = remaining.shift();
            if ( typeof(obj) == 'object' && obj[current] !== undefined ) {
                if ( remaining.length === 0 ) {
                    return obj[current];
                } else if ( typeof(obj[current]) == 'object' ) {
                    return arguments.callee(obj[current], undefined, remaining);
                }
            }
            return null;
        }

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
                return c.querySelectorAll(q);
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
        };
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
            });

        });

        this.getConnectedPorts = function(portName) {
            return connectedPorts[portName] || [];
        };

        this.sendMessage = function (portName, message, tab) {

            if (connectedPorts[portName] && connectedPorts[portName].length > 0) {
                for (var i = 0; i < connectedPorts[portName].length; i++) {
                    var port = connectedPorts[portName][i];
                    if (tab) {
                        if (port.sender.tab && port.sender.tab.id && port.sender.tab.id === tab.id) {
                            port.postMessage(message);
                        }

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

        chrome.extension.onMessage.addListener(function (msg, sender, responseFunc) {
            console.log(msg.CMD, responseFunc);
            // Pass it on to the listener to deal with the response
            self.dispatchEvent(msg.CMD, {
                Data: msg.Data,
                Sender: sender,
                ResponseFunc: responseFunc
            });

            return true;

        });
    },

    // ------------------------------------------------------------------
    // Tab
    // ------------------------------------------------------------------

    Tab: {

        captureFull: function (captureOptions, injectPath) {
            
            var shots = [],
                requestMessenger = new UTILS.RequestMessenger(),
                evtD = new UTILS.EventDispatcher(['EVENT_COMPLETE']);

            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                
                var tab = tabs[0];

                requestMessenger.addEventListener("captureArea", function (msg) {
                    
                    setTimeout(function () {

                        chrome.tabs.captureVisibleTab(null, captureOptions || { format: "png" }, function (img) {

                            shots.push(img);

                            if (msg.Data.moreToCome) {
                                console.log(msg.ResponseFunc);
                                msg.ResponseFunc(true);

                            } else {

                                msg.ResponseFunc(false);

                                if (shots.length === 1) {

                                    evtD.dispatchEvent(evtD.EVENT_COMPLETE, img);

                                } else {

                                    var canvas = document.createElement('canvas');
                                    var ctx = canvas.getContext('2d');
                                    canvas.width = msg.Data.width;
                                    canvas.height = msg.Data.height;

                                    var overflowData = shots.splice(shots.length - 1, 1)[0];

                                    for (var i = 0; i < shots.length; i++) {

                                        (function (imgData, pos) {

                                            var img = new Image();

                                            img.src = imgData;

                                            img.onload = function () {

                                                ctx.drawImage(img, 0, 0, msg.Data.width, msg.Data.viewHeight, 0, msg.Data.viewHeight * pos, msg.Data.width, msg.Data.viewHeight);

                                                if (pos === shots.length - 1) {

                                                    var bottomImg = new Image();

                                                    bottomImg.src = overflowData;

                                                    bottomImg.onload = function () {

                                                        ctx.drawImage(bottomImg, 0, msg.Data.overflow, msg.Data.width, msg.Data.viewHeight - msg.Data.overflow, 0,
                                                                        msg.Data.viewHeight * shots.length, msg.Data.width, msg.Data.viewHeight - msg.Data.overflow);
                                                        
                                                        evtD.dispatchEvent(evtD.EVENT_COMPLETE, canvas.toDataURL("image/png"));

                                                        requestMessenger.removeAllEventListeners("captureArea");
                                                    }
                                                }
                                            }
                                        })(shots[i], i);
                                    }
                                }
                            }
                        });

                    }, 50);

                    return true;
                });
                chrome.tabs.executeScript(tab.id, { file: injectPath || "inject/Tab.captureFull.js" });
            });

            return evtD;

        }

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
        };

    },

    // ------------------------------------------------------------------
    // Ajax
    // ------------------------------------------------------------------

    XHR: {

        ManagedEvent: function (xhrWrap, evtD) {
            return { xhrWrap: xhrWrap, evtD: evtD };
        },

        Manager: function(maxCon) {

            var queue = [],
                maxConnections = maxCon || 6,
                self = this;

            this.currentConnections = 0;

            function processQueue() {

                if (self.currentConnections < maxConnections) {
                    self.currentConnections++;
                    var item = queue.shift();
                    // Add to listeners of event object for when the event is finished
                    item.evtD.addEventListener(['EVENT_COMPLETE'], function (e) {
                        self.currentConnections--;
                        if (queue.length !== 0) {
                            processQueue();
                        }
                    });
                    item.xhrWrap.call(item, item.argsObj, item.evtD);
                }
            }

            this.queue = function (managedEvent) {
                queue.push(managedEvent);
                processQueue();
                return managedEvent.evtD;
            };

        }

    }

};