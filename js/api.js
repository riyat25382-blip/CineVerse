const API = {

  // Generic fetch wrapper — used by ALL functions below
  async get(endpoint, params = {}) {
    const url = new URL(`${CONFIG.BASE_URL}${endpoint}`);
    url.searchParams.set('api_key', CONFIG.API_KEY);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`TMDB Error ${res.status}: ${res.statusText}`);
    return res.json();
  },

  getTrending(page = 1) { return this.get('/trending/all/week', { page }); },
  getPopularMovies(page = 1) { return this.get('/movie/popular', { page }); },
  getPopularTV(page = 1) { return this.get('/tv/popular', { page }); },

  getAnime(page = 1) {
    return this.get('/discover/tv', {
      page,
      with_genres: CONFIG.ANIME_GENRE_ID,
      with_origin_country: 'JP',
      sort_by: 'popularity.desc',
    });
  },

  searchMovies(query, page = 1) { return this.get('/search/movie', { query, page }); },
  searchTV(query, page = 1)     { return this.get('/search/tv',    { query, page }); },
  searchMulti(query, page = 1)  { return this.get('/search/multi', { query, page }); },

  getMovieDetails(id) { return this.get(`/movie/${id}`, { append_to_response: 'videos,credits' }); },
  getTVDetails(id)    { return this.get(`/tv/${id}`,    { append_to_response: 'videos,credits' }); },

  async getMovieGenres() { const data = await this.get('/genre/movie/list'); return data.genres || []; },
  async getTVGenres()    { const data = await this.get('/genre/tv/list');    return data.genres || []; },
};