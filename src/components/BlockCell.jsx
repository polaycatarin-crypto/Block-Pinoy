import './BlockCell.css'

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8']

function BlockCell({ cell, isSelected, onClick }) {
  if (cell.isEmpty) {
    return <div className="block empty" onClick={onClick}></div>
  }

  const backgroundColor = COLORS[cell.color % COLORS.length]

  return (
    <div
      className={`block ${isSelected ? 'selected' : ''}`}
      style={{ backgroundColor }}
      onClick={onClick}
    >
      <div className="block-content">
        <div className="block-shine"></div>
      </div>
    </div>
  )
}

export default BlockCell
