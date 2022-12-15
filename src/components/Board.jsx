import React from 'react'
import Row from "./Row"

const Board = ({gameState, handlePlayerClick}) => {
  return (
    <div>
        <table className="board">
          <thead>
          </thead>
          <tbody>
            {gameState.board.map((row, i) => (
            <Row key={i} row={row} rowIndex ={i} gameState={gameState} handlePlayerClick={handlePlayerClick}/>
            ))}
          </tbody>
        </table>
        
        <p className="message">{gameState.message}</p>
      </div>
  )
}

export default Board