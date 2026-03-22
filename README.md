CineVerse — Entertainment Discovery App
A responsive web application for discovering, searching, and saving Movies, TV Shows, Web Series, and Anime using real-time data from The Movie Database (TMDB) API.

---

Purpose:-
CineVerse lets users explore a vast entertainment library like browse Movies, TV Shows, Web Series, and Anime all in one place. Users can search by title, filter by genre or year, sort by popularity or rating, save personal favorites, and watch official trailers. It demonstrates practical JavaScript skills including API integration, array Higher-Order Functions, and dynamic UI rendering.

---

API Used:-
The Movie Database (TMDB) API
Base URL: https://api.themoviedb.org/3
Docs: https://developer.themoviedb.org/docs
Endpoints used:
GET /trending/all/week — fetch trending movies, shows & anime
GET /movie/popular — fetch popular movies
GET /tv/popular — fetch popular TV shows & web series
GET /search/movie — search movies by title
GET /search/tv — search TV shows by title
GET /genre/movie/list — fetch movie genres
GET /genre/tv/list — fetch TV genres
GET /movie/{id}/videos — fetch official trailers => from YouTube

---

Planned Features:-
Content Tabs — Switch between Movies, TV Shows, Anime and Trending (all in one app)
Search — Search across movies and TV shows using a debounced input (Array filter)
Filter — Filter results by genre, release year, and minimum rating (Array filter)
Sort — Sort results by popularity, release date, or rating (Array sort)
Favorites — Add/remove titles from a personal favorites list (Array map, filter)
Content Cards — Display poster, title, rating, year, and type with a "View Details" button
Trailer Playback — Watch official trailers via embedded YouTube player (TMDB also provides the YouTube keys)
Bonus Features:-
Debouncing — Prevents excessive API calls while typing in the search bar
Local Storage — Favorites and dark mode preference persist across sessions
Dark / Light Mode — Theme toggle with preference saved to localStorage
Pagination — Navigate through multiple pages of results

---

Technologies:-
HTML5 — Semantic structure
CSS3 — Custom styling, Flexbox/Grid, responsive design
JavaScript (ES6+) — Fetch API, DOM manipulation, HOFs, localStorage
TMDB API — Movies, TV shows, anime data + trailer keys
Pure vanilla JS.

---

Deployment:-
Will be deployed via GitHub before the final deadline.

---

Setup & Project Structure:-

cineverse/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── config.js       # API key and base URL
│   ├── api.js          # Fetch logic (movies, tv, trending, trailers)
│   ├── ui.js           # DOM rendering functions
│   ├── filters.js      # Search, filter, sort using HOFs
│   └── main.js         # App entry point, event listeners
└── README.md

---

Author:-
Riya Todi
https://github.com/riyat25382-blip
