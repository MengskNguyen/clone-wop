import { useState } from 'react'

type ClientDetailsProps = {
  client: {
    name: string
    email: string
    userId: string
    vip: number
    note: string
    reviewFlag: string
  }
  contracts: {
    openedAt: string
    quantity: number
    status: 'open' | 'waiting' | 'received' | 'resold'
  }[]
  isFavorite: boolean
  reason: string
  onToggleFavorite: () => void
  onSaveReason: (reason: string) => void
  onClose: () => void
}

const statuses = [
  { id: 'open', label: 'Chưa tất toán' },
  { id: 'waiting', label: 'Chờ nhận hàng' },
  { id: 'received', label: 'Đã nhận hàng' },
  { id: 'resold', label: 'Đã bán lại' },
] as const

function ClientDetails({ client, contracts, isFavorite, reason, onToggleFavorite, onSaveReason, onClose }: ClientDetailsProps) {
  const [copyMessage, setCopyMessage] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [draftReason, setDraftReason] = useState(reason)
  const totalQuantity = contracts.reduce((total, contract) => total + contract.quantity, 0)
  const firstOpenedAt = contracts.map((contract) => contract.openedAt).sort()[0]

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(client.email)
      setCopyMessage('Đã sao chép email.')
    } catch {
      setCopyMessage('Không thể sao chép tự động. Bạn có thể chọn và sao chép email.')
    }
  }

  return (
    <>
      <div className="clients-detail-heading">
        <h3 id="client-detail-title">{client.name}</h3>
        <button type="button" aria-label="Đóng chi tiết" onClick={onClose} autoFocus>×</button>
      </div>
      <p className="clients-detail-subtitle">
        {client.userId} · VIP {client.vip} · {client.email} · Tổng {totalQuantity.toLocaleString('vi-VN')} lượng / {contracts.length} HĐ
      </p>

      <div className="clients-detail-summary">
        {statuses.map((status) => {
          const items = contracts.filter((contract) => contract.status === status.id)
          const quantity = items.reduce((total, contract) => total + contract.quantity, 0)

          return (
            <article className="clients-detail-stat" key={status.id}>
              <span>{status.label}</span>
              <strong>{quantity.toLocaleString('vi-VN')} lượng</strong>
              <small>{items.length} hợp đồng</small>
            </article>
          )
        })}
      </div>

      <section className="clients-detail-panel" aria-labelledby="client-info-title">
        <h4 id="client-info-title">Thông tin khách hàng</h4>
        <dl className="clients-detail-fields">
          <div><dt>Họ và tên:</dt><dd>{client.name}</dd></div>
          <div><dt>User ID:</dt><dd>{client.userId}</dd></div>
          <div>
            <dt>Email:</dt>
            <dd className="clients-detail-email">
              <span>{client.email}</span>
              <button type="button" className="clients-copy-email" aria-label="Sao chép email" onClick={() => void copyEmail()}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                  <rect x="8" y="3" width="12" height="15" rx="2" />
                  <path d="M16 18v3H4V6h4" />
                </svg>
              </button>
            </dd>
          </div>
          <div><dt>Cấp VIP:</dt><dd>VIP {client.vip}</dd></div>
          <div><dt>Mở HĐ đầu tiên:</dt><dd>{firstOpenedAt ? firstOpenedAt.split('-').reverse().join('/') : 'Chưa có hợp đồng'}</dd></div>
          <div><dt>Tổng HĐ:</dt><dd>{contracts.length}</dd></div>
        </dl>
        {copyMessage && <p className="clients-copy-message" role="status">{copyMessage}</p>}
      </section>

      <section className="clients-detail-panel" aria-labelledby="client-tracking-title">
        <div className="clients-detail-panel-heading">
          <h4 id="client-tracking-title">Theo dõi nội bộ</h4>
          <button type="button" className="clients-detail-star" aria-label={`Yêu thích ${client.name}`} aria-pressed={isFavorite} onClick={onToggleFavorite}>
            {isFavorite ? '★' : '☆'}
          </button>
        </div>
        <dl className="clients-detail-fields">
          <div><dt>Trạng thái theo dõi:</dt><dd>{isFavorite ? <><span className="clients-detail-star-symbol">★</span>Yêu thích</> : 'Chưa yêu thích'}</dd></div>
          <div><dt>Cờ rà soát:</dt><dd>{client.reviewFlag}</dd></div>
          <div><dt>Ghi chú:</dt><dd>{client.note}</dd></div>
          <div><dt>Lý do yêu thích:</dt><dd>{reason || 'Chưa có'}</dd></div>
        </dl>

        {isEditing ? (
          <form className="clients-reason-form" onSubmit={(event) => {
            event.preventDefault()
            onSaveReason(draftReason.trim())
            setIsEditing(false)
          }}>
            <label htmlFor="client-tracking-reason">Lý do theo dõi</label>
            <textarea id="client-tracking-reason" value={draftReason} onChange={(event) => setDraftReason(event.target.value)} rows={3} maxLength={500} />
            <div>
              <button type="submit">Lưu</button>
              <button type="button" onClick={() => setIsEditing(false)}>Hủy</button>
            </div>
            <small>Thay đổi lưu tạm trong phiên, mất khi tải lại trang.</small>
          </form>
        ) : (
          <button type="button" className="clients-edit-reason" onClick={() => { setDraftReason(reason); setIsEditing(true) }}>
            Sửa lý do theo dõi
          </button>
        )}
      </section>
    </>
  )
}

export default ClientDetails
