import './GameUI.css'

function GameUI({ profile, currentStage, boosts, onSignOut }) {
  const boostIcons = {
    bomb: '💣',
    lightning: '⚡',
    hammer: '🔨',
    shuffle: '🔄'
  }

  const getPhilippineMessage = () => {
    const messages = [
      'Tuloy-tuloy!',
      'Sipag-sipag!',
      'Magpapalakas!',
      'Kaya mo yan!',
      'Salamat sa paglalaro!'
    ]
    return messages[currentStage % messages.length]
  }

  return (
    <div className="game-ui">
      <div className="ui-header">
        <div className="ui-left">
          <div className="title-section">
            <h1 className="game-title">🎮 Block Blast PH</h1>
            <p className="tagline">{getPhilippineMessage()}</p>
          </div>
          <div className="stage-info">
            <span className="stage-label">Stage</span>
            <span className="stage-number">{currentStage} / 3000</span>
          </div>
        </div>

        <div className="ui-right">
          <div className="coins-display">
            <span className="coin-icon">💰</span>
            <span className="coin-amount">{profile?.total_coins || 0}</span>
          </div>
          <button onClick={onSignOut} className="logout-btn">Sign Out</button>
        </div>
      </div>

      <div className="boosts-section">
        <h3>Boosts</h3>
        <div className="boosts-grid">
          {Object.entries(boostIcons).map(([type, icon]) => (
            <div key={type} className="boost-item">
              <div className="boost-icon">{icon}</div>
              <div className="boost-count">{boosts[type] || 0}</div>
              <div className="boost-name">{type}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default GameUI
