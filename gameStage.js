/**
 * Object representing new stage/screen (reloading stage in pixi a thing?), currently
 * adds other objects and behavior to cleared screen.
 * Initialised once per level.
 * @param stage Stage to add stuff to.
 * @param json Data to use for new object creation.
 * @constructor
 */
var GameStage = function (stage, json) {
    "use strict";
    // tile texture asset list
    var tilesToLoad = [];
    // info bar/UI reference
    var infoUI;
    // built tower list
    var towerList = [];
    var tileSet;
    var waveController;

    /**
     * Function creates stage for gaming by pre-loading data and calling
     * other function to setup tile set.
     */
    this.createStage = function () {
        // defining new field to sprite object
        PIXI.Sprite.prototype.value = null;

        //pre-load images
        var jsonValues = json.values;
        var jsonLength = jsonValues.length;

        for (var i = 0; i < jsonLength; i++) {
            tilesToLoad.push(jsonValues[i].img);
        }

        // create a new loader
        var loader = new PIXI.AssetLoader(tilesToLoad);
        // use callback
        loader.onComplete = onAssetsLoaded;
        //begin load
        loader.load();
    };

    /**
     * Once assets are loaded this function proceeds to create tile set, UI and wave controller.
     * In other words - function initialises any other object needed for game stage.
     */
    var onAssetsLoaded = function () {
        // array, of all tiles
        var jsonTiles = json.tiles;
        // number of tiles 20x20
        var numberOfTiles = json.size;
        // container to keep tiles
        tileSet = new PIXI.DisplayObjectContainer();
        var xStart = (window.innerWidth / 2) - (window.innerHeight / 2);
        var tileWidth = 0;

        // creating tiles
        for (var i = 0; i < numberOfTiles; i++) {
            for (var d = 0; d < numberOfTiles; d++) {
                var index = i * 20 + d;
                var tileValue = jsonTiles[index];
                var singleTile = json.values[tileValue];
                var tile = createTile(singleTile, xStart + (tileWidth * d), tileWidth * i, numberOfTiles);
                // setting previously defined field
                tile.value = tileValue;

                tileWidth = tile.width;
                tileSet.addChild(tile);
            }
        }

        tileSet.setStageReference(stage);
        stage.addChild(tileSet);

        // add info bar/UI, setup reference to its object
        infoUI = new InfoUi(json, stage);
        infoUI.createInfoUI();

        waveController = new WaveController(json, tileSet, infoUI);
    };

    /**
     * Function creates tile sprite, sets up tile event listeners.
     * @param singleTile Tile data from json.
     * @param x Position of new tile in x axis.
     * @param y Position of new tile in y axis.
     * @param tileNumber Number of total tiles, needed for scale calculation.
     * @returns {Sprite}
     */
    var createTile = function (singleTile, x, y, tileNumber) {
        // create a tile texture from an image path
        var texture = PIXI.Texture.fromImage(singleTile.img);
        var tilingSprite = new PIXI.Sprite(texture);
        var spriteSize = window.innerHeight / tileNumber / tilingSprite.height;
        // scaling tile
        tilingSprite.scale.set(spriteSize, spriteSize);
        tilingSprite.position.set(x, y);

        tilingSprite.interactive = singleTile.interactive;
        // set the mouse over callback..
        tilingSprite.mouseover = mouseOver;
//        tilingSprite.touchstart = mouseOver;
        // set the mouse out callback..
        tilingSprite.mouseout = mouseOut;
//        tilingSprite.touchend = tilingSprite.touchendoutside = mouseOut;
        // enable only for browser
        tilingSprite.click = click;
        tilingSprite.tap = click;
//        tilingSprite.tap = click;

        return tilingSprite;
    };

    /**
     * Function defining what happens when "click" event is fired.
     */
    var click = function () {
        var tower = new Tower(infoUI, waveController);

        if (infoUI.getCash() >= tower.getCost()) {
            tower.build(this, stage);
            //disable tile interactivity so second tower ain't built here, this is also what makes tile red as it never runs other events
            this.interactive = false;
            towerList.push(tower);
        }
    };

    /**
     * Function defining what happens when "mouse over" event is fired.
     */
    var mouseOver = function () {
        this.tint = 0xFF0000;
    };

    /**
     * Function defining what happens when "mouse out" event is fired.
     */
    var mouseOut = function () {
        this.tint = 0xFFFFFF;
    };

    /**
     * Function to be called for each frame/interval.
     * It is responsible for continuing this chain call of update functions.
     */
    this.update = function () {
        if (infoUI === undefined || !infoUI.getGameOver()) {

            for (var d = 0; d < towerList.length; d++) {
                towerList[d].update();
            }

            // in case update is called before initialisation was done, TODO: fix this
            if (waveController != undefined) {
                waveController.update();
            }
        }
    };
};