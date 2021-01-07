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

var premousex = 0;
var premousey = 0;
var premousedirection = 0; //駒は0,横壁は1,縦壁は2
//石の現在位置
for(var i = 0;i < 5; i++){
    nowstoneposition[i]={
        x:0,
        y:0
    }
}

// 石用 基準
for(var i=0;i<LENGTH;i++){
    stoneBoard[i]=[];
    for(var j=0;j<LENGTH;j++){
        stoneBoard[i][j]=0
    }
}

// 壁用のボード  基準
for(var i=0;i<=LENGTH;i++){
    wallBoardVertical[i]=[];
    wallBoardHorizontal[i]=[];
    for(var j=0;j<=LENGTH;j++){
        wallBoardVertical[i][j]=false;
        wallBoardHorizontal[i][j]=false;
    }
}

window.onload = () =>{
    var imgcontext=imageboard.getContext('2d');
    var ix = 0;
    var iy = 0;
    var w = 600;
    var h = 600;
    var r = 30;
    var col = 'rgb(129,177,181)'
    imgcontext.beginPath();
    imgcontext.lineWidth = 1;
    imgcontext.strokeStyle = col;
    imgcontext.fillStyle = col;
    imgcontext.moveTo(ix,iy + r);
    imgcontext.arc(ix+r,iy+h-r,r,Math.PI,Math.PI*0.5,true);
    imgcontext.arc(ix+w-r,iy+h-r,r,Math.PI*0.5,0,1);
    imgcontext.arc(ix+w-r,iy+r,r,0,Math.PI*1.5,1);
    imgcontext.arc(ix+r,iy+r,r,Math.PI*1.5,Math.PI,1);
    imgcontext.closePath();
    imgcontext.stroke();
    imgcontext.fill();
};

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

//draw the checkerboard
var context = lineboard.getContext('2d');
context.lineWidth=10
context.strokeStyle="rgb(170,211,214)"

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

//draw stone
var stonecontext=stoneboard.getContext('2d');
function　drawcircle(x,y,color){
    if (color == 1) {
        stonecontext.fillStyle="rgb(245,128,120)";// 赤
    } else if (color == 2) {
        stonecontext.fillStyle="rgb(120,130,245)";// 青
    } else if (color == 3) {
        stonecontext.fillStyle="rgb(120,245,143)";// 緑
    } else if (color == 4) {
        stonecontext.fillStyle="rgb(245,234,120)"; // 黄
    }
    stonecontext.beginPath();
    stonecontext.arc(x,y,15,0,2*Math.PI,true);
    stonecontext.fill();
    stonecontext.stroke();
}

function drawuprect(color) {
    var imgcontext=imageboard.getContext('2d');
    imgcontext.fillStyle = color;
    imgcontext.lineWidth = 1;
    imgcontext.strokeStyle = color;
    imgcontext.strokeRect(600 / (LENGTH + 2) + 5, 0, 600 - 2 * (600 / (LENGTH + 2)) - 10, 600 / (LENGTH + 2)) - 5;
    imgcontext.fillRect(600 / (LENGTH + 2) + 5, 0, 600 - 2 * (600 / (LENGTH + 2)) - 10, 600 / (LENGTH + 2)) - 5;
}

function drawleftrect(color) {
    var imgcontext=imageboard.getContext('2d');
    imgcontext.fillStyle = color;
    imgcontext.lineWidth = 1;
    imgcontext.strokeStyle = color;
    imgcontext.strokeRect(0, 600 / (LENGTH + 2) + 5, 600 / (LENGTH + 2) - 5, 600 - 2 * (600 / (LENGTH + 2)) - 10);
    imgcontext.fillRect(0, 600 / (LENGTH + 2) + 5, 600 / (LENGTH + 2) - 5, 600 - 2 * (600 / (LENGTH + 2)) - 10);
}

function drawdownrect(color) {
    var imgcontext=imageboard.getContext('2d');
    imgcontext.fillStyle = color;
    imgcontext.lineWidth = 1;
    imgcontext.strokeStyle = color;
    imgcontext.strokeRect(600 / (LENGTH + 2) + 5, 600 - (600 / (LENGTH + 2)) + 5, 600 - 2 * (600 / (LENGTH + 2)) - 10, 600 / (LENGTH + 2)) - 5;
    imgcontext.fillRect(600 / (LENGTH + 2) + 5, 600 - (600 / (LENGTH + 2)) + 5, 600 - 2 * (600 / (LENGTH + 2)) - 10, 600 / (LENGTH + 2)) - 5;
}

