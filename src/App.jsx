import React, { useEffect, useRef, useState } from 'react';
import { ArrowDownUp, ArrowLeft, ArrowRight, Bookmark, Check, CheckCheck, ChevronDown, Heart, Leaf, List, LoaderCircle, Map as MapIcon, MapPin, Menu, MessageCircle, Plus, Search, SlidersHorizontal, Soup, Sparkles, Star, Trash2, Upload, Utensils, X } from 'lucide-react';
import L from 'leaflet';
import { cities, cuisines, collections, restaurants, filterRestaurants, readLocal } from './data.js';
import { parseNaturalSearch } from './search.js';

const photo = name => '/images/' + name + '.jpg';
const cuisineSymbols = { 'All cuisines': '✺', Mexican: '🌮', Japanese: '🍣', Italian: '🍝', Indian: '🍛', Chinese: '🥟', Korean: '🍲', Levantine: '🫒' };
const storageKeys = { saved: 'tasteauthentic:saved:v1', reviews: 'tasteauthentic:reviews:v1' };

function Logo({ onClick }) {
  return <button className="brand" onClick={onClick} aria-label="TasteAuthentic home"><span className="brand-icon"><Soup size={25} strokeWidth={1.7} /></span><span>Taste<span className="brand-accent">Authentic</span><span className="brand-dot">.</span></span></button>;
}

function Modal({ title, children, onClose, className = '' }) {
  const dialog = useRef(null);
  useEffect(() => {
    const node = dialog.current;
    const previous = document.activeElement;
    node.showModal();
    document.body.classList.add('modal-open');
    return () => { node.close(); document.body.classList.remove('modal-open'); previous?.focus(); };
  }, []);
  return <dialog ref={dialog} className={'modal ' + className} aria-label={title} onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) onClose(); }}><div className="modal-inner"><button className="icon-button modal-close" onClick={onClose} aria-label="Close dialog"><X size={20} /></button>{children}</div></dialog>;
}

