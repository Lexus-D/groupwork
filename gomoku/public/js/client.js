//五目並べの処理

const io = require('socket.io-client');

var serverIpAddress = 'http://localhost:8000';
var socket = io.connect(serverIpAddress);//接続先のサーバを指定

//石を置く位置を保持する配列を初期化(15行15列)
var putStoneButton = new Array(15);
for(var y = 0; y < 15; y++) {
    putStoneButton[y] = new Array(15).fill(0);
}

socket.on('connect' ,function (data) {//コネクションの接続
    //サーバからのレスポンス（自分の番かどうかなど）
    socket.on('response',function(msg){
        msg = msg['data'];
        console.log(msg);
    });

    //石を置く位置を取得
    for(var i = 0; i < 225; i++){
        putStoneButton[i/15][i%15] = document.getElementById(str(i));
    }

    //石を置く位置を送信
    socket.emit('exec',command,function(coordinate){
        console.log(putStoneButton);
    });

    //Socket通信を終了する
    socket.on('exit',function(msg){
        console.log(msg);
        socket.disconnect()
    });
});
