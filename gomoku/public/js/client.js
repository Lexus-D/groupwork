var socket=window.io();

var stone=new Array(3);

var imageboard=document.getElementById('imageboard');
var lineboard=document.getElementById('lineboard');
var stoneboard=document.getElementById('stoneboard');
var turn=document.getElementById('turn');
var reset=document.getElementById('reset');

var myturn=0;//初期カラーが黒なら1白なら0
var mycolor=1;//null
var userID;//サーバから割り当てられるID
var roomNumber;//サーバから割り当てられる部屋番号

window.onload=()=>{
    var imgcontext=imageboard.getContext('2d');
    var img=new Image();
    img.src="image/boardimg.jpg";
    img.addEventListener('load',()=>{
        imgcontext.drawImage(img,0,0);
    });
};

var imgcontext=imageboard.getContext('2d');
var img=new Image();
img.src="image/boardimg.jpg";
img.addEventListener('load',()=>{
    imgcontext.drawImage(img,0,0);
});

const width=imageboard.clientWidth;
const height=imageboard.clientHeight;
imageboard.width=600;
imageboard.height=600;
lineboard.width=600;
lineboard.height=600;
stoneboard.width=600;
stoneboard.height=600;

var context = lineboard.getContext('2d');
//draw the checkerboard
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

//
var stonecontext=stoneboard.getContext('2d');
function　drawcircle(x,y,color){
    if(color){
        stonecontext.fillStyle="#ffffff";
    }else{
        stonecontext.fillStyle="#000000"
    }
    stonecontext.beginPath();
    stonecontext.arc(x,y,15,0,2*Math.PI,true);
    stonecontext.fill();
    stonecontext.stroke();
}


stoneboard.addEventListener('click',(event)=>{

    var sendInfo = {
        stone: stone,
        id : userID,
        room: roomNumber
    };

    if(!myturn){
        return;
    }

    var rect=stoneboard.getBoundingClientRect();

    var x=event.clientX-Math.floor(rect.left);
    var y=event.clientY-Math.floor(rect.top);

    //碁盤上の石の座標
    x=Math.floor(x/40);
    y=Math.floor(y/40);

    console.log(x,y);

    //石の座標と色をstoneに保存、サーバに送る
    stone[0]=x;
    stone[1]=y;
    stone[2]=mycolor;
    console.log('mycolor:'+mycolor);
    socket.emit('message',sendInfo);
    drawcircle(20+x*40,20+y*40,mycolor);
    changeturn(0);
});

//listen on setting, receive the given id, color and room number 
socket.on('setting',(setting)=>{
    userID = setting.id;
    roomNumber = setting.room;
    if(setting.color==0){   //最初の色決め
        mycolor=0;
        changeturn(1);
    }
    else if(setting.color==1){
        mycolor=1;
        changeturn(0);
    }
    console.log(setting);
})

//
socket.on('Broadcast',(msg)=>{
    
    var x=msg[0];
    var y=msg[1];
    var color=msg[2];
    console.log('color:'+color)
    drawcircle(20+x*40,20+y*40,color);
    changeturn(1);
    
});

//勝ち負けの判定が終わったら、勝者を表示し、石を置けなくする
socket.on('gameover',function (data) {
    console.log(data);
    if(data==mycolor){
        var text="You Win!";
        drawtext(text);
    }else{
        var text="You Lose";
        drawtext(text);
    }

    //石を置く権限を外す方法はわからないごめん
    //stoneboard.removeEventListener('click',function (param) {  });
    myturn=0;
    reset.disabled=false;
    reset.style.display='inline';

})

function drawtext(str){
    var stoneboardcontext=stoneboard.getContext('2d');
    stoneboardcontext.fillStyle="aliceblue";
    stoneboardcontext.fillRect(200,225,200,130);
    stoneboardcontext.strokeStyle="black";
    stoneboardcontext.strokeRect(200,225,200,130);
    stoneboardcontext.textBaseline='center';
    stoneboardcontext.textAlign='center';
    stoneboardcontext.font='40px serif';
    stoneboardcontext.fillStyle="black";
    var x=stoneboard.width/2;
    var y=stoneboard.height/2;
    stoneboardcontext.fillText(str,x,y);
}

function changeturn(flag){
    if(flag){
        myturn=1;
        turn.innerText="あなたの番";
    }
    else{
        myturn=0;
        turn.innerText="相手の番";
    }
}
