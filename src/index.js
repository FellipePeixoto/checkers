/* eslint-disable */
import * as PIXI from 'pixi.js';
import { Game } from './checkers/Game';

const app = new PIXI.Application(800, 600, { backgroundColor: 0x1099bb });
document.body.appendChild(app.view);

const game = new Game();
app.stage.addChild(game);

window.addEventListener("beforeunload", function (e) { 
    savegame(game.state);
});

savegame(game.state);

function savegame (gameState) {
    const { turn, player1Points, player2Points, board } = gameState;

    const xmlFile = document.implementation.createDocument(null, 'game');

    const nodeTurn = xmlFile.createElement('turn');
    const nodeTurnValue = xmlFile.createTextNode(turn);
    nodeTurn.appendChild(nodeTurnValue);
    xmlFile.getElementsByTagName('game')[0].appendChild(nodeTurn);

    const nodePlayer1 = xmlFile.createElement('player1');
    const nodePlayer1Value = xmlFile.createTextNode(player1Points);
    nodePlayer1.appendChild(nodePlayer1Value);
    xmlFile.getElementsByTagName('game')[0].appendChild(nodePlayer1);

    const nodePlayer2 = xmlFile.createElement('player2');
    const nodePlayer2Value = xmlFile.createTextNode(player2Points);
    nodePlayer2.appendChild(nodePlayer2Value);
    xmlFile.getElementsByTagName('game')[0].appendChild(nodePlayer2);

    const nodeBoard = xmlFile.createElement('board');
    const nodePieces = xmlFile.createElement('pieces');
    nodeBoard.appendChild(nodePieces);
    xmlFile.getElementsByTagName('game')[0].appendChild(nodeBoard);
    
    for (const { line, column, playerIndex, king, visible } of board.pieces) {
        const nodePiece = xmlFile.createElement('piece');
        nodePieces.appendChild(nodePiece);

        const nodeLine = xmlFile.createElement('line');
        const nodeLineValue = xmlFile.createTextNode(line);
        nodeLine.appendChild(nodeLineValue);
        nodePiece.appendChild(nodeLine);
        
        const nodeColumn = xmlFile.createElement('column');
        const nodeColumnValue = xmlFile.createTextNode(column);
        nodeColumn.appendChild(nodeColumnValue);
        nodePiece.appendChild(nodeColumn);

        const nodePlayerIndex = xmlFile.createElement('playerindex');
        const nodePlayerIndexValue = xmlFile.createTextNode(playerIndex);
        nodePlayerIndex.appendChild(nodePlayerIndexValue);
        nodePiece.appendChild(nodePlayerIndex);
        
        const nodeKing = xmlFile.createElement('king');
        const nodeKingValue = xmlFile.createTextNode(king);
        nodeKing.appendChild(nodeKingValue);
        nodePiece.appendChild(nodeKing);

        const nodeVisible = xmlFile.createElement('visible');
        const nodeVisibleValue = xmlFile.createTextNode(visible);
        nodeVisible.appendChild(nodeVisibleValue);
        nodePiece.appendChild(nodeVisible);
    }

    console.log(xmlFile);
}
