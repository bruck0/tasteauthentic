import { matchesSearch } from './search.js';

export const cities = ['San Francisco', 'New York', 'Chicago'];
export const cuisines = ['All cuisines', 'Mexican', 'Japanese', 'Italian', 'Indian', 'Chinese', 'Korean', 'Levantine'];

const review = (id, name, initials, color, text, dish, connection, rating = 5) => ({ id, name, initials, color, text, dish, connection, rating, date: '2026-09-20', photos: [] });

export const restaurants = [
  {
    id: 'noodle-story', name: 'Noodle & Story', cuisine: 'Chinese', region: 'Sichuan', city: 'San Francisco', neighborhood: 'Chinatown', address: '824 Grant Avenue', coordinates: [37.7941, -122.4069], price: 2, image: 'dandan', score: 4.9, reviewCount: 128, tags: ['Hand-pulled noodles', 'Family recipes'], vegetarian: true, since: '1998', dish: 'Dan dan noodles',
    description: 'A tiny noodle shop with a big family story. Three generations of the Chen family bring the flavors of Chengdu to the table, with noodles pulled by hand and a slow-simmered broth made fresh each morning.',
    quote: 'The kind of noodles that take me straight back to my grandmother’s kitchen in Chengdu.', reviewer: 'Michelle L.',
    reviews: [review('n1', 'Michelle L.', 'ML', 'sage', 'The kind of noodles that take me straight back to my grandmother’s kitchen in Chengdu. The chili oil is fragrant, the noodles have a wonderful bite, and the owners are happy to talk about how they make them.', 'Dan dan noodles', 'Grew up with Sichuan cooking'), review('n2', 'Alex R.', 'AR', 'peach', 'Come for the hand-pulled noodles, stay for the conversation. Mr. Chen shared the story behind the broth, and you can taste the care in every bowl.', 'Beef noodle soup', 'Curious food explorer')]
  },
  {
    id: 'casa-maiz', name: 'Casa de Maíz', cuisine: 'Mexican', region: 'Oaxacan', city: 'San Francisco', neighborhood: 'Mission District', address: '2890 24th Street', coordinates: [37.7525, -122.4105], price: 1, image: 'tacos', score: 4.8, reviewCount: 96, tags: ['Handmade tortillas', 'Oaxacan roots'], vegetarian: true, since: '2007', dish: 'Tacos de hongos',
    description: 'Fresh masa, a well-loved comal, and recipes carried from Oaxaca. This cheerful neighborhood spot celebrates the many possibilities of corn, from handmade tortillas to warm tamales wrapped each morning.',
    quote: 'Fresh tortillas, a family behind the counter, and mole with a story. This is the real deal.', reviewer: 'Daniel R.',
    reviews: [review('c1', 'Daniel R.', 'DR', 'peach', 'Fresh tortillas, a family behind the counter, and mole with a story. This is the real deal. The earthy, complex mole reminded me of Sunday lunches with my family in Oaxaca.', 'Mole negro', 'Family from Oaxaca'), review('c2', 'Sofia M.', 'SM', 'lilac', 'The mushroom tacos are such a lovely surprise. You can watch the tortillas being pressed, and the salsa has just the right smoky finish.', 'Tacos de hongos', 'Loves exploring regional Mexican food')]
  },
  {
    id: 'ammas-table', name: 'Amma’s Table', cuisine: 'Indian', region: 'South Indian', city: 'San Francisco', neighborhood: 'Sunset District', address: '1320 9th Avenue', coordinates: [37.7633, -122.4661], price: 2, image: 'curry', score: 4.9, reviewCount: 84, tags: ['Made with tradition', 'Family-owned'], vegetarian: true, since: '2015', dish: 'Sunday thali',
    description: 'Amma means mother, and this kitchen lives up to its name. Expect the warm hospitality of a family home, slow-cooked curries, crisp dosas, and the bright, comforting flavors of Tamil Nadu.',
    quote: 'Every spice feels intentional. A little piece of home, thousands of miles away.', reviewer: 'Priya S.',
    reviews: [review('a1', 'Priya S.', 'PS', 'lilac', 'Every spice feels intentional. A little piece of home, thousands of miles away. The sambar has the tang and depth I remember from Chennai, and the Sunday thali is always a joy.', 'Sunday thali', 'Raised in Chennai'), review('a2', 'Jamie K.', 'JK', 'sage', 'My first dosa, and the owner kindly walked me through the chutneys. The crisp edges and warm potato filling made me an instant fan.', 'Masala dosa', 'Trying something new')]
  },
  {
    id: 'nonnas-kitchen', name: 'Nonna’s Kitchen', cuisine: 'Italian', region: 'Emilia-Romagna', city: 'San Francisco', neighborhood: 'North Beach', address: '1516 Stockton Street', coordinates: [37.8001, -122.4093], price: 2, image: 'pasta', score: 4.7, reviewCount: 112, tags: ['Pasta made daily', 'Regional recipes'], vegetarian: true, since: '1986', dish: 'Tagliatelle al ragù',
    description: 'Flour-dusted countertops and a handwritten menu set the scene for a kitchen inspired by Emilia-Romagna. The pasta is rolled every morning, and the ragù gets all the time it needs.',
    quote: 'Simple ingredients, beautiful pasta, and absolutely no rushing the ragù.', reviewer: 'Luca B.',
    reviews: [review('i1', 'Luca B.', 'LB', 'peach', 'Simple ingredients, beautiful pasta, and absolutely no rushing the ragù. It reminds me of the small trattorias I love in Bologna. Ask what came out of the kitchen that morning.', 'Tagliatelle al ragù', 'From Bologna', 4)]
  },
  {
    id: 'seoul-table', name: 'Seoul Table', cuisine: 'Korean', region: 'Korean home cooking', city: 'San Francisco', neighborhood: 'Inner Richmond', address: '410 Clement Street', coordinates: [37.7832, -122.4635], price: 2, image: 'bibimbap', score: 4.8, reviewCount: 73, tags: ['House-fermented kimchi', 'Generous banchan'], vegetarian: false, since: '2011', dish: 'Dolsot bibimbap',
    description: 'A neighborhood kitchen where the banchan changes with the seasons and the kimchi is made in-house. Stone bowls arrive sizzling, and there is always another little dish to discover.',
    quote: 'The banchan alone is worth coming for. It feels like being welcomed into someone’s home.', reviewer: 'Hana P.',
    reviews: [review('k1', 'Hana P.', 'HP', 'sage', 'The banchan alone is worth coming for. It feels like being welcomed into someone’s home. I especially love the house kimchi and the crispy rice at the bottom of the stone bowl.', 'Dolsot bibimbap', 'Grew up in a Korean household')]
  },
  {
    id: 'zaytoun', name: 'Zaytoun', cuisine: 'Levantine', region: 'Lebanese', city: 'San Francisco', neighborhood: 'Hayes Valley', address: '520 Hayes Street', coordinates: [37.7767, -122.4251], price: 2, image: 'greens', score: 4.8, reviewCount: 65, tags: ['Fresh-baked flatbread', 'Mezze to share'], vegetarian: true, since: '2018', dish: 'Seasonal mezze',
    description: 'Named for the olive tree, Zaytoun is a gathering place built around sharing. Fresh herbs, bright citrus, silky hummus, and bread straight from the oven make a table worth lingering at.',
    quote: 'The tabbouleh is all herbs and brightness, just the way my family makes it.', reviewer: 'Leila A.',
    reviews: [review('l1', 'Leila A.', 'LA', 'lilac', 'The tabbouleh is all herbs and brightness, just the way my family makes it. Order a few mezze, tear into the warm bread, and take your time.', 'Seasonal mezze', 'Lebanese family recipes at home')]
  },
  {
    id: 'komorebi', name: 'Komorebi Ramen', cuisine: 'Japanese', region: 'Hakata-style', city: 'New York', neighborhood: 'East Village', address: '210 East 10th Street', coordinates: [40.7294, -73.9851], price: 2, image: 'noodles', score: 4.8, reviewCount: 104, tags: ['Slow-simmered broth', 'Small-batch noodles'], vegetarian: false, since: '2016', dish: 'Tonkotsu ramen', description: 'An intimate counter serving deep, patiently simmered broth and springy noodles inspired by Hakata. A small menu leaves plenty of room for care.', quote: 'A bowl that rewards slowing down. The broth has so much depth.', reviewer: 'Emi T.', reviews: [review('j1', 'Emi T.', 'ET', 'sage', 'A bowl that rewards slowing down. The broth has so much depth, and the noodles are cooked exactly as I love them.', 'Tonkotsu ramen', 'Ramen enthusiast')]
  },
  {
    id: 'mesa-abuelita', name: 'Mesa de Abuelita', cuisine: 'Mexican', region: 'Pueblan', city: 'New York', neighborhood: 'Sunset Park', address: '4512 5th Avenue', coordinates: [40.6477, -74.0062], price: 1, image: 'tacos', score: 4.9, reviewCount: 89, tags: ['Family-run', 'Fresh masa'], vegetarian: true, since: '2003', dish: 'Tacos de calabaza', description: 'A bright family dining room celebrating Puebla, with fresh masa, seasonal fillings, and sauces made with patience.', quote: 'The handmade tortillas make every bite something special.', reviewer: 'Ana V.', reviews: [review('m1', 'Ana V.', 'AV', 'peach', 'The handmade tortillas make every bite something special. There is a beautiful sweetness in the squash filling.', 'Tacos de calabaza', 'Pueblan food lover')]
  },
  {
    id: 'saffron-house', name: 'Saffron House', cuisine: 'Indian', region: 'Punjabi', city: 'New York', neighborhood: 'Jackson Heights', address: '7410 37th Avenue', coordinates: [40.7486, -73.8915], price: 2, image: 'curry', score: 4.7, reviewCount: 78, tags: ['Tandoor cooking', 'Family recipes'], vegetarian: true, since: '1995', dish: 'Dal makhani', description: 'Long-simmered dals, breads fresh from the tandoor, and the generous hospitality of a Punjabi family kitchen.', quote: 'The dal tastes like someone has been looking after it all day. They have.', reviewer: 'Arjun K.', reviews: [review('s1', 'Arjun K.', 'AK', 'lilac', 'The dal tastes like someone has been looking after it all day. They have. Add a fresh roti and it is my favorite kind of meal.', 'Dal makhani', 'Punjabi home cooking enthusiast', 4)]
  },
  {
    id: 'luna-masa', name: 'Luna & Masa', cuisine: 'Mexican', region: 'Jaliscan', city: 'Chicago', neighborhood: 'Pilsen', address: '1820 South Blue Island Avenue', coordinates: [41.8577, -87.6603], price: 1, image: 'tacos', score: 4.8, reviewCount: 91, tags: ['Stone-ground corn', 'Regional favorites'], vegetarian: true, since: '2010', dish: 'Birria tacos', description: 'A lively Pilsen kitchen with roots in Jalisco. Stone-ground corn, slow-braised fillings, and family hospitality are at the heart of the menu.', quote: 'Big flavors and an even bigger welcome. The salsa is unforgettable.', reviewer: 'Marco G.', reviews: [review('lm1', 'Marco G.', 'MG', 'sage', 'Big flavors and an even bigger welcome. The salsa is unforgettable, with the warmth of toasted chilies.', 'Birria tacos', 'Family from Guadalajara')]
  },
  {
    id: 'piccola-cucina', name: 'Piccola Cucina', cuisine: 'Italian', region: 'Sicilian', city: 'Chicago', neighborhood: 'Little Italy', address: '1320 West Taylor Street', coordinates: [41.8695, -87.6597], price: 3, image: 'pasta', score: 4.9, reviewCount: 68, tags: ['Seasonal menu', 'Sicilian roots'], vegetarian: true, since: '2009', dish: 'Pasta alla Norma', description: 'A little kitchen with a love for Sicily. Seasonal vegetables, handmade pasta, and a changing menu tell the story of the island.', quote: 'The eggplant, the basil, the ricotta salata. A lovely taste of Sicily.', reviewer: 'Francesca D.', reviews: [review('p1', 'Francesca D.', 'FD', 'peach', 'The eggplant, the basil, the ricotta salata. A lovely taste of Sicily, made with thoughtful ingredients.', 'Pasta alla Norma', 'Raised in Catania')]
  },
  {
    id: 'little-seoul', name: 'Little Seoul Kitchen', cuisine: 'Korean', region: 'Korean home cooking', city: 'Chicago', neighborhood: 'Albany Park', address: '3250 West Lawrence Avenue', coordinates: [41.9687, -87.7099], price: 2, image: 'bibimbap', score: 4.7, reviewCount: 58, tags: ['Seasonal banchan', 'Family-owned'], vegetarian: false, since: '2013', dish: 'Kimchi jjigae', description: 'Comforting stews and generous plates in a cozy family-run kitchen. The house kimchi finds its way into a wonderfully warming jjigae.', quote: 'A bubbling pot of comfort. Exactly what a cold Chicago day needs.', reviewer: 'Min J.', reviews: [review('ls1', 'Min J.', 'MJ', 'lilac', 'A bubbling pot of comfort. Exactly what a cold Chicago day needs. The tangy kimchi gives the stew a wonderful depth.', 'Kimchi jjigae', 'Korean comfort food lover', 4)]
  }
];

