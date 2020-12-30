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

//var userName; //自分のユーザーネーム

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

function rotatefromscreen(screenx,screeny,color){ //全部0index
    var x,y;
    if (color==1) {
        x=screenx;
        y=screeny;
        return [x,y]
    } else if (color==2) {
        x=LENGTH + 2 - screeny - 1;
        y=screenx;
        return [x,y]
    } else if (color==3) {
        x=LENGTH + 2 - screenx - 1;
        y=LENGTH + 2 - screeny - 1;
        return [x,y]
    } else if (color==4) {
        x=screeny;
        y=LENGTH + 2 -screenx - 1;
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
        screenx= y;
        screeny=LENGTH+2-x-1;
        return [screenx,screeny]
    } else if (color==3) {
        screenx=LENGTH + 2 - x - 1;
        screeny=LENGTH + 2 - y - 1;
        return [screenx,screeny]
    } else if (color==4) {
        screenx=LENGTH+2-y - 1;
        screeny=x;
        return [screenx,screeny]
    }
}

function rotatewallfromscreen(screenx,screeny,color,wall){ //全部1index
    var x,y;
    if (color==1) {
        x=screenx;
        y=screeny;
        return [x,y]
    } else if (color==2) {
        if (wall) {
            x=LENGTH+2-screeny;
            y=screenx;
            return [x,y]
        } else {
            x=LENGTH+2-screeny-2;
            y=screenx;
            return [x,y]
        }
    } else if (color==3) {
        if (wall) {
            x=LENGTH+2-screenx-2;
            y=LENGTH+2-screeny;
            return [x,y]
        } else {
            x=LENGTH+2-screenx;
            y=LENGTH+2-screeny-2;
            return [x,y]
        }
    } else if (color==4) {
        if (wall) {
            x=screeny;
            y=LENGTH+2-screenx-2;
            return [x,y]
        } else {
            x=screeny;
            y=LENGTH+2-screenx;
            return [x,y]
        }
    }
}

function rotatewalltoscreen(x,y,color,wall){
    var screenx,screeny;
    if (color==1) {
        screenx=x;
        screeny=y;
        return [screenx,screeny]
    } else if (color==2) {
        if (wall) {
            screenx= y;
            screeny=LENGTH+2-x-2;
            return [screenx,screeny]
        } else {
            screenx= y;
            screeny=LENGTH+2-x;
            return [screenx,screeny]
        }
        
    } else if (color==3) {
        if (wall){
            screenx=LENGTH+2-x-2;
            screeny=LENGTH+2-y;
            return [screenx,screeny]
        } else {
            screenx= LENGTH+2-x;
            screeny=LENGTH+2-y-2;
            return [screenx,screeny]
        }
    } else if (color==4) {
        if (wall) {
            screenx=LENGTH+2-y;
            screeny=x;
            return [screenx,screeny]
        } else {
            screenx=LENGTH+2-y-2;
            screeny=x;
            return [screenx,screeny]
        }
    }
}






