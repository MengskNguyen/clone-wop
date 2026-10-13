import type { User } from 'firebase/auth'
import { Outlet, useLocation } from 'react-router'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

type AdminLayoutProps = {
    user: User
}

const pageTitles: Record<string, string> = {
    '/': 'Trang chủ',
    '/clients': 'Clients',
    '/asset-verification': 'Asset Verification',
    '/withdrawal-processing': 'Withdrawal Processing',
    '/audit-logs': 'Audit Logs',
    '/loyalty': 'Danh sách & phần thưởng',
    '/reward-history': 'Lịch sử nhận thưởng',
}

function AdminLayout({ user }: AdminLayoutProps) {
    const { pathname } = useLocation()
    const title = pageTitles[pathname] ?? 'Trang này không tồn tại'

    return (
        <div className='app-layout'>
            <Sidebar />
            <div className='app-main'>
                <Header title={title} user={user} />
                <main className='home-page'>
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default AdminLayout