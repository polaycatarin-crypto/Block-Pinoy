export class GameBoard {
  constructor(width = 6, height = 6) {
    this.width = width
    this.height = height
    this.board = this.initializeBoard()
    this.score = 0
  }

  initializeBoard() {
    const board = []
    for (let i = 0; i < this.height; i++) {
      const row = []
      for (let j = 0; j < this.width; j++) {
        row.push({
          id: `${i}-${j}`,
          color: Math.floor(Math.random() * 5),
          isEmpty: false,
          x: j,
          y: i
        })
      }
      board.push(row)
    }
    return board
  }

  getCell(x, y) {
    if (y < 0 || y >= this.height || x < 0 || x >= this.width) return null
    return this.board[y][x]
  }

  setCell(x, y, value) {
    if (y < 0 || y >= this.height || x < 0 || x >= this.width) return
    this.board[y][x] = value
  }

  getAdjacentCells(x, y) {
    const adjacent = []
    const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]]

    for (const [dx, dy] of directions) {
      const newX = x + dx
      const newY = y + dy
      const cell = this.getCell(newX, newY)
      if (cell && !cell.isEmpty) {
        adjacent.push({ cell, x: newX, y: newY })
      }
    }
    return adjacent
  }

  findMatchingBlock(x, y) {
    const cell = this.getCell(x, y)
    if (!cell || cell.isEmpty) return []

    const color = cell.color
    const visited = new Set()
    const stack = [[x, y]]
    const matches = []

    while (stack.length > 0) {
      const [cx, cy] = stack.pop()
      const key = `${cx}-${cy}`

      if (visited.has(key)) continue
      visited.add(key)

      const currentCell = this.getCell(cx, cy)
      if (!currentCell || currentCell.isEmpty || currentCell.color !== color) continue

      matches.push({ x: cx, y: cy, cell: currentCell })

      const adjacent = this.getAdjacentCells(cx, cy)
      for (const { x: nx, y: ny } of adjacent) {
        if (!visited.has(`${nx}-${ny}`)) {
          stack.push([nx, ny])
        }
      }
    }

    return matches.length >= 3 ? matches : []
  }

  clearBlocks(positions) {
    positions.forEach(({ x, y }) => {
      this.setCell(x, y, {
        id: `${y}-${x}-empty`,
        color: null,
        isEmpty: true,
        x,
        y
      })
    })

    this.applyGravity()
    this.score += positions.length * 10
    return positions.length
  }

  applyGravity() {
    for (let x = 0; x < this.width; x++) {
      const newColumn = []

      for (let y = 0; y < this.height; y++) {
        const cell = this.getCell(x, y)
        if (!cell.isEmpty) {
          newColumn.push(cell)
        }
      }

      for (let y = 0; y < this.height; y++) {
        if (y < this.height - newColumn.length) {
          this.setCell(x, y, {
            id: `${y}-${x}-empty`,
            color: null,
            isEmpty: true,
            x,
            y
          })
        } else {
          const cell = newColumn[y - (this.height - newColumn.length)]
          cell.y = y
          this.setCell(x, y, cell)
        }
      }
    }
  }

  refillBoard() {
    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) {
        const cell = this.getCell(j, i)
        if (cell.isEmpty) {
          this.setCell(j, i, {
            id: `${i}-${j}`,
            color: Math.floor(Math.random() * 5),
            isEmpty: false,
            x: j,
            y: i
          })
        }
      }
    }
  }

  hasValidMoves() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.findMatchingBlock(x, y).length >= 3) {
          return true
        }
      }
    }
    return false
  }
}