wallboard.addEventListener('click',(event)=>{

    var sendInfo = {
        stone: stone,
        wall: wall,
        id : userID,
        room: roomNumber
    };

    //console.log(myturn,gameStart);
    if(!(myturn && gameStart)){
        return;
    }

    //石を置く，または壁を置くのどちらかを実行するようにする
    var rect = wallboard.getBoundingClientRect();
    var screenx = event.clientX-Math.floor(rect.left);
    var screeny = event.clientY-Math.floor(rect.top);
    //console.log(screenx,screeny)
    
    //(xline-1 ,yline-1)ローカル座標
    var xline = Math.floor((screenx+5)*(LENGTH + 2)/600)
    var yline = Math.floor((screeny+5)*(LENGTH + 2)/600)
    console.log('local x y: ',xline-1,yline-1)

    //(x,y)グローバル座標
    var xy = rotatefromscreen(xline,yline,mycolor);
    var x= xy[0]-1;
    var y= xy[1]-1;
    console.log('server x y: ',x,y)

    if ((xline*600/(LENGTH + 2))-5 <= screenx & screenx <= (xline*600/(LENGTH + 2)) + 5 ){
        //縦向きの壁置 関数化したほういいかも

        //ここで置けるか判定する関数欲しい

        if(!wallBoardVertical[xline-1][yline-1]){
            wallcontext.lineWidth=8;
            wallcontext.beginPath();
            wallcontext.moveTo(xline*600/(LENGTH + 2),yline*600/(LENGTH + 2));
            wallcontext.lineTo(xline*600/(LENGTH + 2),(yline + 2)*600/(LENGTH + 2));
            wallcontext.stroke();
            //壁の座標と色をwallに保存、サーバに送る
            var xy=rotatewallfromscreen(xline,yline,mycolor,0);
            wall[0]=xy[0]-1;
            wall[1]=xy[1]-1;
             //console.log('壁のグローバル座標:',xy[0],xy[1],'1-indexed')
            if (mycolor==2 || mycolor==4){
                wall[2]=1;
            } else {
                wall[2]=0;
            }
            wall[3]=mycolor;
            socket.emit('wall',sendInfo);
            changeturn(0);
            wallBoardVertical[xline-1][yline-1]=true;
            wallBoardVertical[xline-1][yline]=true;
        }else{
            console.log('illegal placement');
        }
    } else if ((yline*600/(LENGTH + 2))-5 <= screeny & screeny <= (yline*600/(LENGTH + 2)) + 5) {
        //横向きの壁置く　関数化したほういいかも

        //ここで置けるか判定する関数欲しい
        if(!wallBoardHorizontal[xline-1][yline-1]){
            wallcontext.lineWidth=8;
            wallcontext.beginPath();
            wallcontext.moveTo(xline*600/(LENGTH + 2),yline*600/(LENGTH + 2));
            wallcontext.lineTo((xline+2)*600/(LENGTH + 2),yline*600/(LENGTH + 2));
            wallcontext.stroke();

            //壁の座標と色をwallに保存、サーバに送る
            var xy=rotatewallfromscreen(xline,yline,mycolor,1);
            wall[0]=xy[0]-1;
            wall[1]=xy[1]-1;
            //console.log('壁のグローバル座標:',xy[0],xy[1],' 1-indexed')
            if (mycolor==2 || mycolor==4){
                wall[2]=0;
            } else {
                wall[2]=1;
            }
            wall[3]=mycolor;
            socket.emit('wall',sendInfo);
            changeturn(0);
            wallBoardHorizontal[xline-1][yline-1]=true;
            wallBoardHorizontal[xline][yline-1]=true;
        }else{
            console.log('illegal placement');
        }
    } else {
        if(stoneBoard[xline-1][yline-1]==0){
            //移動前の駒の場所を取得
            var previousx=nowstoneposition[mycolor].x
            var previousy=nowstoneposition[mycolor].y
            //console.log('前の駒のグローバル座標:',previousx+1,previousy+1,'1-indexed')
            // 置けるか判定したい
            var previousscreen=rotatetoscreen(previousx+1,previousy+1,mycolor);
            var previousscreenx=previousscreen[0];
            var previousscreeny=previousscreen[1];
            //console.log('前の駒のローカル座標:',previousscreenx,previousscreeny,'1-indexed')
            stonecontext.clearRect((previousscreenx)*600/(LENGTH + 2),(previousscreeny)*600/(LENGTH + 2),600/(LENGTH + 2),600/(LENGTH +2))

            drawcircle((xline + 0.5)*600/(LENGTH + 2),(yline + 0.5)*600/(LENGTH + 2),mycolor)
            //console.log('新しく置いた駒のローカル座標',xline,yline,mycolor,'1-indexed')
            changeturn(0);
            stoneBoard[nowstoneposition[mycolor].x][nowstoneposition[mycolor].y]=0;
            stoneBoard[xline-1][yline-1]=mycolor;
            /*
            var xy = rotatefromscreen(xline,yline,mycolor);
            var x= xy[0]-1;
            var y= xy[1]-1;
            */
            //console.log('色の駒を新しく置いたグローバル座標',x,y,'0-indeede');
            nowstoneposition[mycolor].x=x;
            nowstoneposition[mycolor].y=y;
            //把棋子在服务器上的坐标传回服务器更新棋盘
            stone[0]=x;
            stone[1]=y;
            stone[2]=mycolor;
            //console.log('send',sendInfo.stone);
            socket.emit('stone',sendInfo);
        }else{
            console.log('illegal placement');
        }
    }
});

