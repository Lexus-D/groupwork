//サーバーたてて、socketでデータの受け渡し

//サーバーを立てる
//htmlファイルを読み取る
//socket.ioを呼び出す
var http = require('http').createServer(handler);
var html = require('fs').readFileSync('public/index.html');
var io = require('socket.io')(http);

function handler(request, response) {
  response.writeHead(200, {'Content-Type': 'text/html'});
  response.end(html);
}

//接続中の処理
io.sockets.on('connection',function(socket){

    //接続切断処理
    socket.on('disconnect',function(){
        console.log("disconnect");
    });

    //たぶんここに処理を色々書いていくはず

})

http.listen(5500);
