/*jshint quotmark: double, unused: false*/
"use strict";


angular.module("Game", [
    "Board",
    "ngCookies"
])
.service("GameService", function($q, $cookieStore, BoardService) {

    this.board = BoardService.board;
    this.pieces = BoardService.pieces;
    
    this.boardSize = BoardService.boardSize;
    
    // new game
    this.createNewBoard = function(level) {
        BoardService.createEmptyBoard();
        BoardService.createStartingPositions(level);
        this.maximalGraphics = this.getMaximal();
        this.setState(level);
        if (level === 1) {
            this.clearState();
        }
    };
    
    this.setState = function(level) {
        this.nextLevel = false;
        this.dalekCount = BoardService.countType("dalek");
        this.level = level;
        this.safeTeleports = Math.min(3, Math.round(Math.sqrt(level)));
    };
    
    this.clearState = function() {
        this.showInstructions = false;
        this.showSettings = false;
        this.gameOver = false;
        this.score = 0;
        this.level = 1;
        this.highscore = this.getHighscore();
    };
    
    this.getHighscore = function() {
        return parseInt($cookieStore.get("highscore"+this.boardSize)) || 0;
    };
    
    this.setBoardSize = function(size) {
        $cookieStore.put("size", size);
        BoardService.boardSize = size;
        this.boardSize = size;
    };
    
    this.getBoardSize = function() {
        var size = parseInt($cookieStore.get("size")) || 16;
        this.setBoardSize(size);
    };
    
    this.setMaximal = function(maximal) {
        $cookieStore.put("maximal", maximal);
        this.maximalGraphics = maximal;
    };
    
    this.getMaximal = function() {
        return ($cookieStore.get("maximal") || false);
    };
    
    this.setMouseDirection = function(index) {
        var doctorPosition = BoardService.getDoctorPosition(),
            cursorPosition = BoardService._1DTo2D(index),
            cell = BoardService.getMouseDirectionCell(doctorPosition, index);
        this.mouseKey = cell.key;
        this.mouseDirectionIndex = cell.index;
        this.mouseIndex = index;
    };
    
    this.clearMouseDirection = function() {
        this.mouseKey = null;
        this.mouseDirectionIndex = null;
        this.mouseIndex = null;  
    };
    
    this.mouseMove = function() {
        this.move(this.mouseKey);
    };
    
    // movement
    this.move = function(key) {
        var movethis = this,
            f;
  
        if (!(movethis.gameOver || 
                movethis.nextLevel ||
                movethis.showInstructions ||
                movethis.showSettings)) {
            f = function() {
                var position,
                    piece,
                    newPosition,
                    doctorPosition,                
                    x, y,
                    safeDoctor,
                    newDalekCount,
                    deadDoctor;
        
                // 0. reset moved flags
                BoardService.resetMovedFlags();
        
                // 1. user moves the doctor
                position = BoardService.getDoctorPosition();
                piece = BoardService.getCellAt(position);
                if (movethis.safeTeleports > 0) {
                    safeDoctor = true;
                } else {
                    safeDoctor = false;
                }
                if (key === "teleport") {
                    movethis.safeTeleports = Math.max(movethis.safeTeleports - 1, 0);
                }
                doctorPosition = BoardService.findNewDoctorPosition(piece, key, safeDoctor);
                BoardService.movePiece(piece, doctorPosition);
            
                // set the doctor position partway between old and new for better dalek behavior
               /* doctorPosition = {
                    x: 0.5*(position.x + doctorPosition.x),
                    y: 0.5*(position.y + doctorPosition.y)
                };*/
            
                // 2. daleks swarm to doctor
                // 2a first calculate each dalek's desired new position
                for (x = 0; x < BoardService.boardSize; x = x + 1) {
                    for (y = 0; y < BoardService.boardSize; y = y + 1) {
                        position = {x: x, y: y};
                        piece = BoardService.getCellAt(position);
                        if (piece) {
                            if (piece.type === "dalek" && !piece.moved) {
                                BoardService.findNewDalekPosition(piece, doctorPosition);
                            }
                        }
                    }
                }
                // 2b then move each dalek
                for (x = 0; x < BoardService.boardSize; x = x + 1) {
                    for (y = 0; y < BoardService.boardSize; y = y + 1) {
                        position = {x: x, y: y};
                        piece = BoardService.getCellAt(position);
                        if (piece) {
                            if (piece.type === "dalek" && !piece.moved) {
                                newPosition = {x: piece.newx, y: piece.newy};
                                BoardService.movePiece(piece, newPosition);
                            }
                        }
                    }
                }
            
                deadDoctor = movethis.isTheDoctorDead();
            
                if (deadDoctor) {
                    movethis.gameOver = true;
                }
                
                if (movethis.mouseIndex && !deadDoctor) {
                    movethis.setMouseDirection(movethis.mouseIndex);
                }
                
                newDalekCount = BoardService.countType("dalek");
                movethis.updateScore(movethis.score + movethis.dalekCount - newDalekCount);
                movethis.dalekCount = newDalekCount;
                if (movethis.dalekCount === 0 && !deadDoctor) {
                    movethis.nextLevel = true;
                    movethis.level = movethis.level + 1;
                }
            };   
            return $q.when(f());
        }
    };
    
    // update the score
    this.updateScore = function(newScore) {
        this.score = newScore;
        if (newScore > this.getHighscore()) {
            this.highscore = newScore;
            $cookieStore.put("highscore"+this.boardSize, newScore);
        }
    };
    
    // is the doctor dead?
    this.isTheDoctorDead = function() {
        return BoardService.overlappingDalek() ||
            BoardService.overlappingRubble();
    };
    
});