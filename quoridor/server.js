// モジュール
const http     = require('http');
const express  = require('express');
const socketIO = require('socket.io');
const { count } = require('console');

// オブジェクト
const app = express();
const server = http.Server(app);
const io = socketIO(server);

// 定数
const PORT = 5500; // ポート番号
const LENGTH = 9; // 奇数のみ
const ROOMMAX = 20; // 部屋の最大数
const PLAYERNUM = 4; // プレイヤーの数 2or4

// グローバル変数
var stoneBoard=[];
var wallBoardVertical=[];
var wallBoardHorizontal=[];
var previousStone=[];

var countRoomUsers = Array(ROOMMAX).fill(0);
var countRooms = 0;

var username = {}; //ユーザーネームを格納

// kはroomの数．上限はとりあえず20にしておく
for(var k=0;k<ROOMMAX;k++){
    // ボードを部屋数分作成
    stoneBoard[k]=[];
    wallBoardVertical[k]=[];
    wallBoardHorizontal[k]=[];
    previousStone[k]=[];

    // 前に置いていた石の座標保存用
    for(var n=0;n<PLAYERNUM;n++){
        // nはcolor-1
        previousStone[k][n]=[];
        for(var c=0;c<2;c++){
            // x座標はc=0,y座標はc=1
            previousStone[k][n][c]=0;
        }
    }

    // 石用のボード
    for(var i=0;i<LENGTH;i++){
        stoneBoard[k][i]=[];
        for(var j=0;j<LENGTH;j++){
            stoneBoard[k][i][j]=0;
            // colorがプレイヤーを表す
            // 0は石がない意味
        }
    }
    stoneBoard[k][4][8]=1;
    stoneBoard[k][0][4]=2;
    stoneBoard[k][4][0]=3;
    stoneBoard[k][8][4]=4;

    // 壁用のボード
    for(var i=0;i<=LENGTH;i++){
        wallBoardVertical[k][i]=[];
        wallBoardHorizontal[k][i]=[];
        for(var j=0;j<=LENGTH;j++){
            wallBoardVertical[k][i][j]=false;
            wallBoardHorizontal[k][i][j]=false;
        }
    }

    username[k] = {}; //ユーザーネームを格納する変数の初期化
}

server.listen(process.env.PORT || PORT,()=>{
    console.log('server starts on port: %d',PORT);
    app.use(express.static(__dirname+'/public'));
})

/*
io.once('connection',socket=>{
});
*/

io.on('connection',socket=>{

    // 最初の接続の処理
    // ここで部屋割りと部屋内での上限を超えていないか調べる
    // ID割り振り，色の設定も

    // 来た人順で部屋にいれ，部屋がいっぱいになったら次の部屋へ
    countRoomUsers[countRooms] = countRoomUsers[countRooms] + 1;
    socket.join(countRooms);

    // ID割り振り
    var userID = socket.id;
    var settingInfo={
        id: userID,
        color: countRoomUsers[countRooms]%(PLAYERNUM+1),
        room: countRooms
    }

    //
    console.log("enter the room ");
    console.log(settingInfo.color);
    //

    // PLAYNUMだけ入ったら次の部屋へ
    if(countRoomUsers[countRooms]==PLAYERNUM){
        // 人数が揃ったら開始
        io.to(countRooms).emit('gameStart',1);

        countRooms = countRooms + 1;
        console.log("open next room");
    }

    // アクセスしてきたclientに設定データを送る
    io.to(userID).emit('setting',settingInfo);


    username[settingInfo.room][settingInfo.color] = "ユーザー" + settingInfo.color; //デフォルトのユーザーネーム
    io.emit("display_username",username);
    // console.log(username);

    // 石や壁をおけるかどうかの判断はclient側だけでいいかもしれない

    // 石を置いた場合の処理
    socket.on('stone',putStone=>{

        var x=putStone.stone[0];
        var y=putStone.stone[1];
        var color=putStone.stone[2];

        // 前の座標のcolorを0にする
        for(var i=0;i<LENGTH;i++){
            for(var j=0;j<LENGTH;j++){
                if(stoneBoard[putStone.room][i][j]==color){
                    stoneBoard[putStone.room][i][j]=0;
                    previousStone[putStone.room][color-1][0]=i;
                    previousStone[putStone.room][color-1][1]=j;
                }
            }
        }
        stoneBoard[putStone.room][x][y]=color;
        //console.log(stoneBoard[putStone.room]);
        io.to(putStone.room).emit('Broadcast',putStone.stone,previousStone[putStone.room]);

        // ↓勝利条件を満たしているかを判断する関数

        if(gameover(stoneBoard[putStone.room])==1){
            io.to(putStone.room).emit('gameover',1);
        }else if(gameover(stoneBoard[putStone.room])==2){
            io.to(putStone.room).emit('gameover',2);
        }else if(gameover(stoneBoard[putStone.room])==3){
            io.to(putStone.room).emit('gameover',3);
        }else if(gameover(stoneBoard[putStone.room])==4){
            io.to(putStone.room).emit('gameover',4);
        }

    })

    // 壁を置いた場合の処理
    socket.on('wall',putWall=>{

        var x=putWall.wall[0];
        var y=putWall.wall[1];
        // 縦壁か横壁かの情報をwall[2]に入れてほしいです
        var wallDirection=putWall.wall[2];
        io.to(putWall.room).emit('wallbroadcast',putWall.wall);
        // 横なら
        if(wallDirection){
            wallBoardHorizontal[putWall.room][x][y]=true;
            wallBoardHorizontal[putWall.room][x+1][y]=true;
        }
        else{
            wallBoardVertical[putWall.room][x][y]=true;
            wallBoardVertical[putWall.room][x][y+1]=true;
        }
    })

    //ユーザーネームの登録
    socket.on("register_username",(register_username) =>{
        username[register_username["roomNumber"]][register_username["color"]] = register_username["username"];
        console.log(username);
        io.emit("display_username",username);
    })


    // 接続が切れた場合，試合中断
    // ボードを初期化して再接続を待つ
    /*
    socket.on('disconnect',function(){
        var room;

        console.log(room);
    })
    */
})

// 勝敗判定のアルゴリズム
function gameover(stoneBoard){
    for(var i=0;i<9;i++){
        if(stoneBoard[i][0]==1){
            return 1
        }else if(stoneBoard[i][8]==3){
            return 3
        }else if(stoneBoard[8][i]==2){
            return 2
        }else if(stoneBoard[0][i]==4){
            return 4
        }
    }
}
