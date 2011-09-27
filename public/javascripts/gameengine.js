var DIRECTIONS = ["e", "se", "s", "sw", "w", "nw", "n", "ne"];
var canvas;
var context;
var preloadcontext;
var players = new Array();
var numbers = new Array();
var isTargetSelectMode = false;
var groundImage;
var worldObjects = new Array();
var worldObjectSprites = {};
var canvasStartX=0;
var canvasStartY=0;
var thisClientPlayerName = "";

function initCanvas() {
    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");
    preloadcanvas = document.getElementById("preloadcanvas");
    preloadcontext = preloadcanvas.getContext("2d");
    groundImage = new Image();
    groundImage.src = "images/grasstile.png";
    groundImage.onload = preloadImage(groundImage);
}

function processKeyPress(e) {
    keynum = e.which;
    //alert('key press of: '+keynum+" looking for: "+"a".charCodeAt(0));
    if( "a".charCodeAt(0) == keynum) {
        canvas.style.cursor="crosshair";
        isTargetSelectMode = true;
    }
}

/* TODO eventually will probably have a target id so that this
 * method will be called periodically with updated coordinates
 * for the target (because target is likely moving so need
 * to update where the player needs to move to attack) */
function processAttackRequest(player, x, y) {
    var selectedPlayer = getPlayer(x,y);
    if(selectedPlayer != null){
        console.info("attacking: "+selectedPlayer.getName());
    }
    if(selectedPlayer == null){
        console.log("Could not find a player to attack!");
        return -1;
    }
    player.setAttackTarget(selectedPlayer);

//    if(player.getX() > selectedPlayer.getX()){
//        x = selectedPlayer.getX() + selectedPlayer.getWidth()/2;
//    } else {
//        x = selectedPlayer.getX() - selectedPlayer.getWidth()/2
//    }
//
//    if(player.getY() > selectedPlayer.getY()){
//        y = selectedPlayer.getY() + selectedPlayer.getHeight()/2;
//    } else {
//        y = selectedPlayer.getY() - selectedPlayer.getHeight()/2;
//    }
    x = selectedPlayer.getX();
    y = selectedPlayer.getY();
    
    distToTarget = calcDistance(player.getX(), player.getY(), x, y);
    if(distToTarget > player.getAttackDistance()) {
        //move to attack distance
        deltaX = x-player.getX();
        deltaY = y-player.getY();

        angle = Math.atan(deltaY / deltaX);
        dx = Math.abs(Math.cos(angle)*player.getAttackDistance());
        dy = Math.abs(Math.sin(angle)*player.getAttackDistance());

        if(deltaX > 0) {
            x = x -dx;
        } else if(deltaX < 0){
            x = x+dx;
        } else {
            x = 0;
        }

        if(deltaY > 0) {
            y = y-dy;
        } else if (deltaY < 0) {
            y = y+dy;
        } else {
            y = 0;
        }
        angle = 180.0 / Math.PI * angle;
        direction = determineDirection(deltaX, deltaY);
        waypoints = createWayPoints(player.getX(), player.getY(), x, y, direction, player.getSpeed(), angle);
        
        player.addActionToQueue("attack");
        player.addActionToQueue("move");
        player.setWayPoints(waypoints);
        isTargetSelectMode = false;
        player.setActionComplete(true);
        canvas.style.cursor="default";
        
    } else {
        angle = Math.atan(deltaY / deltaX);

        angle = 180.0 / Math.PI * angle;
        direction = determineDirection(deltaX, deltaY);
        player.clearActionQueue();
        player.clearWayPoints();
        player.AddActionToQueue("attack");
        player.setIsActionComplete(true);
        isTargetSelectMode = false;
    }
}

function getPlayer(x,y){
    console.info("Trying to find a player at : "+x+", "+y+" canvas start: "+canvasStartX+","+canvasStartY);
    for(i = 0; i < players.length; i++){
        console.info("Trying player at: "+players[i].getX()+", "+players[i].getY());
        var minX = players[i].getX()-players[i].getWidth()/2;
        var maxX = players[i].getX()+players[i].getWidth()/2;
        var minY = players[i].getY()-players[i].getHeight()/2;
        var maxY = players[i].getY()+players[i].getHeight()/2;

        if(x > minX && x < maxX && y > minY && y < maxY){
            console.log("Found a player to attack: "+players[i].getName());
            return players[i];
        }
    }

    return null;
}

function calcDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2-x1, 2)+Math.pow(y2-y1, 2));
}

function processMoveRequest(player, x, y) {
    playerX=player.getX();
    playerY=player.getY();

    deltaX = x-playerX;
    deltaY = y-playerY;
    direction = determineDirection(deltaX, deltaY);
    angle = 180.0 / Math.PI * Math.atan(deltaY/deltaX);
    waypoints = createWayPoints(playerX, playerY, x, y, direction, player.getSpeed(), angle);
    player.setWayPoints(waypoints);
    player.setActionComplete(true);
    player.clearActionQueue();
    player.addActionToQueue("move");
    
}

function isOnCanvas(x,y){
    var xMax = canvasStartX+500;
    var yMax = canvasStartY+500;

    if(x > canvasStartX && x < xMax && y > canvasStartY && y < yMax){
        return true;
    } else {
        return false;
    }
}

/*
 *process mouse click
 */
function processClick(e){

    var x;
    var y;
    if (e.pageX != undefined && e.pageY != undefined) {
	x = e.pageX;
	y = e.pageY;
    }
    else {
	x = e.clientX + document.body.scrollLeft +
            document.documentElement.scrollLeft;
	y = e.clientY + document.body.scrollTop +
            document.documentElement.scrollTop;
    }

    x -= canvas.offsetLeft;
    y -= canvas.offsetTop;
//    console.debug("x: "+x+", y: "+y);
    x+= canvasStartX;
    y+= canvasStartY;
    console.debug("Clicked on: "+x+", "+y);
    console.info("Clicked on: "+x+", "+y);
    var username = $("#username").html().trim();
    var player = null;
    if(isTargetSelectMode){
        player = findCharacter(username);
        processAttackRequest(player, x, y);
        
    } else {
         player = findCharacter(username);
         processMoveRequest(player, x, y);
         //sendMoveRequest(player.getName(),x,y);
    }
}

function findCharacter(username){
    var playerToReturn = null;
  //  console.log("Finding player with username: "+username);
    for(i = 0; i < players.length; i++){
        var pcName = players[i].getName();
        //alert(pcName+" == "+username);
        
        if(pcName == username){
           // alert("match");
            playerToReturn = players[i];
           
        }
    }

    return playerToReturn;
}

function updateNumbers(){
    var numsToKeep = new Array();
    for(i = 0; i < numbers.length; i++){
        var currY = numbers[i].getY();
        var change = numbers[i].getOrigY()-currY;
       // console.info("Change = "+change);
        if(change < 30){
            numbers[i].setY(currY-3);
            numsToKeep.push(numbers[i]);
        }
    }

    numbers = numsToKeep;
}

function updateCharacters() {
    
    for(i = 0; i < players.length; i++) {
        //console.info("Player "+players[i].getName()+" currentAction = "+players[i].getCurrentAction());
        if(players[i].getCurrentActionName() == "attack"){
          //  console.debug("player is attacking!");
            var frameCount = players[i].getAttackFrameCount();
            if(frameCount == players[i].getAttackSpeed()){
                //do attack
                //need to add range checks
                console.debug("DOING AN ATTACK!");
                sendAttack(players[i].getAttackTarget().getName(), players[i].getName());
                players[i].resetAttackFrameCount();
//                players[i].setActionComplete(true);
//                player.clearActionQueue();
//                player.addActionToQueue("pause");

            } else {
                players[i].incrementAttackFrameCount();
            }
        }
        if(players[i].isActionComplete()) {
            completedAction = players[i].getCurrentActionName();
            action = players[i].getNextAction();
            console.log("completed action: "+completedAction+" changing action to: "+action);
            players[i].setActionComplete(false);
            players[i].setCurrentAction(action);
        }
        //console.log("in updateCharacters() updating character: "+players[i].getName());
        moveCharacter(players[i]);
        var direction = players[i].getCurrentDirection();
        actionSprites = players[i].getCurrentAction();

        frame = actionSprites[direction].updateFrame();
        if(players[i].getName() == thisClientPlayerName){
            sendPosition(players[i].getX(),players[i].getY(), players[i].getCurrentDirection(), players[i].getCurrentActionName());
        }
    }
}