export const collections = [
  { id: 'mexico', title: 'From Mexico, with love', subtitle: 'Fresh masa. Family recipes. Full hearts.', image: 'tacos', label: 'A TASTE OF TRADITION', ids: ['casa-maiz', 'mesa-abuelita', 'luna-masa'], color: 'orange' },
  { id: 'comfort', title: 'A bowl that feels like home', subtitle: 'Comfort food with a story to tell.', image: 'noodles', label: 'FOOD FOR THE SOUL', ids: ['noodle-story', 'ammas-table', 'komorebi', 'little-seoul'], color: 'green' },
  { id: 'sf', title: 'Around the world, in SF', subtitle: 'Six neighborhoods. A world of flavor.', image: 'restaurant', label: 'THE LOCAL EDIT', ids: ['noodle-story', 'casa-maiz', 'ammas-table', 'nonnas-kitchen', 'seoul-table', 'zaytoun'], color: 'pink' }
];

export function filterRestaurants(items, { city = 'All cities', cuisine = 'All cuisines', query = '', price = 'all', vegetarian = false, sort = 'recommended', ids = null, neighborhood = '', excludeCuisines = [] } = {}) {
  const search = query.trim().toLocaleLowerCase();
  const result = items.filter(r =>
    (city === 'All cities' || r.city === city) &&
    (cuisine === 'All cuisines' || r.cuisine === cuisine) &&
    (price === 'all' || r.price === Number(price)) &&
    (!vegetarian || r.vegetarian) &&
    (!neighborhood || r.neighborhood === neighborhood) &&
    !excludeCuisines.includes(r.cuisine) &&
    (!ids || ids.includes(r.id)) &&
    (!search || matchesSearch(r, search))
  );
  if (sort === 'rating') result.sort((a, b) => b.score - a.score || b.reviewCount - a.reviewCount);
  if (sort === 'price') result.sort((a, b) => a.price - b.price || b.score - a.score);
  if (sort === 'reviews') result.sort((a, b) => b.reviewCount - a.reviewCount);
  return result;
}

export function readLocal(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
