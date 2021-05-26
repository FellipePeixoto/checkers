/* eslint-disable */
import * as PIXI from 'pixi.js';
import { GameEvents } from '../config/Defaults';
import { Board } from './components/Board';

export class Game extends PIXI.Container {
    get state () {
        const state = {
            ended: this._ended,
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

    constructor(save) {
        super();

        if (save) {
            const { ended, turn, player1Points, player2Points, board } = save;
            
            this._ended = ended === 'true' ? true : false;
            this._turn = parseInt(turn);
            this._player1Points = parseInt(player1Points);
            this._player2Points = parseInt(player2Points);

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
                        isKing: isKing === 'true' ? true : false,
                        visible: visible === 'true' ? true : false
                    } )
            }
            this._board = new Board(patchedBoard);
        } else {
            this._ended = false;
            this._turn = 0;
            this._player1Points = 0;
            this._player2Points = 0;
            this._board = new Board();
        }

        this._board.on(GameEvents.ON_CLICK_PIECE, (piece) => this._onClickPiece(piece));
        this._board.on(GameEvents.ON_CLICK_TARGET, () => this._onClickTarget());
        this._board.on(GameEvents.ON_PIECE_EATEN, () => this._onPieceEaten());
        this.addChild(this._board);
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
        if (this._player1Points <= 12 && this._player2Points <= 12) {
            this.emit(GameEvents.ON_PLAY_MADE);
        }
    }
    
    _onPieceEaten () {
        if (this._ended === true) {
            return;
        }
        if (this._turn === 0)
        {
            this._player1Points += 1; 
        } else {
            this._player2Points += 1;
        }
        if (this._player1Points === 12 || this._player2Points === 12) {
            this._ended = true;
        }
        if (this._player1Points <= 12 && this._player2Points <= 12) {
            this.emit(GameEvents.ON_PLAY_MADE);
        }
    }
}