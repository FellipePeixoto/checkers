/* eslint-disable */
import * as PIXI from 'pixi.js';
import { Game } from './checkers/Game';
import { GameEvents } from './config/Defaults';

const canvasWidth = 800;
const canvasHeight = 600;

const app = new PIXI.Application(canvasWidth, canvasHeight, { backgroundColor: 0x1099bb });
document.body.appendChild(app.view);

let game;

loadAgame();

function loadAgame () {
  // TODO: LOAD XML FROM COMPUTER
  let xml;
  if (xml) {
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

    game = new Game({ turn, player1Points, player2Points, board });
  } else {
    game = new Game();
  }
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

    return xmlFile;
}

const loadGameButton = document.createElement('button');
const loadGameButtonValue = document.createTextNode('CARREGAR JOGO');
loadGameButton.appendChild(loadGameButtonValue);
document.body.appendChild(loadGameButton);

loadGameButton.addEventListener('click', () => {
  const options = {
    types: [
      {
        description: 'File',
        accept: {
          'application/xml': ['.xml']
        }
      },
    ],
    excludeAcceptAllOption: true,
    multiple: false
  };

  window.showOpenFilePicker(options).all( bosta => { console.log(bosta) });
});

const saveGameButton = document.createElement('button');
saveGameButton.appendChild(document.createTextNode('SAVE GAME'));
document.body.appendChild(saveGameButton);

saveGameButton.addEventListener('click', async () => {
  const options = {
    types: [
      {
        description: 'File',
        accept: {
          'application/xml': ['.xml']
        }
      },
    ],
    excludeAcceptAllOption: true,
    multiple: false
  };

  const fileHandle = await window.showSaveFilePicker(options);
  writeFile(fileHandle, savegame(game.state));
});

async function writeFile(fileHandle, contents) {
  const cont = new XMLSerializer().serializeToString(contents);
  const writable = await fileHandle.createWritable();
  await writable.write(cont);
  await writable.close();
}

async function readFile(fileHandle) {
  var handle = await fileHandle.getFile();
  console.log(handle);
}