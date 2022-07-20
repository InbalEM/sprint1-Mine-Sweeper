'use strict'

const SAD = '😵'
const WIN = '😎'
var gLevels = [{ SIZE: 4, MINES: 2 }, { SIZE: 8, MINES: 12 }, { SIZE: 12, MINES: 30 }]
var gBoard
var gGameLevel = 0

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

var timerInterval
var gStartTime
var gLives = 3

function init() {
    gGame.isOn = true
    gBoard = buildBoard()
    document.querySelector('.clock').innerText = '0'
    renderBoard(gBoard)
}

function buildBoard() {
    var boardLevel = gLevels[gGameLevel]
    const board = []
    for (var i = 0; i < boardLevel.SIZE; i++) {
        board.push([])
        for (var j = 0; j < boardLevel.SIZE; j++) {

            board[i][j] = { isShown: false, isMine: false, isMarked: false, minesAroundCount: 0 }
        }
    }


    return board
}

function setMinesNegsCount() {
    for (var i = 0; i < gBoard.length; i++) {

        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j]
            cell.minesAroundCount = countMineNegs(gBoard, i, j)
        }
    }
}

function cellClicked(elCell, idxI, idxJ) {
    if (!gGame.isOn)return

    if (!gStartTime) {
        startTimer()
        addMines(gBoard, idxI, idxJ)
        setMinesNegsCount()
    }

    var cell = gBoard[idxI][idxJ]
    if (cell.isShown) return
  

    if (cell.isMine) {
        mineClicked()

    }
    if (cell.minesAroundCount === 0) {
        expandShown( idxI, idxJ)

    }

    cell.isShown = true
    gGame.shownCount++

    renderBoard(gBoard)
    if (checkGameOver()) {
        gGame.isOn = false
        return
    }
}

function addMines(board, idxI, IdxJ) {
    var mines = []
    for (var i = 0; i < gLevels[gGameLevel].MINES; i++) {

        var cells = createArray(board.length, idxI, IdxJ)
        var ran = getRandomInt(0, cells.length)

        var mineCell = cells[ran]
        mines.push(cells[ran])

        board[mineCell.i][mineCell.j].isMine = true
    }
    return board
}


function cellMarked(elCell) {
    var cellCoord = getCellCoord(elCell.id);

    var cell = gBoard[cellCoord.i][cellCoord.j]

    if (cell.isShown) return

    if (cell.isMarked) {
        cell.isMarked = false
        gGame.shownCount--
    } else {
        cell.isMarked = true
        gGame.shownCount++
    }


    elCell.classList.toggle('clicked')
    renderBoard(gBoard)

}

function setTimer() {
    var diffTime = (Date.now() - gStartTime) / 1000
    gGame.secsPassed = Math.round(diffTime)
    var displayTime = ('000' + gGame.secsPassed).substr(-3)
    document.querySelector('.clock').innerText = displayTime;

}

function startTimer() {
    gStartTime = Date.now()
    timerInterval = setInterval(setTimer, 10)
}

function pauseTimer() {

    clearInterval(timerInterval);
    timerInterval = null;
}

function checkGameOver() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j]

            if (!cell.isShown && !cell.isMarked) return false
        }
    }
    var elSweeper = document.querySelector('.sweeper')
    elSweeper.innerHTML = WIN

    return true

}


function mineClicked() {
    if (gLives > 0) {
        gLives--
        updateLives()
        return
    }
    showsAllMines()
    var elSweeper = document.querySelector('.sweeper')
    elSweeper.innerHTML = SAD
    gGame.isOn = true
}

function updateLives() {
    var elLives = document.querySelector('.lives')
    elLives.innerHTML = gLives
}

function showsAllMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j]
            if (cell.isMine) {
                cell.isShown = true
            }
        }
    }
    renderBoard(gBoard)

}



function levelUpdate(elButton) {
    var level = elButton.dataset.level
    gGameLevel = level
    resetGame()
}

function resetGame() {
    gBoard

    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
    timerInterval=null
    gStartTime =''
    clearInterval(timerInterval)

    gLives = 3

    init()

}



