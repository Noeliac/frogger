


// Especifica lo que se debe pintar al cargar el juego
var startGame = function() {

  Game.setBoard(0, new Fondo());
  Game.setBoard(1, new Logo());
  Game.setBoard(2, new TitleScreen("Welcome!",
    "Press fire to play ",
    playGame));
}



var playGame = function() {

  Game.setBoard(1, new Fondo());

  var board = new GameBoard();

  board.add(new creaTroncosyTurtles());
  board.add(new Home());
  board.add(new Water());
  board.add(new creaCoches());
  board.add(new PlayerFrog()); 
   
  Game.setBoard(2,board);
  
}

var winGame = function() {
  Game.setBoard(2,new TitleScreen("YOU WIN!", 
                                  "Press fire to play again",
                                  playGame));
};



var loseGame = function() {
  Game.setBoard(2,new TitleScreen("YOU LOSE!", 
                                  "Press fire to play again",
                                  playGame));
};


// Indica que se llame al método de inicialización una vez
// se haya terminado de cargar la página HTML
// y este después de realizar la inicialización llamará a
// startGame
window.addEventListener("load", function() {
  Game.initialize("game",sprites,startGame);
});
