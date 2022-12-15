// Row component

import Cell from "./Cell" 
const Row = ({ row,rowIndex ,gameState, handlePlayerClick}) => {
    return (
      <tr>
        {row.map((cell, i) => 
        <Cell key={i} value={cell} gameState={gameState} columnIndex={i} rowIndex={rowIndex} handlePlayerClick={handlePlayerClick} />
        )}
      </tr>
    );
  };

  export default Row;