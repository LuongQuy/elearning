// start video streaming feature
var connection = new RTCMultiConnection();

// set socketURL
connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';

connection.connectSocket(function () {
    console.log('connected to socketIO server successfully');
    connection.socket.emit('howdy', 'hello');
});

connection.sdpConstraints.mandatory = {
    OfferToReceiveAudio: false,
    OfferToReceiveVideo: false
};
// end video streaming feature

var socket = io('http://localhost:3000');

socket.on('SERVER_SEND_FAIL', () => {
    alert('Tên đã tồn tại, vui lòng chọn tên khác');
});

socket.on('SERVER_SEND_SUCCESS', () => {
    alert('Đăng nhập thành công!');
    $('#wrapper').show();
    $('#login').hide();
});

socket.on('SERVER_SEND_ARRAY_USER', (arrUser) => {
    $('#user-online').empty();
    arrUser.slice(0, 5).forEach(element => {
        $('#user-online').append(
            `<a href="#" class="list-group-item">
            ${element}
            <span class="pull-right text-muted small">
            </span>
        </a>`
        );
    });
});

socket.on('SERVER_SEND_MESSAGE', (data) => {
    $('#chat-content').append(
        `<li class="left clearfix">
        <span class="chat-img pull-left">
            <img src="http://placehold.it/50/55C1E7/fff" alt="User Avatar" class="img-circle" />
        </span>
        <div class="chat-body clearfix">
            <div class="header">
                <strong class="primary-font">${data.username}</strong>
            </div>
            <p>
                ${data.message}
            </p>
        </div>
    </li>`
    );
});

socket.on('SERVER_SEND_ARRAY_CLASS', (arrClass) => {
    $('#listClass').html('');
    arrClass.forEach(element => {
        $('#listClass').append(
            `<li>${element}</li>`
        );
    });
});

socket.on('SERVER_SEND_ROOM_SOCKET', (currentClass) => {
    $('#currentClass').html(currentClass);
});

$(document).ready(() => {
    $('#wrapper').show();
    // $('#login').show();

    $('#btnLogin').on('click', () => {
        var txtUserName = $('#txtUserName').val();
        socket.emit('CLIENT_SEND_ACCOUNT', txtUserName);
    });

    $('#listClass').on('click','li', function(){
        $('#formCreateClass').hide();
        var roomId = $(this).html();
        connection.session = {
            audio: true,
            video: true,
            oneway: true
        };
        connection.sdpConstraints.mandatory = {
            OfferToReceiveAudio: false,
            OfferToReceiveVideo: true // TURE here i.e. I want to receive video tracks
        };
        connection.videosContainer = document.getElementById('video-screen');
        connection.join(roomId);
    });

    $('#txtUserName').on('keypress', (event) => {
        if (event.keyCode == 13) {
            socket.emit('CLIENT_SEND_ACCOUNT', $('#txtUserName').val());
        }
    });

    $('#btnLogout').on('click', () => {
        socket.emit('LOGOUT');
        $('#wrapper').hide();
        $('#login').show();
    });

    $('#btn-chat').on('click', () => {
        socket.emit('CLIENT_SEND_MESSAGE', $('#txtMessage').val());
        $('#txtMessage').val('');
    });

    $('#txtMessage').keypress((event) => {
        if (event.keyCode == 13) {
            socket.emit('CLIENT_SEND_MESSAGE', $('#txtMessage').val());
            $('#txtMessage').val('');
        }
    });

    $('#btnCreateClass').on('click', () => {
        var roomId = $('#txtClassName').val();
        socket.emit('CLIENT_CREATE_CLASS', roomId);

        $('#formCreateClass').hide();

        connection.session = {
            audio: true,
            video: true,
            oneway: true
        };
        connection.videosContainer = document.getElementById('videos-container');
        connection.open(roomId, function () {
            connection.session = {
                screen: true,
                oneway: true
            };
            connection.videosContainer = document.getElementById('video-screen');
            connection.open(roomId);
        });
    });

    $('#txtClassName').keypress((event) => {
        if (event.keyCode == 13) {
            var roomId = $('#txtClassName').val();
            socket.emit('CLIENT_CREATE_CLASS', roomId);
            $('#formCreateClass').hide();

            connection.session = {
                audio: true,
                video: true,
                oneway: true
            };

            connection.videosContainer = document.getElementById('videos-container');
            connection.open(roomId, function () {
                connection.session = {
                    screen: true,
                    oneway: true
                };
                connection.videosContainer = document.getElementById('video-screen');
                connection.open(roomId);
            });
        }
    });

    $('#btnJoinRoom').on('click', () => {
        var roomId = $('#txtClassName').val();
        connection.session = {
            audio: true,
            video: true,
            oneway: true
        };
        connection.sdpConstraints.mandatory = {
            OfferToReceiveAudio: false,
            OfferToReceiveVideo: true // TURE here i.e. I want to receive video tracks
        };
        connection.videosContainer = document.getElementById('video-screen');
        connection.join(roomId);
    });



    // $('#btnCreateClass').on('click', () => {
    //     var roomId = $('#txtClassName').val();
    //     socket.emit('CLIENT_CREATE_CLASS', roomId);
    //     $('#formCreateClass').hide();

    //     connection.session = {
    //         audio: true,
    //         video: true,
    //         oneway: true
    //     };
    //     connection.videosContainer = document.getElementById('videos-container');
    //     connection.open(roomId);
    // });

    // $('#txtClassName').keypress((event) => {
    //     if (event.keyCode == 13) {
    //         var roomId = $('#txtClassName').val();
    //         socket.emit('CLIENT_CREATE_CLASS', roomId);
    //         $('#formCreateClass').hide();

    //         connection.session = {
    //             audio: false,
    //             video: true,
    //             oneway: true
    //         };
    //         connection.sdpConstraints.mandatory = {
    //             OfferToReceiveAudio: false,
    //             OfferToReceiveVideo: false
    //         };
    //         connection.videosContainer = document.getElementById('videos-container');
    //         connection.open(roomId);
    //     }
    // });

    // $('#btnJoinRoom').on('click', () => {
    //     var roomId = $('#txtClassName').val();
    //     connection.session = {
    //         audio: false,
    //         video: true,
    //         oneway: true
    //     };
    //     connection.sdpConstraints.mandatory = {
    //         OfferToReceiveAudio: false,
    //         OfferToReceiveVideo: true // TURE here i.e. I want to receive video tracks
    //     };
    //     connection.videosContainer = document.getElementById('videos-container');
    //     connection.join(roomId);
    // });
});