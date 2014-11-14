/*jshint quotmark: double, unused: false*/
"use strict";

angular.module("Keyboard", [])
.service("KeyboardService", function($document) {

    var N = "north",
        NE = "northeast",
        E = "east",
        SE = "southeast",
        S = "south",
        SW = "southwest",
        W = "west",
        NW = "northwest",
        C = "center",
        T = "teleport",
        A = "advance";
    
    var keyboardMap = {
        87: N,
        69: NE,
        68: E,
        67: SE,
        88: S,
        90: SW,
        65: W,
        81: NW,
        83: C,
        84: T,
        32: A,
        13: A
    };

    this.init = function() {
        var initthis = this;
        this.keyEventHandlers = [];
        
        $document.unbind("keydown");
        
        $document.bind("keydown", function(event) {
            var key = keyboardMap[event.which];
            
            if(key) {
                event.preventDefault();
                initthis._handleKeyEvent(key, event);
            }
        });
    };
    
    this._handleKeyEvent = function(key, event) {
        var callbacks = this.keyEventHandlers,
            callback,
            x;
            
        if (!callbacks) {
            return;
        }
        
        event.preventDefault();
        if (callbacks) {
            for (x = 0; x < callbacks.length; x++) {
                callback = callbacks[x];
                callback(key, event);
            }
        }
    };

    this.on = function(func) {
        this.keyEventHandlers.push(func);
    };
});