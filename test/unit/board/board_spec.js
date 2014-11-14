describe("Board", function() {

    beforeEach(module("Board")); 
    
    describe("BoardService", function() {
        
        var boardService;
        
        beforeEach(inject(function(BoardService) {
            boardService = BoardService;
        })); 
         
        describe(".createEmptyBoard", function() {        
            var nullArr;
            var boardSize = 32;
    
            beforeEach(function() {
                nullArr = [];
                for (var x = 0; x < boardSize*boardSize; x++) {
                    nullArr.push(null);
                }
            });
            it("should populate the board array with nulls", function() {
                var board = [];
                for (var x = 0; x < boardSize*boardSize; x++) {
                    board.push(x);
                }
                boardService.board = board;
                boardService.createEmptyBoard();
                expect(boardService.board).toEqual(nullArr);
            });
            it('should populate the pieces array with nulls', function() {
                var pieces = [];
                for (var x = 0; x < boardSize*boardSize; x++) {
                    pieces.push(x);
                }
                boardService.pieces = pieces;
                boardService.createEmptyBoard();
                expect(boardService.pieces).toEqual(nullArr);
            });
        });
    });
    
    describe("PieceModel", function() {
        var pieceModel,
            piece;
        
        beforeEach(inject(function(PieceModel) {
            pieceModel = PieceModel;
        }));
        beforeEach(function() {
            piece = new pieceModel({x:1, y:2}, "pieceType");
        });
        
        it("should have an x coordinate", function() {
            expect(piece.x).toEqual(1);
        });
        it("should have a y coordinate", function() {
            expect(piece.y).toEqual(2);
        });
        it("should have a type", function() {
            expect(piece.type).toEqual("pieceType");
        });
        it("should return its coordinate", function() {
            expect(piece.getPos()).toEqual({x:1, y:2});
        });
    });
}); 