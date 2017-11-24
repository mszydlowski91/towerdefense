/**
 * Object representing single tower (sprite/graphics, behavior, data).
 * @param uiRef Reference to UI so updates on data could be shown.
 * @param waveController Reference to wave controller so we could access enemy data.
 * @returns {Tower}
 * @constructor
 */
var Tower = function (uiRef, waveController) {
    "use strict";
    var position = {},
        laser, animationTimeout,
        self = this;

    /**
     * Calling parent constructor.
     * java Super.Constructor();
     */
    PIXI.Graphics.call(this);

    /**
     * Function removes or hides laser sprite.
     * @param stage Stage reference that laser is being removed from.
     */
    this.stopAnimatingLaser = function (stage) {
        if (laser !== undefined) {
            stage.removeChild(laser);
            laser = undefined;
        }
    };

    /**
     * Function to be called for each frame/interval.
     */
    this.update = function () {
        if (this.lastShot + this.speed >= Date.now()) {
            return false;
        }

        var enemies = waveController.getEnemyList();
        // clear any current timeout for animation
        clearTimeout(animationTimeout);
        // stop animation quick after attacking, just no at instant! This is supported in IE
        animationTimeout = setTimeout(this.stopAnimatingLaser, 500, this.stage);
        this.attackEnemy(enemies);
        this.lastShot = Date.now();

        return true;
    };

    /**
     * Function looks for enemy through list, by distance from tower, to attack.
     * @param enemies
     */
    this.attackEnemy = function (enemies) {
        var loopLength = enemies.length;

        for (var i = 0; i < loopLength; i++) {
            var enemy = enemies[i];
            var enemySprite = enemy.getSprite();
            var distance = Math.abs(enemySprite.position.x - position.x) + Math.abs(enemySprite.position.y - position.y);

            // if enemy is in range animate attacking, otherwise remove attack animation after short delay
            if (distance < position.height * self.range) {
                // --------------animate attack---------------------
                self.createAttackSprite(distance, enemySprite);
                // ---------------deal damage--------------------
                var reducedHealth = enemies[i].getHealth() - self.damage;
                enemy.setHealth(reducedHealth);
                // exit loop
                return;
            }
        }
    };

    /**
     * Function creates tower attack (laser) sprite and adds it to stage attached to tower.
     * @param distance Distance to enemy in x and y Axis.
     * @param enemySprite Sprite of enemy being attacked.
     */
    this.createAttackSprite = function (distance, enemySprite) {
        self.stopAnimatingLaser(self.stage);

        laser = new PIXI.Sprite(self.texture);
        laser.scale.x = (distance - position.height / 2) / laser.width;
        laser.scale.y = 0.3;
        laser.position.x = position.x + position.height / 2;
        laser.position.y = position.y + position.height / 2;
        laser.alpha = 0.8;

        var x = (enemySprite.position.x) - position.x;
        var y = (enemySprite.position.y) - position.y;
        laser.rotation = Math.atan2(y, x);

        var laserAttack = new Howl({
            src: ['res/laser.wav']
        });
        laserAttack.play();

        self.stage.addChild(laser);
    };

    /**
     * Function draws shape representing tower and sets up appropriate variables, event listeners.
     * @param tile Tile to build on.
     * @param stage Stage to build in.
     */
    this.build = function (tile, stage) {
        // build circle to represent tower
        this.lineStyle(1, 0xFF0000, 1);
        // this.beginFill(this.towerColor);
        // this.drawCircle(tile.position.x + tile.width / 2, tile.position.y + tile.height / 2, tile.scale.x * 10);
        var images = ['res/gander.jpg', 'res/demon.png'];
        var index = Math.floor(2*Math.random());
        var scale = 0.15;
        if(index === 1) {
            scale *= 5;
        }
        var texture = PIXI.Texture.fromImage(images[index]);
        var sprite = new PIXI.Sprite(texture);
        sprite.scale.set(scale);
        sprite.x = tile.position.x;
        sprite.y = tile.position.y;
        stage.addChild(sprite);
        // setting hit area so click event could be fired
        // this.hitArea = new PIXI.Rectangle(tile.position.x, tile.position.y, tile.width, tile.height);
        this.saveTileValues(tile);
        // update UI/set variables
        var newCash = uiRef.getCash() - this.getCost();
        uiRef.setCash(newCash, stage);

        // setup tower event listener
        this.interactive = true;
        this.click = click;
        this.tap = click;
        //        tilingSprite.tap = click;

        // add tower sprite/shape to stage
        stage.addChild(this);
    };

    /**
     * Function saves tile data within object variable for later use/calculations.
     * @param tile Tile which data this function saves.
     */
    this.saveTileValues = function (tile) {
        // save current tile values for later
        position.x = tile.position.x;
        position.y = tile.position.y;
        position.height = tile.height;
        position.scale = tile.scale.x;
    };

    /**
     * Function defining what happens when "click" event is fired.
     */
    var click = function () {
        var upgradeCost = self.cost * (self.upgrade + 1) * 1.5, currentCash = uiRef.getCash();
        // first upgrade would cost 100(tower cost) * 1.5 = 150, second 300, third 450, and etc.
        if (currentCash >= upgradeCost) {
            self.damage++;
            self.upgrade++;
            uiRef.setCash(currentCash - upgradeCost);
        }
    };

    return this;
};

/**
 * Tower inherits PIXI.Graphics
 * @type {Graphics}
 */
Tower.prototype = new PIXI.Graphics();
Tower.prototype.constructor = Tower;

Tower.prototype.cost = 100;
Tower.prototype.damage = 1;
Tower.prototype.range = 2;
// interval how often tower shoots
Tower.prototype.speed = 1000;
Tower.prototype.upgrade = 0;
Tower.prototype.towerColor = 0xff0055;
// last call for animating
Tower.prototype.lastShot = Date.now();
Tower.prototype.texture = PIXI.Texture.fromImage("res/laser.png");

Tower.prototype.getCost = function () {
    return this.cost;
};