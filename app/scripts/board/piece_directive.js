/*jshint quotmark: double, unused: false*/
"use strict";


angular.module("Board")
.directive("piece", function() {
    return {
        restrict: "A",
        scope: {
            ngModel: "="
        },
        templateUrl: "scripts/board/piece.html"
    };
});

