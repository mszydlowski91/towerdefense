/**
 * Object for displaying UI.
 * Initialised once per level.
 * @param json Level data in json format.
 * @param stage Stage to attach UI to.
 * @returns {InfoUi}
 * @constructor
 */
var InfoUi = function (json, stage) {
    "use strict";
    var level = json.name,
        waves = json.waves,
        lives = json.lives,
        cash = json.money,
        infoBar,
        gameOver = false;

    /**
     * Function creates UI window and adds it to stage.
     */
    this.createInfoUI = function () {
        //creating info bar
        infoBar = new PIXI.DisplayObjectContainer();
        var startingPoint = 0;
        //(window.innerWidth / 2) - (window.innerHeight / 2);
        var infoText = ["Poziom: " + level, "Procesje: " + waves, "Mroczne życia: " + lives, "Złote obierki: " + cash];

        for (var i = 0; i < infoText.length; i++) {
            var previousText = this.createText(startingPoint, infoText[i]);
            infoBar.addChild(previousText);
            startingPoint = previousText.position.y + previousText.height;
        }

        stage.addChild(infoBar);
    };

    /**
     * Function generates text field (its position) to be used in UI.
     * @param yStart Coordinate in x axis for final UI position calculation.
     * @param text Value to be used as text.
     * @returns {Text}
     */
    this.createText = function (yStart, text) {
        // level name
        var levelText = new PIXI.Text(text, { font: "1vw Snippet", fill: "white", align: "left"});
        // 2% margin
        var textMargin = window.innerHeight * 0.02;
        levelText.position.x = textMargin;
        levelText.position.y = yStart + textMargin;

        return levelText;
    };

    /**
     * Function returns cash variable.
     * @returns {*}
     */
    this.getCash = function () {
        return cash;
    };

    /**
     * Function sets up cash variable with new value and updates UI view.
     * @param money New value for cash variable.
     */
    this.setCash = function (money) {
        cash = money;
        infoBar.children[3].setText("Cash: " + cash);
    };

    /**
     * Function returns lives variable.
     * @returns {*}
     */
    this.getLives = function () {
        return lives;
    };

    /**
     * Function sets up lives variable with new value and updates UI view.
     * In case lives reach zero function sets up gameOver variable to be true.
     * @param difLives New value for lives variable.
     */
    this.setLives = function (difLives) {
        lives = difLives;
        infoBar.children[2].setText("Lives: " + lives);

        if (lives <= 0) {
            gameOver = true;
        }
    };

    /**
     * Function increments current cash value and calls setCash() function with new value.
     * @param inc Amount to increment.
     */
    this.incrementCash = function (inc) {
        cash += inc;
        // just so it updates
        this.setCash(cash);
    };

    /**
     * Function returns gameOver variable.
     * @returns {boolean}
     */
    this.getGameOver = function () {
        return gameOver;
    };

    /**
     * Function sets up gameOver variable with value provided.
     * @param value New value for gameOver variable.
     */
    this.setGameOver = function (value) {
        gameOver = value;
    };

    return this;
};