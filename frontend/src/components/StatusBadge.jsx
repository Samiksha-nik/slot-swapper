export default function StatusBadge({ status }) {
  const map = {
    BUSY: { text: 'BUSY', cls: 'bg-red-100 text-red-700 border-red-200' },
    SWAPPABLE: { text: 'SWAPPABLE', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
    SWAP_PENDING: { text: 'SWAP PENDING', cls: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    ACCEPTED: { text: 'ACCEPTED', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    PENDING: { text: 'PENDING', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
    REJECTED: { text: 'REJECTED', cls: 'bg-rose-100 text-rose-700 border-rose-200' }
  };
  const s = map[status] || { text: status, cls: 'bg-gray-100 text-gray-700 border-gray-200' };
  return (
    <span className={`text-xs px-2 py-1 rounded border ${s.cls}`}>{s.text}</span>
  );
}


