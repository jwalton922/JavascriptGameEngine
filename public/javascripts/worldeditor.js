var tileSprite;
var treeSprite;
var world_canvas;
var world_canvas_ctx;
var selector_canvas;
var selector_ctx;
var iTileIndex = 0;
var jTileIndex = 0;
var selectType = 0;
var TILES = 0;
var TREES = 1;
var BUILDINGS = 2;
var selectedX;
var selectedY;
var displayWidth;
var displayHeight;
var selectedWidth;
var selectedHeight;
var objectSelected = false;
var selectedSprite;
var selectedFrameIndex;
var worldObjects = new Array();




function initWorldEditor(object_selector_canvas) {
    selector_canvas = document.getElementById(object_selector_canvas);
    selector_ctx = selector_canvas.getContext("2d");
    world_canvas = document.getElementById("canvas");
    world_canvas_ctx = world_canvas.getContext("2d");
    initWorldEditorImages();

    drawSelectorImages();
}

function initWorldEditorImages() {
    tileImage = new Image();
    tileImage.src = "images/world_images/ground/ground_tiles.bmp";
    tileImage.onload = preloadImage(tileImage);
    tileSprite = new Sprite(tileImage);
    tileSprite.createFrames(32, 32, 32, 1024);

    treeImage = new Image();
    treeImage.src = "images/world_images/trees/trees.png";
    treeImage.onload = preloadImage(treeImage);
    treeSprite = new Sprite(treeImage);
    treeSprite.createFrames(128, 128, 4, 21);

}

function mouseMoved(e){
    if(objectSelected){
        world_canvas.width = world_canvas.width;
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

        x -= world_canvas.offsetLeft;
        y -= world_canvas.offsetTop;
        
//        var obj = new WorldObject(selectedSprite, selectedSprite.getFrameIndex(),x, y);
//        worldObjects.push(obj);
        
        selectedSprite.setFrameIndex(selectedFrameIndex);
        var frame = selectedSprite.getFrame();
        //console.log('mouse at: '+x+","+y+" drawing frame index: "+selectedSprite.getFrameIndex());
        world_canvas_ctx.drawImage(selectedSprite.getSpriteImage(), frame.getX(), frame.getY(), frame.getWidth(),frame.getHeight(), (x-(displayWidth/2)), (y-(displayHeight/2)), displayWidth,displayHeight);
        drawWorldCanvas();
    }
}

function drawWorldCanvas(){
    for(i = 0; i < worldObjects.length; i++){
        var sprite = worldObjects[i].getSprite();
        var frame = sprite.getFrameAtIndex(worldObjects[i].getFrameIndex());
        var x = worldObjects[i].getX();
        var y = worldObjects[i].getY();
        var width = worldObjects[i].getWidth();
        var height = worldObjects[i].getHeight();
        //console.log("drawing a world object at "+x+","+y);
        world_canvas_ctx.drawImage(sprite.getSpriteImage(), frame.getX(), frame.getY(), frame.getWidth(),frame.getHeight(), x,y, width, height);
    }
}

function processMouseClickWorldCanvas(e){
    console.log("canvas clicked");
    if(objectSelected){
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

        x -= world_canvas.offsetLeft;
        y -= world_canvas.offsetTop;
        var frame = selectedSprite.getFrameAtIndex(selectedSprite.getFrameIndex());
        var obj = new WorldObject(selectedSprite, selectedSprite.getFrameIndex(),x-displayWidth/2, y-displayHeight/2, displayWidth, displayHeight);
        worldObjects.push(obj);
        drawWorldCanvas();
    }
}