function RestaurantCard({ restaurant: r, saved, onSave, onOpen, addedCount = 0 }) {
  return <article className="restaurant-card">
    <div className="card-photo">
      <button className="image-open" onClick={() => onOpen(r)} aria-label={'Explore ' + r.name}><img src={photo(r.image)} alt={r.cuisine + ' food, illustrative photo for ' + r.name} loading="lazy" /></button>
      <span className="community-badge"><Heart size={12} fill="currentColor" /> Community loved</span>
      <button className={'save-button ' + (saved ? 'is-saved' : '')} onClick={() => onSave(r.id)} aria-label={(saved ? 'Unsave ' : 'Save ') + r.name} aria-pressed={saved}><Bookmark size={19} fill={saved ? 'currentColor' : 'none'} /></button>
      <span className="photo-cuisine">{r.region}</span>
    </div>
    <div className="card-body">
      <div className="card-title-row"><button className="card-title" onClick={() => onOpen(r)}>{r.name}</button><span className="rating"><Star size={14} fill="currentColor" />{r.score.toFixed(1)}</span></div>
      <p className="card-meta">{r.cuisine}<span>·</span>{r.neighborhood}<span>·</span>{'$'.repeat(r.price)}</p>
      <div className="food-tags">{r.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
      <div className="review-snippet"><span className="quote-mark">“</span><p>{r.quote}</p></div>
      <div className="card-bottom"><span><span className={'mini-avatar ' + r.reviews[0].color}>{r.reviews[0].initials}</span>{r.reviewer}<CheckCheck size={13} className="verified-icon" /></span><button onClick={() => onOpen(r)}>{r.reviewCount + addedCount} reviews <ArrowRight size={13} /></button></div>
    </div>
  </article>;
}

function CollectionCards({ onSelect }) {
  return <div className="collection-grid">{collections.map(c => <button key={c.id} className={'collection-card ' + c.color} onClick={() => onSelect(c)}>
    <img src={photo(c.image)} alt="" loading="lazy" /><span className="collection-shade" /><span className="collection-count"><Bookmark size={12} />{c.ids.length} places</span><span className="collection-content"><span className="eyebrow">{c.label}</span><strong>{c.title}</strong><span>{c.subtitle}</span></span><span className="collection-arrow"><ArrowRight size={20} /></span>
  </button>)}</div>;
}

function RestaurantMap({ items, onOpen }) {
  const element = useRef(null);
  const [tileError, setTileError] = useState(false);
  useEffect(() => {
    const map = L.map(element.current, { scrollWheelZoom: false, zoomControl: true }).setView([37.775, -122.43], 12);
    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>', maxZoom: 19 }).addTo(map);
    tiles.on('tileerror', () => setTileError(true));
    const markers = items.map(r => {
      const marker = L.marker(r.coordinates, { icon: L.divIcon({ className: 'restaurant-marker', html: '<span>★ ' + r.score.toFixed(1) + '</span>', iconSize: [58, 34], iconAnchor: [29, 34] }), title: r.name, alt: r.name, keyboard: true }).addTo(map);
      const popup = document.createElement('div');
      const title = document.createElement('strong');
      title.textContent = r.name;
      const description = document.createElement('p');
      description.textContent = r.cuisine + ' · ' + r.neighborhood;
      const button = document.createElement('button');
      button.className = 'map-popup-button';
      button.textContent = 'Explore restaurant →';
      button.addEventListener('click', () => onOpen(r));
      popup.append(title, description, button);
      marker.bindPopup(popup);
      return marker;
    });
    if (markers.length) map.fitBounds(L.featureGroup(markers).getBounds().pad(0.18), { maxZoom: 13 });
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(element.current);
    return () => { observer.disconnect(); map.remove(); };
  }, [items.map(r => r.id).join(',')]);
  return <div className="map-wrap"><div className="map-canvas" ref={element} aria-label="Map of sample restaurant locations" /><div className="map-note"><MapPin size={14} /> Illustrative locations for fictional restaurants. {tileError ? 'Map tiles are unavailable; use the restaurant list below.' : 'Select a marker to explore.'}</div></div>;
}

function RestaurantDetail({ restaurant: r, saved, onSave, onClose, onReview, userReviews, onDeleteReview }) {
  return <Modal title={r.name} onClose={onClose} className="detail-modal">
    <div className="detail-hero"><img src={photo(r.image)} alt={r.cuisine + ' food, illustrative photo'} /><span className="detail-region">{r.region} · {r.city}</span></div>
    <div className="detail-content">
      <div className="detail-heading"><div><span className="eyebrow orange-text">A PLACE WITH A STORY</span><h2>{r.name}</h2></div><button className={'icon-button detail-save ' + (saved ? 'is-saved' : '')} onClick={() => onSave(r.id)} aria-label={(saved ? 'Unsave ' : 'Save ') + r.name} aria-pressed={saved}><Bookmark fill={saved ? 'currentColor' : 'none'} size={22} /></button></div>
      <p className="detail-meta"><span className="rating"><Star fill="currentColor" size={15} />{r.score.toFixed(1)}</span><span>{r.reviewCount + userReviews.length} community reviews</span><span>·</span><span>{'$'.repeat(r.price)}</span></p>
      <p className="detail-description">{r.description}</p>
      <div className="story-box"><span className="story-icon"><Leaf size={22} /></span><div><h3>Rooted in tradition</h3><p>{r.tags.join(' · ')} · Sharing their food since {r.since}</p></div></div>
      <div className="detail-facts"><div><MapPin size={18} /><div><strong>{r.neighborhood}</strong><span>{r.address}, {r.city}</span></div></div><div><Utensils size={18} /><div><strong>A good place to start</strong><span>{r.dish}{r.vegetarian ? ' · Vegetarian options' : ''}</span></div></div></div>
      <div className="reviews-heading"><div><h3>Stories from the table</h3><p>What makes this place special, in their words.</p></div><button className="button secondary small" onClick={() => onReview(r)}><Plus size={16} /> Write a review</button></div>
      <div className="reviews-list">{[...userReviews, ...r.reviews].map(review => <article className="full-review" key={review.id}>
        <div className="review-person"><span className={'avatar ' + (review.color || 'sage')}>{review.initials}</span><div><strong>{review.name}</strong><span>{review.connection || 'TasteAuthentic community'}</span></div><span className="review-stars" aria-label={review.rating + ' out of 5 stars'}>{Array.from({ length: 5 }, (_, i) => <Star key={i} size={13} fill={i < review.rating ? 'currentColor' : 'none'} />)}</span></div>
        <p>{review.text}</p><span className="tried-dish"><Utensils size={12} /> Tried: {review.dish}</span>
        {userReviews.some(own => own.id === review.id) && <button className="delete-review" onClick={() => onDeleteReview(r.id, review.id)}><Trash2 size={12} />Remove my review</button>}
        {!!review.photos?.length && <div className="review-photos">{review.photos.map((src, i) => <img src={src} key={i} alt={'Dining photo ' + (i + 1) + ' shared by ' + review.name} />)}</div>}
      </article>)}</div>
      <p className="demo-note"><Sparkles size={14} /> Prototype: restaurant details and community reviews are fictional. Authenticity reflects personal experience, not a certification.</p>
    </div>
  </Modal>;
}

async function resizePhoto(file) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Please choose a JPG, PNG, or WebP image.');
  if (file.size > 10 * 1024 * 1024) throw new Error('Please choose photos smaller than 10 MB each.');
  const source = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => {
      reject(new Error('This photo could not be read. Try a photo saved on your device.'));
    };
    reader.readAsDataURL(file);
  });
  const bitmap = await new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('This photo could not be decoded. Try another JPG, PNG, or WebP image.'));
    image.src = source;
  });
  const canvas = document.createElement('canvas');
  const scale = Math.min(1, 1000 / Math.max(bitmap.width, bitmap.height));
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.75);
}

