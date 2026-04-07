import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import GameBoard from './GameBoard'
import GameUI from './GameUI'
import './GamePage.css'

function GamePage({ session }) {
  const [profile, setProfile] = useState(null)
  const [currentStage, setCurrentStage] = useState(1)
  const [boosts, setBoosts] = useState({})
  const [gameKey, setGameKey] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle()

      if (error) throw error
      setProfile(data)
      setCurrentStage(data?.current_stage || 1)

      loadBoosts()
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadBoosts = async () => {
    try {
      const { data, error } = await supabase
        .from('boosts')
        .select('*')
        .eq('user_id', session.user.id)

      if (error) throw error

      const boostMap = {}
      data?.forEach(boost => {
        boostMap[boost.boost_type] = boost.quantity || 0
      })
      setBoosts(boostMap)
    } catch (error) {
      console.error('Error loading boosts:', error)
    }
  }

  const handleStageComplete = async (coins) => {
    try {
      const newStage = currentStage + 1

      await Promise.all([
        supabase
          .from('profiles')
          .update({
            current_stage: newStage,
            total_coins: (profile?.total_coins || 0) + coins,
            best_stage: Math.max(profile?.best_stage || 1, newStage)
          })
          .eq('id', session.user.id),

        supabase
          .from('game_progress')
          .upsert({
            user_id: session.user.id,
            stage: currentStage,
            coins_earned: coins,
            completed: true
          }, { onConflict: 'user_id,stage' })
      ])

      setCurrentStage(newStage)
      setGameKey(prev => prev + 1)
      loadProfile()
    } catch (error) {
      console.error('Error completing stage:', error)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const handleUseBoost = (boostType) => {
    if ((boosts[boostType] || 0) > 0) {
      setBoosts(prev => ({
        ...prev,
        [boostType]: (prev[boostType] || 0) - 1
      }))
      return true
    }
    return false
  }

  if (loading) return <div className="loading">Pag-load...</div>

  return (
    <div className="game-page">
      <GameUI
        profile={profile}
        currentStage={currentStage}
        boosts={boosts}
        onSignOut={handleSignOut}
      />
      <GameBoard
        key={gameKey}
        stage={currentStage}
        onComplete={handleStageComplete}
        onUseBoost={handleUseBoost}
      />
    </div>
  )
}

export default GamePage
