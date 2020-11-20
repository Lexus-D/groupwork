//サーバーたてて、socketでデータの受け渡し

// モジュール
const http     = require('http');
const express  = require('express');
const socketIO = require('socket.io');

// オブジェクト
const app = express();
const server = http.Server(app);
const io = socketIO(server);

// 定数
const PORT = 5500;

// グローバル変数
var countUsers=0;
var roomNumber=1;

server.listen(PORT,()=>{
    console.log('server starts on port: %d',PORT);
    app.use(express.static(__dirname+'/public'));
})

//最初の接続の処理
/*io.once('connection',socket=>{
    socket.emit('message',0);
});*/

//クライアントの処理
io.on('connection',socket=>{

    // 人数の確認と部屋割り
    countUsers=countUsers+1;
    console.log(countUsers + "user active");
    socket.join(roomNumber);

    // ID割り振り
    var userID = socket.id;
    var settingInfo={
        id: userID,
        color: countUsers%2,
        room: roomNumber
    };

    // アクセスしてきたclientに設定データを送る
    io.to(userID).emit('setting',settingInfo);

    // 2人入ったら次のルームへ
    if(countUsers%2==0){
        roomNumber=roomNumber+1;
    }

    // 石を置いたときの処理
    socket.on('message',msg=>{
        socket.broadcast.to(msg.room).emit('message',msg.stone);
    });

    // 切断時の処理
    socket.on('disconnect',()=>{
        console.log('disconnect');

        // ない方がいいかも
        countUsers=countUsers-1;
        console.log(countUsers);
    });

});
