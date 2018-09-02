if(DetectRTC.browser.name === 'Chrome') {
    document.getElementById('room-name').disabled = true;
    document.getElementById('share-screen').disabled = true;
    // https://github.com/muaz-khan/Chrome-Extensions/tree/master/Screen-Capturing.js#getchromeextensionstatus
    getChromeExtensionStatus(function(status) {
        if(status == 'installed-enabled') {
            if(document.getElementById('install-button')) {
                document.getElementById('install-button').parentNode.innerHTML = '<strong>Great!</strong> <a href="https://chrome.google.com/webstore/detail/screen-capturing/ajhifddimkapgcifgcodmmfdlknahffk" target="_blank">Google chrome extension</a> is installed.';
            }
            CHROME_MEDIA_SOURCE = 'desktop';
            document.getElementById('room-name').disabled = false;
            document.getElementById('share-screen').disabled = false;
        }
        else  {
            document.getElementById('chrome-warning').style.display = 'block';
        }
    });
}