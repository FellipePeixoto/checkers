/* eslint-disable */
import * as PIXI from 'pixi.js';
import { GameEvents } from '../config/Defaults';
import { Board } from './components/Board';

export class Game extends PIXI.Container {
    constructor(save) {
        super();

        if (save) {
            const { turn, player1Points, player2Points, board } = save;
            
            this._turn = turn;
            this._player1Points = player1Points;
            this._player2Points = player2Points;

            const patchedBoard = { pieces: [] };
            for (const { line, column, playerIndex, isKing, visible } of board.pieces) {
                patchedBoard.pieces.push( 
                    { 
                        coordinate: 
                        { 
                            line: parseInt(line), 
                            column: parseInt(column) 
                        }, 
                        playerIndex: parseInt(playerIndex),
                        isKing,
                        visible 
                    } )
            }
            this._board = new Board(patchedBoard);
        } else {
            this._turn = 0;
            this._player1Points = 0;
            this._player2Points = 0;
            this._board = new Board();
        }

        this._board.on(GameEvents.ON_CLICK_PIECE, (piece) => this._onClickPiece(piece));
        this._board.on(GameEvents.ON_CLICK_TARGET, () => this._onClickTarget());
        this._board.on(GameEvents.ON_PIECE_EATEN, () => this._onPieceEaten());
        
        this._board.x = 100;
        this._board.y = 100;
        this.addChild(this._board);
    }

    get state () {
        const state = {
            turn: this._turn,
            player1Points: this._player1Points,
            player2Points: this._player2Points,
            board: { pieces: [] }
        }

        for (let i = 0; i < this._board.tiles.length; i++) {
            for (const tile of this._board.tiles[i]) {
                if (tile) {
                    const { coordinate, playerIndex, isKing, visible } = tile;
                    state.board.pieces.push({
                        line: coordinate.line,
                        column: coordinate.column,
                        playerIndex,
                        king: isKing,
                        visible
                    });
                }
            }
        }
        return state;
    }

    _onClickPiece (piece) {
        if (this._turn === piece.playerIndex) {
            this._board.updateCurrentPiece(piece);
            this._board.showPossibleMoves();
        }
    }

    _onClickTarget () {
        this._board.hidePossibleMoves();
        this._board.outOfGame();
        this._turn = this._turn === 0 ? 1 : 0; 
    }

    _onPieceEaten () {
        if (this._turn === 0)
        {
            this._player1Points += 1; 
        } else {
            this._player2Points += 1; 
        }
    }
}