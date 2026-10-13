import { useEffect, useRef, useState } from 'react'
import ClientDetails from '../components/ClientDetails'
import './Clients.css'

type Status = 'open' | 'waiting' | 'received' | 'resold'
type Client = { id: string; name: string; email: string; phone: string }
type Contract = {
  id: string; clientId: string; openedAt: string; quantity: number; price: number
  status: Status; outstanding: number; refunded: number; profit: number; paid: number
  deliveryDate?: string; deliveryTime?: string
}

const mockClients: Client[] = [
  { id: 'c1', name: 'Nguyễn Minh Anh', email: 'minhanh@example.com', phone: '0900 000 001' },
  { id: 'c2', name: 'Trần Hoàng Nam', email: 'hoangnam@example.com', phone: '0900 000 002' },
  { id: 'c3', name: 'Lê Thu Hà', email: 'thuha@example.com', phone: '0900 000 003' },
  { id: 'c4', name: 'Phạm Đức Long', email: 'duclong@example.com', phone: '0900 000 004' },
  { id: 'c5', name: 'Võ Ngọc Mai', email: 'ngocmai@example.com', phone: '0900 000 005' },
]

const mockProfiles: Record<string, { userId: string; vip: number; note: string; reviewFlag: string; reason: string }> = {
  c1: { userId: 'U10082', vip: 4, note: 'Khách giao dịch thường xuyên', reviewFlag: 'Không có', reason: 'Giao dịch khối lượng lớn' },
  c2: { userId: 'U10083', vip: 3, note: 'Ưu tiên liên hệ trước khi giao hàng', reviewFlag: 'Không có', reason: '' },
  c3: { userId: 'U10084', vip: 4, note: 'Khách quan tâm chương trình BigDeal', reviewFlag: 'Không có', reason: '' },
  c4: { userId: 'U10085', vip: 2, note: 'Liên hệ trong giờ hành chính', reviewFlag: 'Không có', reason: '' },
  c5: { userId: 'U10086', vip: 3, note: 'Khách đã hoàn tất nhận hàng', reviewFlag: 'Không có', reason: '' },
}

const mockContracts: Contract[] = [
  { id: 'BD.J01', clientId: 'c1', openedAt: '2026-07-05', quantity: 30, price: 2550000, status: 'open', outstanding: 42000000, refunded: 0, profit: 0, paid: 34500000 },
  { id: 'BD.J02', clientId: 'c2', openedAt: '2026-07-12', quantity: 30, price: 2500000, status: 'waiting', outstanding: 0, refunded: 0, profit: 0, paid: 75000000, deliveryDate: '2026-10-12', deliveryTime: '14:30' },
  { id: 'BD.J03', clientId: 'c3', openedAt: '2026-07-20', quantity: 25, price: 2450000, status: 'resold', outstanding: 0, refunded: 33500000, profit: 700000, paid: 32800000 },
  { id: 'BD.A01', clientId: 'c4', openedAt: '2026-08-03', quantity: 30, price: 2650000, status: 'open', outstanding: 45000000, refunded: 0, profit: 0, paid: 34500000 },
  { id: 'BD.N22R', clientId: 'c1', openedAt: '2026-08-09', quantity: 20, price: 2400000, status: 'waiting', outstanding: 0, refunded: 0, profit: 0, paid: 48000000, deliveryDate: '2026-10-08', deliveryTime: '11:00' },
  { id: 'BD.A03', clientId: 'c5', openedAt: '2026-08-15', quantity: 20, price: 2450000, status: 'received', outstanding: 0, refunded: 0, profit: 0, paid: 49000000 },
  { id: 'BD.A04', clientId: 'c2', openedAt: '2026-08-21', quantity: 10, price: 2400000, status: 'resold', outstanding: 0, refunded: 12000000, profit: 300000, paid: 11700000 },
  { id: 'BD.A05', clientId: 'c4', openedAt: '2026-08-28', quantity: 20, price: 2500000, status: 'resold', outstanding: 0, refunded: 25000000, profit: 500000, paid: 24500000 },
  { id: 'BD.S01', clientId: 'c3', openedAt: '2026-09-04', quantity: 100, price: 2580000, status: 'open', outstanding: 120000000, refunded: 0, profit: 0, paid: 138000000 },
  { id: 'BD.S02', clientId: 'c5', openedAt: '2026-09-18', quantity: 40, price: 2450000, status: 'received', outstanding: 0, refunded: 0, profit: 0, paid: 98000000 },
]

