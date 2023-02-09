
/* state variables */
const PLAYER_1 = "first";
const PLAYER_2 = "second";
const ONE_PLAYER = "1player";
const TWO_PLAYER = "2players";
let game;
let gameType;

/* cached element reference */
let boardEL = document.getElementById("gameboard");
let squareEl = document.querySelectorAll(".square");
let startBtn = document.getElementById("start-game-btn");
let winningMsg = document.getElementById("winning-message");
startBtn.style.visibility = "hidden";
boardEL.style.visibility = "hidden";

class Square {
  constructor(domSquareElement, index) {
    this.domSquareElement = domSquareElement;
    //value represents the piece it holds
    //if piece is 1 or -1
    //null = no piece, matches piece value if occupied
    this.value = null;
    this.index = index;
  }
  static indexMatch = {
    firstRow: [],
    lastRow: [],
    firstRowCorner: [],
    lastRowCorner: [],
    edgesDiagonal: [],
    edgesAntiDiagonal: [],
    allDiagonal: []
  }
  renderNewBoard() {
    this.fillMoveableAreas();
    // this.blockOutsideClick();
  }
  renderMovableSquareBg() {
    this.domSquareElement.classList.add("moveable-square");
    this.domSquareElement.classList.add("pushUpSquares");
  }
  fillMoveableAreas() {
    let moveableSquares = Square.indexMatch.allDiagonal.concat(
      Square.indexMatch.firstRowCorner, 
      Square.indexMatch.edgesDiagonal,
      Square.indexMatch.edgesAntiDiagonal,
      Square.indexMatch.lastRowCorner, 
      );
    moveableSquares.sort((a, b) => a - b);
    this.moveableSquares = moveableSquares;
    Square.indexMatch.moveableSquares = moveableSquares;
    boardEL.style.display = "grid";
    if (moveableSquares.includes(this.index)) {
      this.renderMovableSquareBg();
    }
  }
  renderStartingPieces(piece) {
    if (piece.startingIndex === this.index) {
      this.domSquareElement.append(piece.divElem);
      this.renderValue(piece);
    }
  }
  renderSuggestionMoves(currentPlayerTurn) {
    this.domSquareElement.addEventListener("click", (e) => {
      if (
        !this.moveableSquares.includes(this.index) 
        || this.value === null
        || this.value !== currentPlayerTurn.playerValue
        ) return;
      console.log(currentPlayerTurn);
    })
  }
  renderValue(piece) {
    this.value = piece.value;
  }
  renderClearSquare() {
    this.value = null;
    this.domSquareElement.innerHTML = "";
  }
}//end of Square class

class Piece {
  isKing = false;
  constructor(divElem, player) {
    this.divElem = divElem;
    this.player = player;
    this.currentIndexVal = null;
    this.style = {
      "Blueberry": {
        className: 'blueberry-piece',
        image: 'https://cdn-icons-png.flaticon.com/512/1791/1791354.png',
        imgIconClassName: "blueberry-icon",
      },
      "Lemon": {
        className: "lemon-piece",
        image: 'https://cdn-icons-png.flaticon.com/512/2732/2732012.png',
        imgIconClassName: "lemon-icon",
      },
      shape: 'checker-piece',
    }
  }
  setStyle() {
    this.divElem.classList.add(this.style[this.player.playerName].className);
    this.divElem.classList.add(this.style.shape);
    let imgDivEl = document.createElement("img");
    imgDivEl.src = this.style[this.player.playerName].image;
    imgDivEl.classList.add("piece-icon");
    imgDivEl.classList.add(this.style[this.player.playerName].imgIconClassName);
    this.divElem.append(imgDivEl);
  }
  setToKing() {
    this.isKing = true;
  }
  //might not be necessary if player makeMove()method "removes" other player's piece
  renderCaptured() {
    this.value = null;
  }
  setValue() {
    //if captured, set value to "null"
    this.value = this.player.playerValue;
  }
  updateIndexValue(newValue) {
    this.startingIndex = newValue;
  }
}

