import { useState } from 'react'
import { supabase } from '../supabase'
import './AuthPage.css'

function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password
      })

      if (signUpError) throw signUpError

      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ id: data.user.id, username }])

      if (profileError) throw profileError

      alert('Nag-sign up na! Check mo ang email mo.')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1 className="auth-title">Block Blast PH</h1>
        <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="auth-form">
          {isSignUp && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="auth-input"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="auth-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="auth-input"
          />
          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Pag-load...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        {error && <div className="auth-error">{error}</div>}

        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="auth-toggle"
        >
          {isSignUp ? 'May account na? Sign in' : 'Walang account? Sign up'}
        </button>
      </div>
    </div>
  )
}

export default AuthPage
