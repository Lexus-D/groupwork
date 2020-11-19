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
var imageboard=document.getElementById('imageboard');
var lineboard=document.getElementById('lineboard');
var stoneboard=document.getElementById('stoneboard');
var myturn=0;//1
var mycolor=1//null
window.onload=()=>{
    var imgcontext=imageboard.getContext('2d');
    var img=new Image();
    img.src="../image/boardimg.jpg"
    img.onload=()=>{
        imgcontext.drawImage(img,0,0);
    }
}

const width=imageboard.clientWidth;
const height=imageboard.clientHeight;
imageboard.width=600;
imageboard.height=600;
lineboard.width=600;
lineboard.height=600;
stoneboard.width=600;
stoneboard.height=600;


var context = lineboard.getContext('2d');

for(let i=0;i<=14;i++){
    context.beginPath();
    context.moveTo(20+i*40,20);
    context.lineTo(20+i*40,580);
    context.stroke();
}
for(let i=0;i<=14;i++){
    context.beginPath();
    context.moveTo(20,20+i*40);
    context.lineTo(580,20+i*40);
    context.stroke();
}
var stonecontext=stoneboard.getContext('2d');
function　drawcircle(x,y,color){
    if(color){
        stonecontext.fillStyle="#ffffff";
    }else{
        stonecontext.fillStyle="#000000"
    }
    stonecontext.beginPath();
    stonecontext.arc(x,y,10,0,2*Math.PI,true);
    stonecontext.fill();
    stonecontext.stroke();
}

stoneboard.addEventListener('click',(event)=>{
    if(myturn){
        return;
    }
    myturn=1;
    var rect=stoneboard.getBoundingClientRect();
    var x=event.clientX-Math.floor(rect.left);
    var y=event.clientY-Math.floor(rect.top);
    x=Math.floor(x/40);
    y=Math.floor(y/40);
    console.log(x,y);
    drawcircle(x,y,mycolor);
});
