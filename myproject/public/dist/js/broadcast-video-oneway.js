    var connection = new RTCMultiConnection();

    // set socketURL
    connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';

    connection.session = {
        audio: true,
        video: true,
        oneway: true
    };

    connection.connectSocket(function () {
        console.log('connected to socketIO server successfully');
        connection.socket.emit('howdy', 'hello');
    });
	
	connection.videosContainer = document.getElementById('videos-container');

    $('#btnOpenRoom').on('click', function () {
        alert('xin chao');
        var roomId = $('#txtClassName').val();
        connection.open(roomId);
        
    });

    $('#btnJoinRoom').on('click', function () {
        var roomId = $('#txtRoomId').val();

        // Thiet Lap rang buoc video, audio cho Offer
        connection.sdpConstraints.mandatory = {
            OfferToReceiveAudio: true,
            OfferToReceiveVideo: true
        };
        connection.join(roomId);
    });