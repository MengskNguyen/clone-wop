import { useEffect, useRef, useState } from 'react'
import './AssetVerification.css'

type VerificationStatus = 'pending' | 'approved' | 'review' | 'deferred' | 'rejected'
type MatchResult = 'matched' | 'hng' | 'review'
type Assets = { vnd: number; gold: number; silver: number; hng: number }

// UI model for mock data; the database mapping will be added separately.
type VerificationRecord = {
  receipt: string
  submittedAt: string
  userId: string
  name: string
  phone: string
  email: string
  status: VerificationStatus
  similarity: number
  maxDifference: number
  result: MatchResult
  declared: Assets
  transferred: Assets
  withdrawn: Assets
}

const statuses: { id: VerificationStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'pending', label: 'Chờ duyệt' },
  { id: 'approved', label: 'Đã duyệt' },
  { id: 'review', label: 'Chờ rà soát' },
  { id: 'deferred', label: 'Tạm hoãn' },
  { id: 'rejected', label: 'Từ chối' },
]

const resultLabels: Record<MatchResult, string> = {
  matched: 'Khớp', hng: 'Khớp (HNG)', review: 'Chờ rà soát',
}

const assetColumns = [
  { id: 'vnd', label: 'VND' },
  { id: 'gold', label: 'Vàng', unit: 'chi' },
  { id: 'silver', label: 'Bạc', unit: 'chi' },
  { id: 'hng', label: 'HNG' },
] as const

const seeds = [
  ['HNS.0913.7JD8', '50454', 'Bùi Quang Tuấn', 0, 0.329, 24.513, 1.247],
  ['HNS.0913.08EK', '398512', 'Võ Thị Nhạn', 12774208, 0, 0, 1.187],
  ['HNS.0914.QSMP', '366129', 'Lê Công Minh', 0, 0.307, 32.327, 28.261],
  ['HNS.0914.DT37', '271413', 'Vũ Thị Luyến', 643315, 0, 0, 0],
  ['HNS.0914.QMXN', '304792', 'Nguyễn Công Nhật', 2513739, 16.994, 310.792, 924.979],
  ['HNS.0914.YGB0', '369516', 'Doãn Thị Ngọc Oanh', 25005795, 0, 3, 5.851],
  ['HNS.0914.0T52', '69791', 'Nguyễn Việt Anh', 918642130, 0, 0, 95.230],
  ['HNS.0914.3CNT', '322952', 'Phạm Khánh Trang', 413373997, 0, 800.8, 23.610],
  ['HNS.0914.K2RZ', '334425', 'Diệp Long Sơn', 17046841, 20, 1200, 3.434],
  ['HNS.0914.U0IV', '312515', 'Đàm Thị Thu Trang', 318010, 1.546, 97.662, 16.949],
  ['HNS.0914.WMR9', '69702', 'Lê Văn Thông', 992000, 1.687, 0, 165.571],
  ['HNS.0915.MA01', '10082', 'Nguyễn Minh Anh', 48000000, 12, 40, 25],
] as const

const mockStatuses: VerificationStatus[] = [
  'approved', 'approved', 'approved', 'approved', 'approved', 'approved',
  'approved', 'rejected', 'rejected', 'deferred', 'review', 'pending',
]

const mockRecords: VerificationRecord[] = seeds.map(([receipt, userId, name, vnd, gold, silver, hng], index) => {
  const declared = { vnd, gold, silver, hng }
  const withdrawn = { vnd: Math.floor(vnd * 0.2), gold: 0, silver: 0, hng: 0 }
  const transferred = { ...declared, vnd: vnd - withdrawn.vnd }
  const needsReview = index === 10

  return {
    receipt, userId, name, declared, withdrawn,
    transferred: needsReview ? { ...transferred, hng: 140.171 } : transferred,
    submittedAt: index === 0 ? '2026-09-13T19:29' : index === 1 ? '2026-09-13T22:06' : index === 11 ? '2026-09-15T09:00' : '2026-09-14T08:29',
    phone: `0900 000 ${String(index + 1).padStart(3, '0')}`,
    email: `client${index + 1}@example.com`,
    status: mockStatuses[index],
    similarity: needsReview ? 84.66 : 100,
    maxDifference: needsReview ? 15.34 : 0,
    result: needsReview ? 'review' : index === 1 || index === 4 ? 'matched' : 'hng',
  }
})

