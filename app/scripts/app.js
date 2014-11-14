/*jshint quotmark: double, unused: false*/
"use strict";

/**
 * @ngdoc overview
 * @name daleksApp
 * @description
 * # daleksApp
 *
 * Main module of the application.
 */
angular
.module("daleksApp", [
    "Game",
    "Board",
    "Keyboard",
    "ngAnimate",
    "ngCookies"
])
.controller("GameController", function($q, GameService, KeyboardService){
    this.game = GameService;
    
    this.newGame = function() {
        KeyboardService.init();
        this.getSize();
        this.game.createNewBoard(1);
        this.startGame();
    };
    
    this.nextLevel = function() {
        this.game.createNewBoard(this.game.level);
    }
    
    this.startGame = function() {
        var ctrlthis = this,
            f;
            
        KeyboardService.on(function(key) {
            ctrlthis.game.move(key);
            
            if ((ctrlthis.game.gameOver || ctrlthis.game.nextLevel) && key === "advance") {
                f = function() {
                    if (ctrlthis.game.gameOver) {
                        ctrlthis.newGame();
                    }
                    if (ctrlthis.game.nextLevel) {
                        ctrlthis.nextLevel();
                    }
                }
                return $q.when(f());
            }
        });
    };
    
    this.toggleInstructions = function() {
        if (this.game.showSettings) {
            this.toggleSettings();
        }
        if (this.game.gameOver) {
            this.game.gameOver = false;
            this.newGame();
        }
        this.game.showInstructions = !this.game.showInstructions;
    };
    
    this.toggleSettings = function() {
        if (this.game.showInstructions) {
            this.toggleInstructions();
        };
        if (this.game.gameOver) {
            this.game.gameOver = false;
            this.newGame();
        }
        this.game.showSettings = !this.game.showSettings;
    };
    
    this.clearOverlays = function() {
        if (this.game.showInstructions) {
            this.toggleInstructions();
        }
        if (this.game.showSettings) {
            this.toggleSettings();
        }
    };
    
    this.setSize = function(size) {
        this.game.setBoardSize(size);
        this.newGame();
    };
    
    this.getSize = function() {
        this.game.getBoardSize();
    };
    
    this.newGame();
});
