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
var stoneboard=[];

var isStonePut;

//サーバ側で碁盤を保持
for(var i=-5;i<20;i++){
    stoneboard[i]=[];
    for(var j=-5;j<20;j++){
        stoneboard[i][j]={
            state:false,
            color:2  //2 means no stone on this position
        };
    }
}


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
    console.log(countUsers + " user active");
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
        
        var x=msg.stone[0];
        var y=msg.stone[1];
        var color=msg.stone[2];

        //update new stone to the stoneboard in server
        //石がすでに置かれている場合はクライアントに知らせる
        if(stoneboard[x][y].state){
            isStonePut = true;
            socket.emit('stone put', isStonePut);
        }
        //空いているマスに石が置かれる場合，石の座標を二人に送信
        else{
            stoneboard[x][y].color=color;
            stoneboard[x][y].state=true;
            isStonePut = false;
            socket.emit('stone put', isStonePut);

            //broadcast position of stone for every client in one room
            io.sockets.emit('Broadcast',msg.stone);
        }
        //judge winlose:
        if(gameover(x,y,stoneboard)==true){
            //send winner's color back to client
            socket.broadcast.to(msg.room).emit('gameover',stoneboard[x][y].color);
            console.log(stoneboard[x][y].color+' win');
        }
    });
    
    

    // 切断時の処理
    socket.on('disconnect',()=>{
        console.log('disconnect');

        // ない方がいいかも
        countUsers=countUsers-1;
        console.log(countUsers);
    });

});

//勝ち負け判定のアルゴリズム
function checkoneline(tpx,tpy,xplus,yplus,color){
    var count=0;
    for(var i=0;i<10;i++){
        if(stoneboard[tpx][tpy].color==color&&stoneboard[tpx][tpy].color!=2){
            count++;
            if(count>=5)return true;
        }else{
            count=0;
        }
        tpx+=xplus;
        tpy+=yplus;
    }
}

function checkalldirection(x,y,stoneboard){
    //check Main diagonal
    if(checkoneline(x-5,y-5,1,1,stoneboard[x][y].color))return true;
    //check column
    if(checkoneline(x,y-5,0,1,stoneboard[x][y].color))return true;
    //check Antidiagonal
    if(checkoneline(x+5,y-5,-1,1,stoneboard[x][y].color))return true;
    //check row
    if(checkoneline(x-5,y,1,0,stoneboard[x][y].color))return true;
}

function gameover(x,y,stoneboard){
    return checkalldirection(x,y,stoneboard);
}
