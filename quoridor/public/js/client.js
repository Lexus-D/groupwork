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
var mycolor = 0;//null
var userID;//サーバから割り当てられるID
var roomNumber;//サーバから割り当てられる部屋番号
var gameStart = 0; // 人数が揃ったら1になる

var stoneBoard=[];
var wallBoardVertical=[];
var wallBoardHorizontal=[];
var nowstoneposition=[];



for(var i = 0;i < 5; i++){
    nowstoneposition[i]={
        x:0,
        y:0
    }
}


// 石用 基準
for(var i=0;i<LENGTH;i++){
    stoneBoard[i]=[];
    for(var j=0;j<9;j++){
        stoneBoard[i][j]=0
    }
}

// 壁用のボード  基準
for(var i=0;i<LENGTH-1;i++){
    wallBoardVertical[i]=[];
    wallBoardHorizontal[i]=[];
    for(var j=0;j<LENGTH;j++){
        wallBoardVertical[i][j]=false;
        wallBoardHorizontal[i][j]=false;
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
    if (color == 1) {
        stonecontext.fillStyle="#FF0000";// 赤
    } else if (color == 2) {
        stonecontext.fillStyle="#0000FF";// 青
    } else if (color == 3) {
        stonecontext.fillStyle="#008000";// 緑
    } else if (color == 4) {
        stonecontext.fillStyle="#FFFF00"; // 黄
    }
    stonecontext.beginPath();
    stonecontext.arc(x,y,15,0,2*Math.PI,true);
    stonecontext.fill();
    stonecontext.stroke();
}

wallboard.addEventListener('mousemove',(e)=>{
    var rect = wallboard.getBoundingClientRect();
    var x= e.clientX-Math.floor(rect.left);
    var y=e.clientY-Math.floor(rect.top);
    var xline = Math.floor((x+5)*(LENGTH + 2)/600);
    var yline = Math.floor((y+5)*(LENGTH + 2)/600);
    var wallcontext = wallboard.getContext('2d');
    if((xline*600/(LENGTH + 2))-5<=x & x<=(xline*600/(LENGTH + 2))+5) {
        //たて壁
    } else if ((yline*600/(LENGTH + 2))-5 <= y & y <= (yline*600/(LENGTH + 2)) + 5) {
        //横壁
    } else {
        //駒
    }
})

function rotatefromscreen(screenx,screeny,color){ //全部1index
    var x,y;
    if (color==1) {
        x=screenx;
        y=screeny;
        return [x,y]
    } else if (color==2) {
        y=screenx;
        x=LENGTH + 2 - screeny;
        return [x,y]
    } else if (color==3) {
        x=LENGTH + 2 - screenx;
        y=LENGTH + 2 - screeny;
        return [x,y]
    } else if (color==4) {
        x=screeny;
        y=LENGTH + 2 -screenx;
        return [x,y]
    }
}

function rotatetoscreen(x,y,color){
    var screenx,screeny;

    if (color==1) {
        screenx=x;
        screeny=y;
        return [screenx,screeny]
    } else if (color==2) {
        screenx=y;
        screeny=LENGTH+2-x;
        return [screenx,screeny]
    } else if (color==3) {
        screenx=LENGTH + 2 - x;
        screeny=LENGTH + 2 - y;
        return [screenx,screeny]
    } else if (color==4) {
        screenx=LENGTH+2-y;
        screeny=x;
        return [screenx,screeny]
    }
}






wallboard.addEventListener('click',(event)=>{

    var sendInfo = {
        stone: stone,
        wall: wall,
        id : userID,
        room: roomNumber
    };

    console.log(myturn,gameStart);
    if(!(myturn && gameStart)){
        return;
    }

    //石を置く，または壁を置くのどちらかを実行するようにする
    var rect = wallboard.getBoundingClientRect();
    var screenx = event.clientX-Math.floor(rect.left);
    var screeny = event.clientY-Math.floor(rect.top);
    //console.log(x,y)
    var xline = Math.floor((screenx+5)*(LENGTH + 2)/600)
    var yline = Math.floor((screeny+5)*(LENGTH + 2)/600)
    console.log(xline,yline)
    
    if ((xline*600/(LENGTH + 2))-5 <= screenx & screenx <= (xline*600/(LENGTH + 2)) + 5 ){
        //縦向きの壁置 関数化したほういいかも

        //ここで置けるか判定する関数欲しい

        wallcontext.lineWidth=8;
        wallcontext.beginPath();
        wallcontext.moveTo(xline*600/(LENGTH + 2),yline*600/(LENGTH + 2));
        wallcontext.lineTo(xline*600/(LENGTH + 2),(yline + 2)*600/(LENGTH + 2));
        wallcontext.stroke();
        //壁の座標と色をwallに保存、サーバに送る
        var xy=rotatefromscreen(xline,yline,mycolor);
        console.log(xy[0],xy[1])
        wall[0]=xy[0]-1;
        wall[1]=xy[1]-1;
        wall[2]=0;
        wall[3]=mycolor;
        socket.emit('wall',sendInfo);
        changeturn(0)
        wallBoardVertical[xline-1][yline-1].state=true;
        wallBoardVertical[xline-1][yline-1].color=mycolor;
    } else if ((yline*600/(LENGTH + 2))-5 <= screeny & screeny <= (yline*600/(LENGTH + 2)) + 5) {
        //横向きの壁置く　関数化したほういいかも

        //ここで置けるか判定する関数欲しい

        wallcontext.lineWidth=8;
        wallcontext.beginPath();
        wallcontext.moveTo(xline*600/(LENGTH + 2),yline*600/(LENGTH + 2));
        wallcontext.lineTo((xline+2)*600/(LENGTH + 2),yline*600/(LENGTH + 2));
        wallcontext.stroke();
        //壁の座標と色をwallに保存、サーバに送る
        var xy=rotatefromscreen(xline,yline,mycolor);
        console.log(xy[0],xy[1])
        wall[0]=xy[0]-1;
        wall[1]=xy[1]-1;
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
        var previousscreen=rotatetoscreen(previousx+1,previousy+1,mycolor);
        //var previousscreenx=previousscreen[0];
        //var previousscreeny=previousscreen[1];
        stonecontext.clearRect((previousx+1)*600/(LENGTH + 2),(previousy+1)*600/(LENGTH + 2),600/(LENGTH + 2),600/(LENGTH +2))

        drawcircle((xline + 0.5)*600/(LENGTH + 2),(yline + 0.5)*600/(LENGTH + 2),mycolor)
        console.log(xline,yline,mycolor)
        nowstoneposition[mycolor].x=xline-1
        nowstoneposition[mycolor].y=yline-1
        changeturn(0);
        stoneBoard[xline-1][yline-1].state=true;
        stoneBoard[xline-1][yline-1].color=mycolor;
        var xy = rotatefromscreen(xline,yline,mycolor)
        stone[0]=xy[0]-1;
        stone[1]=xy[1]-1;
        stone[2]=mycolor;
        console.log(sendInfo.stone);
        socket.emit('stone',sendInfo);
    }
});

//listen on setting, receive the given id, color and room number 
socket.on('setting',(setting)=>{
    userID = setting.id;
    roomNumber = setting.room;
    mycolor=setting.color;
    if (setting.color==1) {
        changeturn(1);
        drawcircle(((LENGTH + 1)/2 + 0.5)*600/(LENGTH + 2),(LENGTH+0.5)*600/(LENGTH + 2),1)// した
        drawcircle(((LENGTH + 1)/2 + 0.5)*600/(LENGTH + 2),1.5*600/(LENGTH + 2),3)// 上
        drawcircle((LENGTH+0.5)*600/(LENGTH + 2),((LENGTH + 1)/2 + 0.5)*600/(LENGTH + 2),4)//右
        drawcircle(1.5*600/(LENGTH + 2),((LENGTH + 1)/2 + 0.5)*600/(LENGTH + 2),2)//左
    } else if (setting.color==2) {
        changeturn(0);
        drawcircle(((LENGTH + 1)/2 + 0.5)*600/(LENGTH + 2),(LENGTH+0.5)*600/(LENGTH + 2),2)
        drawcircle(((LENGTH + 1)/2 + 0.5)*600/(LENGTH + 2),1.5*600/(LENGTH + 2),4)
        drawcircle((LENGTH+0.5)*600/(LENGTH + 2),((LENGTH + 1)/2 + 0.5)*600/(LENGTH + 2),1)
        drawcircle(1.5*600/(LENGTH + 2),((LENGTH + 1)/2 + 0.5)*600/(LENGTH + 2),3)
    } else if (setting.color==3) {
        drawcircle(((LENGTH + 1)/2 + 0.5)*600/(LENGTH + 2),(LENGTH+0.5)*600/(LENGTH + 2),3)
        drawcircle(((LENGTH + 1)/2 + 0.5)*600/(LENGTH + 2),1.5*600/(LENGTH + 2),1)
        drawcircle((LENGTH+0.5)*600/(LENGTH + 2),((LENGTH + 1)/2 + 0.5)*600/(LENGTH + 2),2)
        drawcircle(1.5*600/(LENGTH + 2),((LENGTH + 1)/2 + 0.5)*600/(LENGTH + 2),4)
    } else if (setting.color==4) {
        drawcircle(((LENGTH + 1)/2 + 0.5)*600/(LENGTH + 2),(LENGTH+0.5)*600/(LENGTH + 2),4)
        drawcircle(((LENGTH + 1)/2 + 0.5)*600/(LENGTH + 2),1.5*600/(LENGTH + 2),2)
        drawcircle((LENGTH+0.5)*600/(LENGTH + 2),((LENGTH + 1)/2 + 0.5)*600/(LENGTH + 2),3)
        drawcircle(1.5*600/(LENGTH + 2),((LENGTH + 1)/2 + 0.5)*600/(LENGTH + 2),1)
    }
    nowstoneposition[1].x=(LENGTH - 1)/2;
    nowstoneposition[1].y=LENGTH-1;
    nowstoneposition[2].x=0;
    nowstoneposition[2].y=(LENGTH - 1)/2;
    nowstoneposition[3].x=(LENGTH - 1)/2;
    nowstoneposition[3].y=0;
    nowstoneposition[4].x=LENGTH-1;
    nowstoneposition[4].y=(LENGTH - 1)/2;

    nowstoneposition[mycolor].x=(LENGTH-1)/2;
    nowstoneposition[mycolor].y=LENGTH-1;
    console.log(setting);
})

socket.on('Broadcast',(msg,previousStone)=>{
    // 前の石の座標
    // previousStone[color-1][c]
    // 配列数はプレイヤーの人数4 × 座標2 = 8
    // color:1 の人の前の石のx座標はpreviousStone[0][0]にある
    console.log(previousStone[msg[2]-1]);
    //
    if (msg[2]==mycolor){
        return;
    }
    var line=rotatetoscreen(msg[0]+1,msg[1]+1,mycolor);
    var xline=line[0];
    var yline=line[1];
    var color=msg[2];

    console.log('color:'+color)
    var i=0;
    var j=0;
    if (mycolor==2) {
        j=-1;
    } else if (mycolor==3) {
        i=-1;
        j=-1;
    } else if (mycolor==4) {
        i=-1;
    }
    var previousx=nowstoneposition[color].x;
    var previousy=nowstoneposition[color].y;
    var previousscreen=rotatetoscreen(previousx+1,previousy+1,mycolor)
    var previousscreenx=previousscreen[0];
    var previousscreeny=previousscreen[1];
    console.log('presc:',previousscreenx,previousscreeny)
    stonecontext.clearRect((previousscreenx+i)*600/(LENGTH + 2),(previousscreeny+j)*600/(LENGTH + 2),600/(LENGTH + 2),600/(LENGTH +2))
    i=0.5;
    j=0.5;
    if (color+1==mycolor) {
        j=-0.5;
    }
    if (color==4 && mycolor==1){
        j=-0.5;
    }
    if (color==mycolor+1) {
        i=-0.5;
    }
    if (color==1 && mycolor==4){
        i=-0.5;
    }
    if (Math.abs(mycolor-color)==2){
        i=-0.5;
        j=-0.5;
    }
    
    drawcircle((xline + i)*600/(LENGTH + 2),(yline + j)*600/(LENGTH + 2),color)
    console.log(xline,yline,color)
    nowstoneposition[color].x=xline-1;
    nowstoneposition[color].y=yline-1;
    //ターンを変える処理
    //次のターンは誰かサーバから受け取る
    //changeturn(nextTurn == myTurnNum); //4人用のとき
    if (color+1==mycolor){
        changeturn(1);
    }
    if (color==4 && mycolor==1){
        changeturn(1);
    }
});

socket.on('wallbroadcast',(msg)=>{
    if (msg[3]==mycolor) {
        return;
    }
    if((mycolor-msg[3])%2==0){
        var screen=rotatetoscreen(msg[0]+1,msg[1]+1,mycolor);
        var screenx=screen[0];
        var screeny=screen[1];
        var xline=screenx;
        var yline=screeny;
        console.log(xline,yline)
        var wallDirection=msg[2];
        if (wallDirection){
            wallcontext.lineWidth=8;
            wallcontext.beginPath();
            wallcontext.moveTo(xline*600/(LENGTH + 2),yline*600/(LENGTH + 2));
            wallcontext.lineTo((xline - 2)*600/(LENGTH + 2),yline*600/(LENGTH + 2));
            wallcontext.stroke();
        } else {
            wallcontext.lineWidth=8;
            wallcontext.beginPath();
            wallcontext.moveTo(xline*600/(LENGTH + 2),(yline-2)*600/(LENGTH + 2));
            wallcontext.lineTo(xline*600/(LENGTH + 2),yline*600/(LENGTH + 2));
            wallcontext.stroke();
        }
    } else {
        var screen=rotatetoscreen(msg[0]+1,msg[1]+1,mycolor);
        var screenx=screen[0];
        var screeny=screen[1];
        var xline=screenx;
        var yline=screeny;
        
        console.log(xline,yline)
        var wallDirection=msg[2];
        var i=2;
        var j=2;
        if (msg[3]+1==mycolor) {
            i=-2;
        }
        if (msg[3]==4 && mycolor==1){
            i=-2;
        }
        if (msg[3]==mycolor+1) {
            j=-2;
        }
        if (msg[3]==1 && mycolor==4){
            j=-2;
        }
        if (!wallDirection){
            wallcontext.lineWidth=8;
            wallcontext.beginPath();
            wallcontext.moveTo(xline*600/(LENGTH + 2),yline*600/(LENGTH + 2));
            wallcontext.lineTo((xline+j)*600/(LENGTH + 2),yline*600/(LENGTH + 2));
            wallcontext.stroke();
        } else {
            wallcontext.lineWidth=8;
            wallcontext.beginPath();
            wallcontext.moveTo(xline*600/(LENGTH + 2),yline*600/(LENGTH + 2));
            wallcontext.lineTo(xline*600/(LENGTH + 2),(yline + i)*600/(LENGTH + 2));
            wallcontext.stroke();
        }
    }
    if (msg[3]+1==mycolor){
        changeturn(1);
    }
    if (msg[3]==4 && mycolor==1){
        changeturn(1);
    }
})

// 人数が揃ったらゲームスタート
socket.on('gameStart',judge=>{
    gameStart=judge;
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