'use strict'

const LIVE = '😁'
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
const LIVES = '❤️❤️❤️'

var gHints = 3
const HINTS = '💡💡💡'
var gIsHint = false

var gSafeClickCount = 3

var isManually = false
var gManuallyMines = []

var gLastClick = []

var gIsSevenBoom = false

function init() {
    gGame.isOn = true
    gBoard = buildBoard()
    renderBoard(gBoard)
    if (gIsSevenBoom) {
        addSevBoomMines()
        
    }
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

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j]
            cell.minesAroundCount = countMineNegs(board, i, j)
        }
    }
    return board
}

function cellClicked(elCell, idxI, idxJ) {
    if (!gGame.isOn) return
    if (!gStartTime && !isManually) {
        startTimer()
        if (!gIsSevenBoom){
            addMines(gBoard, idxI, idxJ)
        }else {
            gIsSevenBoom = false
        }
        gBoard = setMinesNegsCount(gBoard)
    } else if (!gStartTime && isManually) {
        gBoard[idxI][idxJ].isMine = true
        renderCell(idxI, idxJ, MARKED, 'clicked')
        gManuallyMines.push({ i: idxI, j: idxJ })
        return
    }
    var cell = gBoard[idxI][idxJ]

    if (cell.isShown) return
    if (cell.isMarked) return
    if (gIsHint) {
        var showsCells = cellHint(idxI, idxJ)
        setTimeout(hideCells, 1000, showsCells)
        gIsHint = false
        return
    }
    gLastClick = []
    if (cell.isMine) {
        mineClicked()
    } else if (cell.minesAroundCount === 0) {
        expandShown(elCell, idxI, idxJ, gLastClick)
    }
    gLastClick.push({ i: idxI, j: idxJ })

    cell.isShown = true
    gGame.shownCount++
    renderBoard(gBoard)
    if (checkGameOver()) {
        gGame.isOn = false
        return
    }
}

function cellMarked(elCell) {
    if (!gGame.isOn) return

    var cellCoord = getCellCoord(elCell.id);
    var cell = gBoard[cellCoord.i][cellCoord.j]

    if (cell.isShown) return

    if (cell.isMarked) {
        cell.isMarked = false
        if (cell.isMine) gGame.markedCount--
    } else {
        cell.isMarked = true
        if (cell.isMine) gGame.markedCount++
    }
    renderBoard(gBoard)

    if (checkGameOver()) {
        gGame.isOn = false
        return
    }
}

function addMines(board, idxI, IdxJ) {
    var cells = createArray(board.length, idxI, IdxJ)
    for (var i = 0; i < gLevels[gGameLevel].MINES; i++) {
        var ran = getRandomInt(0, cells.length)
        var mineCell = cells[ran]
        cells.splice(ran, 1)
        board[mineCell.i][mineCell.j].isMine = true
    }
    return board
}

function addSevBoomMines() {
    var count = 0
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            console.log('i , j:', i , j)
            if (i === 0 && j === 0)continue
            count++
            console.log('count:', count)
            if (count % 7 === 0 || count % 10 === 7) {
                console.log('true');
                gBoard[i][j].isMine = true
            }
        }

    }
}

function safeClick() {
    if (gSafeClickCount === 0) return
    --gSafeClickCount
    var elSafeButton = document.querySelector('.safe-click')
    elSafeButton.innerHTML = gSafeClickCount
    var drawBoard = cellToDraw(gBoard)
    var ranIdx = getRandomInt(0, drawBoard.length)
    var drawCell = drawBoard[ranIdx]
    var cell = gBoard[drawCell.i][drawCell.j]
    cell.isShown = true
    renderCell(drawCell.i, drawCell.j, cell.minesAroundCount, 'clicked')

    setTimeout(() => {
        cell.isShown = false
        renderBoard(gBoard)
    }, "1000", cell)
}