//used only for characters not being controlled by clients user
function updateCharacterPosition(name, x, y, action, dir){
   // console.log("in updating character position method to update: "+name);
    for(i = 0; i < players.length; i++){
        
        if(players[i].getName() == name){
            //console.log("Found player to update: "+players[i].getName());
            players[i].setX(x);
            players[i].setY(y);
           // console.log(" action to "+action+" direction to "+dir);
            players[i].setCurrentAction(action);
            players[i].setCurrentDirection(dir);
            
        }
    }
}

function updateCharacterState(name, hp, maxhp, state){
    for(i = 0; i < players.length; i++){

        if(players[i].getName() == name){
         //   console.log("Found player to update: "+players[i].getName());
            players[i].setMaxHP(maxhp);
            players[i].setHP(hp);
            if(state == "dead"){
                players[i].clearActionQueue();
                players[i].setActionComplete(true);
                players[i].addActionToQueue("dying");
            }

        }
    }

}

function updateCharacterAction(name, action, direction, x, y){

}

function moveCharacter(player) {
    waypoint = player.popWayPoint();
    if(waypoint != null) {
        var usersPlayer = $("#username").html().trim();

        var deltaX = waypoint.getX()-player.getX();
        var deltaY = waypoint.getY()-player.getY();
        player.setX(waypoint.getX());
        player.setY(waypoint.getY());
        player.setCurrentDirection(waypoint.getDirection());

        if(player.hasMoreWayPoints() ){

        } else {
            if(player.getCurrentAction() == ("pause")) {

            } else {
                player.setActionComplete(true);
            }
        }

        if(player.getName() == usersPlayer){
            //not doing this anymore
            //sendPosition(waypoint.getX(),waypoint.getY(), waypoint.getDirection(), player.getCurrentActionName());
            canvasStartX+=deltaX;
            canvasStartY+=deltaY;
        }
    } else {
        if(player.getName() == usersPlayer){
        //sendPosition(player.getX(),player.getY(), player.getCurrentDirection(), player.getCurrentActionName());
        }
    }

    
}

function draw() {
    drawGround();
    drawWorldObjects();
    drawCharacters();
    drawNumbers();

}

function drawNumbers(){
   // console.debug("drawing "+numbers.length+" numbers");
    for(i = 0; i < numbers.length; i++){
        var text = numbers[i].getNum();
        context.fillText(text, numbers[i].getX()-canvasStartX,numbers[i].getY()-canvasStartY);
    }
}

function drawWorldObjects(){
    for(i = 0; i < worldObjects.length; i++){
        var sprite = worldObjects[i].getSprite();
        var frame = sprite.getFrameAtIndex(worldObjects[i].getFrameIndex());
        var x = worldObjects[i].getX();
        var y = worldObjects[i].getY();
        var width = worldObjects[i].getWidth();
        var height = worldObjects[i].getHeight();
        //console.log("drawing a world object at "+x+","+y);
        var objX = worldObjects[i].getX();
        var objY = worldObjects[i].getY();
        if(objX >= canvasStartX && objX <= (canvasStartX+500)
           && objY >= canvasStartY && objY <= (canvasStartY+500)){

            var drawX = objX - canvasStartX;
            var drawY = objY - canvasStartY;
           // console.log("drawing world object at: "+drawX+","+drawY+" world pos: "+objX+","+objY);
            try {
                context.drawImage(sprite.getSpriteImage(), frame.getX(), frame.getY(), frame.getWidth(),frame.getHeight(), drawX-width/2,drawY-height/2, width, height);
            }catch(err){

            }
        }
       // context.drawImage(sprite.getSpriteImage(), frame.getX(), frame.getY(), frame.getWidth(),frame.getHeight(), x,y, width, height);
    }
}

function drawGround() {
    context.clearRect(0,0,canvas.width,canvas.height);
    context.drawImage(groundImage, 0, 0, 256, 192, 0, 0, 20, 20);
    //console.log("drawing ground");
}

