import { FirebaseError } from 'firebase/app'
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from 'firebase/auth'
import { auth } from '../firebase'

import { useState } from 'react'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  async function handleLogin() {
    if (isLoading) return

    setIsLoading(true)
    setMessage('')
    setIsError(false)

    try {
      await setPersistence(
        auth,
        rememberMe
          ? browserLocalPersistence
          : browserSessionPersistence,
      )

      await signInWithEmailAndPassword(auth, email.trim(), password)

      setPassword('')
      setMessage('Đăng nhập thành công!')
    } catch (error) {
      setIsError(true)
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/invalid-credential':
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-email':
            setMessage('Email hoặc mật khẩu không hợp lệ.')
            break

          case 'auth/too-many-requests':
            setMessage('Có quá nhiều lần thử. Vui lòng thử lại sau.')
            break

          case 'auth/network-request-failed':
            setMessage('Không thể kết nối. Vui lòng kiểm tra mạng.')
            break

          default:
            console.error('Firebase Auth error:', error.code)
            setMessage('Không thể đăng nhập. Vui lòng kiểm tra Console.')
        }
      } else {
        console.error('Login error:', error)
        setMessage('Đã xảy ra lỗi khi đăng nhập.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="login-page">
      <div className="login-container">
        <h1>HanaSilver WOP</h1>

        <form
          className="login-card"
          onSubmit={(event) => {
            event.preventDefault()
            void handleLogin()
          }}
        >
          <h2>Đăng nhập</h2>

          <label htmlFor="email">
            <span className="required">*</span> Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="password">
            <span className="required">*</span> Mật khẩu
          </label>
          <div className="password-field">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <button
              type="button"
              className="password-toggle"
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              aria-controls="password"
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? 'Ẩn' : 'Hiện'}
            </button>
          </div>

          <label className="remember-login">
            <input
              type="checkbox"
              checked={rememberMe}
              disabled={isLoading}
              onChange={(event) => setRememberMe(event.target.checked)}
            />
            <span>Ghi nhớ đăng nhập</span>
          </label>

          <button 
            type="submit" 
            className="login-submit"
            disabled={isLoading}
          >
            { isLoading ? 'Đang đăng nhập ...' : 'Đăng nhập' }
          </button>

          <p
            className={`login-message${isError ? ' login-message-error' : ''}`}
            role="status"
          >
            {message}
          </p>
        </form>
      </div>
    </main>
  )
}

export default Login
