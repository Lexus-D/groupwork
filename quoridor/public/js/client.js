var socket = window.io();

var stone = new Array(3);
var wall = new Array(4);

var imageboard = document.getElementById('imageboard');
var lineboard = document.getElementById('lineboard');
var stoneboard = document.getElementById('stoneboard');
var wallboard = document.getElementById('wallboard');
var turn = document.getElementById('turn');
var reset = document.getElementById('reset');

var wallcontext = wallboard.getContext('2d')
wallcontext.strokeStyle="#8b0000";


var LENGTH = 9; //盤面の大きさ

var myturn = 0;//初期カラーが黒なら1白なら0
var myTurnNum; //自分は何番目か
var mycolor = 1;//null
var userID;//サーバから割り当てられるID
var roomNumber;//サーバから割り当てられる部屋番号

var stoneBoard=[];
var wallBoardVertical=[];
var wallBoardHorizontal=[];
var nowstoneposition=[]



for(var i = 0;i < 5; i++){
    nowstoneposition[i]={
        x:0,
        y:0
    }
}


// 石用
for(var i=0;i<LENGTH;i++){
    stoneBoard[i]=[];
    for(var j=0;j<9;j++){
        stoneBoard[i][j]={
            state:false,
            color:0
        }
    }
}

// 壁用のボード
for(var i=0;i<LENGTH-1;i++){
    wallBoardVertical[i]=[];
    wallBoardHorizontal[i]=[];
    for(var j=0;j<LENGTH;j++){
        wallBoardVertical[i][j]={
            state:false,
            color:0
        }
        wallBoardHorizontal[i][j]={
            state:false,
            color:0
        }
    }
}

/*window.onload = () =>{
    var imgcontext=imageboard.getContext('2d');
    var img=new Image();
    img.src="image/boardimg.jpg";
    img.addEventListener('load',()=>{
        imgcontext.drawImage(img,0,0);
    });
};
*/

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
for(let i=1;i<=LENGTH + 1;i++){
    context.beginPath();
    context.moveTo(i*600/(LENGTH + 2),0);
    context.lineTo(i*600/(LENGTH + 2),600);
    context.stroke();
}
for(let i=1;i<=LENGTH + 1;i++){
    context.beginPath();
    context.moveTo(0,i*600/(LENGTH + 2));
    context.lineTo(600,i*600/(LENGTH + 2));
    context.stroke();
}