function drawrightrect(color) {
    var imgcontext=imageboard.getContext('2d');
    imgcontext.fillStyle = color;
    imgcontext.lineWidth = 1;
    imgcontext.strokeStyle = color;
    imgcontext.strokeRect(600 - (600 / (LENGTH + 2)) + 5, 600 / (LENGTH + 2) + 5, 600 / (LENGTH + 2) - 5, 600 - 2 * (600 / (LENGTH + 2)) - 10);
    imgcontext.fillRect(600 - (600 / (LENGTH + 2)) + 5, 600 / (LENGTH + 2) + 5, 600 / (LENGTH + 2) - 5, 600 - 2 * (600 / (LENGTH + 2)) - 10);
}

/*
function preclear(premousex,premousey,premousedirection) {
    if (premousedirection == 0) {
        wallcontext.clearRect(premousex, premousey,600 / (LENGTH + 2), 600 / (LENGTH + 2))
    } else if (premousedirection == 1) {
        wallcontext.clearRect(premousex, premousey - 8, 1200 / (LENGTH + 2), 16)
    } else if (premousedirection == 2) {
        wallcontext.clearRect(premousex - 8, premousey, 16, 1200 / (LENGTH + 2))
    }
}
*/
//ローカル座標からグローバル座標に変換
function rotatefromscreen(screenx,screeny,color){ //全部1index(1~9)
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

//グローバル座標からローカル座標に変換
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

function rotatewallfromscreen(screenx,screeny,color,wall){ //全部1index(1~9)
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


wallboard.addEventListener('mousemove',(e)=>{
    if(!(myturn && gameStart)){
        return;
    }
    var rect = wallboard.getBoundingClientRect();
    var x = e.clientX-Math.floor(rect.left);
    var y = e.clientY-Math.floor(rect.top);
    var xline = Math.floor((x+5)*(LENGTH + 2)/600);
    var yline = Math.floor((y+5)*(LENGTH + 2)/600);
    var wallcontext = wallboard.getContext('2d');
    if((xline*600/(LENGTH + 2))-5<=x & x<=(xline*600/(LENGTH + 2))+5) {
        wallcontext.strokeStyle = 'rgb(26,65,69)';
        wallcontext.lineWidth = 8;
        //preclear(premousex,premousey,premousedirection)
        wallcontext.clearRect(0,0,600,600);
        wallcontext.beginPath();
        wallcontext.moveTo(xline*600/(LENGTH + 2),yline*600/(LENGTH + 2));
        wallcontext.lineTo(xline*600/(LENGTH + 2),(yline + 2)*600/(LENGTH + 2))
        wallcontext.stroke();
        premousex = xline * 600 / (LENGTH + 2);
        premousey = yline * 600 / (LENGTH + 2);
        premousedirection = 1;
    } else if ((yline*600/(LENGTH + 2))-5 <= y & y <= (yline*600/(LENGTH + 2)) + 5) {
        //横壁
        wallcontext.strokeStyle = 'rgb(26,65,69)';
        wallcontext.lineWidth = 8;
        wallcontext.clearRect(0,0,600,600);
        //preclear(premousex,premousey,premousedirection)
        wallcontext.beginPath();
        wallcontext.moveTo(xline*600/(LENGTH + 2),yline*600/(LENGTH + 2));
        wallcontext.lineTo((xline + 2)*600/(LENGTH + 2),yline*600/(LENGTH + 2))
        wallcontext.stroke();
        premousex = xline * 600 / (LENGTH + 2);
        premousey = yline * 600 / (LENGTH + 2);
        premousedirection = 2;
    } else {
        //駒
        wallcontext.strokeStyle = 'rgb(26,65,69)';
        wallcontext.lineWidth = 8;
        wallcontext.clearRect(0,0,600,600);
        //preclear(premousex,premousey,premousedirection)
        wallcontext.beginPath();
        wallcontext.arc((xline + 0.5) * 600 / (LENGTH + 2),(yline + 0.5) * 600 / (LENGTH + 2),15,0,2*Math.PI,true);
        wallcontext.fill();
        wallcontext.stroke();
        premousex = xline * 600 / (LENGTH + 2);
        premousey = yline * 600 / (LENGTH + 2);
        premousedirection = 0;
    }
})

wallboard.addEventListener('click',(event)=>{

    var sendInfo = {
        stone: stone,
        wall: wall,
        id : userID,
        room: roomNumber
    };
    if(!(myturn && gameStart)){
        return;
    }

    //石を置く，または壁を置くのどちらかを実行するようにする
    var rect = wallboard.getBoundingClientRect();
    var screenx = event.clientX-Math.floor(rect.left);
    var screeny = event.clientY-Math.floor(rect.top);
 
    //ローカル座標
    var xline = Math.floor((screenx+5)*(LENGTH + 2)/600)
    var yline = Math.floor((screeny+5)*(LENGTH + 2)/600)
    console.log('ボード上にクリックしたローカル座標 ',xline-1,yline-1)//index starts from 0
    
    //石のローカル座標を用いてグローバル座標を計算し、serverとclientの盤面を更新
    var xy = rotatefromscreen(xline,yline,mycolor);
    var x= xy[0]-1;
    var y= xy[1]-1;
    
    
    if ((xline*600/(LENGTH + 2))-5 <= screenx & screenx <= (xline*600/(LENGTH + 2)) + 5 ){
        //縦向きの壁置 walldirection=0
        
        //クリックのローカル座標を用いて縦壁のグローバル座標を計算
        var wxy=rotatewallfromscreen(xline,yline,mycolor,0);
        var wx=wxy[0]-1;
        var wy=wxy[1]-1;
        
        //既に壁があるところに置けない
        if(mycolor==2||mycolor==4){//player 2と4が置いた壁の向きは逆だから、逆方向のwallBoardをチェック
            if(wallBoardHorizontal[wx][wy]||wallBoardHorizontal[wx+1][wy]||wx>7){
                console.log('illegal placement');
                return;
            }
        }else{
            if(wallBoardVertical[wx][wy]||wallBoardVertical[wx][wy+1]||wy>7){
                console.log('illegal placement');
                return;
            }
        }
        //壁を十字に置けない

        //石を囲むように置けない

        stonecontext.lineWidth=8;
        stonecontext.strokeStyle='rgb(18,51,54)';
        stonecontext.beginPath();
        stonecontext.moveTo(xline*600/(LENGTH + 2),yline*600/(LENGTH + 2));
        stonecontext.lineTo(xline*600/(LENGTH + 2),(yline + 2)*600/(LENGTH + 2));
        stonecontext.stroke();
        
        //置かれた壁のグローバル向きを計算し、wallboardを更新する
        if (mycolor==2 || mycolor==4){
            wall[2]=1;//player 2,4が置いた縦壁はグローバル上では横壁
            console.log('壁のグローバル座標:(',wx,wy,')(',wx+1,wy,')','global direction:横');
            wallBoardHorizontal[wx][wy]=true;
            wallBoardHorizontal[wx+1][wy]=true;
        } else {
            wall[2]=0;
            console.log('壁のグローバル座標:(',wx,wy,')(',wx,wy+1,')','global direction:縦');
            wallBoardVertical[wx][wy]=true;
            wallBoardVertical[wx][wy+1]=true;
        }
        wall[0]=wx;
        wall[1]=wy;
        wall[3]=mycolor;
        socket.emit('wall',sendInfo);
        if (mycolor == 4) {
            changeturn(1);
        } else {
            changeturn(mycolor + 1);
        }
           
    } else if ((yline*600/(LENGTH + 2))-5 <= screeny & screeny <= (yline*600/(LENGTH + 2)) + 5) {
    //横向きの壁置く　walldirection=1
        //クリックのローカル座標を用いて横壁のグローバル座標を計算
        var wxy=rotatewallfromscreen(xline,yline,mycolor,1);
        var wx=wxy[0]-1;
        var wy=wxy[1]-1;
        
        //既に壁があるところに置けない
        if(mycolor==2||mycolor==4){
            if(wallBoardVertical[wx][wy]||wallBoardVertical[wx][wy+1]||wy>7){
                console.log('illegal placement');
                return;
            }
        }else{
            if(wallBoardHorizontal[wx][wy]||wallBoardHorizontal[wx+1][wy]||wx>7){
                console.log('illegal placement');
                return;
            }       
        }
        //壁を十字に置けない
        //石を囲むように置けない

        stonecontext.lineWidth=8;
        stonecontext.strokeStyle='rgb(18,51,54)';
        stonecontext.beginPath();
        stonecontext.moveTo(xline*600/(LENGTH + 2),yline*600/(LENGTH + 2));
        stonecontext.lineTo((xline+2)*600/(LENGTH + 2),yline*600/(LENGTH + 2));
        stonecontext.stroke();

        //壁の座標と色をwallに保存、サーバに送る
        wall[0]=wx;
        wall[1]=wy;
        if (mycolor==2 || mycolor==4){
            wall[2]=0;//player 2,4が置いた横壁はグローバル上では縦壁
            console.log('壁のグローバル座標:(',wx,wy,')(',wx,wy+1,')','global direction:縦');
            wallBoardVertical[wx][wy]=true;
            wallBoardVertical[wx][wy+1]=true;
        } else {
            wall[2]=1;
            console.log('壁のグローバル座標:(',wx,wy,')(',wx+1,wy,')','global direction:横');
            wallBoardHorizontal[wx][wy]=true;
            wallBoardHorizontal[wx+1][wy]=true;
        }
        wall[3]=mycolor;
        socket.emit('wall',sendInfo);
        if (mycolor == 4) {
            changeturn(1);
        } else {
            changeturn(mycolor + 1);
        } 
        
        
    } else {
        //石を置く
              
        if(stoneBoard[x][y]!=0){
            //石のあるところに置けないようにする
            console.log('occupied position');
            return;
        }else if(Math.abs(x-nowstoneposition[mycolor].x)>2||Math.abs(y-nowstoneposition[mycolor].y)>2){           
            //遠すぎるところに置けない
            console.log('too far away');
            return;
        }
        
        //壁を越えてはいけない
        if(y-nowstoneposition[mycolor].y==1){
            if(wallBoardHorizontal[x][y+1]){
                console.log('cannot go across the wall');
                return;
            }
        }else if(y-nowstoneposition[mycolor].y==-1){
            if(wallBoardHorizontal[x][y]){
                console.log('cannot go across the wall');
                return;
            }
        }else if(x-nowstoneposition[mycolor].x==1){
            if(wallBoardVertical[x+1][y]){
                console.log('cannot go across the wall');
                return;
            }
        }else if(x-nowstoneposition[mycolor].x==-1){
            if(wallBoardVertical[x][y]){
                console.log('cannot go across the wall');
                return;
            }
        }


       
        //相手の石をジャンプ
        if(y-nowstoneposition[mycolor].y==2){
            if(stoneBoard[x][y-1]!=0){
                //下にある相手の駒をジャンプして移動する
                stoneUpdate(xline,yline,x,y,nowstoneposition[mycolor].x,nowstoneposition[mycolor].y,mycolor)
                //新しく置かれた石の情報を送る
                stone[0]=x;
                stone[1]=y;
                stone[2]=mycolor;
                console.log('send',sendInfo.stone);
                socket.emit('stone',sendInfo);
            }
        }else if(y-nowstoneposition[mycolor].y==-2){
            if(stoneBoard[x][y+1]!=0){
                //上にある相手の駒をジャンプして移動する
                stoneUpdate(xline,yline,x,y,nowstoneposition[mycolor].x,nowstoneposition[mycolor].y,mycolor)
                
                stone[0]=x;
                stone[1]=y;
                stone[2]=mycolor;
                console.log('send',sendInfo.stone);
                socket.emit('stone',sendInfo);
            }
        }else if(x-nowstoneposition[mycolor].x==2){
            if(stoneBoard[x-1][y]!=0){
                //右にある相手の駒をジャンプして移動する
                stoneUpdate(xline,yline,x,y,nowstoneposition[mycolor].x,nowstoneposition[mycolor].y,mycolor)
                
                stone[0]=x;
                stone[1]=y;
                stone[2]=mycolor;
                console.log('send',sendInfo.stone);
                socket.emit('stone',sendInfo);
            }
        }else if(x-nowstoneposition[mycolor].x==-2){
            if(stoneBoard[x+1][y]!=0){
                //左にある相手の駒をジャンプして移動する
                stoneUpdate(xline,yline,x,y,nowstoneposition[mycolor].x,nowstoneposition[mycolor].y,mycolor)
                
                stone[0]=x;
                stone[1]=y;
                stone[2]=mycolor;
                console.log('send',sendInfo.stone);
                socket.emit('stone',sendInfo);
            }
        }else{
            console.log('illegal placement');
        }  

        //上下左右一歩
        if(Math.abs(x-nowstoneposition[mycolor].x)==1&&y==nowstoneposition[mycolor].y){
            stoneUpdate(xline,yline,x,y,nowstoneposition[mycolor].x,nowstoneposition[mycolor].y,mycolor)
            stone[0]=x;
            stone[1]=y;
            stone[2]=mycolor;
            console.log('send',sendInfo.stone);
            socket.emit('stone',sendInfo);
        }else if(Math.abs(y-nowstoneposition[mycolor].y)==1&&x==nowstoneposition[mycolor].x){
            stoneUpdate(xline,yline,x,y,nowstoneposition[mycolor].x,nowstoneposition[mycolor].y,mycolor)
            stone[0]=x;
            stone[1]=y;
            stone[2]=mycolor;
            console.log('send',sendInfo.stone);
            socket.emit('stone',sendInfo);
        }else{
            console.log('illegal placement');
        }
    }
});

//駒を更新する関数
function stoneUpdate(xline,yline,x,y,nowpositionx,nowpositiony,mycolor){
    //移動前の駒の場所を取得
    var previousx=nowpositionx
    var previousy=nowpositiony
    
    var previousscreen=rotatetoscreen(previousx+1,previousy+1,mycolor);//index starts from 1
    var previousscreenx=previousscreen[0];
    var previousscreeny=previousscreen[1];
    console.log('前の駒のローカル座標:',previousscreenx-1,previousscreeny-1)//index starts from 0

    stonecontext.clearRect((previousscreenx)*600/(LENGTH + 2),(previousscreeny)*600/(LENGTH + 2),600/(LENGTH + 2),600/(LENGTH +2))
    drawcircle((xline + 0.5)*600/(LENGTH + 2),(yline + 0.5)*600/(LENGTH + 2),mycolor)

    console.log('新しく置いた駒のローカル座標',xline-1,yline-1)//index starts from 0
    if (mycolor == 4) {
        changeturn(1);
    } else {
        changeturn(mycolor + 1)
    }

    console.log('前の駒のグローバル座標:',previousx,previousy)//index starts from 0
    console.log(mycolor,'色の駒を新しく置いたグローバル座標',x,y);//index starts from 0
    
    stoneBoard[previousx][previousy]=0;//以前の位置を0に
    stoneBoard[x][y]=mycolor;//新しく置かれた位置に色を書き込む
    nowstoneposition[mycolor].x=x;//受け取った色の現在位置を更新
    nowstoneposition[mycolor].y=y;
}

//ローカル盤面初期化 
socket.on('setting',(setting)=>{
    userID = setting.id;
    roomNumber = setting.room;
    mycolor=setting.color;
    
    if (setting.color==1) {
        
        drawcircle(((LENGTH + 1)/2 + 0.5)*600/(LENGTH + 2),(LENGTH+0.5)*600/(LENGTH + 2),1)// した
        drawcircle(((LENGTH + 1)/2 + 0.5)*600/(LENGTH + 2),1.5*600/(LENGTH + 2),3)// 上
        drawcircle((LENGTH+0.5)*600/(LENGTH + 2),((LENGTH + 1)/2 + 0.5)*600/(LENGTH + 2),4)//右
        drawcircle(1.5*600/(LENGTH + 2),((LENGTH + 1)/2 + 0.5)*600/(LENGTH + 2),2)//左
        
        drawuprect("rgb(245,128,120)")
        drawrightrect("rgb(120,130,245)")
        drawdownrect("rgb(120,245,143)")
        drawleftrect("rgb(245,234,120)")
    } else if (setting.color==2) {
        
        drawcircle(((LENGTH + 1)/2 + 0.5)*600/(LENGTH + 2),(LENGTH+0.5)*600/(LENGTH + 2),2)
        drawcircle(((LENGTH + 1)/2 + 0.5)*600/(LENGTH + 2),1.5*600/(LENGTH + 2),4)
        drawcircle((LENGTH+0.5)*600/(LENGTH + 2),((LENGTH + 1)/2 + 0.5)*600/(LENGTH + 2),1)
        drawcircle(1.5*600/(LENGTH + 2),((LENGTH + 1)/2 + 0.5)*600/(LENGTH + 2),3)
        drawleftrect("rgb(245,128,120)")
        drawuprect("rgb(120,130,245)")
        drawrightrect("rgb(120,245,143)")
        drawdownrect("rgb(245,234,120)")
    } else if (setting.color==3) {
        
        drawcircle(((LENGTH + 1)/2 + 0.5)*600/(LENGTH + 2),(LENGTH+0.5)*600/(LENGTH + 2),3)
        drawcircle(((LENGTH + 1)/2 + 0.5)*600/(LENGTH + 2),1.5*600/(LENGTH + 2),1)
        drawcircle((LENGTH+0.5)*600/(LENGTH + 2),((LENGTH + 1)/2 + 0.5)*600/(LENGTH + 2),2)
        drawcircle(1.5*600/(LENGTH + 2),((LENGTH + 1)/2 + 0.5)*600/(LENGTH + 2),4)
        drawdownrect("rgb(245,128,120)")
        drawleftrect("rgb(120,130,245)")
        drawuprect("rgb(120,245,143)")
        drawrightrect("rgb(245,234,120)")
    } else if (setting.color==4) {
        
        drawcircle(((LENGTH + 1)/2 + 0.5)*600/(LENGTH + 2),(LENGTH+0.5)*600/(LENGTH + 2),4)
        drawcircle(((LENGTH + 1)/2 + 0.5)*600/(LENGTH + 2),1.5*600/(LENGTH + 2),2)
        drawcircle((LENGTH+0.5)*600/(LENGTH + 2),((LENGTH + 1)/2 + 0.5)*600/(LENGTH + 2),3)
        drawcircle(1.5*600/(LENGTH + 2),((LENGTH + 1)/2 + 0.5)*600/(LENGTH + 2),1)
        drawrightrect("rgb(245,128,120)")
        drawdownrect("rgb(120,130,245)")
        drawleftrect("rgb(120,245,143)")
        drawuprect("rgb(245,234,120)")
    }
    nowstoneposition[1].x=(LENGTH - 1)/2;
    nowstoneposition[1].y=LENGTH-1;
    nowstoneposition[2].x=0;
    nowstoneposition[2].y=(LENGTH - 1)/2;
    nowstoneposition[3].x=(LENGTH - 1)/2;
    nowstoneposition[3].y=0;
    nowstoneposition[4].x=LENGTH-1;
    nowstoneposition[4].y=(LENGTH - 1)/2;
    console.log(setting);

    stoneBoard[(LENGTH - 1)/2][LENGTH-1]=1;
    stoneBoard[0][(LENGTH - 1)/2]=2;
    stoneBoard[(LENGTH - 1)/2][0]=3;
    stoneBoard[LENGTH-1][(LENGTH - 1)/2]=4;
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
    //グローバル座標を用いてローカル座標を計算
    var line=rotatetoscreen(msg[0]+1,msg[1]+1,mycolor);
    var xline=line[0];
    var yline=line[1];
    var color=msg[2];

    //受け取った駒の前のローカル座標
    var previousx=nowstoneposition[color].x;
    var previousy=nowstoneposition[color].y;
    var previousscreen=rotatetoscreen(previousx+1,previousy+1,mycolor)//index starts from 1
    var previousscreenx=previousscreen[0];
    var previousscreeny=previousscreen[1];
    console.log('色:',color,'の駒の以前のglobal座標',previousx,previousy)//index starts from 0
    console.log('色:',color,'の駒の現在のglobal座標',msg[0],msg[1])//index starts from 0
    console.log('色:',color,'の駒の以前のlocal座標',previousscreenx-1,previousscreeny-1)//index starts from 0
    console.log('色:',color,'の駒の現在のlocal座標',xline-1,yline-1)//index starts from 0
    

    //前の位置にある駒を消し、新しい位置に置く
    stonecontext.clearRect((previousscreenx)*600/(LENGTH + 2),(previousscreeny)*600/(LENGTH + 2),600/(LENGTH + 2),600/(LENGTH +2))
    drawcircle((xline+0.5)*600/(LENGTH + 2),(yline+0.5)*600/(LENGTH + 2),color);

    stoneBoard[msg[0]][msg[1]]=color;//新しく置かれた位置に色を書き込む
    stoneBoard[previousx][previousy]=0;//以前の位置を0に
    nowstoneposition[color].x=msg[0];//受け取った色の現在位置を更新
    nowstoneposition[color].y=msg[1];
    
    //changeturn(nextTurn == myTurnNum); //4人用のとき
    if (color == 4){
        changeturn(1);
    } else {
        changeturn(color + 1);
    }
});

socket.on('wallbroadcast',(msg)=>{
    if (msg[3]==mycolor) {
        return;
    }
    
    var wallDirection=msg[2];
    console.log('壁のglobal向き:',wallDirection==0?'縦':'横')

    //ローカル盤面に壁を描く
    var screen=rotatewalltoscreen(msg[0]+1,msg[1]+1,mycolor,wallDirection);
    var screenx=screen[0];
    var screeny=screen[1];
    var xline=screenx;
    var yline=screeny;

    if (wallDirection) {  
        //横壁
        console.log('受け取った横壁のグローバル座標:(',msg[0],msg[1],')(',msg[0]+1,msg[1],')');
        wallBoardHorizontal[msg[0]][msg[1]]=true;
        wallBoardHorizontal[msg[0]+1][msg[1]]=true;
    } else {
        //縦壁
        console.log('受け取った縦壁のグローバル座標:(',msg[0],msg[1],')(',msg[0],msg[1]+1,')');
        wallBoardVertical[msg[0]][msg[1]]=true;
        wallBoardVertical[msg[0]][msg[1]+1]=true;
    }

    
    if (wallDirection){
        if (mycolor==2 || mycolor==4){
            console.log('縦壁のローカル座標:(',xline-1,yline-1,')(',xline-1,yline,')')//index starts from 0
            wallcontext.lineWidth=8;
            wallcontext.beginPath();
            wallcontext.moveTo(xline*600/(LENGTH + 2),yline*600/(LENGTH + 2));
            wallcontext.lineTo(xline*600/(LENGTH + 2),(yline+2)*600/(LENGTH + 2));
            wallcontext.stroke();
        } else {
            console.log('横壁のローカル座標:(',xline-1,yline-1,')(',xline,yline-1,')')//index starts from 0
            wallcontext.lineWidth=8;
            wallcontext.beginPath();
            wallcontext.moveTo(xline*600/(LENGTH + 2),yline*600/(LENGTH + 2));
            wallcontext.lineTo((xline + 2)*600/(LENGTH + 2),yline*600/(LENGTH + 2));
            wallcontext.stroke();
        }
        
    } else {
        if (mycolor==2 || mycolor==4) {
            console.log('横壁のローカル座標:(',xline-1,yline-1,')(',xline,yline-1,')')//index starts from 0
            wallcontext.lineWidth=8;
            wallcontext.beginPath();
            wallcontext.moveTo(xline*600/(LENGTH + 2),yline*600/(LENGTH + 2));
            wallcontext.lineTo((xline+2)*600/(LENGTH + 2),yline*600/(LENGTH + 2));
            wallcontext.stroke();
        } else {
            wallcontext.lineWidth=8;
            console.log('縦壁のローカル座標:(',xline-1,yline-1,')(',xline-1,yline,')')//index starts from 0
            wallcontext.beginPath();
            wallcontext.moveTo(xline*600/(LENGTH + 2),yline*600/(LENGTH + 2));
            wallcontext.lineTo(xline*600/(LENGTH + 2),(yline + 2)*600/(LENGTH + 2));
            wallcontext.stroke();
        }
        
    }
    
    if (color == 4){
        changeturn(1);
    } else {
        changeturn(color + 1);
    }
})

// 人数が揃ったらゲームスタート
socket.on('gameStart',judge=>{
    gameStart=judge;
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

    //stoneboard.removeEventListener('click',function (param) {  });
    myturn=0;
    reset.disabled=false;
    reset.style.display='inline';

})

// ユーザーネームの表示
// TODO: どの色がどのユーザーか分かるようにする
socket.on("display_username",(username)=>{
    var displayName = "";
    for(var i = 1; i <= 4; i++){
        if(username[roomNumber][i]){
            displayName += username[roomNumber][i] + "<br>";
        }
    }
    document.getElementById("display_username").innerHTML = displayName;
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

function changeturn(player){
    if (player == mycolor) {
        myturn=1;
        turn.innerText="あなたの番";
    }
    else {
        myturn=0;
        if (player == 1) {
            turn.innerText="プレイヤー1の番";
        } else if (player == 2) {
            turn.innerText="プレイヤー2の番";
        } else if (player == 3) {
            turn.innerText="プレイヤー3の番";
        } else if (player == 4) {
            turn.innerText="プレイヤー4の番";
        }
    }
}

function register_username() {
    var username;
    username = document.getElementById("username").value;
    registerName = {"roomNumber":roomNumber,"color":mycolor,"username":username};
    socket.emit("register_username",registerName);
}
