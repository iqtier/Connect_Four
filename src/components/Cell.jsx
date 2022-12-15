import React from 'react'
const Cell = ({columnIndex, gameState,rowIndex,value,handlePlayerClick}) => {

  const isBlink=()=>{
    if (gameState.gameOver){
      for(let i = 0; i < gameState.winnigCell.length; i++){
        if(gameState.winnigCell[i][0] === rowIndex){
          if(gameState.winnigCell[i][1] === columnIndex){
            return true;
            
          }
        }
      }
      return false;
    }
  }
  
  
  let color = 'white';
    if (value === 1) {
      color = 'red';
    } else if (value === 2) {
      color = 'green';
    }

    return (
      <td>
        <div className="cell" onClick={() => {handlePlayerClick(columnIndex)}}>
          <div className={`${color} ${isBlink()?`${color}-blink`:""}`}></div>
        </div>
      </td>
    );
  };

export default Cell;
  