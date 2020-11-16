//五目並べの処理

const io = require('socket.io-client');

var socket = io.connect('http://localhost:8000');//接続先のサーバを指定

var coordinate = {}; //石を置く座標を格納(JSON形式)

socket.on('connect' ,function (data) {//コネクションの接続
    //サーバからのレスポンス（自分の番かどうかなど）
    socket.on('response',function(msg){
        msg = msg['data'];
        console.log(msg);
    });

    //石を置く位置を入力

    //石を置く座標を送信
    socket.emit('exec',command,function(coordinate){
        console.log(coodinate);
    });

    //Socket通信を終了する
    socket.on('exit',function(msg){
        console.log(msg);
        socket.disconnect()
    });
});
