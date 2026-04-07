const UI = {
 
  // ── Show / hide loader ───────────────────
  showLoader(show) {
    document.getElementById('loader').style.display = show ? 'flex' : 'none';
    document.getElementById('contentGrid').style.display = show ? 'none' : 'grid';
    document.getElementById('emptyState').style.display = 'none';
  },
 
  // ── Show empty state ─────────────────────
  showEmpty(message = '') {
    document.getElementById('loader').style.display = 'none';
    document.getElementById('contentGrid').style.display = 'none';
    const el = document.getElementById('emptyState');
    el.style.display = 'flex';
    if (message) el.querySelector('p').textContent = message;
  },
 
  // ── Render all cards ─────────────────────
  renderCards(items, favorites) {
    const grid = document.getElementById('contentGrid');
    grid.innerHTML = '';
 
    if (!items || items.length === 0) {
      this.showEmpty();
      return;
    }
 
    // HOF: map items → HTML card elements
    const fragment = document.createDocumentFragment();
    items.map(item => this.createCard(item, favorites))
         .forEach((card, i) => {
           card.style.animationDelay = `${i * 0.04}s`;
           fragment.appendChild(card);
         });
 
    grid.appendChild(fragment);
    grid.style.display = 'grid';
    document.getElementById('loader').style.display = 'none';
    document.getElementById('emptyState').style.display = 'none';
  },
 
  // ── Single card ──────────────────────────
  createCard(item, favorites = []) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.id = item.id;
 
    const isMovie  = item.media_type === 'movie' || item.title;
    const isTv     = item.media_type === 'tv' || item.name;
    const title    = item.title || item.name || 'Untitled';
    const year     = (item.release_date || item.first_air_date || '').substring(0, 4);
    const rating   = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
    const poster   = item.poster_path ? `${CONFIG.IMG_W500}${item.poster_path}` : null;
    const isFav    = favorites.some(f => f.id === item.id);
 
    let typeLabel = 'MOVIE';
    if (item.media_type === 'tv' || (!item.title && item.name)) typeLabel = 'TV';
    if (item.media_type === 'person') typeLabel = 'PERSON';
 
    card.innerHTML = `
      <div class="card-poster">
        ${poster
          ? `<img src="${poster}" alt="${title}" loading="lazy" onerror="this.parentNode.innerHTML='<div class=card-poster-fallback><span>🎬</span><p>${title}</p></div>'">`
          : `<div class="card-poster-fallback"><span>🎬</span><p>${title}</p></div>`
        }
        <div class="card-rating">★ ${rating}</div>
        <div class="card-type">${typeLabel}</div>
        <div class="card-overlay">
          <div class="overlay-actions">
            <button class="overlay-btn primary" data-action="details">Details</button>
            <button class="overlay-btn secondary ${isFav ? 'favorited' : ''}" data-action="fav">
              ${isFav ? '♥' : '♡'}
            </button>
          </div>
        </div>
      </div>
      <div class="card-body">
        <div class="card-title">${title}</div>
        <div class="card-meta">
          <span>${year || '—'}</span>
          <span>·</span>
          <span>★ ${rating}</span>
        </div>
      </div>
    `;
 
    return card;
  },
 
  // ── Update results meta ──────────────────
  updateMeta(count, category) {
    const labels = {
      trending:  '⚡ Trending',
      movie:     '🎬 Movies',
      tv:        '📺 TV Shows',
      anime:     '🌸 Anime',
      favorites: '❤️ Favorites',
    };
    document.getElementById('resultsCount').textContent = `${count} result${count !== 1 ? 's' : ''}`;
    document.getElementById('activeCategory').textContent = labels[category] || '';
  },
 
  // ── Render pagination ────────────────────
  renderPagination(currentPage, totalPages, onPageClick) {
    const wrap = document.getElementById('pagination');
    wrap.innerHTML = '';
    if (totalPages <= 1) return;
 
    // Cap at 500 (TMDB limit)
    const maxPages = Math.min(totalPages, 500);
 
    const createBtn = (label, page, isActive = false, isDisabled = false) => {
      const btn = document.createElement('button');
      btn.className = 'page-btn' + (isActive ? ' active' : '');
      btn.textContent = label;
      btn.disabled = isDisabled;
      if (!isDisabled) btn.addEventListener('click', () => onPageClick(page));
      return btn;
    };
 
    const createDots = () => {
      const s = document.createElement('span');
      s.className = 'page-dots';
      s.textContent = '…';
      return s;
    };
 
    // Prev
    wrap.appendChild(createBtn('‹', currentPage - 1, false, currentPage === 1));
 
    // Page numbers — HOF: Array.from + map
    const getPageNumbers = () => {
      if (maxPages <= 7) return Array.from({ length: maxPages }, (_, i) => i + 1);
      if (currentPage <= 4) return [1,2,3,4,5,'…',maxPages];
      if (currentPage >= maxPages - 3) return [1,'…',maxPages-4,maxPages-3,maxPages-2,maxPages-1,maxPages];
      return [1,'…',currentPage-1,currentPage,currentPage+1,'…',maxPages];
    };
 
    getPageNumbers().forEach(p => {
      if (p === '…') {
        wrap.appendChild(createDots());
      } else {
        wrap.appendChild(createBtn(p, p, p === currentPage));
      }
    });
 
    // Next
    wrap.appendChild(createBtn('›', currentPage + 1, false, currentPage === maxPages));
  },
 
  // ── Populate genre dropdown ──────────────
  populateGenres(genres) {
    const sel = document.getElementById('genreFilter');
    // HOF: map genres → option elements
    genres.map(g => {
      const opt = document.createElement('option');
      opt.value = g.id;
      opt.textContent = g.name;
      return opt;
    }).forEach(opt => sel.appendChild(opt));
  },
 
  // ── Populate year dropdown ───────────────
  populateYears(years) {
    const sel = document.getElementById('yearFilter');
    // Clear existing (keep first "All Years")
    while (sel.options.length > 1) sel.remove(1);
    years.forEach(y => {
      const opt = document.createElement('option');
      opt.value = y;
      opt.textContent = y;
      sel.appendChild(opt);
    });
  },
 
  // ── Open modal ───────────────────────────
  openModal(html) {
    const overlay = document.getElementById('modalOverlay');
    document.getElementById('modalInner').innerHTML = html;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  },
 
  closeModal() {
    document.getElementById('modalOverlay').classList.remove('open');
    document.body.style.overflow = '';
    // Stop any playing video
    const iframe = document.querySelector('.modal-trailer-wrap iframe');
    if (iframe) iframe.src = iframe.src;
  },
 
  // ── Build modal HTML ─────────────────────
  buildModalHTML(details, isFav) {
    const title      = details.title || details.name || 'Untitled';
    const overview   = details.overview || 'No overview available.';
    const tagline    = details.tagline || details.original_name || '';
    const rating     = details.vote_average ? details.vote_average.toFixed(1) : 'N/A';
    const votes      = details.vote_count ? details.vote_count.toLocaleString() : '0';
    const year       = (details.release_date || details.first_air_date || '').substring(0, 4);
    const runtime    = details.runtime ? `${details.runtime} min` : (details.episode_run_time?.[0] ? `${details.episode_run_time[0]} min/ep` : '—');
    const status     = details.status || '—';
    const poster     = details.poster_path ? `${CONFIG.IMG_W500}${details.poster_path}` : null;
    const backdrop   = details.backdrop_path ? `${CONFIG.IMG_ORIG}${details.backdrop_path}` : null;
 
    // HOF: map genres
    const genreTags  = (details.genres || []).map(g => `<span class="badge">${g.name}</span>`).join('');
 
    // Trailer
    const trailerKey = API.getTrailerKey(details.videos);
    const trailerHTML = trailerKey
      ? `<iframe src="https://www.youtube.com/embed/${trailerKey}?autoplay=0&rel=0" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>`
      : `<div class="no-trailer">No trailer available</div>`;
 
    return `
      <div class="modal-hero">
        ${backdrop
          ? `<img class="modal-backdrop" src="${backdrop}" alt="${title}" />`
          : `<div class="modal-backdrop-fallback">🎬</div>`
        }
        <div class="modal-hero-content">
          ${poster ? `<img class="modal-poster" src="${poster}" alt="${title}" />` : ''}
          <div class="modal-title-wrap">
            <div class="modal-title">${title}</div>
            ${tagline ? `<div class="modal-tagline">${tagline}</div>` : ''}
            <div class="modal-badges">
              <span class="badge gold">★ ${rating}</span>
              ${year ? `<span class="badge">${year}</span>` : ''}
              ${genreTags}
            </div>
          </div>
        </div>
      </div>
 
      <div class="modal-body">
        <div class="modal-main">
          <p class="modal-overview">${overview}</p>
          <p class="modal-section-title">OFFICIAL TRAILER</p>
          <div class="modal-trailer-wrap">${trailerHTML}</div>
        </div>
 
        <div class="modal-sidebar">
          <div class="modal-info-list">
            <div class="modal-info-item">
              <span class="modal-info-label">Rating</span>
              <span class="modal-info-value">★ ${rating} (${votes} votes)</span>
            </div>
            <div class="modal-info-item">
              <span class="modal-info-label">Runtime</span>
              <span class="modal-info-value">${runtime}</span>
            </div>
            <div class="modal-info-item">
              <span class="modal-info-label">Status</span>
              <span class="modal-info-value">${status}</span>
            </div>
            <div class="modal-info-item">
              <span class="modal-info-label">Year</span>
              <span class="modal-info-value">${year || '—'}</span>
            </div>
          </div>
 
          <button class="modal-fav-btn ${isFav ? 'active' : ''}" id="modalFavBtn" data-id="${details.id}">
            ${isFav ? '♥ Remove from Favorites' : '♡ Add to Favorites'}
          </button>
        </div>
      </div>
    `;
  },
 
  // ── Show toast message ───────────────────
  showToast(message, type = '') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => { toast.className = 'toast'; }, 2500);
  },
 
  // ── Render favorites empty state ─────────
  renderFavoritesEmpty() {
    const grid = document.getElementById('contentGrid');
    grid.style.display = 'block';
    grid.innerHTML = `
      <div class="fav-empty">
        <div class="big-icon">🍿</div>
        <h3>No favorites yet</h3>
        <p>Hit the ♡ on any card to save it here</p>
      </div>
    `;
    document.getElementById('loader').style.display = 'none';
    document.getElementById('emptyState').style.display = 'none';
  },
 
};