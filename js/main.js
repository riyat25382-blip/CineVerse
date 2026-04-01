const State = {
  currentType:  'trending',
  currentPage:  1,
  totalPages:   1,
  allItems:     [],
  favorites:    [],
  genres:       [],
  searchQuery:  '',
  filters: {
    genre:    '',
    year:     '',
    rating:   '',
    sort:     'popularity',
  },
};

const Store = {
  KEY_FAV:   'cineverse_favorites',
  KEY_THEME: 'cineverse_theme',

  loadFavorites() {
    try { return JSON.parse(localStorage.getItem(this.KEY_FAV)) || []; }
    catch { return []; }
  },
  saveFavorites(favs) { localStorage.setItem(this.KEY_FAV, JSON.stringify(favs)); },
  loadTheme() { return localStorage.getItem(this.KEY_THEME) || 'dark'; },
  saveTheme(theme) { localStorage.setItem(this.KEY_THEME, theme); },
};

function debounce(fn, delay) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
}

async function loadContent(type = State.currentType, page = 1) {
  UI.showLoader(true);
  State.currentType = type;
  State.currentPage = page;

  if (type === 'favorites') {
    const favs = State.favorites;
    if (favs.length === 0) {
      UI.renderFavoritesEmpty();
      UI.updateMeta(0, 'favorites');
      document.getElementById('pagination').innerHTML = '';
      return;
    }
    const filtered = Filters.applyAll(favs, {
      query: State.searchQuery, genre: State.filters.genre,
      year: State.filters.year, rating: State.filters.rating, sortKey: State.filters.sort,
    });
    UI.renderCards(filtered, State.favorites);
    UI.updateMeta(filtered.length, 'favorites');
    document.getElementById('pagination').innerHTML = '';
    UI.populateYears(Filters.extractYears(favs));
    return;
  }

  try {
    let data;
    if (State.searchQuery.trim()) {
      if (type === 'movie')                       data = await API.searchMovies(State.searchQuery, page);
      else if (type === 'tv' || type === 'anime') data = await API.searchTV(State.searchQuery, page);
      else                                        data = await API.searchMulti(State.searchQuery, page);
    } else {
      if (type === 'trending')   data = await API.getTrending(page);
      else if (type === 'movie') data = await API.getPopularMovies(page);
      else if (type === 'tv')    data = await API.getPopularTV(page);
      else if (type === 'anime') data = await API.getAnime(page);
    }

    State.allItems   = data.results || [];
    State.totalPages = data.total_pages || 1;

    UI.populateYears(Filters.extractYears(State.allItems));

    const filtered = Filters.applyAll(State.allItems, {
      query: '', genre: State.filters.genre,
      year: State.filters.year, rating: State.filters.rating, sortKey: State.filters.sort,
    });

    UI.renderCards(filtered, State.favorites);
    UI.updateMeta(data.total_results || filtered.length, type);
    UI.renderPagination(page, State.totalPages, (p) => loadContent(type, p));

    if (page > 1) document.querySelector('.filters-bar').scrollIntoView({ behavior: 'smooth' });

  } catch (err) {
    console.error('Error:', err);
    UI.showEmpty('Something went wrong. Check your API key in js/config.js');
  }
}

async function openDetails(item) {
  const isMovie = item.media_type === 'movie' || (item.title && !item.name);
  try {
    const details = isMovie ? await API.getMovieDetails(item.id) : await API.getTVDetails(item.id);
    const isFav = State.favorites.some(f => f.id === details.id);
    UI.openModal(UI.buildModalHTML(details, isFav));
    window._modalItem = { ...item, ...details };
  } catch (err) {
    UI.showToast('Could not load details', 'removed');
  }
}

