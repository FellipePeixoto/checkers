/* eslint-disable */
import * as PIXI from 'pixi.js';
import { Events, GameEvents, ItemDimensions } from '../../config/Defaults';
import { Piece } from './Piece';

const DEFAULT_TARGET_TILE_COLOR = 0x00FF00;

export class Board extends PIXI.Container {
    constructor(board) {
        super();

        if (board) {
            const { pieces } = board;
            this._setupBoardFromSave(pieces);
        } else {
            this._setupBoard();
        }
    }

    get tiles () {
        return this._board;
    }

    checkMoveTo({ playerIndex, startCoordinate, direction, lastTileWas = undefined, enemiesEaten = [] }) {
        const targetCoordinate = 
        { 
            line: startCoordinate.line + direction.line,
            column: startCoordinate.column + direction.column
        }

        const { line, column } = targetCoordinate;

        if (this._isOutOfBounds(targetCoordinate)) {
            return [];
        }

        const piece = this._board[line][column];

        if (piece === undefined && enemiesEaten.length === 0) {
            return [ 
                {
                    coordinate: {
                        line,
                        column
                    },
                    enemiesEaten: []
                } ];
        }

        if (piece === undefined && lastTileWas === undefined) {
            return [
                {
                    coordinate: {
                        line: startCoordinate.line,
                        column: startCoordinate.column
                    },
                    enemiesEaten
                }
            ];
        }

        if (piece !== undefined  && piece.playerIndex === playerIndex) {
            return [];
        }

        if (piece !== undefined && lastTileWas !== undefined) {
            return [];
        }

        if (piece === undefined && lastTileWas !== undefined) {
            const forRight = this.checkMoveTo({ direction: { line: direction.line, column: 1 }, startCoordinate: { line, column }, playerIndex, undefined, enemiesEaten });
            const forLeft = this.checkMoveTo({ direction: { line: direction.line, column: -1 }, startCoordinate: { line, column }, playerIndex, undefined, enemiesEaten });

            return [
                {
                    coordinate: {
                        line,
                        column
                    },
                    enemiesEaten: [...enemiesEaten]
                },
                ...forRight,
                ...forLeft
            ];
        }

        if (piece !== undefined  && piece.playerIndex !== playerIndex) {
            return this.checkMoveTo({ playerIndex, startCoordinate: targetCoordinate, direction, lastTileWas: piece, enemiesEaten: [...enemiesEaten, piece] });
        }

        if (piece === undefined) {
            const moveInfo = [{
                coordinate: {
                    line,
                    column
                },
                enemiesEaten
            }];

            const forRight = this.checkMoveTo({ direction: { line: direction.line, column: 1 }, startCoordinate: { line, column }, playerIndex, enemiesEaten });
            const forLeft = this.checkMoveTo({ direction: { line: direction.line, column: -1 }, startCoordinate: { line, column }, playerIndex, enemiesEaten });
            
            return [...moveInfo, ...forRight, ...forLeft];
        }
    }

    showPossibleMoves() {
        this.hidePossibleMoves();

        const { coordinate, playerIndex, isKing } = this._currentPiece;

        const yModifier = playerIndex === 0 ? 1 : -1;
        this._moves = [];

        for (let i = -1; i < 2; i += 2) {
            this._moves.push(...this.checkMoveTo(
                { 
                    playerIndex, 
                    startCoordinate: coordinate, 
                    direction: 
                    { 
                        line: yModifier,
                        column: i
                    }
                }));

                if (isKing) {
                    this._moves.push(...this.checkMoveTo(
                        { 
                            playerIndex, 
                            startCoordinate: coordinate, 
                            direction: 
                            { 
                                line: -yModifier,
                                column: i
                            }
                        }));
                }
        }

        this._highlightMoves(this._moves);
    }

    hidePossibleMoves () {
        for (let i = 0; i < this._targetTiles.length; i++) {
            for (const targetTile of this._targetTiles[i]) {
                targetTile.visible = false;
            }
        }
    }

    updateCurrentPiece (piece) {
        this._currentPiece = piece;
    }

    outOfGame () {
        const { line, column } = this._currentTargetCoordinate;
        
        const move = this._moves.filter( move => {
            return move.coordinate.line === line &&  move.coordinate.column === column;
        });

        for (const enemyEaten of move[0].enemiesEaten) {
            this._board[enemyEaten.coordinate.line][enemyEaten.coordinate.column] = undefined;
            enemyEaten.visible = false;
            this.emit(GameEvents.ON_PIECE_EATEN);
        }
    }

