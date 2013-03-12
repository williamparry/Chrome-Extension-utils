var origOverflowY = document.body.style.overflowY;
document.body.style.overflowY = 'hidden';

var origOverflowX = document.body.style.overflowX;
document.body.style.overflowX = 'hidden';

var origOffsetTop = document.body.scrollTop;

var docHeight = document.body.clientHeight;
var viewHeight = window.innerHeight;
var overlay = document.createElement('div');
overlay.style.position = 'absolute';
overlay.style.width = '100%';
overlay.style.height = '100%';

document.body.appendChild(overlay);

var buffer = 0;

function send(keepGoing) {

    if (keepGoing) {
        
        window.scrollTo(0, buffer);

        overlay.style.top = document.body.scrollTop + 'px';

        buffer += viewHeight;

        console.log(buffer, docHeight);

        if (buffer >= docHeight) {

            chrome.extension.sendMessage({
                CMD: 'captureArea',
                Data: {
                    moreToCome: false,
                    overflow: buffer - docHeight,
                    width: window.innerWidth,
                    height: docHeight,
                    viewHeight: viewHeight
                }
            }, send);

        } else {
            chrome.extension.sendMessage({
                CMD: 'captureArea',
                Data: {
                    moreToCome: true
                }
            }, send);
        }
    } else {
        buffer = 0;
        window.scrollTo(0, origOffsetTop);
        document.body.style.overflowY = origOverflowY;
        document.body.style.overflowX = origOverflowX;
        document.body.removeChild(overlay);
    }
}

send(true);