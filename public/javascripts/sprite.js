var DIRECTIONS = ["e", "se", "s", "sw", "w", "nw", "n", "ne"];

function Sprite(spriteImage, repeatAction)
{
    this.spriteImage = spriteImage;
    this.frames = new Array();
    this.frameIndex = 0;
    this.doRepeat = repeatAction;
    this.complete = false;

    this.isComplete = function(){
        return this.complete;
    }

    this.addFrame = function(frame)
    {
        this.frames.push(frame);
    }

    this.getFrame = function() {
        return this.frames[this.frameIndex];
    }

    this.getFrameAtIndex = function(index){
        return this.frames[index];
    }

    this.getFrameIndex = function(){
        return this.frameIndex;
    }

    this.setFrameIndex = function(index) {
        this.frameIndex = index;
    }

    this.getSpriteImage = function() {
        return this.spriteImage;
    }

    this.updateFrame = function(){
        nextFrame = this.frames[this.frameIndex];
        this.frameIndex = this.frameIndex +1;
        if(this.frameIndex >= this.frames.length-1){
            if(this.doRepeat){
                this.frameIndex = 0;
            } else {
                this.frameIndex = this.frameIndex -1;
                this.complete = true;
            }
        }

        return nextFrame;
    }

    this.resetSprite = function() {
        this.frameIndex = 0;
    }

    this.createFrames = function(frameWidth,frameHeight,numFramesAcross,totalNumFrames){
        countFrames = 0;
        columnCount = 0;
        rowCount = 0;
        while(countFrames < totalNumFrames) {
            x = frameWidth*columnCount;
            y = frameHeight*rowCount;
            f = new Frame(x,y,frameWidth,frameHeight);
            this.frames.push(f);
            countFrames = countFrames + 1;
            columnCount = columnCount + 1;
            if(columnCount >= numFramesAcross){
                columnCount = 0;
                rowCount = rowCount + 1;
            }
        }
    }
}
/*
 *files need to be named actionName_Direction.png
 */
function createActionSpriteList(path, actionName, imageType, frameWidth, frameHeight, numFramesAcross, totalNumFrames, repeat) {
    sprites = {};
    for(i = 0; i < DIRECTIONS.length; i++){
        full_path = path+actionName+"_"+DIRECTIONS[i]+"."+imageType;      
        image = new Image();
        
        
        image.src = full_path;
        image.onload = preloadImage(image);
        sprite = new Sprite(image, repeat);
        sprite.createFrames(frameWidth,frameHeight,numFramesAcross,totalNumFrames);
        sprites[DIRECTIONS[i]] = sprite;
    }

    return sprites;
}
/*
 * Container for information on what to draw
 * for a single from from the whole sprite image
 */
function Frame(x, y, width, height)
{
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.getX = function() {
        return this.x;
    }

    this.getY = function() {
        return this.y;
    }

    this.getWidth = function() {
        return this.width;
    }

    this.getHeight = function() {
        return this.height;
    }
}

function preloadImage(image){
    //preloadcontext.drawImage(image, 0,0);
}
