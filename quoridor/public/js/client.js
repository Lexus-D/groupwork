var socket = window.io();

var stone = new Array(3);
var wall = new Array(3);

var imageboard = document.getElementById('imageboard');
var lineboard = document.getElementById('lineboard');
var stoneboard = document.getElementById('stoneboard');
var wallboard = document.getElementById('wallboard');
var turn = document.getElementById('turn');
var reset = document.getElementById('reset');

var length = 9; //盤面の大きさ

var myturn = 0;//初期カラーが黒なら1白なら0
var myTurnNum; //自分は何番目か
var mycolor = 1;//null
var userID;//サーバから割り当てられるID
var roomNumber;//サーバから割り当てられる部屋番号


window.onload = () =>{
    var imgcontext=imageboard.getContext('2d');
    var img=new Image();
    img.src="image/boardimg.jpg";
    img.addEventListener('load',()=>{
        imgcontext.drawImage(img,0,0);
    });
};

var imgcontext = imageboard.getContext('2d');
var img = new Image();
img.src = "image/boardimg.jpg";
img.addEventListener('load',()=>{
    imgcontext.drawImage(img,0,0);
});

const width = imageboard.clientWidth;
const height = imageboard.clientHeight;
imageboard.width = 600;
imageboard.height = 600;
lineboard.width = 600;
lineboard.height = 600;
stoneboard.width = 600;
stoneboard.height = 600;
wallboard.width = 600;
wallboard.height = 600;

var context = lineboard.getContext('2d');
//draw the checkerboard
context.lineWidth=10
context.strokeStyle="#ffffff"
for(let i=1;i<=length+1;i++){
    context.beginPath();
    context.moveTo(i*600/(length+2),0);
    context.lineTo(i*600/(length+2),600);
    context.stroke();
}
for(let i=1;i<=length+1;i++){
    context.beginPath();
    context.moveTo(0,i*600/(length+2));
    context.lineTo(600,i*600/(length+2));
    context.stroke();
}

var stonecontext=stoneboard.getContext('2d');
function　drawcircle(x,y,color){
    if (color == 1) {
        stonecontext.fillStyle="#ffffff";
    }else if (color==2) {
        stonecontext.fillStyle="#000000"
    }//後二種
    stonecontext.beginPath();
    stonecontext.arc(x,y,15,0,2*Math.PI,true);
    stonecontext.fill();
    stonecontext.stroke();
}

wallboard.addEventListener('mousemove',(e)=>{
    var rect = wallboard.getBoundingClientRect();
    var x=e.clientX-Math.floor(rect.left);
    var y=e.clientY-Math.floor(rect.top);
    var xline = Math.floor((x+5)*(length + 2)/600)
    var yline = Math.floor((y+5)*(length + 2)/600)
    var wallcontext = wallboard.getContext('2d')
    if((xline*600/(length+2))-5<=x & x<=(xline*600/(length+2))+5) {
        //たて壁
    } else if ((yline*600/(length+2))-5 <= y & y <= (yline*600/(length+2)) + 5) {
        //横壁
    } else {
        //駒
    }
})


wallboard.addEventListener('click',(event)=>{

    var sendInfo = {
        stone: stone,
        wall: wall,
        id : userID,
        room: roomNumber
    };

    //if(!myturn){
        //return;
    //}

    //石を置く，または壁を置くのどちらかを実行するようにする
    var rect = wallboard.getBoundingClientRect();
    var x = event.clientX-Math.floor(rect.left);
    var y = event.clientY-Math.floor(rect.top);
    console.log(x,y)
    var xline = Math.floor((x+5)*(length + 2)/600)
    var yline = Math.floor((y+5)*(length + 2)/600)
    console.log(xline,yline)
    var wallcontext = wallboard.getContext('2d')
    if ((xline*600/(length+2))-5 <= x & x <= (xline*600/(length+2)) + 5 ){
        //縦向きの壁置 関数化したほういいかも

        //ここで置けるか判定する関数欲しい

        wallcontext.strokeStyle="#8b0000"
        wallcontext.lineWidth=8
        wallcontext.beginPath();
        wallcontext.moveTo(xline*600/(length + 2),yline*600/(length + 2));
        wallcontext.lineTo(xline*600/(length + 2),(yline + 2)*600/(length + 2));
        wallcontext.stroke();
        console.log('a')
    } else if ((yline*600/(length+2))-5 <= y & y <= (yline*600/(length+2)) + 5) {
        //横向きの壁置く　関数化したほういいかも

        //ここで置けるか判定する関数欲しい

        wallcontext.strokeStyle="#8b0000"
        wallcontext.lineWidth=8
        wallcontext.beginPath();
        wallcontext.moveTo(xline*600/(length + 2),yline*600/(length + 2));
        wallcontext.lineTo((xline+2)*600/(length + 2),yline*600/(length + 2));
        wallcontext.stroke();
    } else {
        //盤面情報から移動前の駒の場所を取得
        //stonecontext.clearRect(x,y,15,15) 移動前の駒消す
        drawcircle((xline + 0.5)*600/(length + 2),(yline + 0.5)*600/(length + 2),1)
    }
    //石を置く処理
    //碁盤上の石の座標
    /*
    x=Math.floor(x/40);
    y=Math.floor(y/40);

    console.log(x,y);

    //石の座標と色をstoneに保存、サーバに送る
    stone[0]=x;
    stone[1]=y;
    stone[2]=mycolor;
    console.log('mycolor:'+mycolor);
    socket.emit('message',sendInfo);

    //壁を置く処理
    var rect=stoneboard.getBoundingClientRect();

    var x=event.clientX-Math.floor(rect.left);
    var y=event.clientY-Math.floor(rect.top);

    //碁盤上の壁の座標
    x=Math.floor(x/40);
    y=Math.floor(y/40);

    console.log(x,y);

    //壁の座標と色をwallに保存、サーバに送る
    wall[0]=x;
    wall[1]=y;
    wall[2]=mycolor;
    console.log('mycolor:'+mycolor);
    socket.emit('message',sendInfo);
    */
});

//listen on setting, receive the given id, color and room number 
socket.on('setting',(setting)=>{
    userID = setting.id;
    roomNumber = setting.room;
    if (setting.color==0) {   //最初の色決め
        mycolor = 0;
        changeturn(1);
    } else {
        mycolor = setting.color;
        changeturn(0);
    }
    console.log(setting);
})

socket.on('Broadcast',(msg)=>{
    
    var x=msg[0];
    var y=msg[1];
    var color=msg[2];
    console.log('color:'+color)
    drawcircle(20+x*40,20+y*40,color);
    
    //ターンを変える処理
    //次のターンは誰かサーバから受け取る
    changeturn(nextTurn == myTurnNum);
    
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
