describe("Game", function() {
    describe("GameService", function() {
        // Inject the Game module into this test
        beforeEach(module("Game"));

        var gameService, 
            _boardService;
        
        beforeEach(module(function($provide) {
            _boardService = {
                overlappingDalek: angular.noop,
                overlappingRubble: angular.noop
            };
            
            $provide.value("BoardService", _boardService);
        }));
        
        beforeEach(inject(function(GameService) {
            gameService = GameService;
        })); 
        
        describe(".isTheDoctorDead", function() {
            it("should report true if a dalek is on the doctor", function() {
                spyOn(_boardService, "overlappingDalek").and.returnValue(true);
                expect(gameService.isTheDoctorDead()).toBeTruthy();
            });
            it("should report true if the doctor is on a rubble pile", function() {
                spyOn(_boardService, "overlappingRubble").and.returnValue(true);
                expect(gameService.isTheDoctorDead()).toBeTruthy();
            });
            it("should report false if the doctor is in a safe space", function() {
                spyOn(_boardService, "overlappingDalek").and.returnValue(false);
                spyOn(_boardService, "overlappingRubble").and.returnValue(false);
                expect(gameService.isTheDoctorDead()).toBeFalsy();
            });
        });
    });
});