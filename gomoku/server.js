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

    // 人数の確認
    iCountUser=iCountUser+1;
    console.log(iCountUser);
    var userid = socket.id;
    var info={id: userid, number: iCountUser-1};

    if(iCountUser<3)
    {
        idCheck[iCountUser-1]=userid;
        io.to(userid).emit('setting',info);
    }
    
    socket.on('message',msg=>{
        if(msg.id==idCheck[0])
        {
            io.to(idCheck[1]).emit('message',msg.stoneinfo);
        }
        else if(msg.id==idCheck[1])
        {
            io.to(idCheck[0]).emit('message',msg.stoneinfo);
        }
        else
        {
            console.log("watch only");
        }
    });

    // 切断時の処理
    socket.on('disconnect',()=>{
    console.log('disconnect');
    iCountUser=iCountUser-1;
    console.log(iCountUser);
    });

});
