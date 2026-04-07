const API = {
 
  // ── Generic fetch wrapper ──────────────────
  async get(endpoint, params = {}) {
    const url = new URL(`${CONFIG.BASE_URL}${endpoint}`);
    url.searchParams.set('api_key', CONFIG.API_KEY);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
 
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`TMDB Error ${res.status}: ${res.statusText}`);
    return res.json();
  },
 
  // ── Content endpoints ──────────────────────
  getTrending(page = 1) {
    return this.get('/trending/all/week', { page });
  },
 
  getPopularMovies(page = 1) {
    return this.get('/movie/popular', { page });
  },
 
  getPopularTV(page = 1) {
    return this.get('/tv/popular', { page });
  },
 
  getAnime(page = 1) {
    // Anime = TV + Animation genre (16) + Japanese origin
    return this.get('/discover/tv', {
      page,
      with_genres: CONFIG.ANIME_GENRE_ID,
      with_origin_country: 'JP',
      sort_by: 'popularity.desc',
    });
  },
 
  searchMovies(query, page = 1) {
    return this.get('/search/movie', { query, page });
  },
 
  searchTV(query, page = 1) {
    return this.get('/search/tv', { query, page });
  },
 
  searchMulti(query, page = 1) {
    return this.get('/search/multi', { query, page });
  },
 
  // ── Details & Trailers ─────────────────────
  getMovieDetails(id) {
    return this.get(`/movie/${id}`, { append_to_response: 'videos,credits' });
  },
 
  getTVDetails(id) {
    return this.get(`/tv/${id}`, { append_to_response: 'videos,credits' });
  },
 
  getTrailerKey(videos) {
    if (!videos || !videos.results) return null;
    // Prefer official YouTube trailers
    const trailer = videos.results.find(
      v => v.site === 'YouTube' && v.type === 'Trailer' && v.official
    ) || videos.results.find(
      v => v.site === 'YouTube' && v.type === 'Trailer'
    ) || videos.results.find(
      v => v.site === 'YouTube'
    );
    return trailer ? trailer.key : null;
  },
 
  // ── Genres ────────────────────────────────
  async getMovieGenres() {
    const data = await this.get('/genre/movie/list');
    return data.genres || [];
  },
 
  async getTVGenres() {
    const data = await this.get('/genre/tv/list');
    return data.genres || [];
  },
 
};