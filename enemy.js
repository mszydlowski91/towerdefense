/**
 * Object representing single enemy (sprite, behavior, data).
 * @param infoUI Reference to UI so updates on data could be shown.
 * @param enemyVars Variables required for setting up and using this object (tile list, gates, container for sprite).
 * @param windowSize Window size variable, given so sprites wouldn't differ on screen resize.
 * @returns {Enemy}
 * @constructor
 */
var Enemy = function (infoUI, enemyVars, windowSize) {
    "use strict";
    var sprite,
        sinceStart = Date.now();

    /**
     * Functions creates enemy sprite and modifies key variables according to parameters.
     * @param wave Current wave number.
     * @returns {Sprite}
     */
    this.createEnemy = function (wave) {
        //---------------set sprite-----------------------
        sprite = new PIXI.Sprite(this.texture);
        var tileNr = Math.sqrt(enemyVars.tiles.children.length);
        var spriteSize = windowSize.height / tileNr / this.texture.height;
        sprite.scale.set(spriteSize, spriteSize);
        sprite.position.set(enemyVars.gates.start.x, enemyVars.gates.start.y);

        enemyVars.container.addChild(sprite);
        //--------------set variables-------------------
        this.health += wave;
        this.worth += wave;

        return sprite;
    };

    /**
     * Function sets health of enemy minion, once enemy health reaches 0 enemy
     * is removed from game and current cash player has is incremented by worth.
     * @param reducedHealth Reduced health (calculations are done elsewhere).
     */
    this.setHealth = function (reducedHealth) {
        this.health = reducedHealth;

        if (this.health <= 0) {
            this.killed = true;
            infoUI.incrementCash(this.worth);
        }
    };

    /**
     * Function returns local variable sprite, sprite variable is part of object
     * that is responsible for visual representation of enemy.
     * @returns {*}
     */
    this.getSprite = function () {
        return sprite;
    };

    /**
     * Function to be called for each frame/interval. This update creates movement and is also
     * responsible for sending feedback on whether enemy is alive, reached final point or is simply moving.
     * @returns {boolean|*}
     */
    this.update = function () {
        // if killed skip everything right away
        if (this.killed) {
            enemyVars.container.removeChild(sprite);
            return this.killed;
        }

        var oldTime = sinceStart;
        sinceStart = Date.now();
        var deltaTime = sinceStart - oldTime,
            nextTile = enemyVars.path[this.counter],
            tile = enemyVars.tiles.children[nextTile.x * enemyVars.size + nextTile.y],
            xDirection = tile.position.x - sprite.position.x,
            yDirection = tile.position.y - sprite.position.y;

        this.moveHorizontal(xDirection, deltaTime, sprite);
        this.moveVertical(yDirection, deltaTime, sprite);

        // not going to be exact coordinate, thus if small distance is left stop movement
        if (xDirection < 1 && xDirection > -1) {
            sprite.position.x = tile.position.x;
        }

        if (yDirection < 1 && yDirection > -1) {
            sprite.position.y = tile.position.y;
        }

        if (xDirection === 0 && yDirection === 0) {
            this.counter++;

            if (this.counter >= enemyVars.path.length) {
                this.killed = true;
                infoUI.setLives(infoUI.getLives() - 1);
            }
        }

        return false;
    };

    return this;
};

Enemy.prototype.health = 5;
Enemy.prototype.killed = false;
// how much cash per kill is it worth
Enemy.prototype.worth = 10;
Enemy.prototype.counter = 0;
Enemy.prototype.speed = 40;
Enemy.prototype.texture = PIXI.Texture.fromImage("res/enemy.png");

Enemy.prototype.getHealth = function () {
    return this.health;
};

/**
 * Function creates movement of sprite in x axis.
 * @param xDirection Direction to move to (right or left).
 * @param deltaTime Time difference since last call (frames aren't as reliable).
 * @param sprite Sprite to move.
 */
Enemy.prototype.moveHorizontal = function (xDirection, deltaTime, sprite) {
    //move right
    if (xDirection > 0) {
        sprite.position.x += this.speed / 1000 * deltaTime;
        return;
    }

    //move left
    if (xDirection < 0) {
        sprite.position.x -= this.speed / 1000 * deltaTime;
    }
};

/**
 * Function creates movement of sprite in y axis.
 * @param yDirection Direction to move to (up or down).
 * @param deltaTime Time difference since last call (frames aren't as reliable).
 * @param sprite Sprite to move.
 */
Enemy.prototype.moveVertical = function (yDirection, deltaTime, sprite) {
    //move down
    if (yDirection > 0) {
        sprite.position.y += this.speed / 1000 * deltaTime;
        return;
    }

    //move up
    if (yDirection < 0) {
        sprite.position.y -= this.speed / 1000 * deltaTime;
    }
};