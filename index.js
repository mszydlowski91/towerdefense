/**
 * Root of all evil.
 */
(function () {
    "use strict";

    /**
     * Called once json with level data is loaded.
     * Function proceeds to load "menuStage.js" once json is loaded.
     * @param evt Event/data.
     */
    var loadJson = function (evt) {
        if (evt.loader.json) {
            json = evt.loader.json;
            // load stage from menuStage module
            require(['menuStage.js'], loadStage);
        }
    };

    /**
     * Function is called once "menuStage.js" is loaded.
     * It initialises MenuStage object and proceeds to update whole game in one animation loop.
     */
    var loadStage = function () {
        var menu = new MenuStage(stage, json);
        menu.createStage();

        /**
         * Single loop to rule them all.
         */
        function animate() {
            menu.update();
            // render the stage
            renderer.render(stage);
            requestAnimFrame(animate);
        }

        requestAnimFrame(animate);
    };

    // auto-detect renderer, either canvas or webgl (webgl faster)
    var renderer = new PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight);
    //attach renderer to body
    document.body.appendChild(renderer.view);
    var stage = new PIXI.Stage;
    //json to be used later on
    var json;

    var jsonToLoad = ["res/levels.json"];
    var loader = new PIXI.AssetLoader(jsonToLoad);
    loader.on('onProgress', loadJson);
    loader.load();
})();