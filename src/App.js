import { PlayerAI } from "./Logic";
import { Board, Welcome } from "./components";
import { useState, useEffect } from "react";

import "./App.css";

import { Header } from "./components";
function App() {
  const [config, setConfig] = useState({ timeLimit: 0, maxDepth: 6 });
  const [welcome, setWelcome] = useState(true);
  const AI = new PlayerAI(config);

  const [width, setWidth] = useState(7);
  const [height, setHeight] = useState(6);
  const [gameState, setGameState] = useState(newGameState(width, height));

  useEffect(() => {
    if (!gameState.gameOver && gameState.aiTurn && gameState.aiAction) {
      const copyState = structuredClone(gameState);
      let aiAction = AI.getAction(copyState);
      handlePlayerClick(aiAction);
    }

    if (welcome) {
      setInterval(() => {
        setWelcome(false);
      }, 7500);
    }
  }, [gameState]);

  function newGameState(width, height) {
    return {
      player1: 1,
      player2: 2,
      width: width,
      height: height,
      piece: new Array(width).fill(height - 1),
      totalPieces: 0,
      board: new Array(height).fill(0).map((x) => new Array(width).fill(0)),
      player: 1,
      dirs: [
        [1, 0],
        [0, 1],
        [1, 1],
        [1, -1],
      ],
      connect: 4,
      winInfo: [null, null, null],
      gameOver: false,
      winnigCell: [],
      aiTurn: false,
      aiAction: false,
      humanPlayfirst: true,
      message: "",
    };
  }

  const changeState = (e) => {
    // const value = parseInt(e.target.value) ? true : false;
    if (e.target.name === "humanPlayfirst") {
      if (e.target.value === "false") {
        gameState.aiTurn = true;
      }
    }
    const value = JSON.parse(e.target.value);
    setGameState((state) => ({
      ...state,
      [e.target.name]: value,
    }));
    console.log(gameState);
  };

  const changeConfig = (e) => {
    setConfig((config) => ({
      ...config,
      [e.target.name]: parseInt(e.target.value),
    }));
  };

  const initBoard = () => {
    setGameState((state) => ({
      ...state,
      piece: new Array(width).fill(height - 1),
      totalPieces: 0,
      board: new Array(height).fill(0).map((x) => new Array(width).fill(0)),
      winInfo: [null, null, null],
      gameOver: false,
      winnigCell: [],
      aiTurn: false,
      humanPlayfirst: true,
      player: 1,
      message: "",
    }));
  };

  const updateBoard = (clm) => {
    let board = gameState.board;
    let player = gameState.player;
    for (let row = height - 1; row >= 0; row--) {
      if (board[row][clm] === 0) {
        board[row][clm] = player;
        break;
      }
    }
    return board;
  };

  const togglePlayer = () => {
    return gameState.player === 1 ? 2 : 1;
  };

  const winningCell = () => {
    let connectedCells = [];
    let win = gameState.winInfo;
    for (let p = 0; p < 4; p++) {
      let x = win[0] + p * win[2][0];
      let y = win[1] + p * win[2][1];
      connectedCells.push([x, y]);
    }
    return connectedCells;
  };

  const handlePlayerClick = (columnIndex) => {
    if (!gameState.gameOver) {
      let board = updateBoard(columnIndex);
      gameState.piece[columnIndex]--;
      gameState.totalPieces++;

      let result = AI.winner(gameState);
      if (result === gameState.player1) {
        setGameState((state) => ({
          ...state,
          board: board,
          gameOver: true,
          aiTurn: !state.aiTurn,
          winnigCell: winningCell(),
          message: "Player (red) wins!",
        }));
      } else if (result === gameState.player2) {
        setGameState((state) => ({
          ...state,
          board: board,
          gameOver: true,
          aiTurn: !state.aiTurn,
          winnigCell: winningCell(),
          message: "Player (yellow) wins!",
        }));
      } else if (result === 3) {
        setGameState((state) => ({
          ...state,
          board: board,
          gameOver: true,
          aiTurn: !state.aiTurn,
          message: "Draw game.",
        }));
      } else {
        setGameState((state) => ({
          ...state,
          board: board,
          aiTurn: !state.aiTurn,
          gameOver: false,
          player: togglePlayer(),
        }));
      }
    } else {
      setGameState((state) => ({
        ...state,
        message: "Game over. Please start a new game.",
      }));
    }
  };

  return (
    <div className="App">
      {welcome && (
        <>
          <Welcome />
        </>
      )}
      {!welcome && (
        <div className="slide-in">
          <div className="config">
            <h2>Configuration</h2>

            <fieldset className="field">
              <legend>Play Aginst</legend>
              <div className="field-option">
                <input
                  type="radio"
                  name="aiAction"
                  id="human"
                  value={false}
                  checked={gameState.aiAction === false}
                  onChange={changeState}
                />
                <label htmlFor="human">Human</label>
              </div>

              <div className="field-option">
                <input
                  type="radio"
                  name="aiAction"
                  id="ai"
                  value={true}
                  checked={gameState.aiAction === true}
                  onChange={changeState}
                />
                <label htmlFor="ai">Computer</label>
              </div>
            </fieldset>
            {gameState.aiAction && (
              <>
                <h3>Choose difficulty</h3>

                <fieldset className="field">
                  <legend>Difficulty</legend>

                  <div className="field-option">
                    <input
                      type="radio"
                      name="maxDepth"
                      id="easy"
                      value="2"
                      checked={config.maxDepth === 2}
                      onChange={changeConfig}
                    />
                    <label htmlFor="easy">Easy (Your winning chance 80%)</label>
                  </div>

                  <div className="field-option">
                    <input
                      type="radio"
                      name="maxDepth"
                      id="medium"
                      value="3"
                      checked={config.maxDepth === 3}
                      onChange={changeConfig}
                    />
                    <label htmlFor="medium">
                      Medium (Your winning Chance 40%)
                    </label>
                  </div>

                  <div className="field-option">
                    <input
                      type="radio"
                      name="maxDepth"
                      id="hard"
                      value="6"
                      checked={config.maxDepth === 6}
                      onChange={changeConfig}
                    />
                    <label htmlFor="hard">Hard (Your winning Chance 1%)</label>
                  </div>
                </fieldset>
                <h3>Choose Your Play order</h3>

                <fieldset className="field">
                  <legend>Play order</legend>
                  <div className="field-option">
                    <input
                      type="radio"
                      name="humanPlayfirst"
                      id="first"
                      value={true}
                      checked={gameState.humanPlayfirst === true}
                      onChange={changeState}
                    />
                    <label htmlFor="first">Human First</label>
                  </div>

                  <div className="field-option">
                    <input
                      type="radio"
                      name="humanPlayfirst"
                      id="second"
                      value={false}
                      checked={gameState.humanPlayfirst === false}
                      onChange={changeState}
                    />
                    <label htmlFor="second">Computer first</label>
                  </div>
                </fieldset>
                <div className="config-p">
                  <p>You are:</p>
                  <div
                    className={`config-circle ${
                      gameState.humanPlayfirst ? "red-sm" : "yellow-sm"
                    }`}
                  ></div>
                </div>

                <div className="config-p">
                  <p>Computer: </p>
                  <div
                    className={`config-circle ${
                      !gameState.humanPlayfirst ? "red-sm" : "yellow-sm"
                    }`}
                  ></div>
                </div>
              </>
            )}
          </div>

          <div className="Board">
            <Header />
            <div
              className="button"
              onClick={() => {
                initBoard();
              }}
            >
              New Game
            </div>
            <Board
              gameState={gameState}
              handlePlayerClick={handlePlayerClick}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
