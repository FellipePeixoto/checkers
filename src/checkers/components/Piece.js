/* eslint-disable */
import * as PIXI from 'pixi.js';
import { Events, ItemDimensions } from '../../config/Defaults';

const player1Color = 0x000000;
const player2Color = 0xFF0000;

export class Piece extends PIXI.Container {
    constructor({ coordinate, playerIndex, isKing = false }) {
        super();
        this._coordinate = coordinate;
        this._playerIndex = playerIndex;
        this._isKing = isKing;

        this._circle = new PIXI.Graphics();
        this._circle.beginFill(playerIndex === 0 ? player1Color : player2Color);
        this._circle.drawCircle(0, 0, ItemDimensions.DEFAULT_SIZE);
        this._circle.endFill();
        this.addChild(this._circle);

        this._updatePosition();
    }

    get playerIndex () {
        return this._playerIndex;
    }

    get isKing() {
        return this._isKing;
    }

    get coordinate () {
        return this._coordinate;
    }

    set coordinate (coordinate) {
        this._coordinate = coordinate;

        if (this._playerIndex === 0 && coordinate.line === 7) {
            this._makeMeAQueen();
            this._isKing = true;
        }
        
        if (this._playerIndex === 1 && coordinate.line === 0) {
            this._makeMeAQueen();
            this._isKing = true;
        }

        this._updatePosition();
    }

    _updatePosition() {
        const { line, column } = this._coordinate;
        this.y = line * ItemDimensions.DEFAULT_SIZE + (line * ItemDimensions.DEFAULT_PADDING);
        this.x = column * ItemDimensions.DEFAULT_SIZE + (column * ItemDimensions.DEFAULT_PADDING);
    }

    _makeMeAQueen() {
        if (this._isKing) {
            return;
        }

        const crown = new PIXI.Graphics();
        crown.beginFill(0xFFFFFF);
        crown.drawCircle(0, 0, ItemDimensions.DEFAULT_CROWN_SIZE);
        crown.endFill();
        this.addChild(crown);
    }
}