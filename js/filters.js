const Filters = {
 
  // ── Search by title ─────────────────────
  // HOF used: Array.filter
  bySearch(items, query) {
    if (!query || !query.trim()) return items;
    const q = query.toLowerCase().trim();
    return items.filter(item => {
      const title = (item.title || item.name || '').toLowerCase();
      const original = (item.original_title || item.original_name || '').toLowerCase();
      return title.includes(q) || original.includes(q);
    });
  },
 
  // ── Filter by genre id ───────────────────
  // HOF used: Array.filter
  byGenre(items, genreId) {
    if (!genreId) return items;
    const id = parseInt(genreId);
    return items.filter(item =>
      item.genre_ids && item.genre_ids.includes(id)
    );
  },
 
  // ── Filter by release year ───────────────
  // HOF used: Array.filter
  byYear(items, year) {
    if (!year) return items;
    return items.filter(item => {
      const date = item.release_date || item.first_air_date || '';
      return date.startsWith(year);
    });
  },
 
  // ── Filter by minimum rating ─────────────
  // HOF used: Array.filter
  byRating(items, minRating) {
    if (!minRating) return items;
    const min = parseFloat(minRating);
    return items.filter(item => item.vote_average >= min);
  },
 
  // ── Sort results ─────────────────────────
  // HOF used: Array.sort (with spread to avoid mutation)
  sort(items, sortKey) {
    const sorted = [...items]; // copy so original isn't mutated
 
    switch (sortKey) {
      case 'popularity':
        return sorted.sort((a, b) => b.popularity - a.popularity);
 
      case 'rating':
        return sorted.sort((a, b) => b.vote_average - a.vote_average);
 
      case 'date_desc':
        return sorted.sort((a, b) => {
          const da = new Date(a.release_date || a.first_air_date || 0);
          const db = new Date(b.release_date || b.first_air_date || 0);
          return db - da;
        });
 
      case 'date_asc':
        return sorted.sort((a, b) => {
          const da = new Date(a.release_date || a.first_air_date || 0);
          const db = new Date(b.release_date || b.first_air_date || 0);
          return da - db;
        });
 
      case 'title_asc':
        return sorted.sort((a, b) => {
          const ta = (a.title || a.name || '').toLowerCase();
          const tb = (b.title || b.name || '').toLowerCase();
          return ta.localeCompare(tb);
        });
 
      case 'title_desc':
        return sorted.sort((a, b) => {
          const ta = (a.title || a.name || '').toLowerCase();
          const tb = (b.title || b.name || '').toLowerCase();
          return tb.localeCompare(ta);
        });
 
      default:
        return sorted;
    }
  },
 
  // ── Apply all filters in sequence ────────
  // HOF pipeline: filter → filter → filter → sort
  applyAll(items, { query, genre, year, rating, sortKey }) {
    return this.sort(
      this.byRating(
        this.byYear(
          this.byGenre(
            this.bySearch(items, query),
            genre
          ),
          year
        ),
        rating
      ),
      sortKey
    );
  },
 
  // ── Extract unique years from results ────
  // HOF used: map + filter (via Set dedup)
  extractYears(items) {
    const years = items
      .map(item => {
        const date = item.release_date || item.first_air_date || '';
        return date.substring(0, 4);
      })
      .filter(y => y && y.length === 4);
 
    return [...new Set(years)].sort((a, b) => b - a);
  },
 
};
 