var stonecontext=stoneboard.getContext('2d');
function　drawcircle(x,y,color){
    if (color == 0) {
        stonecontext.fillStyle="#000000";
    }else if (color == 1) {
        stonecontext.fillStyle="#ffffff"
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
    var xline = Math.floor((x+5)*(LENGTH + 2)/600)
    var yline = Math.floor((y+5)*(LENGTH + 2)/600)
    var wallcontext = wallboard.getContext('2d')
    if((xline*600/(LENGTH + 2))-5<=x & x<=(xline*600/(LENGTH + 2))+5) {
        //たて壁
    } else if ((yline*600/(LENGTH + 2))-5 <= y & y <= (yline*600/(LENGTH + 2)) + 5) {
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

    if(!myturn){
        return;
    }

    //石を置く，または壁を置くのどちらかを実行するようにする
    var rect = wallboard.getBoundingClientRect();
    var x = event.clientX-Math.floor(rect.left);
    var y = event.clientY-Math.floor(rect.top);
    //console.log(x,y)
    var xline = Math.floor((x+5)*(LENGTH + 2)/600)
    var yline = Math.floor((y+5)*(LENGTH + 2)/600)
    console.log(xline,yline)
    
    if ((xline*600/(LENGTH + 2))-5 <= x & x <= (xline*600/(LENGTH + 2)) + 5 ){
        //縦向きの壁置 関数化したほういいかも

        //ここで置けるか判定する関数欲しい

        wallcontext.lineWidth=8;
        wallcontext.beginPath();
        wallcontext.moveTo(xline*600/(LENGTH + 2),yline*600/(LENGTH + 2));
        wallcontext.lineTo(xline*600/(LENGTH + 2),(yline + 2)*600/(LENGTH + 2));
        wallcontext.stroke();
        //壁の座標と色をwallに保存、サーバに送る
        wall[0]=xline-1;
        wall[1]=yline-1;
        wall[2]=0;
        wall[3]=mycolor;
        socket.emit('wall',sendInfo);
        changeturn(0)
        wallBoardVertical[xline-1][yline-1].state=true;
        wallBoardVertical[xline-1][yline-1].color=mycolor;
    } else if ((yline*600/(LENGTH + 2))-5 <= y & y <= (yline*600/(LENGTH + 2)) + 5) {
        //横向きの壁置く　関数化したほういいかも

        //ここで置けるか判定する関数欲しい

        wallcontext.lineWidth=8;
        wallcontext.beginPath();
        wallcontext.moveTo(xline*600/(LENGTH + 2),yline*600/(LENGTH + 2));
        wallcontext.lineTo((xline+2)*600/(LENGTH + 2),yline*600/(LENGTH + 2));
        wallcontext.stroke();
        //壁の座標と色をwallに保存、サーバに送る
        wall[0]=xline-1;
        wall[1]=yline-1;
        wall[2]=1;
        wall[3]=mycolor;
        socket.emit('wall',sendInfo);
        changeturn(0);
        wallBoardHorizontal[xline-1][yline-1].state=true;
        wallBoardHorizontal[xline-1][yline-1].color=mycolor;
    } else {
        //移動前の駒の場所を取得
        var previousx=nowstoneposition[mycolor].x
        var previousy=nowstoneposition[mycolor].y
        // 置けるか判定したい
        
        stonecontext.clearRect((previousx+1)*600/(LENGTH + 2),(previousy+1)*600/(LENGTH + 2),600/(LENGTH + 2),600/(LENGTH +2))
        drawcircle((xline + 0.5)*600/(LENGTH + 2),(yline + 0.5)*600/(LENGTH + 2),mycolor)
        console.log(xline,yline,mycolor)
        nowstoneposition[mycolor].x=xline-1
        nowstoneposition[mycolor].y=yline-1
        changeturn(0);
        stoneBoard[xline-1][yline-1].state=true;
        stoneBoard[xline-1][yline-1].color=mycolor;
        stone[0]=xline - 1;
        stone[1]=yline - 1;
        stone[2]=mycolor;
        console.log(sendInfo.stone);
        socket.emit('stone',sendInfo);
    }

    
    
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
    drawcircle(((LENGTH + 1)/2 + 0.5)*600/(LENGTH + 2),(LENGTH+0.5)*600/(LENGTH + 2),mycolor)
    nowstoneposition[mycolor].x=(LENGTH-1)/2;
    nowstoneposition[mycolor].y=LENGTH-1;
    enecolor=Math.abs(mycolor-1)
    drawcircle(((LENGTH + 1)/2 + 0.5)*600/(LENGTH + 2),1.5*600/(LENGTH + 2),enecolor)
    nowstoneposition[enecolor].x=(LENGTH-1)/2;
    nowstoneposition[enecolor].y=0;
    console.log(setting);
})

socket.on('Broadcast',(msg)=>{
    if (msg[2]==mycolor){
        return;
    }
    var x=LENGTH - msg[0] - 1;
    var y=LENGTH - msg[1] - 1;
    var color=msg[2];
    console.log('color:'+color)
    var previousx=nowstoneposition[color].x;
    var previousy=nowstoneposition[color].y;
    stonecontext.clearRect((previousx+1)*600/(LENGTH + 2),(previousy+1)*600/(LENGTH + 2),600/(LENGTH + 2),600/(LENGTH +2))
    
    drawcircle((x + 1.5)*600/(LENGTH + 2),(y + 1.5)*600/(LENGTH + 2),color)
    console.log(x,y,color)
    nowstoneposition[color].x=x;
    nowstoneposition[color].y=y;
    //ターンを変える処理
    //次のターンは誰かサーバから受け取る
    //changeturn(nextTurn == myTurnNum); //4人用のとき
    changeturn(1); //二人用
});

socket.on('wallbroadcast',(msg)=>{
    if (msg[3]==mycolor) {
        return;
    }
    var x=LENGTH - msg[0];
    var y=LENGTH - msg[1];
    var wallDirection=msg[2]
    if (wallDirection){
        wallcontext.lineWidth=8;
        wallcontext.beginPath();
        wallcontext.moveTo((x + 1)*600/(LENGTH + 2),(y + 1)*600/(LENGTH + 2));
        wallcontext.lineTo((x - 1)*600/(LENGTH + 2),(y + 1)*600/(LENGTH + 2));
        wallcontext.stroke();
        
        changeturn(1); //二人用
    } else {
        wallcontext.lineWidth=8;
        wallcontext.beginPath();
        wallcontext.moveTo((x + 1)*600/(LENGTH + 2),(y + 1)*600/(LENGTH + 2));
        wallcontext.lineTo((x + 1)*600/(LENGTH + 2),(y - 1)*600/(LENGTH + 2));
        wallcontext.stroke();
        
        changeturn(1); // 二人用
    }
})


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
