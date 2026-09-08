'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NavbarSearch() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="search-bar-mock" style={{ cursor: 'text' }} suppressHydrationWarning>
      <input
        type="text"
        placeholder="ค้นหาข่าวไซเบอร์..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        suppressHydrationWarning
      />
      <button type="submit" aria-label="ค้นหา" suppressHydrationWarning>
        🔍
      </button>
    </form>
  );
}