class Player {
  constructor(playerName) {
    this.pieces = [];
    this.playerName = playerName;
    this.turn = false;
    this.indexMatch = Square.indexMatch;
    this.setCreatePieces();
  }
  updateTotalPieces() {
    this.totalPiecesLeft = this.pieces.length;
  }
  setPlayerType(value) {
    this.playerType = value;
    this.setPlayerValue();
  }
  setPlayerValue() {
    this.playerType === "first" ? this.playerValue = -1 : this.playerValue = 1;
  }
  setCreatePieces() {
    let i = 0;
    while (i < 12) {
      i++;
      let piece = document.createElement("div");
      this.pieces.push(piece);
    }
    this.pieces = this.pieces.map((el) => new Piece(el, this));
    this.updateTotalPieces();
  }
  getPiece() {
    console.log(this.pieces);
  }
  renderStartingPiecesIndexVal() {
    this.pieceStartingIndexVal = this.getStartingIndice(this.playerValue);
    for (let i = 0; i < this.pieceStartingIndexVal.length; i++) {
      //adds the property startingIndex to each pieces, setting their value to the startingindexval
      this.pieces[i].startingIndex = this.pieceStartingIndexVal[i];
    }
  }
  getStartingIndice(val) {
    return val === -1 
      ? this.indexMatch.moveableSquares.slice(this.indexMatch.moveableSquares.indexOf(40), this.indexMatch.moveableSquares.length) 
      : this.indexMatch.moveableSquares.slice(0, this.indexMatch.moveableSquares.indexOf(23) + 1);
  }
  setSquareClassSearch(checkersObj) {
    this.squareClasses = checkersObj.squares.filter((square, idx) => this.indexMatch.moveableSquares.includes(idx));
  }

  checkAntiDiagonalDirection(playerTurn, indexVal) {
    return Math.abs(playerTurn * (-indexVal) + (-7));
  }
  checkDiagonalDirection(playerTurn, indexVal) {
    return Math.abs(playerTurn * (-indexVal) + (-9));
  }
  checkMovesAvailable(indexVal, checkers) {
    //-1
    if (checkers.currentPlayerTurn.playerValue === -1) {
      //last row check
      //antidiagonal check
      if (this.indexMatch.edgesAntiDiagonal.includes(indexVal)) {
        console.log("in antidiagonal");
        let antiDiagonal = this.checkDiagonalDirection(checkers.currentPlayerTurn.playerValue, indexVal);
        return [antiDiagonal];
      }
      //diagonal check
      else if (this.indexMatch.edgesDiagonal.includes(indexVal)) {
        console.log("in diagonal");
        let diagonal = this.checkAntiDiagonalDirection(checkers.currentPlayerTurn.playerValue, indexVal);
        return [diagonal];
      }
      //allDiagonal check
      else if (this.indexMatch.allDiagonal.includes(indexVal)) {
        console.log("in all Diagonal");
      
        let antiDiagonal = this.checkAntiDiagonalDirection(checkers.currentPlayerTurn.playerValue, indexVal);
        let diagonal = this.checkDiagonalDirection(checkers.currentPlayerTurn.playerValue, indexVal);
        return [diagonal, antiDiagonal];
      }
    }
    //1
    if (checkers.currentPlayerTurn.playerValue === 1) {
      //last row check
      if (this.indexMatch.lastRow.includes(indexVal)) {
        if (this.indexMatch.lastRowCorner.includes(indexVal)) {
          let possibleIndexSpace = this.checkAntiDiagonalDirection(-checkers.currentPlayerTurn.playerValue, indexVal);
          return [possibleIndexSpace];
        }
        let antiDiagonal = this.checkAntiDiagonalDirection(-checkers.currentPlayerTurn.playerValue, indexVal);
        let diagonal = this.checkDiagonalDirection(-checkers.currentPlayerTurn.playerValue, indexVal);
          return [antiDiagonal, diagonal];
      }
      //antidiagonal check
      if (this.indexMatch.edgesAntiDiagonal.includes(indexVal)) {
        let antiDiagonal = this.checkAntiDiagonalDirection(checkers.currentPlayerTurn.playerValue, indexVal);
        return [antiDiagonal];
      }
      //diagonal check
      if (this.indexMatch.edgesDiagonal.includes(indexVal)) {
        let diagonal = this.checkDiagonalDirection(checkers.currentPlayerTurn.playerValue, indexVal);
        return [diagonal];
      }
      //allDiagonal check
      if (this.indexMatch.allDiagonal.includes(indexVal)) {
        let antiDiagonal = this.checkAntiDiagonalDirection(checkers.currentPlayerTurn.playerValue, indexVal);
        let diagonal = this.checkDiagonalDirection(checkers.currentPlayerTurn.playerValue, indexVal);
        return [diagonal, antiDiagonal];
      }
    }
  }
  checkIfCorner(checkers, match, sqIdx) {
    if (match.lastRowCorner.includes(sqIdx) ||
    match.firstRowCorner.includes(sqIdx)) {
      let val =  checkers.currentPlayerTurn.playerValue;
      return this.checkAntiDiagonalDirection(val, sqIdx);
    }
  }
  lookUpAllMoves(squareClassIndex, checkers) {
    let possibleMovesIdx = [];    
    if (this.indexMatch.lastRowCorner.includes(squareClassIndex) ||
    this.indexMatch.firstRowCorner.includes(squareClassIndex)) {
      let possibleIdxSpace = this.checkIfCorner(checkers, this.indexMatch, squareClassIndex);
      possibleMovesIdx.push([possibleIdxSpace]);
    }
    let morePossibleMoves = this.checkMovesAvailable(squareClassIndex, checkers);
    possibleMovesIdx.push(morePossibleMoves);
    return possibleMovesIdx.filter((number) => number !== undefined)[0];
  }