//listen on setting, receive the given id, color and room number 
socket.on('setting',(setting)=>{
    userID = setting.id;
    roomNumber = setting.room;
    mycolor=setting.color;

    //各プレーヤーの色々な初期化
    if (setting.color==1) {
        changeturn(1);
        //ローカル盤面の初期化
        drawcircle(((LENGTH + 1)/2 + 0.5)*600/(LENGTH + 2),(LENGTH+0.5)*600/(LENGTH + 2),1)// した
        drawcircle(((LENGTH + 1)/2 + 0.5)*600/(LENGTH + 2),1.5*600/(LENGTH + 2),3)// 上
        drawcircle((LENGTH+0.5)*600/(LENGTH + 2),((LENGTH + 1)/2 + 0.5)*600/(LENGTH + 2),4)//右
        drawcircle(1.5*600/(LENGTH + 2),((LENGTH + 1)/2 + 0.5)*600/(LENGTH + 2),2)//左
        //ローカル座標の初期化
        stoneBoard[(LENGTH - 1)/2][LENGTH-1]=4;//4,8
        stoneBoard[0][(LENGTH - 1)/2]=3;//0,4
        stoneBoard[(LENGTH - 1)/2][0]=2;//4,0
        stoneBoard[LENGTH-1][(LENGTH - 1)/2]=1;//8,4
        //各色の石の現在位置の初期化
        nowstoneposition[1].x=LENGTH-1;
        nowstoneposition[1].y=(LENGTH - 1)/2;
        nowstoneposition[2].x=(LENGTH - 1)/2;
        nowstoneposition[2].y=0;
        nowstoneposition[3].x=0;
        nowstoneposition[3].y=(LENGTH - 1)/2;
        nowstoneposition[4].x=(LENGTH-1)/2;
        nowstoneposition[4].y=LENGTH - 1;
    } else if (setting.color==2) {
        changeturn(0);
        //ローカル盤面の初期化
        drawcircle(((LENGTH + 1)/2 + 0.5)*600/(LENGTH + 2),(LENGTH+0.5)*600/(LENGTH + 2),2)
        drawcircle(((LENGTH + 1)/2 + 0.5)*600/(LENGTH + 2),1.5*600/(LENGTH + 2),4)
        drawcircle((LENGTH+0.5)*600/(LENGTH + 2),((LENGTH + 1)/2 + 0.5)*600/(LENGTH + 2),1)
        drawcircle(1.5*600/(LENGTH + 2),((LENGTH + 1)/2 + 0.5)*600/(LENGTH + 2),3)
        //ローカル座標の初期化
        stoneBoard[(LENGTH - 1)/2][LENGTH-1]=1;
        stoneBoard[0][(LENGTH - 1)/2]=4;
        stoneBoard[(LENGTH - 1)/2][0]=3;
        stoneBoard[LENGTH-1][(LENGTH - 1)/2]=2;
        //各色の石の現在位置の初期化
        nowstoneposition[2].x=LENGTH-1;
        nowstoneposition[2].y=(LENGTH - 1)/2;
        nowstoneposition[3].x=(LENGTH - 1)/2;
        nowstoneposition[3].y=0;
        nowstoneposition[4].x=0;
        nowstoneposition[4].y=(LENGTH - 1)/2;
        nowstoneposition[1].x=(LENGTH-1)/2;
        nowstoneposition[1].y=LENGTH - 1;
    } else if (setting.color==3) {
        changeturn(0);
        //ローカル盤面の初期化
        drawcircle(((LENGTH + 1)/2 + 0.5)*600/(LENGTH + 2),(LENGTH+0.5)*600/(LENGTH + 2),3)
        drawcircle(((LENGTH + 1)/2 + 0.5)*600/(LENGTH + 2),1.5*600/(LENGTH + 2),1)
        drawcircle((LENGTH+0.5)*600/(LENGTH + 2),((LENGTH + 1)/2 + 0.5)*600/(LENGTH + 2),2)
        drawcircle(1.5*600/(LENGTH + 2),((LENGTH + 1)/2 + 0.5)*600/(LENGTH + 2),4)
        //ローカル座標の初期化
        stoneBoard[(LENGTH - 1)/2][LENGTH-1]=2;
        stoneBoard[0][(LENGTH - 1)/2]=1;
        stoneBoard[(LENGTH - 1)/2][0]=4;
        stoneBoard[LENGTH-1][(LENGTH - 1)/2]=3;
        //各色の石の現在位置の初期化
        nowstoneposition[3].x=LENGTH-1;
        nowstoneposition[3].y=(LENGTH - 1)/2;
        nowstoneposition[4].x=(LENGTH - 1)/2;
        nowstoneposition[4].y=0;
        nowstoneposition[1].x=0;
        nowstoneposition[1].y=(LENGTH - 1)/2;
        nowstoneposition[2].x=(LENGTH-1)/2;
        nowstoneposition[2].y=LENGTH - 1;
    } else if (setting.color==4) {
        changeturn(0);
        //ローカル盤面の初期化
        drawcircle(((LENGTH + 1)/2 + 0.5)*600/(LENGTH + 2),(LENGTH+0.5)*600/(LENGTH + 2),4)
        drawcircle(((LENGTH + 1)/2 + 0.5)*600/(LENGTH + 2),1.5*600/(LENGTH + 2),2)
        drawcircle((LENGTH+0.5)*600/(LENGTH + 2),((LENGTH + 1)/2 + 0.5)*600/(LENGTH + 2),3)
        drawcircle(1.5*600/(LENGTH + 2),((LENGTH + 1)/2 + 0.5)*600/(LENGTH + 2),1)
        //ローカル座標の初期化
        stoneBoard[(LENGTH - 1)/2][LENGTH-1]=3;
        stoneBoard[0][(LENGTH - 1)/2]=2;
        stoneBoard[(LENGTH - 1)/2][0]=1;
        stoneBoard[LENGTH-1][(LENGTH - 1)/2]=4;
        //各色の石の現在位置の初期化
        nowstoneposition[4].x=LENGTH-1;
        nowstoneposition[4].y=(LENGTH - 1)/2;
        nowstoneposition[1].x=(LENGTH - 1)/2;
        nowstoneposition[1].y=0;
        nowstoneposition[2].x=0;
        nowstoneposition[2].y=(LENGTH - 1)/2;
        nowstoneposition[3].x=(LENGTH-1)/2;
        nowstoneposition[3].y=LENGTH - 1;
    }  
    console.log(setting);
})