function ReviewForm({ initialRestaurant, onClose, onSubmit }) {
  const [restaurantId, setRestaurantId] = useState(initialRestaurant?.id || '');
  const [rating, setRating] = useState(5);
  const [photos, setPhotos] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function handlePhotos(e) {
    const input = e.target;
    const files = Array.from(input.files || []);
    setError('');
    if (files.length + photos.length > 3) { setError('You can share up to 3 photos per review.'); input.value = ''; return; }
    setBusy(true);
    try { const images = await Promise.all(files.map(resizePhoto)); setPhotos(current => [...current, ...images]); }
    catch (err) { setError(err.message || 'That photo could not be opened. Try another image.'); }
    finally { input.value = ''; setBusy(false); }
  }
  function submit(e) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = data.get('name').trim();
    const dish = data.get('dish').trim();
    const text = data.get('review').trim();
    if (!name || !dish || text.length < 30 || !restaurantId) { setError('Add your name, a dish, and at least 30 characters about your experience.'); return; }
    const result = onSubmit(restaurantId, { id: crypto.randomUUID(), name, initials: name.split(/\s+/).map(x => x[0]).slice(0, 2).join('').toUpperCase(), color: 'sage', text, dish, connection: data.get('connection').trim() || 'Curious food explorer', rating, photos, date: new Date().toISOString() });
    if (!result) setError('Your browser storage is full or unavailable. Try fewer photos, or enable local storage.');
  }
  return <Modal title="Share your food story" onClose={onClose} className="review-modal"><div className="form-header"><span className="form-icon"><MessageCircle size={25} /></span><span className="eyebrow orange-text">YOUR EXPERIENCE MATTERS</span><h2>Every meal has a story.</h2><p>Help someone discover a little taste of somewhere.</p></div>
    <form className="review-form" onSubmit={submit}>
      <label>The restaurant<select required value={restaurantId} onChange={e => setRestaurantId(e.target.value)}><option value="">Choose a restaurant</option>{restaurants.map(r => <option key={r.id} value={r.id}>{r.name} — {r.city}</option>)}</select></label>
      <fieldset className="rating-field"><legend>How was your experience?</legend><div className="star-input" role="group" aria-label="Review rating">{[1, 2, 3, 4, 5].map(n => <button key={n} type="button" aria-label={'Rate ' + n + ' stars'} aria-pressed={rating === n} onClick={() => setRating(n)}><Star size={30} fill={n <= rating ? 'currentColor' : 'none'} /></button>)}<span>{rating}/5</span></div></fieldset>
      <div className="form-columns"><label>Your name<input name="name" placeholder="e.g. Jamie R." required maxLength={50} /></label><label>What did you try?<input name="dish" placeholder="The dish worth talking about" required maxLength={80} /></label></div>
      <label>Your connection to the cuisine <span className="optional">(optional)</span><input name="connection" placeholder="Grew up with it, traveled for it, trying it for the first time…" maxLength={100} /></label>
      <label>Tell us what made it special<textarea name="review" placeholder="The flavors, the traditions, the people. What stayed with you?" rows={4} required minLength={30} maxLength={2000} /><span className="field-hint">At least 30 characters. Every perspective is welcome.</span></label>
      <div className="photo-upload"><label className={'upload-target ' + (busy ? 'upload-disabled' : '')}><Upload size={21} /><strong>{busy ? 'Preparing your photos…' : 'Add a little flavor to your story'}</strong><span>Up to 3 photos · JPG, PNG, WebP · 10 MB each</span><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handlePhotos} disabled={busy} aria-label="Upload dining photos" /></label></div>
      {!!photos.length && <div className="upload-previews">{photos.map((src, i) => <div key={i}><img src={src} alt={'Photo ' + (i + 1) + ' preview'} /><button type="button" onClick={() => setPhotos(p => p.filter((_, index) => index !== i))} aria-label={'Remove photo ' + (i + 1)}><X size={14} /></button></div>)}</div>}
      {error && <p className="form-error" role="alert">{error}</p>}
      <p className="form-privacy">This is a local prototype. Your review and photos are saved only in this browser.</p>
      <button className="button primary submit-review" disabled={busy} type="submit">{busy ? <LoaderCircle className="spin" size={18} /> : <Plus size={18} />} Share your story</button>
    </form>
  </Modal>;
}

