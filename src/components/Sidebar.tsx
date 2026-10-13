import './Sidebar.css'
import { NavLink } from 'react-router'

const menuGroups = [
  {
    title: 'BIG DEAL',
    items: [
      {
        id: 'clients',
        label: 'Clients',
        icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M16 3a4 4 0 0 1 0 8 M22 21v-2a4 4 0 0 0-3-3.87 M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
      },
    ],
  },
  {
    title: 'SỐ TÀI SẢN',
    items: [
      {
        id: 'asset-verification',
        label: 'Asset Verification',
        icon: 'M12 3 3 7v6c0 5 9 9 9 9s9-4 9-9V7l-9-4Z M8 12l3 3 5-6',
      },
      {
        id: 'withdrawal-processing',
        label: 'Withdrawal Processing',
        icon: 'M20 7H4l4-4 M4 17h16l-4 4 M4 12h16',
      },
      {
        id: 'audit-logs',
        label: 'Audit Logs',
        icon: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0 M12 6v6l4 2',
      },
    ],
  },
  {
    title: 'CHƯƠNG TRÌNH TRI ÂN',
    items: [
      {
        id: 'loyalty',
        label: 'Danh sách & phần thưởng',
        icon: 'M3 8h18v4H3Z M5 12v9h14v-9 M12 8v13 M12 8H8a3 3 0 1 1 3-3l1 3Z M12 8h4a3 3 0 1 0-3-3l-1 3Z',
      },
      {
        id: 'reward-history',
        label: 'Lịch sử nhận thưởng',
        icon: 'M21 8a9 9 0 1 0 0 8 M21 3v5h-5 M12 7v5l3 2',
      },
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
                <svg
                  className="sidebar-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d={item.icon} />
                </svg>
                <span>{item.label}</span>
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
