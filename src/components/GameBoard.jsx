import { useState, useEffect, useCallback } from 'react'
import { GameBoard as GameEngine } from '../gameEngine'
import BlockCell from './BlockCell'
import './GameBoard.css'

function GameBoard({ stage, onComplete, onUseBoost }) {
  const [board, setBoard] = useState(null)
  const [selectedCells, setSelectedCells] = useState([])
  const [score, setScore] = useState(0)
  const [stageScore, setStageScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [activeBoos, setActiveBoost] = useState(null)
  const [coinsEarned, setCoinsEarned] = useState(0)

  useEffect(() => {
    const newBoard = new GameEngine(6, 6)
    setBoard(newBoard)
    setScore(0)
    setCoinsEarned(0)
    setStageScore(0)
    setGameOver(false)
  }, [stage])

  const stageTargetScore = stage * 100

  const handleCellClick = useCallback((x, y) => {
    if (!board || gameOver) return

    if (activeBoos) {
      applyBoost(x, y)
      return
    }

    const matches = board.findMatchingBlock(x, y)
    if (matches.length === 0) return

    setSelectedCells(matches)
  }, [board, gameOver, activeBoos])

  const applyBoost = (x, y) => {
    if (!activeBoos) return

    let cleared = 0
    const positions = []

    if (activeBoos === 'bomb') {
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const nx = x + dx
          const ny = y + dy
          const cell = board.getCell(nx, ny)
          if (cell && !cell.isEmpty) {
            positions.push({ x: nx, y: ny })
          }
        }
      }
    } else if (activeBoos === 'lightning') {
      for (let i = 0; i < board.height; i++) {
        const cell = board.getCell(x, i)
        if (cell && !cell.isEmpty) {
          positions.push({ x, y: i })
        }
      }
    } else if (activeBoos === 'hammer') {
      for (let j = 0; j < board.width; j++) {
        const cell = board.getCell(j, y)
        if (cell && !cell.isEmpty) {
          positions.push({ x: j, y })
        }
      }
    }

    if (positions.length > 0) {
      cleared = board.clearBlocks(positions)
      updateScore(cleared * 15)
    }

    setActiveBoost(null)
    setBoard({ ...board })
  }

  const handleConfirm = () => {
    if (selectedCells.length === 0) return

    const cleared = board.clearBlocks(selectedCells)
    updateScore(cleared * 10)
    setSelectedCells([])

    setTimeout(() => {
      board.refillBoard()
      setBoard({ ...board })

      if (!board.hasValidMoves()) {
        setGameOver(true)
      }
    }, 300)
  }

  const updateScore = (points) => {
    const newScore = stageScore + points
    setStageScore(newScore)
    setCoinsEarned(Math.floor(newScore / 50))

    if (newScore >= stageTargetScore) {
      completeStage()
    }
  }

  const completeStage = () => {
    setGameOver(true)
    onComplete(coinsEarned)
  }

  const handleBoostClick = (boostType) => {
    if (onUseBoost(boostType)) {
      setActiveBoost(boostType)
    }
  }

  const handleRetry = () => {
    const newBoard = new GameEngine(6, 6)
    setBoard(newBoard)
    setScore(0)
    setCoinsEarned(0)
    setStageScore(0)
    setGameOver(false)
    setSelectedCells([])
  }

  if (!board) return <div className="loading">Pag-load ng game...</div>

  return (
    <div className="game-board-container">
      <div className="game-info-bar">
        <div className="info-item">
          <span className="info-label">Score</span>
          <span className="info-value">{stageScore} / {stageTargetScore}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Coins</span>
          <span className="info-value">{coinsEarned}</span>
        </div>
        {activeBoos && (
          <div className="active-boost-indicator">Active: {activeBoos}</div>
        )}
      </div>

      <div className="game-grid">
        {board.board.map((row, y) =>
          row.map((cell, x) => (
            <BlockCell
              key={cell.id}
              cell={cell}
              isSelected={selectedCells.some(c => c.x === x && c.y === y)}
              onClick={() => handleCellClick(x, y)}
            />
          ))
        )}
      </div>

      <div className="game-controls">
        {selectedCells.length > 0 && (
          <button onClick={handleConfirm} className="confirm-btn">
            Clear {selectedCells.length} Blocks
          </button>
        )}
        {!gameOver && (
          <div className="quick-boosts">
            <button
              className="quick-boost bomb"
              onClick={() => handleBoostClick('bomb')}
              title="Bomb"
            >
              💣
            </button>
            <button
              className="quick-boost lightning"
              onClick={() => handleBoostClick('lightning')}
              title="Lightning"
            >
              ⚡
            </button>
            <button
              className="quick-boost hammer"
              onClick={() => handleBoostClick('hammer')}
              title="Hammer"
            >
              🔨
            </button>
            <button
              className="quick-boost shuffle"
              onClick={() => handleBoostClick('shuffle')}
              title="Shuffle"
            >
              🔄
            </button>
          </div>
        )}
      </div>

      {gameOver && (
        <div className="game-over-modal">
          <div className="modal-content">
            {stageScore >= stageTargetScore ? (
              <>
                <h2>Stage Complete! 🎉</h2>
                <p>Score: {stageScore}</p>
                <p>Coins Earned: {coinsEarned}</p>
                <p>Go to the next stage!</p>
              </>
            ) : (
              <>
                <h2>No Valid Moves 😢</h2>
                <p>Score: {stageScore} / {stageTargetScore}</p>
                <button onClick={handleRetry} className="retry-btn">Retry Stage</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default GameBoard