function processSelectorMouseClick(e){
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

    x -= selector_canvas.offsetLeft;
    y -= selector_canvas.offsetTop;

    if(selectType == TILES){

    } else if(selectType == TREES) {
        var iIndex = Math.floor(x / 64);
        var jIndex = Math.floor(y / 64);
        var frameIndex = iIndex*5+jIndex;
        selectedFrameIndex = frameIndex;
        treeSprite.setFrameIndex(frameIndex);
        var imageX = iIndex * 64;
        var imageY = jIndex * 64;
        //alert('clicked on tree at : '+iIndex+","+jIndex);
        console.log("tree index: "+iIndex+","+jIndex+" frameIndex="+frameIndex);
        var rX = 0-imageX;
        var rY = 0-imageY;
        objectSelected = true;

        selectedX = imageX;
        selectedY = imageY;
        selectedHeight = 64;
        selectedWidth = 64;
        displayWidth = 128;
        displayHeight = 128;
        selectedSprite = treeSprite;

        drawSelectorImages();
        //oImg.setAttribute('style', 'background-position:'+rX+"px "+rY+'px;background-image: url(images/world_images/trees/trees.png);position:absolute;top:'+x+'px;left:'+y+'px;');
        //alert($('#objectToPlace').attr('id'));
        //$("#objectToPlace").draggable();
//        $('#objectToPlace').attr("style", "background-image:url(trees.png)");
//        alert($('#objectToPlace').attr('style'));
        //var objectToPlace = $("<image id='objectToPlace' src='images/world_images/trees/trees.png' style='position:absolute;top:0px;left:0px;width:64px;height:64px;clip:"+imageX+"px "+imageY+"px"+"64px 64px '/>");
       // $("#objectToPlace").css("clip",imageX+"px, "+imageY+"px,"+"64px, 64px" );
//       var newCanvas = $("<canvas></canvas>");
//       newCanvas.id = 'canvasToPlace';
//
//       $('body').append(newCanvas);
//       alert(newCanvas.id);
//       var newCanvasContext = newCanvas[0].getContext("2d");
//       //var newCanvasContext = $("#canvasToPlace").getContext("2d");
//       newCanvasContext.drawImage(treeImage, imageX*2, imageY*2, 128, 128, 0,0, 128,128);
//       newCanvas.css('width', 128);
//       newCanvas.css('height',128);
//       $('#canvasToPlace').css('position', 'absolute');
//       $('#canvasToPlace').css('top', x);
//       $('#canvasToPlace').css('left', y);
//       newCanvas.css('border', "solid 1px black");
       //$('#canvasToPlace').draggable();

        
    }
}

function drawSelectorImages() {
    selector_canvas.width = selector_canvas.width;

    if(selectType == TILES){
        startFrameIndex = iTileIndex*21;
        //alert("drawing tiles starting at index: "+startFrameIndex);
        tileSprite.setFrameIndex(startFrameIndex);
        var frame = null;
        for(i = 0; i < 8; i++){
            for(j = 0; j < 21; j++) {
                frame = tileSprite.getFrame();
                selector_ctx.drawImage(tileSprite.getSpriteImage(),frame.getX(), frame.getY(), frame.getWidth(), frame.getHeight(), i*34, j*34, 32, 32);
                tileSprite.updateFrame();
            }
        }
    } else if(selectType == TREES) {
        treeSprite.resetSprite();
        for(i = 0; i < 4; i++) {
            for(j = 0; j < 5; j++) {
                frame = treeSprite.getFrame();
                selector_ctx.drawImage(treeSprite.getSpriteImage(), frame.getX(), frame.getY(), frame.getWidth(), frame.getHeight(), i*64, j*64, 64, 64);
                treeSprite.updateFrame();
            }
        }
        treeSprite.resetSprite();
    }
    //draw box around selected object
    if(objectSelected){
        selector_ctx.strokeRect(selectedX, selectedY, selectedWidth, selectedHeight);
    }
}

function updateSelectorCanvas() {
    tileSprite.resetSprite();
    selectedItem = getSelectedItem();
    objectSelected = false;
    if(selectedItem == "Tiles 1") {
        iTileIndex = 0;
        jTileIndex = 0;
        selectType = TILES;
    } else if(selectedItem == "Tiles 2") {
        iTileIndex = 8;
        jTileIndex = 21;
        selectType = TILES;
    } else if(selectedItem == "Tiles 3") {
        iTileIndex = 16;
        jTileIndex = 42;
        selectType = TILES;
    } else if(selectedItem == "Tiles 4") {
        iTileIndex = 24;
        jTileIndex = 63;
        selectType = TILES;
    } else if(selectedItem == "Trees"){
        iTileIndex = 0;
        jTileIndex = 0;
        selectType = TREES;
    }

    drawSelectorImages();
}

function getSelectedItem() {
    si = document.getElementById("object_selector");

    len = si.length;
    i = 0
    chosen = ""

    for (i = 0; i < len; i++) {
        if (si[i].selected) {
            chosen = chosen +si[i].value + "\n"
        }
    }
    chosen = $('#object_selector option:selected').val();
    console.log("selector value: "+chosen);
    return chosen
}