const referencePrice = 2550000
const number = (value: number) => value.toLocaleString('vi-VN')
const money = (value: number) => `${number(value)} VND`
const date = (value: string) => value.split('-').reverse().join('/')
const sum = (items: Contract[], field: 'quantity' | 'outstanding' | 'refunded' | 'profit') => items.reduce((total, item) => total + item[field], 0)
const statusLabels: Record<Status, string> = { open: 'Chưa tất toán', waiting: 'Chờ nhận hàng', received: 'Đã nhận hàng', resold: 'Đã bán lại' }
const tabs = [{ id: 'overview', label: 'Tổng quan' }, { id: 'list', label: 'Danh sách clients' }, { id: 'favorites', label: 'Yêu thích' }] as const

function StatCard({ label, value, note, tone }: { label: string; value: string; note: string; tone?: 'negative' | 'positive' }) {
  return <article className="clients-stat"><p>{label}</p><strong className={tone ? `clients-${tone}` : undefined}>{value}</strong><small>{note}</small></article>
}

function Clients() {
  const [tab, setTab] = useState<(typeof tabs)[number]['id']>('overview')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [range, setRange] = useState({ from: '', to: '' })
  const [search, setSearch] = useState('')
  const [favorites, setFavorites] = useState<string[]>(['c1'])
  const [trackingReasons, setTrackingReasons] = useState<Record<string, string>>(
    () => Object.fromEntries(Object.entries(mockProfiles).map(([id, profile]) => [id, profile.reason])),
  )
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (selectedClient) dialogRef.current?.showModal()
    else dialogRef.current?.close()
  }, [selectedClient])

  const contracts = mockContracts.filter((item) => (!range.from || item.openedAt >= range.from) && (!range.to || item.openedAt <= range.to))
  const open = contracts.filter((item) => item.status === 'open')
  const waiting = contracts.filter((item) => item.status === 'waiting')
  const received = contracts.filter((item) => item.status === 'received')
  const resold = contracts.filter((item) => item.status === 'resold')
  const difference = open.reduce((total, item) => total + item.quantity * (referencePrice - item.price), 0)
  const clientIds = new Set(contracts.map((item) => item.clientId))
  const filteredClients = mockClients.filter((client) => clientIds.has(client.id) && (tab !== 'favorites' || favorites.includes(client.id)) && `${client.name} ${client.email} ${client.phone}`.toLocaleLowerCase('vi-VN').includes(search.trim().toLocaleLowerCase('vi-VN')))
  const months = [...new Set(contracts.map((item) => item.openedAt.slice(0, 7)))].sort().map((month) => {
    const items = contracts.filter((item) => item.openedAt.startsWith(month))
    return { month, count: items.length, quantity: sum(items, 'quantity') }
  })
  const maximum = Math.max(1, ...months.map((item) => item.quantity))
  const totalQuantity = sum(contracts, 'quantity')
  const volumes = [{ status: 'open', value: sum(open, 'quantity') }, { status: 'waiting', value: sum(waiting, 'quantity') }, { status: 'received', value: sum(received, 'quantity') }, { status: 'resold', value: sum(resold, 'quantity') }] as const
  const schedule = [...waiting].sort((a, b) => `${a.deliveryDate} ${a.deliveryTime}`.localeCompare(`${b.deliveryDate} ${b.deliveryTime}`))

  function toggleFavorite(id: string) {
    setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  }

  return (
    <section className="clients-page" aria-labelledby="clients-title">
      <div className="clients-heading">
        <div><h2 id="clients-title">Quản lý clients</h2><p>Chỉ gồm khách hàng đã mở hợp đồng BigDeal ít nhất một lần.</p></div>
        <span className="clients-version">v1.63 · Dữ liệu minh họa</span>
      </div>

      <nav className="clients-tabs" aria-label="Các mục quản lý clients">
        {tabs.map((item) => <button type="button" key={item.id} aria-pressed={tab === item.id} className={tab === item.id ? 'is-active' : ''} onClick={() => setTab(item.id)}>{item.label}</button>)}
      </nav>

      <form className="clients-filters" onSubmit={(event) => { event.preventDefault(); setRange({ from, to }) }}>
        <label><span>Ngày mở từ</span><input type="date" value={from} max={to || undefined} onChange={(event) => setFrom(event.target.value)} /></label>
        <label><span>Đến ngày</span><input type="date" value={to} min={from || undefined} onChange={(event) => setTo(event.target.value)} /></label>
        <button type="submit" disabled={!from && !to}>Áp dụng</button>
        <button type="button" onClick={() => { setFrom(''); setTo(''); setRange({ from: '', to: '' }) }}>Tất cả</button>
        <span className="clients-filter-note">Hợp đồng mở trong kỳ · trạng thái hiện tại</span>
      </form>

      {tab === 'overview' ? <div className="clients-overview">
        <section aria-labelledby="portfolio-title">
          <div className="clients-section-heading"><div><h3 id="portfolio-title">Danh mục hợp đồng</h3><p>Có bao nhiêu khách và bao nhiêu hợp đồng cần theo dõi?</p></div></div>
          <div className="clients-stats-grid">
            <StatCard label="Clients đã giao dịch" value={number(clientIds.size)} note="Đã mở ≥ 1 hợp đồng trong kỳ" />
            <StatCard label="Hợp đồng còn hiệu lực" value={number(open.length + waiting.length)} note={`${open.length} chưa tất toán · ${waiting.length} chờ nhận`} />
            <StatCard label="Khối lượng chưa tất toán" value={`${number(sum(open, 'quantity'))} lượng`} note="Chưa chọn bán lại / nhận hàng" />
            <StatCard label="Khối lượng chờ giao" value={`${number(sum(waiting, 'quantity'))} lượng`} note="Đã thanh toán đợt 2" />
          </div>
        </section>

        <section aria-labelledby="cashflow-title">
          <div className="clients-section-heading"><div><h3 id="cashflow-title">Dòng tiền & biến động giá</h3><p>Theo dõi khoản phải thu và chênh lệch giá trị của khách.</p></div><span className="clients-price">Giá tham chiếu: {number(referencePrice)} VND/lượng</span></div>
          <div className="clients-stats-grid">
            <StatCard label="Còn phải thu đợt 2" value={money(sum(open, 'outstanding'))} note="Từ hợp đồng chưa tất toán" />
            <StatCard label="Chênh lệch giá trị tạm tính chưa tất toán" value={`${difference > 0 ? '+' : difference < 0 ? '−' : ''}${money(Math.abs(difference))}`} note="Khối lượng chưa tất toán, theo giá hiện tại" tone={difference < 0 ? 'negative' : difference > 0 ? 'positive' : undefined} />
            <StatCard label="Tiền đã hoàn khi bán lại" value={money(sum(resold, 'refunded'))} note={`${resold.length} hợp đồng đã bán lại`} />
            <StatCard label="Chênh lệch giá trị đã bán lại" value={`${sum(resold, 'profit') > 0 ? '+' : ''}${money(sum(resold, 'profit'))}`} note="Tính trên toàn bộ lượng đã bán lại" tone="positive" />
          </div>
          <p className="clients-formula">Chênh lệch giá trị tạm tính = Σ số lượng × (giá mua vào HanaSilver hiện tại − đơn giá hợp đồng). Khi bán lại, số tiền hoàn cho khách = thanh toán đợt 1 + chênh lệch giá trên toàn bộ hợp đồng.</p>
        </section>

        <section aria-labelledby="results-title">
          <div className="clients-section-heading"><div><h3 id="results-title">Kết quả xử lý</h3><p>Theo trạng thái hiện tại của từng hợp đồng.</p></div></div>
          <div className="clients-stats-grid clients-stats-three">
            <StatCard label="Đã giao nhận" value={number(received.length)} note={`${number(sum(received, 'quantity'))} lượng`} />
            <StatCard label="Đã bán lại" value={number(resold.length)} note={`${number(sum(resold, 'quantity'))} lượng`} />
            <StatCard label="Tổng khối lượng từng mở" value={`${number(totalQuantity)} lượng`} note={`${contracts.length} hợp đồng`} />
          </div>
        </section>

        <div className="clients-charts">
          <section className="clients-panel" aria-labelledby="monthly-title">
            <h3 id="monthly-title" className="clients-panel-title">Hợp đồng mở mới theo tháng</h3>
            <div className="clients-monthly-chart">
              {months.length ? months.map((item) => <div className="clients-month-column" key={item.month}><span className="clients-contract-count">{item.count} HĐ</span><div className="clients-bar-space"><div className="clients-month-bar" style={{ height: `${item.quantity / maximum * 100}%` }} /></div><strong>{number(item.quantity)} lượng</strong><span>{item.month.split('-').reverse().join('/')}</span></div>) : <p className="clients-empty">Không có hợp đồng trong kỳ đã chọn.</p>}
            </div>
            <div className="clients-chart-legend"><span><i /> Khối lượng (lượng)</span><span><i /> Số hợp đồng</span></div>
          </section>
          <section className="clients-panel" aria-labelledby="volumes-title">
            <h3 id="volumes-title" className="clients-panel-title">Khối lượng theo trạng thái</h3>
            <div className="clients-volume-chart">{volumes.map((item) => <div className="clients-volume-row" key={item.status}><span>{statusLabels[item.status]}</span><div className="clients-volume-track"><div className={`clients-volume-fill clients-volume-${item.status}`} style={{ width: `${totalQuantity ? item.value / totalQuantity * 100 : 0}%` }} /></div><strong>{number(item.value)} lượng</strong></div>)}</div>
          </section>
        </div>

        <section className="clients-panel" aria-labelledby="schedule-title">
          <div className="clients-panel-title clients-panel-toolbar"><h3 id="schedule-title">Lịch nhận hàng sắp tới</h3><button type="button" onClick={() => { setSearch(''); setTab('list') }}>Xem tất cả →</button></div>
          <div className="clients-table-wrap"><table className="clients-table">
            <thead><tr><th>Ngày dự kiến nhận</th><th>Giờ dự kiến</th><th>Client</th><th>Mã hợp đồng</th><th className="clients-numeric">Số lượng</th><th className="clients-numeric">Đã thanh toán</th><th><span className="clients-sr-only">Thao tác</span></th></tr></thead>
            <tbody>{schedule.map((item) => {
              const client = mockClients.find((client) => client.id === item.clientId)!
              return <tr key={item.id}><td><strong>{date(item.deliveryDate!)}</strong></td><td>{item.deliveryTime}</td><td><strong>{client.name}</strong></td><td>{item.id}</td><td className="clients-numeric">{item.quantity} lượng</td><td className="clients-numeric">{money(item.paid)}</td><td><button type="button" onClick={() => setSelectedClient(client)}>Chi tiết →</button></td></tr>
            })}</tbody>
          </table>{!schedule.length && <p className="clients-empty">Không có lịch nhận hàng trong kỳ đã chọn.</p>}</div>
        </section>
      </div> : <section className="clients-panel" aria-labelledby="list-title">
        <div className="clients-panel-title clients-panel-toolbar"><h3 id="list-title">{tab === 'favorites' ? 'Clients yêu thích' : 'Danh sách clients'} ({filteredClients.length})</h3><input type="search" aria-label="Tìm client theo tên, email hoặc điện thoại" placeholder="Tìm tên, email, điện thoại..." value={search} onChange={(event) => setSearch(event.target.value)} /></div>
        <div className="clients-table-wrap"><table className="clients-table">
          <thead><tr><th>Client</th><th>Email</th><th>Điện thoại</th><th className="clients-numeric">Hợp đồng</th><th className="clients-numeric">Khối lượng</th><th>Yêu thích</th><th><span className="clients-sr-only">Thao tác</span></th></tr></thead>
          <tbody>{filteredClients.map((client) => {
            const items = contracts.filter((item) => item.clientId === client.id)
            return <tr key={client.id}><td><strong>{client.name}</strong></td><td>{client.email}</td><td>{client.phone}</td><td className="clients-numeric">{items.length}</td><td className="clients-numeric">{sum(items, 'quantity')} lượng</td><td><button type="button" className="clients-favorite" aria-label={`Yêu thích ${client.name}`} aria-pressed={favorites.includes(client.id)} onClick={() => toggleFavorite(client.id)}>{favorites.includes(client.id) ? '★' : '☆'}</button></td><td><button type="button" onClick={() => setSelectedClient(client)}>Chi tiết →</button></td></tr>
          })}</tbody>
        </table>{!filteredClients.length && <p className="clients-empty">{tab === 'favorites' ? 'Chưa có client yêu thích phù hợp. Nhấn ☆ trong danh sách để thêm.' : 'Không tìm thấy client phù hợp.'}</p>}</div>
      </section>}

      <dialog ref={dialogRef} className="clients-dialog" aria-labelledby="client-detail-title" onClose={() => setSelectedClient(null)}>
        {selectedClient && (
          <ClientDetails
            key={selectedClient.id}
            client={{ ...selectedClient, ...mockProfiles[selectedClient.id] }}
            contracts={mockContracts.filter((item) => item.clientId === selectedClient.id)}
            isFavorite={favorites.includes(selectedClient.id)}
            reason={trackingReasons[selectedClient.id]}
            onToggleFavorite={() => toggleFavorite(selectedClient.id)}
            onSaveReason={(reason) => setTrackingReasons((current) => ({ ...current, [selectedClient.id]: reason }))}
            onClose={() => setSelectedClient(null)}
          />
        )}
      </dialog>
    </section>
  )
}

export default Clients
