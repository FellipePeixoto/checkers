/* eslint-disable */
import * as PIXI from 'pixi.js';
import { Game } from './checkers/Game';

/**
 * check other examples at https://pixijs.io/examples
 * feel free to [Ctrl+A + Del] this file to write your own
 */

const app = new PIXI.Application(800, 600, { backgroundColor: 0x1099bb });
document.body.appendChild(app.view);

const game = new Game({ turn: 1, player1Points: 0, player2Points: 0, board });
app.stage.addChild(game);
