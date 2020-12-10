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
const LENGTH = 9; // 奇数のみ

// グローバル変数
var stoneBoard=[];
var wallBoardVertical=[];
var wallBoardHorizontal=[];

// kはroomの数．上限はとりあえず20にしておく
for(var k=0;k<20;k++){
    // ボードを部屋数分作成
    stoneBoard[k]=[];
    wallBoardVertical[k]=[];
    wallBoardHorizontal[k]=[];

    // 石用のボード
    for(var i=0;i<LENGTH;i++){
        stoneBoard[k][i]=[];
        for(var j=0;j<9;j++){
            stoneBoard[k][i][j]={
                state:false,
                // colorがプレイヤーを表す
                // 0は石がない意味
                color:0
            }
        }
    }

    // 壁用のボード
    for(var i=0;i<LENGTH-1;i++){
        wallBoardVertical[k][i]=[];
        wallBoardHorizontal[k][i]=[];
        for(var j=0;j<LENGTH;j++){
            wallBoardVertical[k][i][j]={
                state:false,
                color:0
            },
            wallBoardHorizontal[k][i][j]={
                state:false,
                color:0
            }
        }
    }
}

server.listen(PORT,()=>{
    console.log('server starts on port: %d',PORT);
    app.use(express.static(__dirname+'/public'));
})

// 最初の接続の処理
// ここで部屋割りと部屋内での上限を超えていないか調べる
// ID割り振り，色の設定も
io.once('connection',socket=>{
    //socket.emit('message',0);
});

io.on('connection',socket=>{

    // 人数が揃うまで何もできないようにする
    // 人数が揃ったら開始
    // io.to().emit('',);

    // ターンが回ってきたら動作できるようにする
    // socket.on('',=>{
    //     io.to().emit('',);
    // })

    // 動作（石・壁を動かす置く等）に応じてそれが可能か確かめる
    // ↓動作可能か確かめるアルゴリズム
    // socket.on('',=>{

        // 動作可能ならその結果を部屋全員に送信する
        // io.to().emit('',);

        // ↓動作の結果が勝敗に繋がっているか確認するアルゴリズム

    // })

    // 接続が切れた場合，試合中断
    // ボードを初期化して再接続を待つ
    /*
    socket.on('disconnect',()=>{

    })
    */
})

// 動作可能か確かめるアルゴリズム

// 勝敗判定のアルゴリズム
