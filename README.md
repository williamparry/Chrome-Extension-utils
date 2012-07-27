chrome-extension-utils
======================

Small library of utilities for Chrome Extension developers. You probably don't need jQuery in your app.

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