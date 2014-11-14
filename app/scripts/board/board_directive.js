/*jshint quotmark: double, unused: false*/
"use strict";


angular.module("Board")
.directive("board", function() {
    return {
        restrict: "A",
        require: "ngModel",
        scope: {
            ngModel: "="
        },
        templateUrl: "scripts/board/board.html"
    };
});