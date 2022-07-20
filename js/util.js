'use strict'

const MINE = '💣'
const NUM1 = '1️⃣'
const NUM2 = '2️⃣'
const NUM3 = '3️⃣'
const MARKED = '🏁'


function renderBoard(board) {

    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n';
        for (var j = 0; j < board[0].length; j++) {

            
            var tdId = `cell-${i}-${j}`;
            var currCell = board[i][j];
            var className = (currCell.isShown) ? 'clicked' : ''

            strHTML += `\t<td  id="${tdId}" class="${className}"  onclick="cellClicked(this,${i}, ${j})" 
                        oncontextmenu="cellMarked(this,event);return false;">\n`;

            if (currCell.isMarked) {
                strHTML += MARKED
            } else if (currCell.isShown) {
                if (currCell.isMine) {
                    strHTML += MINE
                } else if (currCell.minesAroundCount > 0) {
                    strHTML += currCell.minesAroundCount
                }
            }
            strHTML += '\t</td>\n';
        }
        strHTML += '</tr>\n';
    }
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}

function countMineNegs(board, rowIdx, colIdx) {
    var count = 0
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= board[0].length) continue
            var currCell = board[i][j]
            if (currCell.isMine) count++
        }
    }
    return count
}

function getCellCoord(strCellId) {
    var coord = {};
    var parts = strCellId.split('-');
    coord.i = +parts[1]
    coord.j = +parts[2];
    return coord;
}


function getRandomInt(min, max) {
    var min = Math.ceil(min)
    var max = Math.floor(max)
    var randNum = Math.floor(Math.random() * (max - min)) + min
    return randNum
}

function createArray(boardSize,idxI,idxJ) {
    var cells = []
    for (var i = 0; i < boardSize; i++) {

        for (var j = 0; j < boardSize; j++) {
            if (i === idxI && j === idxJ) continue
        
            cells.push({ i: i, j: j })
        }
    }
    return cells
}


function showNeighbors( rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue
            var Cell = gBoard[i][j]
            Cell.isShown=true
            gGame.shownCount++
        }
    }

}