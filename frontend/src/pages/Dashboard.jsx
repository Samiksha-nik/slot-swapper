import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../utils/api.js';
import StatusBadge from '../components/StatusBadge.jsx';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', startTime: '', endTime: '' });

  async function load() {
    setError('');
    setLoading(true);
    try {
      const res = await api.get('/api/events');
      setEvents(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function addEvent(e) {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        title: form.title,
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString()
      };
      await api.post('/api/events', payload);
      setForm({ title: '', startTime: '', endTime: '' });
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to add event');
    }
  }

  async function makeSwappable(id) {
    try {
      await api.put(`/api/events/${id}`, { status: 'SWAPPABLE' });
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update event');
    }
  }

  async function deleteEvent(id) {
    try {
      await api.delete(`/api/events/${id}`);
      setEvents(prev => prev.filter(e => e._id !== id));
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete event');
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">My Events</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">{user?.email}</span>
          <button className="text-sm text-red-600" onClick={logout}>Logout</button>
        </div>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={addEvent} className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-3 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg">
        <input
          type="text"
          placeholder="Title"
          className="border p-2 rounded"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
          required
        />
        <input
          type="datetime-local"
          className="border p-2 rounded"
          value={form.startTime}
          onChange={e => setForm({ ...form, startTime: e.target.value })}
          required
        />
        <input
          type="datetime-local"
          className="border p-2 rounded"
          value={form.endTime}
          onChange={e => setForm({ ...form, endTime: e.target.value })}
          required
        />
        <button className="bg-blue-600 text-white rounded px-4">Add Event</button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : events.length === 0 ? (
        <p className="text-gray-600">You have no events yet. Add one above.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map(evt => (
            <div key={evt._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{evt.title}</h3>
                <StatusBadge status={evt.status} />
              </div>
              <div className="text-sm text-gray-700">
                <div>{new Date(evt.startTime).toLocaleString()}</div>
                <div className="text-gray-500">→ {new Date(evt.endTime).toLocaleString()}</div>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  className="text-sm bg-emerald-600 text-white px-3 py-1 rounded disabled:opacity-50 hover:bg-emerald-700"
                  onClick={() => makeSwappable(evt._id)}
                  disabled={evt.status !== 'BUSY'}
                >
                  Make Swappable
                </button>
                <button
                  className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  onClick={() => deleteEvent(evt._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


