/*jshint quotmark: double, unused: false*/
"use strict";


angular.module("Board", [])
.factory("GenerateUniqueId", function() {
    var generateUid = function() {
        // http://www.ietf.org/rfc/rfc4122.txt
        // http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
        var d = new Date().getTime();
        var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c === "x" ? r : (r&0x7|0x8)).toString(16);
        });
        return uuid;
    };
    return {
        next: function() { return generateUid(); }
    };
})
.factory("PieceModel", function(GenerateUniqueId) {
    var Piece = function(pos, type) {
        this.x = pos.x;
        this.y = pos.y;
        
        this.id = GenerateUniqueId.next();
        this.type = type;
        this.moved = false;
        
        
        this.newx = pos.x;
        this.newy = pos.y;
    };
    
    Piece.prototype.getPos = function() {
        return {
            x: this.x,
            y: this.y
        };
    };
    
    Piece.prototype.updatePosition = function(newPosition) {
        this.x = newPosition.x;
        this.y = newPosition.y;
        this.newx = newPosition.x;
        this.newy = newPosition.y;
    };
    
    return Piece;
})
.service("BoardService", function(PieceModel) {
    var servicethis = this;
    
    var vectors = {
        "north": {x: 0, y: -1},
        "northeast": {x: 1, y: -1},
        "east": {x: 1, y: 0},
        "southeast": {x: 1, y: 1},
        "south": {x: 0, y: 1},
        "southwest": {x: -1, y: 1},
        "west": {x: -1, y: 0},
        "northwest": {x: -1, y: -1},
        "center": {x: 0, y: 0},
        "teleport": {x: 0, y: 0}
    };
    
    this.board = [];
    this.pieces = [];
    
    this.boardSize = 8;
    /*this.initialDalekNumber = Math.ceil(this.boardSize / 4);
    this.dalekLeveLIncrement = Math.ceil(this.boardSize / 6);*/
    this.initialDoctorNumber = 1;
    this.deadDoctor = null;
    
    this.resetMovedFlags = function() {
        this.forEachCell(function(x, y, piece) {
            if (piece) {
                piece.moved = false;
            }
        });
    };
    
    this.countType = function(type) {
        var count = 0;
        this.forEachCell(function(x, y, piece) {
            if (piece) {
                if (piece.type === type) {
                    count = count + 1;
                }
            }
        });
        return count;
    };
    
    this.movePiece = function(piece, newPosition) {
        var oldPosition = {
            x: piece.x,
            y: piece.y
        },
        occupant,
        occupantNewPos;
        
        // check for an occupant in the new position
        occupant = this.getCellAt(newPosition);
        if (!occupant) { // if nobody's there, just move.
            this.simpleMove(piece, oldPosition, newPosition);
        } else {
            if (piece.type === "dalek" && occupant.type === "rubble") {
                // if a dalek hits a rubble pile, just remove the dalek
                this.setCellAt(oldPosition, null);
            }
            if (piece.type === "dalek" && occupant.type === "dalek") {
                // if the new positions match, create rubble
                if (piece.newx === occupant.newx && piece.newy === occupant.newy) {
                    this.setCellAt(oldPosition, null);
                    this.setCellAt(newPosition, null);
                    this.addPiece(new PieceModel(newPosition, "rubble"));
                } else {
                    // need to move the occupant out of the way first
                    occupantNewPos = {x: occupant.newx, y: occupant.newy};
                    this.movePiece(occupant, occupantNewPos);
                    this.simpleMove(piece, oldPosition, newPosition);
                }
            }
            if (piece.type === "dalek" && occupant.type === "doctor") {
                this.deadDoctor = true;
                this.simpleMove(piece, oldPosition, newPosition);
            }
            if (piece.type === "doctor" && (occupant.type === "dalek" || occupant.type === "rubble")) {
                this.deadDoctor = true;
                this.setCellAt(oldPosition, null);
            }
        }
    };
    
    this.simpleMove = function(piece, oldPosition, newPosition) {
        this.setCellAt(oldPosition, null);
        this.setCellAt(newPosition, piece);
        
        piece.updatePosition(newPosition);
        piece.moved = true;
    };
    
    this.findNewDalekPosition = function(piece, target) {
        /*var dx,
            dy,
            dist;
        
        dx = target.x - piece.x;
        dy = target.y - piece.y;
        dist = Math.sqrt(dx*dx + dy*dy);

        piece.newx = piece.x + Math.round(dx/dist);
        piece.newy = piece.y + Math.round(dy/dist);   */
        if (piece.x > target.x) {
            piece.newx = piece.x - 1;
        } else if (piece.x < target.x) {
            piece.newx = piece.x + 1; 
        }
        
        if (piece.y > target.y) {
            piece.newy = piece.y - 1;
        } else if (piece.y < target.y) {
            piece.newy = piece.y + 1; 
        }
    };
    
    this.findNewDoctorPosition = function(cell, key, safe) {
        var vector = vectors[key],
            nextPosition;
        if (key !== "teleport") {
            nextPosition = {
                x: Math.min(Math.max(cell.x + vector.x, 0), this.boardSize - 1),
                y: Math.min(Math.max(cell.y + vector.y, 0), this.boardSize - 1)
            };
        } else {
            nextPosition = this.findRandomOpenCell(safe);
        }
        return nextPosition;
    };

    this.getDoctorPosition = function() {
        var docPosition,
            getthis = this;
        this.forEachCell(function(x, y) {
            var piece = getthis.getCellAt({x:x, y:y});
            if (piece !== null) {
                if(piece.type === "doctor") {
                    docPosition = {x: piece.x, y: piece.y};
                }
            }
        });
        return docPosition;
    };
    
    this.createStartingPositions = function(level) {
        var i,
            nDaleks = this.initialDalekNumber + this.dalekLeveLIncrement * (level - 1);
        for (i = 0; i < nDaleks; i++) {
            this.insertRandomPiece("dalek");
        }
        this.insertRandomPiece("doctor");
        this.deadDoctor = false;
    };
    
    this.overlappingRubble = function() {
        return this.deadDoctor;
    };
    
    this.overlappingDalek = function() {
        return this.deadDoctor;
    };

    this.addPiece = function(piece) {
        var i = this._2DTo1D(piece);
        this.pieces[i] = piece;
    };
    
    this.insertRandomPiece = function(type) {
        var openCell = this.findRandomOpenCell(false),
            piece = new PieceModel(openCell, type);
        this.addPiece(piece);
    };
    
    this.findRandomOpenCell = function(safe) {
        var openCells = this.findOpenCells(safe);
            
        if (openCells.length > 0) {
            return openCells[Math.floor(Math.random() * openCells.length)];
        }
    };
    
    this.getMouseDirectionCell = function(doctorPosition, i) {
        var dx = 0,
            dy = 0,
            mouseDirectionPosition,
            NSstring = "",
            EWstring = "",
            fullstring,
            mousePosition = this._1DTo2D(i);
            
        if (mousePosition.x > doctorPosition.x) {
            dx = 1;
            EWstring = "east";
        } else if (mousePosition.x < doctorPosition.x) {
            dx = -1;
            EWstring = "west";
        }
        if (mousePosition.y > doctorPosition.y) {
            dy = 1;
            NSstring = "south";
        } else if (mousePosition.y < doctorPosition.y) {
            dy = -1;
            NSstring = "north";
        }
        if (NSstring !== "" || EWstring !== "") {
            fullstring = NSstring + EWstring;
        } else {
            fullstring = "center";
        }
        mouseDirectionPosition = {x: doctorPosition.x + dx, y: doctorPosition.y + dy};
        return {index: this._2DTo1D(mouseDirectionPosition), key: fullstring};
    };
    
    this.checkCellSafety = function(position) {
        var i,
            j,
            piece,
            safe = true;
  
        for (i = position.x - 1; i <= position.x + 1; i = i + 1) {
            for (j = position.y - 1; j <= position.y + 1; j = j + 1) {
                piece = this.getCellAt({x: i, y: j});
                if (piece) {
                    if (piece.type === "dalek") {
                        safe = false;
                    }
                }
            }
        }
        return safe;
    };
    
    this.findOpenCells = function(safe) {
        var openCells = [],
            openthis = this;
        this.forEachCell(function(x, y) {
            var occupied = openthis.getCellAt({x:x, y:y});
            if (occupied === null) {
                if (safe) {
                    if(openthis.checkCellSafety({x:x, y:y})) {
                        openCells.push({x:x, y:y});
                    }
                } else {
                    openCells.push({x:x, y:y});
                }
            }
        });
        return openCells;
    };

    this.setDalekNumbers = function() {
        this.initialDalekNumber = Math.ceil(this.boardSize / 4);
        this.dalekLeveLIncrement = Math.ceil(this.boardSize / 6);
    };

    this.createEmptyBoard = function() {
        var i,
            boardSize2 = this.boardSize * this.boardSize,
            createthis = this;

        this.setDalekNumbers();

        // trim if moving down in size
        if (this.board.length > boardSize2) {
            this.board.splice(boardSize2, this.board.length - boardSize2);
            this.pieces.splice(boardSize2, this.pieces.length - boardSize2);
        }

        // make a nulled board
        for (i = 0; i < boardSize2; i = i + 1) {
            this.board[i] = null;
        }

        // make a nulled tile array
        this.forEachCell(function(x, y) {
            createthis.setCellAt({x:x, y:y}, null);
        });
    };
    
    this.forEachCell = function(func) {
        var i;
        for (i = 0; i < this.boardSize * this.boardSize; i = i + 1) {
            var pos = this._1DTo2D(i);
            func(pos.x, pos.y, this.pieces[i]);
        }
    };
    
    this.setCellAt = function(pos, piece) {
        if (this.inBoard(pos)) {
            var i = this._2DTo1D(pos);
            this.pieces[i] = piece;
        }
    };
     
    this.getCellAt = function(pos) {
        if (this.inBoard(pos)) {
            var i = this._2DTo1D(pos);
            return this.pieces[i];
        } else {
            return null;
        }
    };
    
    this.inBoard = function(pos) {
        return pos.x >= 0 && pos.x < this.boardSize &&
                pos.y >= 0 && pos.y < this.boardSize;
    }; 
    
    this._1DTo2D = function(i) {
        var x = i % this.boardSize,
            y = (i - x) / this.boardSize;
        return {
            x: x,
            y: y
        };
    };
    
    this._2DTo1D = function(pos) {
        return (pos.y * this.boardSize) + pos.x;
    };
});