  // checkIfSpaceAvailable()
  makeMove(checkers) {
    checkers.currentPlayerTurn.squareClasses.forEach((squareClass) => { 
      squareClass.domSquareElement.addEventListener("click", (e) => {

        if (squareClass.value !== checkers.currentPlayerTurn.playerValue) return;
        
        let currentPieceClicked = checkers.currentPlayerTurn.pieces.filter((piece) => piece.startingIndex === squareClass.index)[0];
        
        let pieceIdx = currentPieceClicked.startingIndex;
        let possibleMovesIdx = this.lookUpAllMoves(squareClass.index, checkers);


        //suggestion moves on null squares
        checkers.currentPlayerTurn.squareClasses.forEach((sC) => {
          if (possibleMovesIdx.includes(sC.index) && sC.value === null) {

            sC.domSquareElement.addEventListener("click", (e) => {
              console.log("clicked");
              checkers.currentPlayerTurn.pieces.forEach(piece => {
                if (piece.startingIndex === squareClass.index) {
                  sC.domSquareElement.append(piece.divElem);
                  squareClass.value = null;
                  sC.value = currentPieceClicked.value;
                  piece.startingIndex = sC.index;
                }
              })
              
              //end turn after player makes a move
              checkers.renderTurn(checkers.currentPlayerTurn, checkers.otherPlayerTurn);
              
            })
          }
        }
        )

      

        //turn ends, eventually set end turn condition
        
      })
    })
  }
}

class Checkers {
  constructor(domElement, players, messageElement) {
    this.domElement = domElement;
    this.players = players;
    this.messageElement = messageElement;
    this.squareEls = [...squareEl];
    this.currentPlayerTurn = null;
    this.winner = null;
  }
  //gameplay
  play() {
    this.renderFirstMove();
  }
  renderFirstMove() {
    this.renderPlayerStartingPieces(this.players);
    this.setFirstTurn(this.players);
    this.renderMoves();
  }
    //render regular moves
  renderMoves() {
    this.currentPlayerTurn.makeMove(this);
  }
  renderTurn(currentPlayerTurn, otherPlayer) {
    let winner = this.checkForWinner(currentPlayerTurn, otherPlayer);
    if (winner === null) {
      this.switchTurn(currentPlayerTurn, otherPlayer);
    } else {
      this.winner = winner;
      this.endGame(winner);
    }
  }
  //checkForWinners
  checkForWinner(currentPlayerTurn, otherPlayer) {
    //check if current player just ate all the other players piece
    return otherPlayer.pieces.length === 0 ? currentPlayerTurn : null
  }
  endGame(winningPlayer) {
    winningMsg.innerText = `${winningPlayer.playerName} wins!`;
    winningMsg.style.visibility = "visible";
    this.clearBoard();
  }
  clearBoard() {
    this.currentPlayerTurn = null;
    // this.squareEls.forEach((square) => square.innerHTML = "");
  }
  //switch turn
  switchTurn(currentPlayerTurn, otherPlayer) {
    currentPlayerTurn.turn = false;
    otherPlayer.turn = true;
    this.currentPlayerTurn = otherPlayer;
    this.otherPlayerTurn = currentPlayerTurn;
  }
  setFirstTurn(players) {
    players.forEach(player => {
      if (player.playerType === "first") {
        this.currentPlayerTurn = player;
        this.currentPlayerTurn.turn = true;
      } else {
        this.otherPlayerTurn = player;
        this.otherPlayerTurn.turn = false;
      }
    })
  }
  setBoard() {
    this.squares = this.squareEls.map((square, indx) => new Square(square, indx));
    this.setMovableSquares();
    this.players.forEach((player) => player.setSquareClassSearch(this));
  }
  setMovableSquares() {
    let allSquares = [];
    this.squares.forEach((square, idx) => allSquares.push(idx));
    let firstRow = allSquares.slice(0, 8);
    let lastRow = allSquares.slice(allSquares.length - 8, allSquares.length);
    firstRow = firstRow.filter((num) => [1,3,5,7].includes(num));
    lastRow = lastRow.filter((num) => [56,58,60,62].includes(num));
    Square.indexMatch.firstRow.push(firstRow);
    Square.indexMatch.lastRow.push(lastRow);
   
    let rowCount = 1;
    let countVals = 0;
    
    allSquares.forEach((indexVal, idx) => {
      countVals += 1;
      if (countVals >= 9) {
        rowCount += 1;
        countVals = 1;
      }
      //row is odd
      if (rowCount % 2 !== 0) {
        if (indexVal % 2 !== 0) {
          if (countVals === 8) {
            if (firstRow.includes(indexVal)) {
              Square.indexMatch.firstRowCorner.push(indexVal);
            } else {
              Square.indexMatch.edgesAntiDiagonal.push(indexVal);
            }
          } else {
            Square.indexMatch.allDiagonal.push(indexVal);
          }
        }
        //row is even
      } else {
        if (indexVal % 2 === 0) {
          if (countVals === 1) {
            if (lastRow.includes(indexVal)) {
              Square.indexMatch.lastRowCorner.push(indexVal);
            } else {
              Square.indexMatch.edgesDiagonal.push(indexVal);
            }
          } else {
            Square.indexMatch.allDiagonal.push(indexVal);
          }
        }
      }
    })
    this.renderNewBoard();
  }
  renderNewBoard() {
    this.squares.forEach(square => square.renderNewBoard());
  }
  checkPlayers() {
    return this.players;
  }
  renderPlayerStartingPieces = ((players) => {
    this.squares.forEach((square) => {
      players.forEach((player) => {
        player.pieces.forEach((piece) => {
          square.renderStartingPieces(piece);
        })
      })
      
    } )
  }) 
}//end of Checkers Class

