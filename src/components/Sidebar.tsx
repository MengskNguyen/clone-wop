import './Sidebar.css'
import { NavLink } from 'react-router'

const menuGroups = [
  {
    title: 'BIG DEAL',
    items: [
      { id: 'clients', label: 'Clients' },
    ],
  },
  {
    title: 'SỐ TÀI SẢN',
    items: [
      { id: 'asset-verification', label: 'Asset Verification' },
      { id: 'withdrawal-processing', label: 'Withdrawal Processing' },
      { id: 'audit-logs', label: 'Audit Logs' },
    ],
  },
  {
    title: 'CHƯƠNG TRÌNH TRI ÂN',
    items: [
      { id: 'loyalty', label: 'Danh sách & phần thưởng' },
      { id: 'reward-history', label: 'Lịch sử nhận thưởng' },
    ],
  },
]

function Sidebar() {
  return (
    <aside className="sidebar">
      <header className="sidebar-brand">
        <NavLink to="/" aria-label="Về trang chủ">
          <img
            src="/logo192.png"
            alt="HanaSilver"
            className="sidebar-logo"
          />
        </NavLink>
        <span>WOP ADMIN PORTAL</span>
      </header>

      <nav className="sidebar-nav" aria-label="Menu chính">
        {menuGroups.map((group) => (
          <section className="sidebar-group" key={group.title}>
            <h2>{group.title}</h2>

            {group.items.map((item) => (
              <NavLink
                to={`/${item.id}`}
                className={({ isActive }) =>
                  `sidebar-item${isActive ? ' sidebar-item-active' : ''}`
                }
                key={item.id}
              >
                {item.label}
              </NavLink>
            ))}
          </section>
        ))}
      </nav>

      <footer className="sidebar-footer">
        WOP ADMIN PORTAL v1.0
      </footer>
    </aside>
  )
}

export default Sidebar