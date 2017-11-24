/**
 * Object defining Menu stage of this game. It allows to choose appropriate level
 * and continues by calling game stage with piece of current json data.
 * @param stage Stage to attach everything to.
 * @param json Json data (all levels).
 * @returns {MenuStage}
 * @constructor
 */
var MenuStage = function (stage, json) {
    "use strict";
    var assetsToLoad = [];
    var gameStage;

    /**
     * Function pre-loads data and creates sprites to represent levels.
     */
    this.createStage = function () {
        //pre-load images
        var jsonLevels = json.levels;
        var jsonLength = jsonLevels.length;

        for (var i = 0; i < jsonLength; i++) {
            assetsToLoad.push(jsonLevels[i].img);
        }

        // defining new field to sprite object
        PIXI.Sprite.prototype.level = null;

        // create a new loader
        var loader = new PIXI.AssetLoader(assetsToLoad);
        // use callback
        loader.onComplete = onAssetsLoaded;
        //begin load
        loader.load();
    };

    /**
     * Function called once assets are loaded (level images and etc.).
     * It generates sprites of each level and adds them to stage.
     */
    var onAssetsLoaded = function () {
        var sinceBeginning = 0;
        var jsonLevels = json.levels;
        var jsonLength = jsonLevels.length;

        // first index=0 is a level json
        for (var i = 0; i < jsonLength; i++) {
            sinceBeginning = addLevel(jsonLevels[i], sinceBeginning);
        }
    };

    /**
     * Function generates and adds level sprite to current stage.
     * @param jsonLevel Json data of level.
     * @param sinceBeginning Distance/position from left (0, 0) coordinates of sreeen.
     * @returns {*}
     */
    var addLevel = function (jsonLevel, sinceBeginning) {
        // create a texture from an image path, image size 1024/2048
        var texture = PIXI.Texture.fromImage(jsonLevel.img);
        // level button sprite
        var levelSprite = new PIXI.Sprite(texture);
        // setup newly created field
        levelSprite.level = jsonLevel;

        // percentage used in calculations for margin and button size
        var heightPercentage = 0.8;
        var widthPercentage = 0.43;
        // scale sprite to defined size
        levelSprite.scale.set(window.innerWidth / levelSprite.width * widthPercentage, window.innerHeight / levelSprite.height * heightPercentage);
        // position to create margin = height * percentage/2 (100-defined), divided by 2 to achieve same margin from bottom and top
        var margin = window.innerHeight * (1 - heightPercentage) / 2;
        // position button to go after other buttons
        levelSprite.position.set(sinceBeginning + margin, margin);

        sinceBeginning += levelSprite.width + margin;
        setupListeners(levelSprite);

        var levelText = generateLevelText(sinceBeginning, margin, jsonLevel);
        addToStage(levelSprite, levelText);

        return sinceBeginning;
    };

    /**
     * Function for setting up event listeners for sprites.
     * @param sprite Sprite to setup listeners for.
     */
    var setupListeners = function (sprite) {
        //setting sprite to be interactive and button-like
        sprite.interactive = true;
        sprite.buttonMode = true;
        // set the mouse over callback..
        sprite.mouseover = mouseOver;
//        levelSprite.touchstart = mouseOver;
        // set the mouse out callback..
        sprite.mouseout = mouseOut;
//        levelSprite.touchend = levelSprite.touchendoutside = mouseOut;
        sprite.click = click;
//        levelSprite.tap = click;
    };

    /**
     * Function responsible for generating text sprite (which shows level name).
     * @param sinceBeginning Position/distance from beginning of screen.
     * @param margin Calculated margin between sprites/text.
     * @param jsonLevel Json data of level being generated.
     */
    var generateLevelText = function (sinceBeginning, margin, jsonLevel) {
        // text field
        var levelText = new PIXI.Text(jsonLevel.name, { font: "2vw Snippet", fill: "white", align: "left"});
        // could be modified to be more dynamic in case screens are extra small or level names are long
        levelText.position.x = sinceBeginning - levelText.width - margin;
        levelText.position.y = window.innerHeight - (margin * 2);

        return levelText;
    };

    /**
     * Function responsible for adding generated sprites (text + image) to container and then to stage.
     * @param levelSprite Sprite of level image.
     * @param levelText Text showing level name.
     */
    var addToStage = function (levelSprite, levelText) {
        // container to keep sprites + text
        var level = new PIXI.DisplayObjectContainer();
        level.addChild(levelSprite);
        level.addChild(levelText);
        stage.addChild(level);
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
     * Function defining what happens when "click" event is fired.
     */
    var click = function () {
        var jsonLevel = this.level;
        // load javascript files at runtime
        require(['gameStage.js', 'tower.js', 'infoUI.js', 'astar.js', 'enemy.js', 'waveController.js'], function () {
            // removing everything from old stage and creating new stage
            while (stage.children[0]) {
                stage.removeChild(stage.children[0]);
            }

            gameStage = new GameStage(stage, jsonLevel);
            gameStage.createStage();
        });


    };

    /**
     * Function to be called for each frame/interval.
     * It is responsible for continuing this chain call of update functions.
     */
    this.update = function () {
        if (gameStage != undefined) {
            gameStage.update();
        }
    };

    return this;
};