export default function App() {
  const [page, setPage] = useState('explore');
  const [city, setCity] = useState('San Francisco');
  const [cuisine, setCuisine] = useState('All cuisines');
  const [query, setQuery] = useState('');
  const [searchDraft, setSearchDraft] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [searchIntent, setSearchIntent] = useState(null);
  const [neighborhood, setNeighborhood] = useState('');
  const [excludedCuisines, setExcludedCuisines] = useState([]);
  const [sort, setSort] = useState('recommended');
  const [price, setPrice] = useState('all');
  const [vegetarian, setVegetarian] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [view, setView] = useState('list');
  const [collection, setCollection] = useState(null);
  const [selected, setSelected] = useState(null);
  const [reviewTarget, setReviewTarget] = useState(undefined);
  const [saved, setSaved] = useState(() => { const value = readLocal(storageKeys.saved, []); return Array.isArray(value) ? value.filter(id => restaurants.some(r => r.id === id)) : []; });
  const [userReviews, setUserReviews] = useState(() => { const value = readLocal(storageKeys.reviews, {}); return value && typeof value === 'object' && !Array.isArray(value) ? Object.fromEntries(Object.entries(value).map(([id, list]) => [id, Array.isArray(list) ? list.filter(r => r && typeof r.text === 'string' && typeof r.name === 'string' && Array.isArray(r.photos)) : []])) : {}; });
  const [toast, setToast] = useState('');
  const [aboutOpen, setAboutOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const resultsRef = useRef(null);
  useEffect(() => { if (toast) { const timeout = setTimeout(() => setToast(''), 4000); return () => clearTimeout(timeout); } }, [toast]);
  function navigate(next) {
    setPage(next); setCollection(null); setMobileMenu(false); clearFilters();
    setCity(next === 'explore' ? 'San Francisco' : 'All cities');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function clearFilters() { setCuisine('All cuisines'); setQuery(''); setSearchDraft(''); setActiveSearch(''); setSearchIntent(null); setNeighborhood(''); setExcludedCuisines([]); setPrice('all'); setVegetarian(false); setSort('recommended'); }
  function runSearch(text = searchDraft, scroll = true) {
    if (!text.trim()) { clearFilters(); return; }
    const parsed = parseNaturalSearch(text, restaurants, city);
    setSearchDraft(text); setActiveSearch(text.trim()); setSearchIntent(parsed);
    setCity(parsed.city || city); setCuisine(parsed.cuisine || 'All cuisines');
    setNeighborhood(parsed.neighborhood); setExcludedCuisines(parsed.excludeCuisines);
    setPrice(parsed.price); setVegetarian(parsed.vegetarian); setSort(parsed.sort); setQuery(parsed.query);
    if (scroll) requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' }));
  }
  function toggleSave(id) {
    const next = saved.includes(id) ? saved.filter(x => x !== id) : [...saved, id];
    try { localStorage.setItem(storageKeys.saved, JSON.stringify(next)); setSaved(next); setToast(next.includes(id) ? 'A good find, saved for later.' : 'Removed from your saved places.'); }
    catch { setToast('Browser storage is unavailable. Your place could not be saved.'); }
  }
  function selectCollection(c) { setCollection(c); setPage('explore'); setCity('All cities'); clearFilters(); requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })); }
  function submitReview(id, review) {
    const next = { ...userReviews, [id]: [review, ...(userReviews[id] || [])] };
    try {
      localStorage.setItem(storageKeys.reviews, JSON.stringify(next));
      setUserReviews(next); setReviewTarget(undefined); setSelected(restaurants.find(r => r.id === id)); setToast('Your story is saved. Thanks for sharing a little flavor!');
      return true;
    } catch { return false; }
  }
  function startReview(r = null) { setSelected(null); setReviewTarget(r); }
  function deleteReview(restaurantId, reviewId) {
    const next = { ...userReviews, [restaurantId]: (userReviews[restaurantId] || []).filter(r => r.id !== reviewId) };
    try { localStorage.setItem(storageKeys.reviews, JSON.stringify(next)); setUserReviews(next); setToast('Your local review has been removed.'); }
    catch { setToast('Browser storage is unavailable. Your review could not be removed.'); }
  }
  const ids = page === 'saved' ? saved : collection?.ids || null;
  const searchBlocked = searchIntent?.issues.length > 0;
  const items = searchBlocked ? [] : filterRestaurants(restaurants, { city, cuisine, query, price, vegetarian, sort, ids, neighborhood, excludeCuisines: excludedCuisines });
  const filterCount = (price !== 'all' ? 1 : 0) + (vegetarian ? 1 : 0);
  const hasFilters = cuisine !== 'All cuisines' || query || filterCount || collection || activeSearch;
  const searchChips = [
    ...(city !== 'All cities' ? [{ label: city, remove: () => { setCity('All cities'); setNeighborhood(''); } }] : []),
    ...(neighborhood ? [{ label: neighborhood, remove: () => setNeighborhood('') }] : []),
    ...(cuisine !== 'All cuisines' ? [{ label: cuisine, remove: () => setCuisine('All cuisines') }] : []),
    ...excludedCuisines.map(c => ({ label: 'Not ' + c, remove: () => setExcludedCuisines(excludedCuisines.filter(x => x !== c)) })),
    ...(price !== 'all' ? [{ label: '$'.repeat(Number(price)), remove: () => setPrice('all') }] : []),
    ...(vegetarian ? [{ label: 'Vegetarian options', remove: () => setVegetarian(false) }] : []),
    ...(sort !== 'recommended' ? [{ label: {rating:'Highest rated',reviews:'Most reviewed',price:'Price: low to high'}[sort], remove: () => setSort('recommended') }] : []),
    ...(query ? [{ label: 'Keywords: ' + query, remove: () => setQuery('') }] : []),
  ];
  const isHome = page === 'explore' && !collection;
  return <>
    <header className="site-header"><div className="header-inner"><Logo onClick={() => navigate('explore')} />
      <nav className={'main-nav ' + (mobileMenu ? 'mobile-open' : '')} aria-label="Main navigation">
        <button className={page === 'explore' ? 'active' : ''} onClick={() => navigate('explore')}>Explore</button><button className={page === 'collections' ? 'active' : ''} onClick={() => navigate('collections')}>Collections</button><button className={page === 'saved' ? 'active' : ''} onClick={() => navigate('saved')}>Saved places{saved.length > 0 && <span className="nav-count">{saved.length}</span>}</button>
      </nav>
      <div className="header-actions"><label className="city-select"><MapPin size={17} /><select aria-label="Choose city" value={city} onChange={e => { setCity(e.target.value); setNeighborhood(''); if (page === 'collections') setPage('explore'); }}>{['All cities', ...cities].map(c => <option key={c}>{c}</option>)}</select><ChevronDown size={14} /></label><button className="button primary header-review" onClick={() => startReview()}><Plus size={17} /> Write a review</button><button className="icon-button mobile-menu" aria-label="Toggle navigation" aria-expanded={mobileMenu} onClick={() => setMobileMenu(!mobileMenu)}><Menu size={22} /></button></div>
    </div></header>

    <main>
      {isHome && <section className="hero"><div className="hero-inner">
        <div className="hero-copy"><div className="hero-eyebrow"><span /><span>REAL FOOD. REAL STORIES. REAL CONNECTIONS.</span></div><h1>Good food.<br /><span>Deep roots.</span><span className="hero-spark" aria-hidden="true">✳</span></h1><p>Discover places that serve more than a meal.<br className="desktop-break" /> Find a taste of tradition, shared by people who know.</p>
          <form className="hero-search" onSubmit={e => { e.preventDefault(); runSearch(); }}><Search size={20} /><input aria-label="Search restaurants, cuisines, or dishes" aria-describedby="search-help" placeholder="Try “cheap vegetarian Mexican in SF”" value={searchDraft} maxLength={300} onChange={e => { setSearchDraft(e.target.value); if (!e.target.value) clearFilters(); }} /><button type="submit" aria-label="Find your next favorite"><ArrowRight size={21} /></button></form>
          <p className="natural-search-help" id="search-help">Describe what you’re craving. Press Enter to explore.</p>
          <div className="search-examples" aria-label="Example searches"><span>Try:</span>{['Best ramen in NYC', 'Indian in the Sunset'].map(example => <button key={example} onClick={() => runSearch(example)}>{example}<ArrowRight size={11} /></button>)}</div>
          <div className="community-proof"><span className="avatar-stack"><span className="face face-one">M</span><span className="face face-two">D</span><span className="face face-three">P</span><span className="face face-four"><Heart size={13} fill="currentColor" /></span></span><p>Good taste brings us together.<br /><strong>A community of curious food lovers.</strong></p></div>
        </div>
        <div className="hero-visual" aria-label="A world of food to discover"><span className="hero-orbit" /><div className="hero-main-image"><img src={photo('noodles')} alt="A comforting bowl of noodles with rich broth and fresh toppings" fetchPriority="high" /></div><div className="hero-small-image"><img src={photo('tacos')} alt="Fresh tacos with colorful traditional toppings" fetchPriority="high" /></div><div className="heritage-stamp"><span>MADE WITH</span><Heart size={25} strokeWidth={1.5} /><span>HERITAGE</span></div><div className="hero-note"><span className="note-avatar">ML</span><div><span className="note-stars">★★★★★</span><p>“Tastes like home.”</p><span>That’s how you know.</span></div><span className="note-heart"><Heart size={16} /></span></div><span className="visual-spark" aria-hidden="true">✧</span><span className="hero-caption">A whole world. Right around the corner.</span></div>
      </div></section>}

      {page !== 'collections' && <section className="discovery content-width" ref={resultsRef} id="discover">
        <div className="section-heading"><div>{collection && <button className="back-link" onClick={() => navigate('collections')}><ArrowLeft size={15} /> All collections</button>}<span className="eyebrow orange-text">{page === 'saved' ? 'YOUR NEXT GOOD MEAL' : collection ? 'THE TASTEAUTHENTIC EDIT' : 'FOLLOW YOUR APPETITE'}</span><h2>{page === 'saved' ? 'Your little book of favorites' : collection ? collection.title : 'A world of flavor, close to home.'}</h2><p>{page === 'saved' ? 'The places you want to come back to. Or finally try.' : collection ? collection.subtitle : 'Local gems. Lasting traditions. Loved by the people who know.'}</p></div><div className="view-toggle" role="group" aria-label="Restaurant view"><button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')} aria-pressed={view === 'list'}><List size={16} />List</button><button className={view === 'map' ? 'active' : ''} onClick={() => setView('map')} aria-pressed={view === 'map'}><MapIcon size={16} />Map</button></div></div>
        <div className="cuisine-filter" aria-label="Filter by cuisine">{cuisines.map(c => <button key={c} className={'cuisine-chip ' + (cuisine === c ? 'active' : '')} onClick={() => setCuisine(c)} aria-pressed={cuisine === c}><span aria-hidden="true">{cuisineSymbols[c]}</span>{c}</button>)}<button className={'filter-button ' + (filtersOpen || filterCount ? 'active' : '')} onClick={() => setFiltersOpen(!filtersOpen)} aria-expanded={filtersOpen}><SlidersHorizontal size={16} />Filters{filterCount > 0 && <span className="filter-count">{filterCount}</span>}</button></div>
        {filtersOpen && <div className="advanced-filters"><label>Price range<select value={price} onChange={e => setPrice(e.target.value)}><option value="all">Any price</option><option value="1">$ · Budget friendly</option><option value="2">$$ · A little extra</option><option value="3">$$$ · Special occasion</option></select></label><label className="check-label"><input type="checkbox" checked={vegetarian} onChange={e => setVegetarian(e.target.checked)} /><Leaf size={16} />Vegetarian options</label><button className="text-link" onClick={() => { setPrice('all'); setVegetarian(false); }}>Reset filters</button></div>}
        {!isHome && <form className="inline-search" onSubmit={e => { e.preventDefault(); runSearch(searchDraft, false); }}><Search size={17} /><input aria-label="Search these restaurants" placeholder="Describe what you’re craving…" value={searchDraft} maxLength={300} onChange={e => { setSearchDraft(e.target.value); if (!e.target.value) clearFilters(); }} /><button type="submit" aria-label="Search these places"><ArrowRight size={17} /></button></form>}
        {activeSearch && <div className="search-understanding" role="region" aria-label="Search interpretation" aria-live="polite"><div className="search-understanding-heading"><Search size={15} /><strong>{searchBlocked ? 'A little more detail needed' : 'Searching with these filters'}</strong><span>Adjust any filter below</span></div><div className="search-chips">{searchChips.map(chip => <button key={chip.label} onClick={chip.remove} aria-label={'Remove ' + chip.label + ' filter'}>{chip.label}<X size={12} /></button>)}{!searchChips.length && !searchBlocked && <span>All sample restaurants</span>}</div>{searchIntent?.notes.map(note => <p key={note} className="search-note">{note}</p>)}{searchIntent?.issues.map(issue => <p key={issue} className="search-issue">{issue}</p>)}{query && !searchBlocked && <p className="search-note">Remaining words are matched against names, dishes, and stories. This prototype understands common dining phrases, not every request.</p>}</div>}
        <div className="results-toolbar"><p aria-live="polite"><strong>{items.length} {items.length === 1 ? 'place' : 'places'}</strong> {city === 'All cities' ? 'to discover' : 'in ' + city}{query && <span> for “{query}”</span>}{hasFilters && <button className="clear-filters" onClick={() => { clearFilters(); setCollection(null); }}>Clear filters <X size={12} /></button>}</p><label className="sort-select"><ArrowDownUp size={13} /><span>Sort by:</span><select aria-label="Sort restaurants" value={sort} onChange={e => setSort(e.target.value)}><option value="recommended">Recommended</option><option value="rating">Highest rated</option><option value="reviews">Most reviewed</option><option value="price">Price: low to high</option></select><ChevronDown size={13} /></label></div>
        {items.length > 0 ? <>{view === 'map' && <RestaurantMap items={items} onOpen={setSelected} />}<div className={'restaurant-grid ' + (view === 'map' ? 'map-results' : '')}>{items.map(r => <RestaurantCard key={r.id} restaurant={r} saved={saved.includes(r.id)} onSave={toggleSave} onOpen={setSelected} addedCount={(userReviews[r.id] || []).length} />)}</div></> : <div className="empty-state"><span>{page === 'saved' && !saved.length ? <Bookmark size={32} /> : <Soup size={36} />}</span><h3>{searchBlocked ? 'Let’s refine that request.' : page === 'saved' && !saved.length ? 'Your next favorite is out there.' : 'A little too specific? Let’s explore.'}</h3><p>{searchBlocked ? 'We can’t verify a match for this request. Edit your search using the guidance above.' : page === 'saved' && !saved.length ? 'Tap the bookmark on any restaurant to keep it here for later.' : 'No places match these filters yet. Try another cuisine or explore all cities.'}</p><button className="button primary" onClick={() => { if (page === 'saved' && !saved.length) navigate('explore'); else { clearFilters(); setCity('All cities'); setCollection(null); } }}>{page === 'saved' && !saved.length ? 'Find a favorite' : 'Broaden your search'}<ArrowRight size={16} /></button></div>}
        {items.length > 0 && <div className="discovery-footnote"><span /><Heart size={13} /> A little less algorithm. A lot more human.<span /></div>}
      </section>}

      {(page === 'collections' || isHome) && <section className={'collections-section ' + (page === 'collections' ? 'standalone-collections' : '')}><div className="content-width"><div className="section-heading"><div><span className="eyebrow orange-text">GOOD TASTE, WELL CURATED</span><h2>{page === 'collections' ? 'Follow a little food curiosity.' : 'Your next food story starts here.'}</h2><p>Thoughtful little guides for your next delicious detour.</p></div>{isHome && <button className="text-link" onClick={() => navigate('collections')}>Explore collections<ArrowRight size={17} /></button>}</div><CollectionCards onSelect={selectCollection} />{page === 'collections' && <div className="collection-city-panel"><MapPin size={25} /><div><h3>Prefer to wander your own way?</h3><p>Pick a city and discover something delicious.</p></div><div>{cities.map(c => <button className="button secondary small" key={c} onClick={() => { navigate('explore'); setCity(c); }}>{c}<ArrowRight size={14} /></button>)}</div></div>}</div></section>}

      <section className="share-banner content-width"><div className="share-illustration" aria-hidden="true"><Soup size={49} strokeWidth={1.3} /><span>✧</span></div><div><span className="eyebrow">PULL UP A CHAIR</span><h2>Know a place that tastes like home?</h2><p>Your story could be someone’s next favorite meal.</p></div><button className="button primary" onClick={() => startReview()}>Share your discovery<ArrowRight size={17} /></button></section>
    </main>
    <footer className="site-footer content-width"><div><Logo onClick={() => navigate('explore')} /><p>Food connects us. Stories bring us closer.</p></div><div className="footer-links"><button onClick={() => setAboutOpen(true)}>Our philosophy</button><span>Made for the love of food <Heart size={13} /></span><span className="prototype-label">LOCAL PROTOTYPE · SAMPLE PLACES</span></div></footer>
    {selected && <RestaurantDetail restaurant={selected} saved={saved.includes(selected.id)} onSave={toggleSave} onClose={() => setSelected(null)} onReview={startReview} userReviews={userReviews[selected.id] || []} onDeleteReview={deleteReview} />}
    {reviewTarget !== undefined && <ReviewForm initialRestaurant={reviewTarget} onClose={() => setReviewTarget(undefined)} onSubmit={submitReview} />}
    {aboutOpen && <Modal title="Our philosophy" onClose={() => setAboutOpen(false)} className="about-modal"><span className="form-icon"><Heart size={27} /></span><span className="eyebrow orange-text">FOOD IS A LIVING STORY</span><h2>Many traditions.<br />A seat for everyone.</h2><p>We believe a great meal can connect us to a place, a person, or a memory. TasteAuthentic puts those stories at the center of discovery.</p><p>Authenticity isn’t a single score or a fixed set of rules. Cuisines travel and evolve. We invite people to share what feels meaningful to them: a regional technique, a family recipe, a thoughtful ingredient, or a warm welcome.</p><div className="story-box"><Sparkles size={22} /><p>This prototype uses fictional restaurants and sample reviews. Saved places and new reviews stay on this device. Food photography is illustrative, from Unsplash and Pixabay. Map tiles are provided by OpenStreetMap.</p></div></Modal>}
    {toast && <div className="toast" role="status"><Check size={17} />{toast}<button aria-label="Dismiss notification" onClick={() => setToast('')}><X size={16} /></button></div>}
  </>;
}
