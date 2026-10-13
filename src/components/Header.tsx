import { useState } from 'react'
import { signOut } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { auth } from '../firebase'
import './Header.css'

type HeaderProps = {
  title: string
  user: User
}

function Header({ title, user }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [error, setError] = useState('')

  const name = user.displayName || user.email || 'Tài khoản'
  const initials = name.slice(0, 2).toUpperCase()

  async function handleLogout() {
    if (isLoggingOut) return

    setIsLoggingOut(true)
    setError('')

    try {
      await signOut(auth)
    } catch {
      setError('Không thể đăng xuất. Vui lòng thử lại.')
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <header className="app-header">
      <h1>{title}</h1>

      <div
        className="account"
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setIsOpen(false)
          }
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setIsOpen(false)
          }
        }}
      >
        <button
          type="button"
          className="account-trigger"
          aria-expanded={isOpen}
          aria-controls="account-panel"
          onClick={() => setIsOpen((value) => !value)}
        >
          <span className="account-avatar" aria-hidden="true">
            {initials}
          </span>

          <span className="account-name">{name}</span>
          <span aria-hidden="true">▾</span>
        </button>

        {isOpen && (
          <div className="account-panel" id="account-panel">
            <strong>{name}</strong>
            <span>{user.email}</span>
            <span>WOP ADMIN PORTAL · v1.0</span>

            <button
              type="button"
              className="logout-button"
              disabled={isLoggingOut}
              onClick={() => void handleLogout()}
            >
              {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
            </button>

            {error && (
              <p className="account-error" role="alert">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    </header>
  )
}

export default Header