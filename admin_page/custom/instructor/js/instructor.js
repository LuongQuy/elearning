$(document).ready(function(){
    $('#listUserOnline').hide();
    $('#btnChat').click(function(){
        $('#chatPanel').toggle();
    });
    $('#btnListUserOnline').click(function(){
        $('#listUserOnline').toggle();
    });
    $('#next1').click(function(){
        // alert('ok');
        alert($('iframe').html());
    });
})