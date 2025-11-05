import { useEffect, useState } from 'react';

export default function DarkModeToggle() {
  const [enabled, setEnabled] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    const root = document.documentElement;
    if (enabled) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [enabled]);

  return (
    <button
      onClick={() => setEnabled(v => !v)}
      className="ml-2 px-3 py-2 text-sm rounded border hover:bg-gray-50"
      title="Toggle theme"
    >
      {enabled ? '🌙' : '☀️'}
    </button>
  );
}


