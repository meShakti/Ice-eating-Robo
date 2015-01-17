var canvasBg = document.getElementById("canvasBg"),
    ctxBg = canvasBg.getContext("2d"),
    canvasEntities = document.getElementById("canvasEntities"),
    ctxEntities = canvasEntities.getContext("2d"),
    canvasWidth = canvasBg.width,
    canvasHeight = canvasBg.height,
    player1 = new Player(),
    firdge = new Things(0,0,75,140,canvasWidth/1.2,canvasHeight/7 -9),
    trampolin1 = new Things(100,0,200,100,85,425),
    tower =new Things(0,0,312,600,canvasWidth/1.3,canvasHeight/2.5 ), 
    isPlaying = false,
    requestAnimFrame = window.requestAnimationFrame ||
                       window.webkitRequestAnimationFrame ||
                       window.mozRequestAnimationFrame ||
                       window.oRequestAnimationFrame ||
                       window.msRequestAnimationFrame ||
                       function (callback) {
                       	   window.setTimeout(callback, 1000/60 );
                       },
    noClicked=0,
    isWon=false,
    simulatorInterval=null,
    imgSprite = new Image();
imgSprite.src = "images/totalImage.png";
var fridgeImg=new Image();
fridgeImg.src="images/fridge.jpg";
var trampolinImg=new Image();
trampolinImg.src = "images/trampolin.png";
var playerImg= new Image();
playerImg.src = "images/player.png";
var towerImg = new Image();
towerImg.src = "images/tower1.jpg";

//Access Form Fields
var button=document.getElementById("jump"),
    Xdir=document.getElementById("XDistance"),
    Ydir=document.getElementById("YDistance"),
    angleField=document.getElementById("angle");



imgSprite.addEventListener("load",init,false);

//functions that run the game
function init() {
	button.addEventListener("click",function(){trigger();});
  begin();
}

function begin() {
	ctxBg.drawImage(imgSprite, 0, 0, canvasWidth,canvasHeight,0,0, canvasWidth,canvasHeight);
	isPlaying=true;
  showDistance();
  requestAnimFrame(loop);
}

function showDistance() {
  var x=firdge.centerX- player1.centerX,
      y=player1.centerY-firdge.centerY;
      Xdir.value=""+x;
      Ydir.value=""+y;
      

}

function update(){
  clearCtx(ctxEntities);
  player1.update();
  validateAndMove();
}

function draw(){
  trampolin1.draw(trampolinImg);
  tower.draw(towerImg);
  firdge.draw(fridgeImg);
  player1.draw();
}

function loop() {
  if (isPlaying){
    update();
    draw();
    requestAnimFrame(loop);

  }

}




//objects of the game
function Player() {
  this.srcX = 0;
  this.srcY = 0;
  this.width = 150;
  this.height = 150;
  this.drawX = 125;
  this.drawY = 350;
  this.centerX = this.drawX + (this.width/2);
  this.centerY = this.drawY + (this.height/2);
}

Player.prototype.update = function () {
  this.centerX = this.drawX + (this.width/2);
  this.centerY = this.drawY + (this.height / 2);

 };

Player.prototype.draw =function () {
  ctxEntities.drawImage(playerImg,this.srcX,this.srcY,this.width,
    this.height, this.drawX,this.drawY,this.width,this.height);
};

Player.prototype.checkDirection = function (x,y) {
  var newDrawX = x,
      newDrawY =y;

    if(!outOfBounds(this,newDrawX,newDrawY)) {
        this.drawX = newDrawX;
        this.drawY =newDrawY;
    }
    else if(!isWon){
      var lose = new Audio("audio/lose.mp3");
      lose.play();
      isPlaying = false;
      clearInterval(simulatorInterval);
      alert("You didn't reach the fridge . Reload to play again");
    }  
};
Player.prototype.forwardTo = function(x0,y0,targetX,targetY) {
   var dx=targetX-x0;
   var dy=targetY-y0;
   var x = this.drawX +10;
   var y = Math.round(y0 + dy*(x -x0)/dx);
   this.checkDirection(x,y);
 
  
};



