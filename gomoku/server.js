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
let iCountUser=0;
var idCheck=new Array(2);

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
  
    var id=socket.id;

      // 人数の確認
    iCountUser=iCountUser+1;
    if(iCountUser==1){
      io.to(id).emit('message',0);
    }
    else if(iCountUser==2){
      io.to(id).emit('message',1);
    }
    console.log(iCountUser);

    socket.on('message',msg=>{
        // 調整中
        /*
        if(iCountUser<3 && msg[0]==-1 && msg[1]==-1)
        {
            var id = socket.id;
            idCheck[iCountUser-1]=id;
            msg[3]=id;
            console.log(id);
            io.to(id).emit('personal',msg);
            console.log("tyakka");
        }
        else if(msg[3]==idCheck[0])
        {
            msg[3]==idCheck[1];
            io.to(idCheck[1]).emit('personal',msg);
            console.log(idCheck[1]);
            console.log("oita");
        }
        else if(msg[3]==idCheck[1])
        {
            msg[3]==idCheck[0];
            io.to(idCheck[0]).emit('personal',msg);
            console.log(idCheck[0]);
            console.log("oita");
        }
        console.log("passed");
        */
        socket.broadcast.emit('message',msg);
    });

    // 切断時の処理
    socket.on('disconnect',()=>{
    console.log('disconnect');
    iCountUser=iCountUser-1;
    console.log(iCountUser);
    });

});
