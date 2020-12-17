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

var countRoomUsers = Array(ROOMMAX).fill(0);
var countRooms = 0;


// kはroomの数．上限はとりあえず20にしておく
for(var k=0;k<ROOMMAX;k++){
    // ボードを部屋数分作成
    stoneBoard[k]=[];
    wallBoardVertical[k]=[];
    wallBoardHorizontal[k]=[];

    // 石用のボード
    for(var i=0;i<LENGTH;i++){
        stoneBoard[k][i]=[];
        for(var j=0;j<LENGTH;j++){
            stoneBoard[k][i][j]={
                color:0 // colorがプレイヤーを表す
                        // 0は石がない意味
            }
        }
    }
    stoneBoard[k][4][8].color=1;
    stoneBoard[k][0][4].color=2;
    stoneBoard[k][4][0].color=3;
    stoneBoard[k][8][4].color=4;

    // 壁用のボード
    for(var i=0;i<LENGTH-1;i++){
        wallBoardVertical[k][i]=[];
        wallBoardHorizontal[k][i]=[];
        for(var j=0;j<LENGTH;j++){
            wallBoardVertical[k][i][j]={
                state:false,
            },
            wallBoardHorizontal[k][i][j]={
                state:false,
            }
        }
    }
}

server.listen(PORT,()=>{
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

    /////////////////////
    console.log("enter the room ");
    console.log(settingInfo.color);
    ////////////////////

    // PLAYNUMだけ入ったら次の部屋へ
    if(countRoomUsers[countRooms]==PLAYERNUM){
        countRooms = countRooms + 1;
        console.log("open next room");
    }

    // アクセスしてきたclientに設定データを送る
    io.to(userID).emit('setting',settingInfo);

    // 人数が揃うまで何もできないようにする
    // 人数が揃ったら開始
    // とりあえず2人用なので特になし
    // io.to().emit('',);

    // 石や壁をおけるかどうかの判断はclient側だけでいいかもしれない

    // 石を置いた場合の処理
    socket.on('stone',putStone=>{

        var x=putStone.stone[0];
        var y=putStone.stone[1];
        var color=putStone.stone[2];

        // if(!stoneBoard[putStone.room][x][y].color){
            // 前の座標のcolorを0にする
            for(var i=0;i<LENGTH;i++){
                for(var j=0;j<LENGTH;j++){
                    if(stoneBoard[putStone.room][i][j].color==color){
                        stoneBoard[putStone.room][i][j].color=0;
                    }
                }
            }
            stoneBoard[putStone.room][x][y].color=color;
            io.to(putStone.room).emit('Broadcast',putStone.stone);
        // }

        // ↓勝利条件を満たしているかを判断する関数

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
            wallBoardHorizontal[putWall.room][x][y].state=true;
            wallBoardHorizontal[putWall.room][x+1][y].state=true;
        }
        else{
            wallBoardVertical[putWall.room][x][y].state=true;
            wallBoardVertical[putWall.room][x][y+1].state=true;
        }
    })

    // 接続が切れた場合，試合中断
    // ボードを初期化して再接続を待つ
    /*
    socket.on('disconnect',()=>{

    })
    */
})

// 勝敗判定のアルゴリズム
