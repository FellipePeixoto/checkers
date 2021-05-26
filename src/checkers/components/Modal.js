/* eslint-disable */
import * as PIXI from 'pixi.js';
import { Events } from '../../config/Defaults';

export class Modal extends PIXI.Container {
    constructor() {
        super();
        this._text = new PIXI.Text('Carregar o último jogo?',
        {
            fontFamily : 'Arial', 
            fontSize: 35, 
            fill : 0x000000, 
            align : 'center'
        });
        this._text.anchor = { x: 0.5, y: 0.5 };
        this.addChild(this._text);
        
        this._yes = new PIXI.Text('Y',
        {
            fontFamily : 'Arial', 
            fontSize: 28, 
            fill : 0x00FF00,
            align : 'center'
        });
        this._yes.anchor = { x: 0.5, y: 0.5 };
        this._yes.x = -40;
        this._yes.y = 50;
        this.addChild(this._yes);
        
        this._no = new PIXI.Text('N',
        {
            fontFamily : 'Arial', 
            fontSize: 28, 
            fill : 0xFF0000, 
            align : 'center'
        });
        this._no.anchor = { x: 0.5, y: 0.5 };
        this._no.x = 40;
        this._no.y = 50;
        this.addChild(this._no);

        this._msg = new PIXI.Text('Se o último jogo acabou um novo será carregado!',
        {
            fontFamily : 'Arial', 
            fontSize: 20, 
            fill : 0x000000, 
            align : 'center'
        });
        this._msg.anchor = { x: 0.5, y: 0.5 };
        this._msg.x = 0;
        this._msg.y = 100;
        this.addChild(this._msg);

        this._yes.interactive = true;
        this._no.interactive = true;
        this._yes.on(Events.POINTER_DOWN, () => { this._onClickModalYes() });
        this._no.on(Events.POINTER_DOWN, () => { this._onClickModalNo() });
    }

    _onClickModalYes() {
        this.emit(ModalEvents.YES);
        this.visible = false;
    }
    
    _onClickModalNo() {
        this.emit(ModalEvents.NO);
        this.visible = false;
    }
}

export const ModalEvents = {
    YES: 'yes',
    NO: 'no'
};