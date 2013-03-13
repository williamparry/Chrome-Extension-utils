var UTILS_Inject_Tab_toImage = new function () {
	
	var self = this;

	var port,
		origOverflowY,
		origOverflowX,
		origOffsetTop,
		docHeight,
		untilY,
		viewHeight,
		overlay,
		buffer;


	origOverflowY = document.body.style.overflowY;
	document.body.style.overflowY = 'hidden';
	origOverflowX = document.body.style.overflowX;
	document.body.style.overflowX = 'hidden';
	origOffsetTop = document.body.scrollTop;
	docHeight = document.body.clientHeight;
	viewHeight = window.innerHeight;
	overlay = document.createElement('div');
	overlay.style.position = 'absolute';
	overlay.style.width = '100%';
	overlay.style.height = '100%';
	document.body.appendChild(overlay);
	buffer = 0;

	function scroll() {

		window.scrollTo(0, buffer);

		overlay.style.top = document.body.scrollTop + 'px';

		buffer += viewHeight;

		if (buffer >= (untilY || docHeight)) {

			port.postMessage({
				CMD: 'CAPTURE',
				Data: {
					moreToCome: false,
					overflow: buffer - (untilY || docHeight),
					width: window.innerWidth,
					height: untilY || docHeight,
					viewHeight: viewHeight
				}
			});

		} else {

			port.postMessage({
				CMD: 'CAPTURE',
				Data: {
					moreToCome: true
				}
			});

		}

	}

	function stopScroll() {
		buffer = 0;
		window.scrollTo(0, origOffsetTop);
		document.body.style.overflowY = origOverflowY;
		document.body.style.overflowX = origOverflowX;
		document.body.removeChild(overlay);
		port.disconnect();
		chrome.extension.onMessage.removeListener(init);
	}

	function init(data, sender, response) {

		if (data.untilY) {
			untilY = data.untilY;
		}

		port = chrome.extension.connect({ name: data.portId });

		port.onMessage.addListener(function (data) {

			switch (data.CMD) {
				case "SCROLL":
					scroll();
					break;
				case 'STOP':
					stopScroll();
					break;
			}

		});

		scroll();


	}
	

	chrome.extension.onMessage.addListener(init);

}