    _isOutOfBounds (coordinate) {
        const { line, column } = coordinate;

        return line < 0 || line > 7 || column < 0 || column > 7;
    }

    _drawBoard () {
        this._board = new Array(8).fill(undefined);
        this._targetTiles = new Array(8);

        for (let i = 0; i < 8; i++) {
            this._board[i] = new Array(8).fill(undefined);
            this._targetTiles[i] = new Array(8);
            for (let j = 0; j < 8; j++) {
                // Linhas pares tem colunas impares coloridas
                if (i % 2 === 0) {
                    this._drawTile(i, j, j % 2 !== 0 ? 0xFFAA00 : 0xFFFFFF);
                }
                // Linhas impares tem colunas pares coloridas
                if (i % 2 !== 0) {
                    this._drawTile(i, j, j % 2 !== 0 ?  0xFFFFFF : 0xFFAA00);
                }

                const targetTile = this._drawTile(i, j, DEFAULT_TARGET_TILE_COLOR)
                this._targetTiles[i][j] = targetTile;

                targetTile.interactive = true;
                targetTile.on(Events.POINTER_DOWN, () => this._onClickTarget({ line: i, column: j }));

                targetTile.visible = false;
            }
        }
    }

    _onClickTarget (coordinate) {
        const { line, column } = coordinate;
        const { line: oldLine, column: oldColumn } = this._currentPiece.coordinate;

        this._currentTargetCoordinate = coordinate;

        this._board[oldLine][oldColumn] = undefined;
        this._currentPiece.coordinate = coordinate;
        this._board[line][column] = this._currentPiece;
        this.emit(GameEvents.ON_CLICK_TARGET);
    }

    _drawTile (line, column, color) {
        const quad = new PIXI.Graphics();
        quad.beginFill(color);
        quad.drawRect(
            0,
            0,
            ItemDimensions.DEFAULT_SIZE * 2,
            ItemDimensions.DEFAULT_SIZE * 2);
        quad.endFill();
        this.addChild(quad);

        const offsetX = quad.width / 2;
        const offsetY = quad.height / 2;

        quad.y = line * ItemDimensions.DEFAULT_SIZE + (line * ItemDimensions.DEFAULT_PADDING) - offsetY;
        quad.x = column * ItemDimensions.DEFAULT_SIZE + (column * ItemDimensions.DEFAULT_PADDING) - offsetX;

        return quad;
    }

    _setupBoardFromSave (pieces) {
        this._drawBoard();
        
        for (const { coordinate, playerIndex, visible, isKing } of pieces) {
            if (visible) {
                this._addPiece({ coordinate, playerIndex, visible, isKing });
            }
        }
    }

    _setupBoard () {
        this._drawBoard();

        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                // BOARD TOP
                if (i >= 0 && i <= 2) {
                    if (i % 2 === 0 && j % 2 !== 0) {
                        this._addPiece( {coordinate: { line: i, column: j }, playerIndex: 0} );
                    }
                    if (i % 2 !== 0 && j % 2 === 0) {
                        this._addPiece( {coordinate: { line: i, column: j }, playerIndex: 0} );
                    }
                }
                
                // BOARD BOTTOM
                if (i >= 5 && i <= 7) {
                    if (i % 2 === 0 && j % 2 !== 0) {
                        this._addPiece( {coordinate: { line: i, column: j }, playerIndex: 1} );
                    }
                    if (i % 2 !== 0 && j % 2 === 0) {
                        this._addPiece( {coordinate: { line: i, column: j }, playerIndex: 1} );
                    }
                }
            }
        }
    }

    _addPiece ({ coordinate, playerIndex, isKing }) {
        const piece = new Piece({ coordinate, playerIndex, isKing });
        this._board[coordinate.line][coordinate.column] = piece;
        this.addChild(piece);
        
        this._setupPieceEvent(piece);
    }

    _setupPieceEvent(piece) {
        piece.interactive = true;
        piece.on(Events.POINTER_DOWN, () => this._onClickPiece(piece));
    }

    _onClickPiece(piece) {
        this.emit(GameEvents.ON_CLICK_PIECE, piece);
    }

    _highlightMoves(moves) {
        for (const { coordinate } of moves) {
            this._targetTiles[coordinate.line][coordinate.column].visible = true;
        }
    }
}