socket.on('Broadcast',(msg,previousStone)=>{
    // 前の石の座標
    // previousStone[color-1][c]
    // 配列数はプレイヤーの人数4 × 座標2 = 8
    // color:1 の人の前の石のx座標はpreviousStone[0][0]にある
    //console.log(previousStone[msg[2]-1]);
    //
    if (msg[2]==mycolor){
        return;
    }
    var line=rotatetoscreen(msg[0]+1,msg[1]+1,mycolor);
    var xline=line[0];
    var yline=line[1];
    var color=msg[2];

    //console.log('recieve color:'+color+ xline-1+ yline-1)
    
    var previousx=nowstoneposition[color].x;
    var previousy=nowstoneposition[color].y;
    var previousscreen=rotatetoscreen(previousx+1,previousy+1,mycolor)
    var previousscreenx=previousscreen[0];
    var previousscreeny=previousscreen[1];
    console.log('色:',color,'の駒の以前のローカル座標',previousscreenx,previousscreeny,'1-indexed')
    stonecontext.clearRect((previousscreenx)*600/(LENGTH + 2),(previousscreeny)*600/(LENGTH + 2),600/(LENGTH + 2),600/(LENGTH +2))
    
    drawcircle((xline+0.5)*600/(LENGTH + 2),(yline+0.5)*600/(LENGTH + 2),color)
    //console.log(xline,yline,color)
    stoneBoard[msg[0]][msg[1]]=color;
    stoneBoard[nowstoneposition[color].x][nowstoneposition[color].y]=0;
    nowstoneposition[color].x=msg[0];
    nowstoneposition[color].y=msg[1];
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
    console.log('壁のグローバル座標:',msg[0]+1,msg[1]+1)

    var wallDirection=msg[2];
    console.log('walld:',wallDirection)
    var screen=rotatewalltoscreen(msg[0]+1,msg[1]+1,mycolor,wallDirection);
    var screenx=screen[0];
    var screeny=screen[1];
    var xline=screenx;
    var yline=screeny;
    if (wallDirection) {
        wallBoardHorizontal[msg[0]][msg[1]]=true;
        wallBoardHorizontal[msg[0]+1][msg[1]]=true;
    } else {
        wallBoardVertical[msg[0]][msg[1]]=true;
        wallBoardHorizontal[msg[0]][msg[1]+1]=true;
    }
    console.log('壁のローカル座標:',xline,yline)
    if (wallDirection){
        if (mycolor==2 || mycolor==4){
            wallcontext.lineWidth=8;
            wallcontext.beginPath();
            wallcontext.moveTo(xline*600/(LENGTH + 2),yline*600/(LENGTH + 2));
            wallcontext.lineTo(xline*600/(LENGTH + 2),(yline+2)*600/(LENGTH + 2));
            wallcontext.stroke();
        } else {
            wallcontext.lineWidth=8;
            wallcontext.beginPath();
            wallcontext.moveTo(xline*600/(LENGTH + 2),yline*600/(LENGTH + 2));
            wallcontext.lineTo((xline + 2)*600/(LENGTH + 2),yline*600/(LENGTH + 2));
            wallcontext.stroke();
        }
        
    } else {
        if (mycolor==2 || mycolor==4) {
            wallcontext.lineWidth=8;
            wallcontext.beginPath();
            wallcontext.moveTo(xline*600/(LENGTH + 2),yline*600/(LENGTH + 2));
            wallcontext.lineTo((xline+2)*600/(LENGTH + 2),yline*600/(LENGTH + 2));
            wallcontext.stroke();
        } else {
            wallcontext.lineWidth=8;
            wallcontext.beginPath();
            wallcontext.moveTo(xline*600/(LENGTH + 2),yline*600/(LENGTH + 2));
            wallcontext.lineTo(xline*600/(LENGTH + 2),(yline + 2)*600/(LENGTH + 2));
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

/*
socket.on("display_username",function(username){
    var displayName = "";
    for(var i = 1; i <= 4; i++){
        if(username[str(roomNumber)][str(i)]){
            displayName += username[str(roomNumber)][str(i)] + "<br>";
        }
    }
    document.getElementById("display_username").innerHTML = displayName;
})
*/

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

//TODO:ユーザー名をサーバーに送信
function register_username() {
    var username;
    username = document.getElementById("username").value;
    registerName = {"roomNumber":roomNumber,"color":mycolor,"username":username};
    socket.emit("register_username",registerName);
    //display_username();
}

//TODO:他のユーザー名を受け取って表示（色とユーザー名が分かるようにする）
/*
function display_username(){
    var displayName;
    
    document.getElementById("display_username").innerHTML = userName;
}
*/