function manuallyGame() {
    if (gStartTime) return
    if (!isManually) {
        isManually = true
        return
    } else {
        isManually = false
        startTimer()
    }
    gBoard = setMinesNegsCount(gBoard)
    hideCells(gManuallyMines)
}

function undo() {
    if (gLastClick.length === 0) return
    hideCells(gLastClick)
    gGame.shownCount -= gLastClick.length
    if (gBoard[gLastClick[0].i][gLastClick[0].j].isMine) {
        gLives++
        updateLives()
    }
}

function sevenBoom() {
    gIsSevenBoom = true
    resetGame()
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

function scoreCount() {
    var diffTime = (Date.now() - gStartTime) / 1000
    gGame.secsPassed = ('000' + Math.round(diffTime)).substr(-3)

    if (typeof (Storage) !== "undefined") {
        if (gGameLevel === 0) {
            localStorage.timer0 = scoreCountToLevel(localStorage.timer0, gGame.secsPassed)
            var bestTime = localStorage.timer0
        } else if (gGameLevel === 1) {
            localStorage.timer1 = scoreCountToLevel(localStorage.timer0, gGame.secsPassed)
            var bestTime = localStorage.timer1
        } else if (gGameLevel === 2) {
            localStorage.timer2 = scoreCountToLevel(localStorage.timer2, gGame.secsPassed)
            var bestTime = localStorage.timer2
        }
        document.querySelector(".score").innerHTML = `Best time score: ${('000' + bestTime).substr(-3)}`
    } else {
        document.querySelector(".score").innerHTML = "Sorry, your browser does not support web storage...";
    }
}

function scoreCountToLevel(storedTime, gameTime) {
    if (!storedTime) return gameTime + ''
    var time = parseInt(storedTime)
    if (isNaN(time)) return gameTime + ''
    if (time) {
        if (time > gameTime) {
            time = gameTime
        }
    } else {
        time = gameTime
    }
    var newTime = time + ''
    return newTime
}

function checkGameOver() {
    var mineCount = gLevels[gGameLevel].MINES
    var flagCount = mineCount - (3 - gLives)
    var showsCount = gLevels[gGameLevel].SIZE ** 2 - flagCount

    if (gGame.shownCount !== showsCount) return false
    if (gGame.markedCount !== flagCount) return false

    var elSweeper = document.querySelector('.sweeper')
    elSweeper.innerHTML = WIN
    scoreCount()
    pauseTimer()
    return true
}

function mineClicked() {
    gLives--
    updateLives()
    if (gLives > 0) {
        return
    }
    showsAllMines()
    var elSweeper = document.querySelector('.sweeper')
    elSweeper.innerHTML = SAD
    pauseTimer()
    gGame.isOn = false
}

function hint() {
    if (gHints === 0) return
    --gHints
    gIsHint = true
    var remainHints = HINTS.slice(0, gHints * 2)
    var elHints = document.querySelector('span.hints')
    elHints.innerHTML = remainHints
}

function updateLives() {
    var elLives = document.querySelector('.lives')
    var remainLives = LIVES.slice(0, gLives * 2)
    elLives.innerHTML = remainLives
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
    gGameLevel = parseInt(level)
    resetGame()
}

function resetGame() {
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
    pauseTimer()
    gStartTime = null
    timerInterval = null
    updateLives()
    document.querySelector('.clock').innerText = '000'

    var elSweeper = document.querySelector('.sweeper')
    elSweeper.innerHTML = LIVE

    gLives = 3
    var elLives = document.querySelector('.lives')
    elLives.innerHTML = LIVES

    gHints = 3
    var elHints = document.querySelector('span.hints')
    elHints.innerHTML = HINTS
    gIsHint = false

    gSafeClickCount = 3
    var elSafeButton = document.querySelector('.safe-click')
    elSafeButton.innerHTML = gSafeClickCount

    isManually = false
    gManuallyMines = []

    gLastClick = []

    init()
}

