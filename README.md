chrome-extension-utils
======================

Small library of utilities for Chrome Extension developers. You probably don't need jQuery in your app.

To use
------

Grab the utils-1.0.js file and include it in your extensions.

If you want to run the tests, load up the folder unpacked into your chrome extensions.

Breaking changes v1.0
---------------------

Port Messenger has changed syntax for listening to commands.

	portMessenger.addEventListener("{port name}.{command}", function (args) { });

$(elementId) has changed to id(elementId)

$$(elementType) has changed to create(elementType)

Additions
---------

sel(query, context) for querySelectorAll()

LocalStoreDAL has a "delete" method which removes it from localStorage

Future ideas
------------

Abstract the LocalStoreDAL to handle multiple types of storage