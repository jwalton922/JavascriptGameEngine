var pause = false;

function pauseComm(){
    if(pause){
        pause = false;
    } else {
        pause = true;
    }
}

var socket = io.connect('http://localhost');

socket.on('world_objects', function (data) {
    var objs = data.world_objects;
    console.log("Received "+objs.length+" world objects");
    for(i = 0; i < objs.length; i++){
        var world_object = loadWorldObjectSprite(objs[i].name,objs[i].x,objs[i].y);
        worldObjects.push(world_object);
    }
});

socket.on('initial position', function(data){
        var x = data.user.x;
        var y = data.user.y;
        pc.setX(x);
        pc.setY(y);
        canvasStartX = x-250;
        canvasStartY = y-250;
        if(canvasStartX < 0){
            canvasStartX = 0;
        }
        if(canvasStartY < 0){
            canvasStartY = 0;
        }
        console.info("Inital canvas start: "+canvasStartX+","+canvasStartY);
    });

function getInitialPosition(){
    var thisUser = $("#username").html().trim();
    socket.emit('get initial position', {username: thisUser});
}

function sendAttack(targetName, attacker){
    socket.emit("attack", {target: targetName, player: attacker});
}

function sendPosition(x, y, direction, action){
    if(!pause){
        x = Math.round(x);
        y = Math.round(y);
        var username = $("#username").html().trim();
       // var character = findCharacter(username);
        //alert('sending position for '+character.getName());
      //  console.log("Sending position for: "+username+" action= "+action+" direction = "+direction);
        socket.emit('position update', {username: username, x: x, y: y, action: action, direction: direction});
    }
}

socket.on('server update', function(data) {
    //alert(data[0].username);
    if(!pause){
      //  console.log("server update: "+data.user.username);
        var username = $("#username").html().trim();
        var user = data.user;
          if(username != user.username){
          //  console.log("updating user = "+user.username+": "+user.x+", "+user.y+" direction: "+user.direction);
            updateCharacterPosition(user.username,user.x,user.y,user.action,user.direction);
          }

    }


});

socket.on('player move request', function(data){
    if(!pause){
        console.log("player move request: "+data.player+" to "+data.x+", "+data.y);
        var request = data.request;
        var character = findCharacter(request.player);
        processMoveRequest(character,data.x,data,y);
    }
});

socket.on('damage dealt', function(data){
   console.debug("\n\n#################################received damage dealt: "+data.x+", "+data.y);
   if(isOnCanvas(data.x,data.y)){
       console.debug("ON CANVAS!");
       var x = data.x+3;
       var y = data.y-10;
       var num = new Number(data.damage, x, y);
       numbers.push(num);
   }
});

socket.on('server push', function(data){
    if(!pause){
  //     console.log("SERVER PUSH: "+data.users.length+" users updated");
       var users = data.users
       var pcname = $("#username").html().trim();
      // console.log(users[0].username+" "+users[1].username+" "+users[2].username);
       for(k = 0; k < users.length; k++){
           var username = users[k].username;
           var x = users[k].x;
           var y = users[k].y;
           var action = users[k].action;
           var dir = users[k].direction;
           var hp = users[k].hp;
           var maxhp = users[k].maxhp;
           var state = users[k].state;
      //     console.log("Updating "+username+" position to "+x+","+y+" direction = "+dir);
           if(pcname != username){
               //console.log("Updating "+username+" position to "+x+","+y);
               updateCharacterPosition(username,x,y,action,dir);
               
          }
          updateCharacterState(username,hp,maxhp,state);
       }

   }
});

function sendMoveRequest(player,x,y){
    if(!pause){
        x = Math.round(x);
        y = Math.round(y);
        var data = {player: player, x: x, y: y};
        console.log("Sending move request for "+player);
        socket.emit('move request', data)
    }
}


