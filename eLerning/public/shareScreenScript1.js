var CHROME_MEDIA_SOURCE = 'screen';
var CHROME_MEDIA_SOURCE_ID = null;
var CHROME_MEDIA_SOURCE_AUDIO = false;
var config = {
    // via: https://github.com/muaz-khan/WebRTC-Experiment/tree/master/socketio-over-nodejs
    openSocket: function (config) {
        var SIGNALING_SERVER = 'https://socketio-over-nodejs2.herokuapp.com:443/';
        config.channel = config.channel || location.href.replace(/\/|:|#|%|\.|\[|\]/g, '');
        var sender = Math.round(Math.random() * 999999999) + 999999999;
        io.connect(SIGNALING_SERVER).emit('new-channel', {
            channel: config.channel,
            sender: sender
        });
        var socket = io.connect(SIGNALING_SERVER + config.channel);
        socket.channel = config.channel;
        socket.on('connect', function () {
            if (config.callback) config.callback(socket);
        });
        socket.send = function (message) {
            socket.emit('message', {
                sender: sender,
                data: message
            });
        };
        socket.on('message', config.onmessage);
    },
    onRemoteStream: function (media) {
        if (isbroadcaster) return;
        var video = media.video;
        videosContainer.insertBefore(video, videosContainer.firstChild);
        var hideAfterJoin = document.querySelectorAll('.hide-after-join');
        for (var i = 0; i < hideAfterJoin.length; i++) {
            hideAfterJoin[i].style.display = 'none';
        }
    },
    onRoomFound: function (room) {
        if (isbroadcaster) return;
        if (location.hash.replace('#', '').length) {
            // private rooms should auto be joined.
            conferenceUI.joinRoom({
                roomToken: room.roomToken,
                joinUser: room.broadcaster
            });
            return;
        }
        var alreadyExist = document.getElementById(room.broadcaster);
        if (alreadyExist) return;
        if (typeof roomsList === 'undefined') roomsList = document.body;
        var tr = document.createElement('tr');
        tr.setAttribute('id', room.broadcaster);
        tr.innerHTML = '<td>' + room.roomName + '</td>' +
            '<td><button class="join" id="' + room.roomToken + '">Open Screen</button></td>';
        roomsList.insertBefore(tr, roomsList.firstChild);
        var button = tr.querySelector('.join');
        button.onclick = function () {
            var button = this;
            button.disabled = true;
            conferenceUI.joinRoom({
                roomToken: button.id,
                joinUser: button.parentNode.parentNode.id
            });
        };
    },
    onNewParticipant: function (numberOfParticipants) {
        document.title = numberOfParticipants + ' users are viewing your screen!';
        var element = document.getElementById('number-of-participants');
        if (element) {
            element.innerHTML = numberOfParticipants + ' users are viewing your screen!';
        }
    },
    oniceconnectionstatechange: function (state) {
        if (state == 'failed') {
            alert('Failed to bypass Firewall rules. It seems that target user did not receive your screen. Please ask him reload the page and try again.');
        }
        if (state == 'connected') {
            alert('A user successfully received your screen.');
        }
    }
};
function captureUserMedia(callback) {
    console.log('captureUserMedia chromeMediaSource', CHROME_MEDIA_SOURCE);
    var video = document.createElement('video');
    video.muted = true;
    video.volume = 0;
    try {
        video.setAttributeNode(document.createAttribute('autoplay'));
        video.setAttributeNode(document.createAttribute('playsinline'));
        video.setAttributeNode(document.createAttribute('controls'));
    } catch (e) {
        video.setAttribute('autoplay', true);
        video.setAttribute('playsinline', true);
        video.setAttribute('controls', true);
    }
    var screen_constraints = {
        mandatory: {
            chromeMediaSource: CHROME_MEDIA_SOURCE,
            maxWidth: screen.width > 1920 ? screen.width : 1920,
            maxHeight: screen.height > 1080 ? screen.height : 1080
            // minAspectRatio: 1.77
        },
        optional: [{ // non-official Google-only optional constraints
            googTemporalLayeredScreencast: true
        }, {
            googLeakyBucket: true
        }]
    };
    if (isEdge) {
        navigator.getDisplayMedia({ video: true }).then(stream => {
            video.srcObject = stream;
            videosContainer.insertBefore(video, videosContainer.firstChild);
            addStreamStopListener(stream, function () {
                location.reload();
            });
            config.attachStream = stream;
            callback && callback();
            addStreamStopListener(stream, function () {
                location.reload();
            });
        }, error => {
            if (location.protocol === 'http:') {
                alert('Please test this WebRTC experiment on HTTPS.');
            } else {
                alert('Please use Edge >= 17.');
            }
        });
        return;
    }
    if (DetectRTC.browser.name === 'Chrome' && CHROME_MEDIA_SOURCE == 'desktop' && !CHROME_MEDIA_SOURCE_ID) {
        // https://github.com/muaz-khan/Chrome-Extensions/tree/master/Screen-Capturing.js#getsourceidwithaudio
        getSourceIdWithAudio(function (sourceId, canRequestAudioTrack) {
            CHROME_MEDIA_SOURCE_ID = sourceId;
            CHROME_MEDIA_SOURCE_AUDIO = canRequestAudioTrack === true;
            captureUserMedia(callback);
        });
        return;
    }
    if (DetectRTC.browser.name === 'Chrome' && CHROME_MEDIA_SOURCE == 'desktop') {
        if (screen_constraints.mandatory) {
            screen_constraints.mandatory.chromeMediaSourceId = CHROME_MEDIA_SOURCE_ID;
        }
        else {
            screen_constraints.chromeMediaSourceId = CHROME_MEDIA_SOURCE_ID;
        }
    }
    var constraints = {
        audio: false,
        video: screen_constraints
    };
    if (CHROME_MEDIA_SOURCE_AUDIO === true) {
        // system audio i.e. speakers
        constraints.audio = screen_constraints;
    }
    if (!!navigator.mozGetUserMedia) {
        constraints.audio = false;
        constraints.video = {
            mozMediaSource: 'window',
            mediaSource: 'window',
            width: screen.width,
            height: screen.height
        };
    }
    console.log(JSON.stringify(constraints, null, '\t'));
    getUserMedia({
        video: video,
        constraints: constraints,
        onsuccess: function (stream) {
            video.srcObject = stream;
            videosContainer.insertBefore(video, videosContainer.firstChild);
            config.attachStream = stream;
            callback && callback();
            video.setAttribute('muted', true);
            addStreamStopListener(stream, function () {
                location.reload();
            });
        },
        onerror: function (error) {
            if (DetectRTC.browser.name === 'Chrome' && location.protocol === 'http:') {
                alert('Please test this WebRTC experiment on HTTPS.');
            } else if (DetectRTC.browser.name === 'Chrome') {
                alert('Screen capturing is either denied or not supported. Please install chrome extension for screen capturing or run chrome with command-line flag: --enable-usermedia-screen-capturing');
            } else {
                alert(error.toString());
            }
        }
    });
}
/* on page load: get public rooms */
var conferenceUI = conference(config);
/* UI specific */
var videosContainer = document.getElementById("videos-container") || document.body;
var roomsList = document.getElementById('rooms-list');
document.getElementById('share-screen').onclick = function () {
    var roomName = document.getElementById('room-name') || {};
    roomName.disabled = true;
    captureUserMedia(function () {
        conferenceUI.createRoom({
            roomName: (roomName.value || 'Anonymous') + ' shared his screen with you'
        });
    });
    this.disabled = true;
};
(function () {
    var uniqueToken = document.getElementById('unique-token');
    if (uniqueToken)
        if (location.hash.length > 2) uniqueToken.parentNode.parentNode.parentNode.innerHTML = '<h2 style="text-align:center;display: block""><a href="' + location.href + '" target="_blank">Right click to copy & share this private link</a></h2>';
        else uniqueToken.innerHTML = uniqueToken.parentNode.parentNode.href = '#' + (Math.random() * new Date().getTime()).toString(36).toUpperCase().replace(/\./g, '-');
})();