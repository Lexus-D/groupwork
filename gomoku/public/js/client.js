var socket=window.io();
var stone=new Array(3);
var imageboard=document.getElementById('imageboard');
var lineboard=document.getElementById('lineboard');
var stoneboard=document.getElementById('stoneboard');
var turn=document.getElementById("turn");
var myturn=0;//初期カラーが黒なら1白なら0
var mycolor=1;//null
var userid;//サーバから割り当てられるID
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
    var sendinfo = {stoneinfo: stone,id : userid};
    if(!myturn){
        return;
    }
    var rect=stoneboard.getBoundingClientRect();
    var x=event.clientX-Math.floor(rect.left);
    var y=event.clientY-Math.floor(rect.top);
    x=Math.floor(x/40);
    y=Math.floor(y/40);
    console.log(x,y);
    stone[0]=x;
    stone[1]=y;
    stone[2]=mycolor;
    console.log('mycolor:'+mycolor);
    socket.emit('message',sendinfo);
    drawcircle(20+x*40,20+y*40,mycolor);
    changeturn(0);
});

socket.on('setting',(setting)=>{
    userid = setting.id;
    if(setting.number==0){   //最初の色決め
        mycolor=0;
        changeturn(1);
    }
    else if(setting.number==1){
        mycolor=1;
        changeturn(0);
    }
    console.log(setting);
})

socket.on('message',(msg)=>{
    if(msg=="win"){
        //勝った時の処理
    }
    else if(msg=="lose"){
        //負けた時の処理
    }
    else{
        var x=msg[0];
        var y=msg[1];
        var color=msg[2];
        console.log('color:'+color)
        drawcircle(20+x*40,20+y*40,color);
        changeturn(1);
    }
});
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