function toggleFavorite(item) {
  const exists = State.favorites.some(f => f.id === item.id);
  if (exists) {
    State.favorites = State.favorites.filter(f => f.id !== item.id);
    UI.showToast('Removed from favorites', 'removed');
  } else {
    State.favorites = [...State.favorites, item];
    UI.showToast('Added to favorites ❤️', 'success');
  }
  Store.saveFavorites(State.favorites);
  return !exists;
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.getElementById('themeToggle').querySelector('.theme-icon').textContent =
    theme === 'dark' ? '☀' : '☾';
  Store.saveTheme(theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

async function loadGenres(type) {
  try {
    let genres = [];
    if (type === 'movie')                       genres = await API.getMovieGenres();
    else if (type === 'tv' || type === 'anime') genres = await API.getTVGenres();
    else {
      const [mg, tg] = await Promise.all([API.getMovieGenres(), API.getTVGenres()]);
      genres = [...mg, ...tg.filter(t => !mg.find(m => m.id === t.id))];
    }
    State.genres = genres;
    const sel = document.getElementById('genreFilter');
    while (sel.options.length > 1) sel.remove(1);
    UI.populateGenres(genres);
  } catch (err) {
    console.error('Genre load error:', err);
  }
}

function switchTab(type) {
  State.currentType = type;
  State.currentPage = 1;
  State.searchQuery = '';
  document.getElementById('searchInput').value = '';
  document.getElementById('searchClear').classList.remove('visible');

  document.querySelectorAll('.tab-btn, .mobile-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.type === type);
  });

  State.filters = { genre: '', year: '', rating: '', sort: 'popularity' };
  document.getElementById('genreFilter').value  = '';
  document.getElementById('yearFilter').value   = '';
  document.getElementById('ratingFilter').value = '';
  document.getElementById('sortFilter').value   = 'popularity';

  loadGenres(type);
  loadContent(type, 1);
}

document.addEventListener('DOMContentLoaded', async () => {

  State.favorites = Store.loadFavorites();
  applyTheme(Store.loadTheme());

  await loadGenres('trending');
  loadContent('trending', 1);

  // Search
  const handleSearch = debounce((query) => {
    State.searchQuery = query;
    State.currentPage = 1;
    loadContent(State.currentType, 1);
  }, 450);

  document.getElementById('searchInput').addEventListener('input', (e) => {
    const val = e.target.value;
    document.getElementById('searchClear').classList.toggle('visible', val.length > 0);
    handleSearch(val);
  });

  document.getElementById('searchClear').addEventListener('click', () => {
    document.getElementById('searchInput').value = '';
    document.getElementById('searchClear').classList.remove('visible');
    State.searchQuery = '';
    loadContent(State.currentType, 1);
  });

  // Filters
  document.getElementById('genreFilter').addEventListener('change', (e) => {
    State.filters.genre = e.target.value;
    const filtered = Filters.applyAll(State.allItems, {
      query: '', genre: State.filters.genre,
      year: State.filters.year, rating: State.filters.rating, sortKey: State.filters.sort,
    });
    UI.renderCards(filtered, State.favorites);
    UI.updateMeta(filtered.length, State.currentType);
  });

  document.getElementById('yearFilter').addEventListener('change', (e) => {
    State.filters.year = e.target.value;
    const filtered = Filters.applyAll(State.allItems, {
      query: '', genre: State.filters.genre,
      year: State.filters.year, rating: State.filters.rating, sortKey: State.filters.sort,
    });
    UI.renderCards(filtered, State.favorites);
    UI.updateMeta(filtered.length, State.currentType);
  });

  document.getElementById('ratingFilter').addEventListener('change', (e) => {
    State.filters.rating = e.target.value;
    const filtered = Filters.applyAll(State.allItems, {
      query: '', genre: State.filters.genre,
      year: State.filters.year, rating: State.filters.rating, sortKey: State.filters.sort,
    });
    UI.renderCards(filtered, State.favorites);
    UI.updateMeta(filtered.length, State.currentType);
  });

  document.getElementById('sortFilter').addEventListener('change', (e) => {
    State.filters.sort = e.target.value;
    const filtered = Filters.applyAll(State.allItems, {
      query: '', genre: State.filters.genre,
      year: State.filters.year, rating: State.filters.rating, sortKey: State.filters.sort,
    });
    UI.renderCards(filtered, State.favorites);
    UI.updateMeta(filtered.length, State.currentType);
  });

  document.getElementById('resetFilters').addEventListener('click', () => {
    State.filters = { genre: '', year: '', rating: '', sort: 'popularity' };
    document.getElementById('genreFilter').value  = '';
    document.getElementById('yearFilter').value   = '';
    document.getElementById('ratingFilter').value = '';
    document.getElementById('sortFilter').value   = 'popularity';
    UI.renderCards(State.allItems, State.favorites);
    UI.updateMeta(State.allItems.length, State.currentType);
  });

  // Tabs
  document.querySelectorAll('.tab-btn, .mobile-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.type));
  });

  // Theme
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);

  // Card clicks
  document.getElementById('contentGrid').addEventListener('click', async (e) => {
    const card = e.target.closest('.card');
    if (!card) return;
    const action = e.target.dataset.action;
    const itemId = parseInt(card.dataset.id);
    const item = State.allItems.find(i => i.id === itemId)
               || State.favorites.find(i => i.id === itemId);
    if (!item) return;

    if (action === 'fav') {
      const nowFav = toggleFavorite(item);
      e.target.textContent = nowFav ? '♥' : '♡';
      e.target.classList.toggle('favorited', nowFav);
      if (State.currentType === 'favorites') loadContent('favorites', 1);
    } else {
      openDetails(item);
    }
  });

  // Modal
  document.getElementById('modalClose').addEventListener('click', UI.closeModal.bind(UI));
  document.getElementById('modalOverlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modalOverlay')) UI.closeModal();
  });

  document.getElementById('modalInner').addEventListener('click', (e) => {
    if (e.target.id === 'modalFavBtn') {
      const item = window._modalItem;
      if (!item) return;
      const nowFav = toggleFavorite(item);
      e.target.textContent = nowFav ? '♥ Remove from Favorites' : '♡ Add to Favorites';
      e.target.classList.toggle('active', nowFav);
      if (State.currentType === 'favorites') loadContent('favorites', 1);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') UI.closeModal();
  });

  // Spotlight
  const spotlight = document.getElementById('spotlight');
  document.addEventListener('mousemove', (e) => {
    spotlight.style.left = e.clientX + 'px';
    spotlight.style.top  = e.clientY + 'px';
  });

});

// Mobile tabs
document.body.insertAdjacentHTML('beforeend', `
  <div class="mobile-tabs">
    <button class="mobile-tab-btn active" data-type="trending">⚡<span class="label">Trending</span></button>
    <button class="mobile-tab-btn" data-type="movie">🎬<span class="label">Movies</span></button>
    <button class="mobile-tab-btn" data-type="tv">📺<span class="label">TV</span></button>
    <button class="mobile-tab-btn" data-type="anime">🌸<span class="label">Anime</span></button>
    <button class="mobile-tab-btn" data-type="favorites">❤️<span class="label">Saved</span></button>
  </div>
`);