var app = new PIXI.Application(800, 600, {backgroundColor : 0x1099bb});
document.body.appendChild(app.view);

// create a texture from an image path
var texture = PIXI.Texture.fromImage('assets/nun.png');



// Scale mode for pixelation
texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;


var nunInterval = 1000;
var nunCount = 10;
var i = 0;;

function addNun () {
    // create our little nun friend..
    var nun = new PIXI.Sprite(texture);

    // enable the nun to be interactive... this will allow it to respond to mouse and touch events
    nun.interactive = true;

    // this button mode will mean the hand cursor appears when you roll over the nun with your mouse
    nun.buttonMode = true;

    // center the nun's anchor point
    nun.anchor.set(0.5);

    // make it a bit bigger, so it's easier to grab
    nun.scale.set(2);

    // move the sprite to its designated position
    nun.x = 750;
    nun.y = 550;


    var tickHandler = function(delta) {
       
        if(nun.y > 300 && nun.x === 750) {
            nun.y -= 2.5;
        }
        else if(nun.y === 300 && nun.x > 50) {
            nun.x -= 2.5;
        }   
        else if(nun.x === 50 && nun.y <= 300) {
            nun.y -= 2.5;
        }
        if(nun.x <= 50 && nun.y <= -50) {
            app.ticker.remove(tickHandler);
        }
    };

    console.log("here");

    app.ticker.add(tickHandler);

    // add it to the stage
    app.stage.addChild(nun);

    i += 1;
    if(i >= nunCount) {
        clearInterval(interval);
    }

}



 var interval = setInterval(addNun, nunInterval);








