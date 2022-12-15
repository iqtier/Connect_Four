class PlayerAI {
  constructor(config) {
    this.config = config;
    this.searchStartTime = 0;

    this.bestAction = null;
    this.currentBestAction = null;
    this.currentMaxDepth = null;
    this.maxPlayer = null;
  }

  winner(state) {
    // For each winning direction possible
    for (let d = 0; d < state.dirs.length; d++) {
      // Check to see if there's a win in that direction from every place on the board
      for (let x = 0; x < state.height; x++) {
        for (let y = 0; y < state.width; y++) {
          if (this.checkWin(x, y, state.dirs[d], state)) {
            state.winInfo[0] = x;
            state.winInfo[1] = y;
            state.winInfo[2] = state.dirs[d];
            return state.board[x][y];
          }
        }
      }
    }

    if (state.totalPieces === state.width * state.height) {
      return 3;
    }
    // Otherwise there is no winner
    return 0;
  }

  isValid(state, x, y) {
    return x >= 0 && y >= 0 && x < state.height && y < state.width;
  }

  checkWin(x, y, dir, state) {
    let p = state.board[x][y];
    if (p === 0) {
      return;
    }
    let cx = x,
      cy = y;
    for (let c = 0; c < 3; c++) {
      cx += dir[0];
      cy += dir[1];
      if (!this.isValid(state, cx, cy)) {
        return false;
      }
      if (state.board[cx][cy] !== p) {
        return false;
      }
    }
    return true;
  }

  doAction(state, action) {
    state.board[state.piece[action]][action] = state.player;
    state.piece[action]--;
    state.player = state.player === 1 ? 2 : 1;
    state.totalPieces++;
  }

  undoAction(state, action) {
    if (state.piece[action] === state.height) {
      console.log("WARNING: Trying to undo illegal action ", action);
      return;
    }

    state.piece[action]++;
    state.board[state.piece[action]][action] = 0;
    state.player = state.player === 1 ? 2 : 1;
    state.totalPieces--;
  }

  // Checks to see if an action is legal or not
  // An action is an integer representing the column to place the piece in
  // An action is legal if that column is not full
  isLegalAction(state, action) {
    return action >= 0 && action < state.width && state.piece[action] >= 0;
  }

  // Returns an array of legal actions
  // Checks each column to see if a piece can be put there and adds it to the array
  getLegalActions(state) {
    let legal = [];
    for (let i = 0; i < state.width; i++) {
      if (this.isLegalAction(state, i)) {
        legal.push(i);
      }
    }
    return legal;
  }
  // Function which is called by the GUI to get the action
  getAction(state) {
    //we check if the center position of the bottom row to put our piece
    let center = state.board[state.height - 1][Math.floor(state.width / 2)];

    if (center === 0) {
      return Math.floor(state.width / 2);
    }
    let action = this.IDAlphaBeta(state);

    return action;
  }

  //Function which will tell us how is the game looking for us
  state_evaluation(state, player) {
    let score = 0; // the actual evaluation of our state
    let row = 0,
      col = 0;

    // we loop through the whole board
    for (row = state.height - 1; row > 0; row--) {
      for (col = 0; col < state.width; col++) {
        let count = 0;

        //vertical

        let places = [];
        for (
          count = 0;
          count <= state.height - 3 && row - count >= 0;
          count++
        ) {
          // we create arrays of 4 consecutive positions and store them in places
          places.push(state.board[row - count][col]);
        }
        score += this.evaluate_places(places, player); // we evaluate each array of 4 we've just created

        //horizontal;

        places = [];
        for (
          count = 0;
          count <= state.width - 3 && col + count < state.width;
          count++
        ) {
          places.push(state.board[row][col + count]);
        }
        score += this.evaluate_places(places, player);

        // right diagonal

        places = [];
        for (
          count = 0;
          count < 4 && row - count >= 0 && col + count < state.width;
          count++
        ) {
          places.push(state.board[row - count][col + count]);
        }
        score += this.evaluate_places(places, player);

        // left diagonal

        places = [];
        for (
          count = 0;
          count < 4 &&
          row - count < state.height &&
          row - count >= 0 &&
          col - count >= 0;
          count++
        ) {
          places.push(state.board[row - count][col - count]);
        }
        score += this.evaluate_places(places, player);
      }
    }
    return score;
  }

  // function used to evaluate each 4 consecutive places in our board in a given direction
  evaluate_places(places, player) {
    let score = 0;

    if (places.length !== 4 && places.length !== 5) {
      return 0;
    }

    let null_count = 0; // number of empty positions
    let player_count = 0; // number of pieces of our player
    let opponent_count = 0; // number of pieces of the other player

    //which player does each piece belong to?
    for (let i = 0; i < places.length; i++) {
      if (places[i] === 0) {
        null_count++;
      } else if (places[i] === player) {
        player_count++;
      } else {
        opponent_count++;
      }
    }

    //what's good and bad?

    //the opponent's about to win
    if (opponent_count === 3 && null_count === 1) {
      score -= 10000;
    }
    //halfway there
    else if (opponent_count === 2 && null_count === 2) {
      score -= 5000;
    }
    //we are about to win
    if (player_count === 3 && null_count === 1) {
      score += 5000;
    }
    //halfway there
    else if (player_count === 2 && null_count === 2) {
      score += 500;
    }

    return score;
  }

  //we get the score for the current state of the game
  eval(state, player) {
    //are we in a terminal state? if so, is there a winner?
    if (this.is_terminal(state)) {
      if (this.winner(state) === player) {
        return 1000000000000;
      } else {
        return -1000000000000;
      }
    } else {
      return this.state_evaluation(state, player);
    }
  }

  //this function sets the best action to make at our given state
  IDAlphaBeta(state) {
    // here is the syntax to record the time in javascript

    this.searchStartTime = performance.now();
    this.bestAction = null;
    this.maxPlayer = state.player;

    //no max depth
    if (this.config.maxDepth === 0) {
      this.config.maxDepth = Number.POSITIVE_INFINITY;
    }

    //no time limit
    if (this.config.timeLimit === 0) {
      this.config.timeLimit = Number.POSITIVE_INFINITY;
    }

    //we loop through each possible depth
    for (let d = 1; d <= this.config.maxDepth; d++) {
      this.currentMaxDepth = d;
      // this.AlphaBeta(state, Number.NEGATIVE_INFINITY,Number.POSITIVE_INFINITY,0, true );
      // this.bestAction = this.currentBestAction;;
      //we try and execute alpha beta recursively, until a timeout or until we reach current max depth
      try {
        this.AlphaBeta(
          state,
          Number.NEGATIVE_INFINITY,
          Number.POSITIVE_INFINITY,
          0,
          true
        );
        this.bestAction = this.currentBestAction;
      } catch (error) {
        break;
      }
    }
    // return the best action found
    return this.bestAction;
  }

  // this function tells us if we would have a winner in the current state
  is_terminal(state) {
    return (
      this.winner(state) === this.maxPlayer ||
      this.winner(state) === (this.maxPlayer === 1 ? 2 : 1)
    );
  }

  // Minimax algorithm with alpha beta pruning
  AlphaBeta(state, alpha, beta, depth, max) {
    var timeElapsed = performance.now() - this.searchStartTime; // how much time have we spent?
    let is_terminal = this.is_terminal(state); //are we in a terminal state?
    let actions = this.getLegalActions(state); // we get the legal actions

    // are we in a terminal state? have we reached maxDepth? are there any possible legal actions from here on?
    if (is_terminal || depth >= this.currentMaxDepth || actions.length === 0) {
      return this.eval(state, this.maxPlayer); //if any of these cases we evaluate the state
    }

    if (timeElapsed > this.config.timeLimit) {
      throw "Maximum time limit reached";
    } //time limit exception

    if (max) {
      //maximizing player

      let value = Number.NEGATIVE_INFINITY;

      for (let i = 0; i < actions.length; i++) {
        //for each child
        let current_action = actions[i];
        this.doAction(state, current_action); //we perform the action
        let new_value = this.AlphaBeta(state, alpha, beta, depth + 1, !max); //recursive call to alpha beta for the minimizing player
        this.undoAction(state, current_action); //we then undo the action so we can continue the search (if we don't do so, we won't be in the original state since the actions are recorded)

        if (new_value > value) {
          //have we reached a new max?
          value = new_value;
        }

        if (new_value >= beta) {
          return value;
        }

        if (new_value > alpha) {
          //is it a greater lower bound?
          alpha = new_value; //if so, we update it
          if (depth === 0) {
            this.currentBestAction = current_action;
          } //we can update the best action as well in the root node
        }
      }

      return value;
    } else {
      //minimizing player

      let value = Number.POSITIVE_INFINITY;

      for (let i = 0; i < actions.length; i++) {
        //for each child
        let current_action = actions[i];
        this.doAction(state, current_action); //we perform the action
        let new_value = this.AlphaBeta(state, alpha, beta, depth + 1, !max); //recursive call to alpha beta in the new state for the maximizing player
        this.undoAction(state, current_action); //we then undo the action to be in the original state again

        if (new_value < value) {
          // have we reached a new min?
          value = new_value;
        }

        if (new_value <= alpha) {
          return value;
        }

        if (new_value < beta) {
          beta = new_value;
        } //do we have a lower upper bound? if so, we update it
      }
      return value;
    }
  }
}

export default PlayerAI;