let blueberry = new Player("Blueberry");
let lemon = new Player("Lemon");
init();

function init() {
  boardEL.style.display = "none";
  renderPlayers(blueberry, lemon);
  setGame(blueberry, lemon);
  startGame();
}
function setGame(n1, n2) {
  game = new Checkers(
    boardEL, 
    [n1, n2],
    winningMsg
    );
  game.setBoard();
}
function startGame() {
  startBtn.addEventListener("click", () => {
    let popUpRollDiceEl = document.getElementById("popup-roll-dice");
    popUpRollDiceEl.style.visibility = "hidden";
    startBtn.style.visibility = "hidden";
    boardEL.style.visibility = "visible";
    game.play();
  })
}
function renderPlayers(n1, n2) {
  let rollDiceBtn = document.getElementById("roll-dice-btn");
  rollDiceBtn.addEventListener("click", () => {
    setPlayers(n1,n2)
    rollDiceBtn.style.visibility = "hidden";
  });
}
function setPlayers(nameOne,nameTwo) {
  let nameOneChoice = rollDice(); 
  let nameTwoChoice = rollDice();

  nameOneChoice = nameOneChoice === nameTwoChoice ? rollDice() : nameOneChoice;
  nameTwoChoice = nameOneChoice === nameTwoChoice ? rollDice() : nameTwoChoice;

  displayRoll();
  setWhoGoesFirst();
  displayWhoGoesFirst();
  
  function rollDice() {
    return Math.floor(Math.random() * 6) + 1;
  }
  function displayRoll() {
    let nameOne = document.getElementById("roll-indicator-n1");
    let nameTwo = document.getElementById("roll-indicator-n2");
    nameOne.innerText = nameOneChoice;
    nameTwo.innerText = nameTwoChoice;
  }
  function setWhoGoesFirst() {
    if (nameOneChoice > nameTwoChoice) {
      nameOne.setPlayerType(PLAYER_1);
      nameOne.turn = true;
      nameTwo.setPlayerType(PLAYER_2);
      renderPlayerPieces(nameOne);
      renderPlayerPieces(nameTwo);
    } else {
      nameTwo.turn = true;
      nameTwo.setPlayerType(PLAYER_1);
      nameOne.setPlayerType(PLAYER_2); 
      renderPlayerPieces(nameOne);
      renderPlayerPieces(nameTwo);
    }  
  }
  function renderPlayerPieces(player) {
    player.pieces.forEach(piece => {
      piece.setValue();
      piece.setStyle();
    })

    player.renderStartingPiecesIndexVal();
  } 
  function displayWhoGoesFirst() {
    let h3MsgEl = document.getElementById('first-player-indicator');
    startBtn.style.visibility = "visible";
    nameOne.playerType === PLAYER_1 ? h3MsgEl.innerText = `${nameOne.playerName} goes first!` : h3MsgEl.innerText = `${nameTwo.playerName} goes first!`;
  }
}
