import { useEffect, useState } from 'react';
import api from '../utils/api.js';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge.jsx';

export default function Requests() {
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState('');
  const navigate = useNavigate();

  async function load() {
    setError('');
    setLoading(true);
    try {
      const [inc, out] = await Promise.all([
        api.get('/api/swaps/requests?type=incoming'),
        api.get('/api/swaps/requests?type=outgoing')
      ]);
      setIncoming(inc.data);
      setOutgoing(out.data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function respond(id, accepted) {
    setSubmittingId(id);
    setError('');
    try {
      await api.post(`/api/swaps/swap-response/${id}`, { accepted });
      await load();
      if (accepted) {
        // After accepting, refresh dashboard view/state
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Action failed');
    } finally {
      setSubmittingId('');
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Requests</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
          <h2 className="font-semibold mb-3">Incoming Requests</h2>
          {incoming.length === 0 ? (
            <p className="text-sm text-gray-600">No incoming requests.</p>
          ) : (
            <ul className="space-y-3">
              {incoming.map(r => (
                <li key={r._id} className="border dark:border-gray-700 rounded-xl p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="text-sm text-gray-700">
                    <div className="font-medium mb-1">They want to swap:</div>
                    <div>Their: <span className="font-medium">{r.mySlotId?.title}</span></div>
                    <div>For your: <span className="font-medium">{r.theirSlotId?.title}</span></div>
                    <div className="mt-2"><StatusBadge status={r.status} /></div>
                  </div>
                  {r.status === 'PENDING' && (
                    <div className="mt-3 flex gap-2">
                      <button
                        className="text-sm bg-emerald-600 text-white px-3 py-1 rounded disabled:opacity-50"
                        onClick={() => respond(r._id, true)}
                        disabled={submittingId === r._id}
                      >
                        {submittingId === r._id ? 'Processing...' : 'Accept'}
                      </button>
                      <button
                        className="text-sm bg-red-600 text-white px-3 py-1 rounded disabled:opacity-50"
                        onClick={() => respond(r._id, false)}
                        disabled={submittingId === r._id}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
          <h2 className="font-semibold mb-3">Outgoing Requests</h2>
          {outgoing.length === 0 ? (
            <p className="text-sm text-gray-600">No outgoing requests.</p>
          ) : (
            <ul className="space-y-3">
              {outgoing.map(r => (
                <li key={r._id} className="border dark:border-gray-700 rounded-xl p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="text-sm text-gray-700">
                    <div className="font-medium mb-1">You requested:</div>
                    <div>Your: <span className="font-medium">{r.mySlotId?.title}</span></div>
                    <div>Their: <span className="font-medium">{r.theirSlotId?.title}</span></div>
                    <div className="mt-2"><StatusBadge status={r.status} /></div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      )}
    </div>
  );
}


