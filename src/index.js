/* eslint-disable */
import * as PIXI from 'pixi.js';
import { Modal, ModalEvents } from './checkers/components/Modal';
import { Game } from './checkers/Game';
import { GameEvents } from './config/Defaults';

const canvasWidth = 800;
const canvasHeight = 600;

const app = new PIXI.Application(canvasWidth, canvasHeight, { backgroundColor: 0x1099bb });
document.body.appendChild(app.view);

let game;

const modal = new Modal()
app.stage.addChild(modal);

modal.pivot.y = modal.height / 2 ;

modal.x = canvasWidth / 2;
modal.y = canvasHeight / 2;

modal.on(ModalEvents.YES, () => {
  loadGameFromServer();
});

modal.on(ModalEvents.NO, () => {
  newGame();
});

function loadGameFromServer () {
  let xml;
  const xhttp = new XMLHttpRequest();
  try {
    xhttp.open("GET", 'https://localhost:44380/api/gamesave', false);
    xhttp.send();

    if (xhttp.responseText) {
      const parser = new DOMParser();
      xml = parser.parseFromString(xhttp.responseText, "text/xml");
    }
  } catch (e) {

  }

  if (xml && 
    xml.getElementsByTagName('game')[0].getElementsByTagName('ended')[0].childNodes[0].nodeValue === 'false') {
    const ended = xml.getElementsByTagName('game')[0].getElementsByTagName('ended')[0].childNodes[0].nodeValue;
    const turn = xml.getElementsByTagName('game')[0].getElementsByTagName('turn')[0].childNodes[0].nodeValue;
    const player1Points = xml.getElementsByTagName('game')[0].getElementsByTagName('player1')[0].childNodes[0].nodeValue;
    const player2Points = xml.getElementsByTagName('game')[0].getElementsByTagName('player2')[0].childNodes[0].nodeValue;

    const pieces = [];
    const board = { pieces };

    const piecesXML = xml.getElementsByTagName('pieces')[0].getElementsByTagName('piece');
    for (const piece of piecesXML) {
      const line = piece.getElementsByTagName('line')[0].childNodes[0].nodeValue;
      const column = piece.getElementsByTagName('column')[0].childNodes[0].nodeValue;
      const playerIndex = piece.getElementsByTagName('playerIndex')[0].childNodes[0].nodeValue;
      const isKing = piece.getElementsByTagName('king')[0].childNodes[0].nodeValue;
      const visible = piece.getElementsByTagName('visible')[0].childNodes[0].nodeValue;
      pieces.push({ line, column, playerIndex, isKing, visible });
    }

    game = new Game({ ended, turn, player1Points, player2Points, board });
  }

  if (!game) {
    newGame();
  }

  setupGame();
}

function newGame () {
  game = new Game();
  setupGame();
}

function setupGame () {
  app.stage.addChild(game);

  game.on(GameEvents.ON_PLAY_MADE, () => { savegame(game.state) });

  game.x = canvasWidth / 2 - game.height / 2;
  game.y = canvasHeight / 2 - game.width / 2;
}

function savegame (gameState) {
  const { ended, turn, player1Points, player2Points, board } = gameState;

  const xmlFile = document.implementation.createDocument(null, 'game');

  const nodeEnded = xmlFile.createElement('ended');
  const nodeEndedValue = xmlFile.createTextNode(ended);
  nodeEnded.appendChild(nodeEndedValue);
  xmlFile.getElementsByTagName('game')[0].appendChild(nodeEnded);

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

      const nodePlayerIndex = xmlFile.createElement('playerIndex');
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

  try {
    const xhttp = new XMLHttpRequest();
    xhttp.open("POST", "https://localhost:44380/api/gamesave");

    const converted = new XMLSerializer().serializeToString(xmlFile);

    xhttp.send(converted);
  } catch (e) {

  }

  return xmlFile;
}