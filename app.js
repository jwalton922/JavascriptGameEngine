
/**
 * Module dependencies.
 */
var io = require('socket.io');
var express = require('express');
var sqlite3 = require('sqlite3').verbose();
var clientSockets = []
var app = module.exports = express.createServer()
  , io = io.listen(app);

var db = new sqlite3.Database('/home/jwalton/workspace/expressServer/db/dominion.sqlite');

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({secret: 'test'}));
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));

});

app.dynamicHelpers({
    session: function (req, res) {
        return req.session;
    }
});

app.configure('development', function(){
  app.use(express.errorHandler({dumpExceptions: true, showStack: true})); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
  res.render('index.jade', {
       title: "Dominion Online"
   });
});

app.get('/game', function(req, res){
   console.log(req.session.username)
   res.render('game.jade', {
       title: "Dominion Online",
       locals: {session: req.session}
   });
});

app.post('/users/login', function(req,res){
   console.log("username: "+req.body.user.username+" is logging in");
   req.session.username = req.body.user.username;
   res.redirect('/game');
});

app.post('/users/signup', function(req,res){
   console.log("Signing up new user: "+req.body.user.username+" is logging in, password: "+req.body.user.password1);
   var username = req.body.user.username;
   var password = req.body.user.password1;
   var pcclass = req.body.user.pcclass;
   var stmtText = "INSERT INTO user (username,password,class,x,y) VALUES ('"+username+"','"+password+"','"+pcclass+"',10,10)";
   console.log("Insert sql: "+stmtText);
   var stmt = db.prepare(stmtText);
   //var stmt = db.prepare("INSERT INTO user (username,password,class,x,y) VALUES ('dubs','pword','Knight',10,10)");
   stmt.run();
   res.redirect('/game');
});


function sendWorldObjects(socket){
    var worldObjects = [];
    db.each("SELECT name,x,y FROM world_objects", function(err,row){
      console.log(row.name+" x= "+row.x+" y="+row.y);
      var worldObject = {name: row.name, x: row.x, y: row.y};
      worldObjects.push(worldObject);
    },
    function(err,row){
      console.log("Have information on "+worldObjects.length+" world objects");
      
      socket.emit('world_objects', {world_objects: worldObjects});
    });
}



io.sockets.on('connection', function (socket) {
  clientSockets.push(socket);
  sendWorldObjects(socket);

  //clientSockets.push(socket)
  socket.on('position update', function(data) {
     console.log("username:"+data.username+" x: "+data.x+" y: "+data.y);
     var stmtText = "update user set x="+data.x+", y="+data.y+", action='"+data.action+"', direction='"+data.direction+"' where username = '"+data.username+"'";
     console.log("Insert sql: "+stmtText);
     var stmt = db.prepare(stmtText);
   //var stmt = db.prepare("INSERT INTO user (username,password,class,x,y) VALUES ('dubs','pword','Knight',10,10)");
     stmt.run();

    // updateClients(socket)
  });

  socket.on('move request', function(data){
     console.log("move request player:"+data.player+" x: "+data.x+" y: "+data.y);
     var stmtText = "update user set action='move', actionX="+data.x+", actionY="+data.y+" where username = '"+data.player+"'";
     console.log("Insert sql: "+stmtText);
     var stmt = db.prepare(stmtText);
   //var stmt = db.prepare("INSERT INTO user (username,password,class,x,y) VALUES ('dubs','pword','Knight',10,10)");
     stmt.run();
     var request = {player: data.player, x: data.x, y: data.y};

     //socket.broadcast.emit('player move request', {request: request});
  });

  socket.on('get initial position', function(data){
      var query = "SELECT x,y FROM user WHERE username='"+data.username+"'";
      db.each(query, function(err,row){

        var user = {x: row.x, y: row.y};
        socket.emit('initial position', {user: user});
      });

  });

  socket.on('attack', function(data){
     var target = data.target;
     var damage = Math.round(Math.random()*4)+1;
     var hp = 0;
     var query = "SELECT hp,maxhp, x, y FROM user WHERE username='"+target+"'";
      db.each(query, function(err,row){
        console.log("Target has "+row.hp+" HP");
        hp = row.hp;
        hp = hp-damage;
        var state = "normal";
        if(hp <= 0){
            hp = 0;
            state = "dead";
        }
         console.log("Received attack request, taking "+damage+" HP off of "+target+" who has "+hp+" HP remaining");
         var stmtText = "update user set hp="+hp+", state='"+state+"' where username = '"+target+"'";
         console.log("Insert sql: "+stmtText);
         var stmt = db.prepare(stmtText);
       //var stmt = db.prepare("INSERT INTO user (username,password,class,x,y) VALUES ('dubs','pword','Knight',10,10)");
         stmt.run();
         sendOutAttack(damage,row.x,row.y);
      });
     
  });
});



function updateClients(socket){
  var users = new Array();
  //console.log("1 sending info for "+users.length+" users");
  db.each("SELECT username,x,y FROM user", function(err, row) {
      console.log(row.username + ": " + row.x+","+row.y);
      var user = {username: row.username, x: row.x, y: row.y};
      console.log(user.username);
      //users.push(user);
     // console.log("2 sending info for "+users.length+" users");
      socket.broadcast.emit('server update', {user: user});
  });
  //for(i =0; clientSockets.length; i++){
  //    clientSockets.emit('server update', users);
  //}
  //console.log("3 sending info for "+users.length+" users");
  
}

function sendOutAttack(damage, x, y){
  console.log("\n\n\n\n#########################\nSending out attack!\n########################\n\n\n\n\n");
  for(i = 0; i < clientSockets.length; i++){
      clientSockets[i].emit('damage dealt', {damage: damage, x: x, y: y});
  }
}

function updateClients2(){
  console.log("Sending out update to "+clientSockets.length+" clients!")
  var users = [];
  db.each("SELECT username,x,y,action,direction,actionX,actionY,hp,maxhp,state FROM user", function(err,row){
     // console.log(row.username+" action= "+row.action+" direction="+row.direction);
      var user = {username: row.username, x: row.x, y: row.y, action: row.action, direction: row.direction, actionX: row.actionX, actionY: row.actionY, hp: row.hp, maxhp: row.maxhp, state: row.state};
      users.push(user);
  },
  function(err,row){
      //console.log("Have information on "+users.length+" players");
      for(i= 0; i < users.length; i++){
        //  console.log("Information for: "+users[i].username);
      }
      for(i = 0; i < clientSockets.length; i++){

          clientSockets[i].emit('server push', {users:users})
      }
  });

}

function initializeComputer(){
  db.each("SELECT x,y FROM user WHERE username='computer'",function(err,row){
      computerX = row.x;
      computerY = row.y;
      console.log("Updated computer location in memory to: "+computerX+", "+computerY);
  });
}
var computerX = 0;
var computerY = 0;
var direction = 1;
function updateComputer(){
    if(direction == 1){
        if(computerX < 300){
            computerX = computerX +2;
        } else {
            direction = 0;
            computerX = computerX -2;
        }
    } else {
        if(computerX > 60){
            computerX = computerX - 2;
        } else {
            direction = 1;
            computerX = computerX + 2;
        }
    }
    
    var stmtText = "update user set x="+computerX+", y="+computerY+" where username = 'computer'";
    //console.log("Insert sql: "+stmtText);
    var stmt = db.prepare(stmtText);
   //var stmt = db.prepare("INSERT INTO user (username,password,class,x,y) VALUES ('dubs','pword','Knight',10,10)");
    stmt.run();

}

app.listen(80);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
initializeComputer();
setInterval(updateClients2,80);
setInterval(updateComputer, 150);


