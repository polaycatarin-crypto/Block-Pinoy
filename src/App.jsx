import { useState, useEffect } from 'react'
import './App.css'
import AuthPage from './components/AuthPage'
import GamePage from './components/GamePage'
import { supabase } from './supabase'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return <div className="loading">Pag-load...</div>
  }

  return session ? <GamePage session={session} /> : <AuthPage />
}

export default App
