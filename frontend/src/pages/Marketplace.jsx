import { useEffect, useState } from 'react';
import api from '../utils/api.js';

export default function Marketplace() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTheirSlot, setSelectedTheirSlot] = useState(null);
  const [mySwappable, setMySwappable] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  async function loadMarketplace() {
    setLoading(true);
    try {
      const res = await api.get('/api/swaps/swappable-slots');
      setEvents(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMarketplace();
  }, []);

  async function openModal(theirSlot) {
    setSelectedTheirSlot(theirSlot);
    setError('');
    try {
      const res = await api.get('/api/events');
      setMySwappable(res.data.filter(e => e.status === 'SWAPPABLE'));
      setModalOpen(true);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load your slots');
    }
  }

  async function requestSwap(mySlotId) {
    if (!selectedTheirSlot) return;
    setSubmitting(true);
    setError('');
    try {
      await api.post('/api/swaps/swap-request', {
        mySlotId,
        theirSlotId: selectedTheirSlot._id
      });
      setModalOpen(false);
      setSelectedTheirSlot(null);
      await loadMarketplace();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to request swap');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Marketplace</h1>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : events.length === 0 ? (
        <p className="text-gray-600">No swappable slots available right now.</p>
      ) : (
        <ul className="space-y-2">
          {events.map(e => (
            <li key={e._id} className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-xs font-semibold">{String(e.userId)?.slice(-2) || '?'}</span>
                    {e.title}
                  </div>
                  <div className="text-sm text-gray-600">{new Date(e.startTime).toLocaleString()} → {new Date(e.endTime).toLocaleString()}</div>
                </div>
                <button
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  onClick={() => openModal(e)}
                >
                  Request Swap
                </button>
              </div>
            </li>)
          )}
        </ul>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-lg w-full p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Select one of your swappable slots</h2>
              <button className="text-gray-500" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            {mySwappable.length === 0 ? (
              <p className="text-sm text-gray-600">You have no SWAPPABLE slots. Mark one swappable on the Dashboard.</p>
            ) : (
              <ul className="space-y-2 max-h-64 overflow-auto">
                {mySwappable.map(s => (
                  <li key={s._id} className="p-3 border rounded flex items-center justify-between">
                    <div>
                      <div className="font-medium">{s.title}</div>
                      <div className="text-sm text-gray-600">{new Date(s.startTime).toLocaleString()} → {new Date(s.endTime).toLocaleString()}</div>
                    </div>
                    <button
                      className="bg-emerald-600 text-white px-3 py-1 rounded disabled:opacity-50"
                      onClick={() => requestSwap(s._id)}
                      disabled={submitting}
                    >
                      {submitting ? 'Sending...' : 'Choose'}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


