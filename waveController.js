/**
 * Object for controlling waves (spawning enemies, linking their update function with previous update functions
 * calculates values to be used in enemy objects).
 * Initialised once per level.
 * @param json Level data in json format.
 * @param tileSet Container with tile sprites within.
 * @param infoBar UI reference.
 * @returns {WaveController}
 * @constructor
 */
var WaveController = function (json, tileSet, infoBar) {
    "use strict";
    // in between waves duration, duration + 20% time for chill
    var deltaTime = json.duration * 1.2 * 1000,
    // last wave
        lastCall = Date.now() - deltaTime,
    // spawn interval
        interval = (json.duration / json.enemyPerWave) * 1000,
    // list of enemies for reference
        enemyList = [],
    // loop reference
        intervalLoop,
        spawnCounter = 0,
    //reference to info bar
        wave = 0,
        windowSize = {width: window.innerWidth, height: window.innerHeight};

    /**
     * Object which is going to be passed to enemy object later on. Could
     * be separate variables, but easier to pass lower number of parameters.
     * @type {{container: SpriteBatch, tiles: *, gates: {}, path: Array}}
     */
    var enemyVars = {
        container: new PIXI.SpriteBatch(),
        tiles: tileSet,
        gates: {},
        path: [],
        size: json.size
    };

    /**
     * Function encapsulates more complex code within constructor and runs it right away.
     */
    (function () {
        tileSet.stage.addChild(enemyVars.container);
        var tileArray = tileSet.children;
        var array2D = [];
        // number of tiles 20x20
        var numberOfTiles = json.size;
        var gates = enemyVars.gates = {};
        gates.start = {};
        gates.end = {};
        // ----------creating grid--------------------
        for (var i = 0; i < numberOfTiles; i++) {
            var array1D = [];

            for (var d = 0; d < numberOfTiles; d++) {
                var index = i * numberOfTiles + d;
                var tile = tileArray[index];
                array1D.push(tile.value);

                if (tile.value === 2) {
                    gates.start.x = tile.position.x;
                    gates.start.y = tile.position.y;
                    gates.start.grid = {};
                    gates.start.grid.x = i;
                    gates.start.grid.y = d;
                } else if (tile.value === 3) {
                    gates.end.x = tile.position.x;
                    gates.end.y = tile.position.y;
                    gates.end.grid = {};
                    gates.end.grid.x = i;
                    gates.end.grid.y = d;
                }
            }
            array2D.push(array1D);
        }
        //--------------------------------------------
        //path finding
        var astar = new Astar();
        var graph2D = new astar.Graph(array2D);

        var startingPoint = graph2D.grid[gates.start.grid.x][gates.start.grid.y];
        var endPoint = graph2D.grid[gates.end.grid.x][gates.end.grid.y];
        enemyVars.path = astar.search(graph2D, startingPoint, endPoint);
    })();

    /**
     * Function to be called for each frame/interval.
     */
    this.update = function () {
        if (lastCall + deltaTime < Date.now()) {
            clearInterval(intervalLoop);
            lastCall = Date.now();

            wave++;
            if (wave >= json.waves) {
                infoBar.setGameOver(true);
                return;
            }

            spawnCounter = json.enemyPerWave;
            intervalLoop = setInterval(this.spawn, interval);
        }

        for (var i = 0; i < enemyList.length; i++) {
            if (enemyList[i].update()) {
                enemyList.splice(i, 1);
            }
        }
    };

    /**
     * Function creates new enemy each time it is called until counter reaches 0;
     */
    this.spawn = function () {
        var enemy = new Enemy(infoBar, enemyVars, windowSize);
        enemy.createEnemy(wave);
        enemyList.push(enemy);
        spawnCounter--;

        if (spawnCounter <= 0 || infoBar.getGameOver()) {
            clearInterval(intervalLoop);
        }
    };

    /**
     * Function which returns list of enemy objects.
     * @returns {Array}
     */
    this.getEnemyList = function () {
        return enemyList;
    };

    return this;
};