function drawCharacters() {

    //frame = character.getFrame();
    
    for(i = 0; i < players.length; i++){
        direction = players[i].getCurrentDirection();
        actionSprites = players[i].getCurrentAction();
        frame = actionSprites[direction].getFrame();
        //alert('image: '+actionSprites[direction].getSpriteImage()+" params: "+frame.getX()+" "+frame.getY()+" "+ frame.getWidth()+" "+ frame.getHeight());

        var playerX = players[i].getX();
        var playerY = players[i].getY();
        if(playerX >= canvasStartX && playerX <= (canvasStartX+500)
           && playerY >= canvasStartY && playerY <= (canvasStartY+500)){

            var drawX = playerX - canvasStartX;
            var drawY = playerY - canvasStartY;
            try {
                context.drawImage(actionSprites[direction].getSpriteImage(), frame.getX(), frame.getY(), frame.getWidth(), frame.getHeight(), drawX-players[i].getWidth()/2, drawY-players[i].getHeight()/2, 96, 96 );
                context.font = "bold 12px sans-serif black";
                //context.fillText(players[i].getName(), drawX-players.getWidth()/2, drawY-players.getHeight()/2-10);
                //var textX = Math.round(dra)
                context.fillText(players[i].getName(), drawX-8,drawY-players[i].getHeight()/3);
                var pixelsToFill = Math.round(30*(players[i].getHP()/players[i].getMaxHP()));
                if(pixelsToFill < 0){
                    pixelsToFill = 0;
                }
               // console.log("PIXELS TO FILL: "+pixelsToFill);
                context.fillRect(drawX-10, drawY+players[i].getHeight()/2, pixelsToFill,5);
            }catch(err){

            }
        }
    }

    /* context.drawImage(character.getSpriteImage(), frame.getX(), frame.getY(), frame.getWidth(), frame.getHeight(),0, 0, 96, 96 );
     * 
     */
}

/* could get errors or return wrong direction if
 * deltaX and deltaY = 0
 */
function determineDirection(deltaX, deltaY) {
    if(deltaX != 0) {
        angle = 180.0 / Math.PI * Math.atan(deltaY/deltaX);
    }
    //alert("angle: "+angle);
    //postive x is to the right
    //positive y is down
    direction = "e";
    if(deltaX > 0 && deltaY > 0) {
        if(angle <= 22.5) {
            direction = "e";
        } else if(angle <= 67.5) {
            direction ="se"
        } else {
            direction = "s";
        }
    } else if(deltaX < 0 && deltaY > 0) {
        if(angle >= -22.5) {
            direction = "w";
        } else if(angle >= -67.5) {
            direction = "sw";
        } else {
            direction = "s";
        }
    } else if(deltaX < 0 && deltaY < 0) {
        if(angle < 22.5) {
            direction = "w";
        } else if(angle < 67.5) {
            direction = "nw";
        } else {
            direction = "n";
        }

    } else if(deltaX > 0 && deltaY < 0) {
        if(angle >= -22.5) {
            direction = "e";
        } else if(angle >= -67.5) {
            direction = "ne";
        } else {
            direction = "n";
        }
    } else if(deltaX == 0){
        if(deltaY > 0){
            direction = "s";
        } else if(deltaY < 0) {
            direction ="n";
        }
    } else if(deltaY == 0){
        if(deltaX > 0) {
            direction = "e";
        } else if(deltaX < 0) {
            direction = "w";
        }
    }

    return direction;
}

function createWayPoints(initX, initY, destX, destY, direction, speed, angle) {

    /* determine number of steps to get to destination */
    dx = destX - initX;
    dy = destY - initY;
    distToTravel = Math.sqrt(dx*dx+dy*dy);
    numPointsReq = distToTravel / speed;
    atDestination = false;
    deltaX = Math.abs(speed * Math.cos(Math.PI / 180.0 * angle));
    deltaY = Math.abs(speed * Math.sin(Math.PI / 180.0 * angle));

    if(dx > 0 && dy > 0) {
        //both are pos, good here
    } else if(dx < 0 && dy > 0) {
        deltaX = deltaX * -1;
    } else if(dx < 0 && dx < 0) {
        deltaX = deltaX * -1;
        deltaY = deltaY * -1;
    } else if(dx > 0 && dy < 0) {
        deltaY = deltaY * -1;
    }

    waypoints = new Array();
    x = initX;
    y = initY;
    Math.sqrt()
    numPoints = 0;
    /* potential rounding issues here - at high speeds won't end
     * up exactly at destination, might have to change later */
    while(numPoints < numPointsReq) {
        x = x+deltaX;
        y = y+deltaY;
        waypoint = new WayPoint(x,y,direction);
        waypoints.push(waypoint);

        numPoints++;
    }

    waypoints.pop();
    lastWayPoint = new WayPoint(destX,destY, direction);
    waypoints.push(lastWayPoint);
    /* reverse waypoints so pop can be used when getting them */
    waypoints.reverse();
    return waypoints;
}