const formatAsset = (value: number, key: keyof Assets) => value.toLocaleString('vi-VN', {
  minimumFractionDigits: key === 'vnd' ? 0 : 3,
  maximumFractionDigits: key === 'vnd' ? 0 : 3,
})
const percent = (value: number) => `${value.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`
const formatDate = (value: string) => {
  const [day, time] = value.split('T')
  return `${day.split('-').reverse().join('/')} ${time}`
}
const statusLabel = (status: VerificationStatus) => statuses.find((item) => item.id === status)!.label

function AssetVerification() {
  const [status, setStatus] = useState<VerificationStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [result, setResult] = useState<MatchResult | 'all'>('all')
  const [sort, setSort] = useState('oldest')
  const [page, setPage] = useState(1)
  const [selectedRecord, setSelectedRecord] = useState<VerificationRecord | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const pageSize = 10

  useEffect(() => {
    if (selectedRecord) dialogRef.current?.showModal()
    else dialogRef.current?.close()
  }, [selectedRecord])

  const query = search.trim().toLocaleLowerCase('vi-VN')
  const filtered = mockRecords.filter((record) => {
    const submittedDate = record.submittedAt.slice(0, 10)
    return (status === 'all' || record.status === status) &&
      (result === 'all' || record.result === result) &&
      (!from || submittedDate >= from) && (!to || submittedDate <= to) &&
      `${record.receipt} ${record.userId} ${record.name} ${record.phone} ${record.email}`.toLocaleLowerCase('vi-VN').includes(query)
  }).sort((a, b) => sort === 'similarity' ? a.similarity - b.similarity :
    sort === 'newest' ? b.submittedAt.localeCompare(a.submittedAt) : a.submittedAt.localeCompare(b.submittedAt))
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize)
  const total = (group: 'declared' | 'transferred' | 'withdrawn', asset: keyof Assets) =>
    filtered.reduce((value, record) => value + record[group][asset], 0)

  function exportList() {
    const headers = ['Mã biên nhận', 'Ngày gửi', 'User ID', 'Khách hàng', 'Điện thoại', 'Email', 'Trạng thái', 'Tương đồng', 'Lệch lớn nhất', 'Kết quả', ...['Khai báo', 'Chuyển tiếp'].flatMap((group) => assetColumns.map((asset) => `${group} ${asset.label}`))]
    const values = filtered.map((record) => [record.receipt, formatDate(record.submittedAt), record.userId, record.name, record.phone, record.email, statusLabel(record.status), percent(record.similarity), percent(record.maxDifference), resultLabels[record.result], ...assetColumns.map((asset) => record.declared[asset.id]), ...assetColumns.map((asset) => record.transferred[asset.id])])
    const csv = [headers, ...values].map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'asset-verification-demo.csv'
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <section className="av-page" aria-labelledby="av-title">
      <div className="av-heading">
        <div>
          <h2 id="av-title">Danh sách xác nhận tài sản</h2>
          <p>Theo dõi hồ sơ, đối chiếu với Snapshot DB và thực hiện xét duyệt.</p>
        </div>
        <button type="button" className="av-button av-export" disabled={!filtered.length} onClick={exportList}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M12 3v12m-4-4 4 4 4-4M4 15v6h16v-6" /></svg>
          Xuất danh sách
        </button>
      </div>

      <nav className="av-tabs" aria-label="Trạng thái xác nhận tài sản">
        {statuses.map((item) => (
          <button type="button" key={item.id} aria-pressed={status === item.id} className={status === item.id ? 'is-active' : ''} onClick={() => { setStatus(item.id); setPage(1) }}>
            {item.label} ({(item.id === 'all' ? mockRecords.length : mockRecords.filter((record) => record.status === item.id).length).toLocaleString('vi-VN')})
          </button>
        ))}
      </nav>

      <div className="av-filters">
        <div className="av-search">
          <input type="search" aria-label="Tìm hồ sơ" placeholder="Tìm: mã, User ID, email, SĐT" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} />
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="10" cy="10" r="6" /><path d="m15 15 5 5" /></svg>
        </div>
        <div className="av-date-range">
          <input type="date" aria-label="Gửi từ ngày" value={from} max={to || undefined} onChange={(event) => { setFrom(event.target.value); setPage(1) }} />
          <span aria-hidden="true">→</span>
          <input type="date" aria-label="Gửi đến ngày" value={to} min={from || undefined} onChange={(event) => { setTo(event.target.value); setPage(1) }} />
        </div>
        <select aria-label="Kết quả đối chiếu" value={result} onChange={(event) => { setResult(event.target.value as MatchResult | 'all'); setPage(1) }}>
          <option value="all">Tất cả kết quả đối chiếu</option>
          <option value="matched">Khớp</option><option value="hng">Khớp (HNG)</option><option value="review">Chờ rà soát</option>
        </select>
        <select aria-label="Sắp xếp hồ sơ" value={sort} onChange={(event) => { setSort(event.target.value); setPage(1) }}>
          <option value="oldest">Ngày gửi: cũ nhất trước</option><option value="newest">Ngày gửi: mới nhất trước</option><option value="similarity">Tương đồng: thấp nhất trước</option>
        </select>
      </div>

      <div className="av-rule-note">
        <span><strong>Quy tắc xác thực tự động:</strong> Tương đồng từ 99% trở lên và chênh lệch của từng loại tài sản dưới 1%.</span>
        <span>Snapshot DB chỉ đọc · Không cập nhật dữ liệu gốc</span>
      </div>

      <div className="av-totals">
        {assetColumns.map((asset) => (
          <section className={`av-total av-total-${asset.id}`} key={asset.id} aria-label={`Tổng ${asset.label}`}>
            <h3><span className="av-asset-symbol" aria-hidden="true">{asset.id === 'vnd' ? '＄' : asset.id === 'hng' ? '⬡' : '❖'}</span>{asset.label}{'unit' in asset ? ` (${asset.unit})` : ''}</h3>
            <div className="av-total-values">
              <div><span>Khai báo</span><strong>{formatAsset(total('declared', asset.id), asset.id)}</strong></div>
              <div><span>Chuyển tiếp</span><strong>{formatAsset(total('transferred', asset.id), asset.id)}</strong></div>
              {asset.id !== 'hng' && <div><span>Đã rút đợt 1</span><strong>{formatAsset(total('withdrawn', asset.id), asset.id)}</strong></div>}
            </div>
          </section>
        ))}
        <section className="av-total av-withdraw-total"><h3><span aria-hidden="true">↓</span> Tổng đề nghị rút đợt 1</h3><strong>{formatAsset(total('withdrawn', 'vnd'), 'vnd')} VND</strong></section>
      </div>

      <div className="av-table-panel">
        <div className="av-table-scroll">
          <table className="av-table">
            <caption className="av-sr-only">Danh sách hồ sơ xác nhận tài sản, dữ liệu minh họa</caption>
            <thead>
              <tr>
                <th rowSpan={2} scope="col">Mã biên nhận</th>
                <th rowSpan={2} scope="col"><button type="button" className="av-sort-button" onClick={() => { setSort(sort === 'oldest' ? 'newest' : 'oldest'); setPage(1) }}>Ngày gửi <span aria-hidden="true">{sort === 'oldest' ? '▴' : sort === 'newest' ? '▾' : '↕'}</span></button></th>
                <th rowSpan={2} scope="col">User ID</th><th rowSpan={2} scope="col">Khách hàng</th><th rowSpan={2} scope="col">Điện thoại</th><th rowSpan={2} scope="col">Email</th><th rowSpan={2} scope="col">Trạng thái</th><th rowSpan={2} scope="col" className="av-numeric">Tương đồng</th><th rowSpan={2} scope="col" className="av-numeric">Lệch lớn nhất</th><th rowSpan={2} scope="col">Kết quả</th>
                <th colSpan={4} scope="colgroup" className="av-group-start">Khai báo</th><th colSpan={4} scope="colgroup" className="av-group-start">Chuyển tiếp</th><th rowSpan={2} scope="col" className="av-action-cell"><span className="av-sr-only">Thao tác</span></th>
              </tr>
              <tr>{['declared', 'transferred'].flatMap((group) => assetColumns.map((asset, index) => <th key={`${group}-${asset.id}`} scope="col" className={`av-numeric${index === 0 ? ' av-group-start' : ''}`}>{asset.label}</th>))}</tr>
            </thead>
            <tbody>
              {rows.map((record) => (
                <tr key={record.receipt}>
                  <td><strong>{record.receipt}</strong></td><td>{formatDate(record.submittedAt)}</td><td>{record.userId}</td><td><strong>{record.name}</strong></td><td>{record.phone}</td><td>{record.email}</td>
                  <td><span className={`av-badge av-status-${record.status}`}><i />{statusLabel(record.status)}</span></td>
                  <td className="av-numeric">{percent(record.similarity)}{record.result === 'hng' ? ' *' : ''}</td><td className="av-numeric">{percent(record.maxDifference)}{record.result === 'hng' ? ' *' : ''}</td>
                  <td><span className={`av-badge av-result-${record.result}`}><i />{resultLabels[record.result]}</span></td>
                  {(['declared', 'transferred'] as const).flatMap((group) => assetColumns.map((asset, index) => <td key={`${group}-${asset.id}`} className={`av-numeric${index === 0 ? ' av-group-start' : ''}`}>{formatAsset(record[group][asset.id], asset.id)}</td>))}
                  <td className="av-action-cell"><button type="button" className="av-button av-view" aria-label={`Xem hồ sơ ${record.receipt}`} onClick={() => setSelectedRecord(record)}>Xem</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && <p className="av-empty">Không có hồ sơ phù hợp với bộ lọc.</p>}
        </div>
        <div className="av-table-footer">
          <span>{filtered.length ? `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, filtered.length)} / ${filtered.length} hồ sơ` : '0 hồ sơ'} · Dữ liệu minh họa</span>
          <div><button type="button" className="av-button" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>Trước</button><span>Trang {page} / {pageCount}</span><button type="button" className="av-button" disabled={page >= pageCount} onClick={() => setPage((current) => current + 1)}>Sau</button></div>
        </div>
      </div>

      <dialog ref={dialogRef} className="av-dialog" aria-labelledby="av-detail-title" onClose={() => setSelectedRecord(null)}>
        {selectedRecord && <>
          <div className="av-detail-heading"><h3 id="av-detail-title">Hồ sơ {selectedRecord.receipt}</h3><button type="button" aria-label="Đóng chi tiết" onClick={() => setSelectedRecord(null)} autoFocus>×</button></div>
          <p>{selectedRecord.name} · User ID: {selectedRecord.userId}</p><p>{selectedRecord.email} · {selectedRecord.phone}</p>
          <p>Ngày gửi: {formatDate(selectedRecord.submittedAt)} · {statusLabel(selectedRecord.status)}</p>
          <div className="av-detail-result"><span className={`av-badge av-result-${selectedRecord.result}`}><i />{resultLabels[selectedRecord.result]}</span><span>Tương đồng: {percent(selectedRecord.similarity)} · Lệch lớn nhất: {percent(selectedRecord.maxDifference)}</span></div>
          <div className="av-table-scroll"><table className="av-table av-detail-table"><thead><tr><th scope="col">Tài sản</th><th scope="col" className="av-numeric">Khai báo</th><th scope="col" className="av-numeric">Chuyển tiếp</th><th scope="col" className="av-numeric">Đã rút đợt 1</th></tr></thead><tbody>{assetColumns.map((asset) => <tr key={asset.id}><th scope="row">{asset.label}</th><td className="av-numeric">{formatAsset(selectedRecord.declared[asset.id], asset.id)}</td><td className="av-numeric">{formatAsset(selectedRecord.transferred[asset.id], asset.id)}</td><td className="av-numeric">{formatAsset(selectedRecord.withdrawn[asset.id], asset.id)}</td></tr>)}</tbody></table></div>
          <p className="av-detail-note">Dữ liệu minh họa · Chỉ xem thông tin hồ sơ.</p>
        </>}
      </dialog>
    </section>
  )
}

export default AssetVerification