function Things(x,y,w,h,dX,dY){
  this.srcX = x;
  this.srcY = y;
  this.width = w;
  this.height = h;
  this.drawX = dX;
  this.drawY = dY;
  this.centerX = this.drawX + (this.width/2);
  this.centerY = this.drawY + (this.height/2);

}
Things.prototype.draw = function(imgObj) {
    ctxEntities.drawImage(imgObj,this.srcX,this.srcY,this.width,
    this.height, this.drawX,this.drawY,this.width,this.height);
};


//golobal helper function
function trigger(){
    noClicked++;
}
function validateAndMove(){
  var angleValue,slope,calcDistanceY,targetX,targetY,distanceX,distanceY,Yoffset; //= Math.round(distanceX*Math.tan(rad));
 if(noClicked==1){
    noClicked++;
    angleValue =parseFloat(angleField.value);
    if(isNaN(angleValue) || (angleValue>=90 || angleValue <= 0) ) {
      var lose = new Audio("audio/lose.mp3");
      lose.play();
      isPlaying = false;
      alert("You Enter invalid angle value .Reload to play again!");

    }
    else{
      
      distanceX =parseFloat( Xdir.value );
      distanceY =parseFloat( Ydir.value );
      Yoffset=distanceY*Math.tan(toRad(5));
      slope = Math.tan( toRad ( angleValue ) );
      calcDistanceY=Math.round( distanceX*slope) ;
      calcDistanceX = Math.round(distanceY/slope);

      
      targetY=  player1.centerY-calcDistanceY;
      targetX= player1.centerX +calcDistanceX;
      if(targetY<0){
        targetY=20;
      }
      if(targetX>canvasWidth){
        targetX=canvasWidth-150;
      }
      if(calcDistanceY > distanceY-Yoffset && calcDistanceY < distanceY +Yoffset){
        isWon=true;
      }
      

      playerImg.src="images/down.png";
      update();
      draw();
      

      
      setTimeout(function(){
        simulatorInterval= setInterval( function(){simulate(player1.drawX,player1.drawY,targetX, targetY);},100);
      var jump = new Audio("audio/jump.wav");
      jump.play();  
      },1000);

      

      
    }


  }
}

function simulate(startX,startY,targetX,targetY){
  playerImg.src ="images/tilt.png";
  if(player1.centerX <= targetX ){
    player1.forwardTo(startX,startY,targetX,targetY);
    console.log("("+player1.centerX+","+player1.centerY+")" );
  }
  else if(isWon || touch(player1,firdge)) {
     var win = new Audio("audio/win.mp3");
      win.play();
      isPlaying = false;
      clearInterval(simulatorInterval);
      alert("YOU WON!!! CONGRATULATION. Reload to play again!!");
      console.log("t:"+targetX+","+targetY+")");
    }
    else{
    var lose = new Audio("audio/lose.mp3");
      lose.play();
      isPlaying = false;
      clearInterval(simulatorInterval);
      alert("You didn't reach the fridge .Reload to play again!");
      console.log("t:"+targetX+","+targetY+")");

    }





}
function toRad(deg){
  return 0.0174532925*deg;
}


function clearCtx(ctx) {   ctx.clearRect(0,0,canvasWidth,canvasHeight); }

function outOfBounds(a, x, y) {
  var newBottomY = y +a.height,
      newTopY = y,
      newRightX = x + a.width,
      newLeftX = x,
      airLineTop = 5,
      airLineBottom = 635,
      airLineRight = 1330,
      airLineLeft = 5;

  return newBottomY > airLineBottom ||
      newTopY < airLineTop ||
      newRightX > airLineRight ||
      newLeftX < airLineLeft; 
}



function touch(a,b) {
  var cx1,cx2,cy3,cy4;
  cx1=b.drawX-a.drawX<a.width;
  cx2=a.drawX-b.drawX< b.width;
  cy1= b.drawY-a.drawY<a.height;
  cy2=a.drawY-b.drawY<b.height;
  return (cx1&&cx2)&&(cy1&&cy2);
}




