// A small, deterministic dining-language parser. No model, network, or API keys.
export function normalizeSearch(value) {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[’']/g, '').replace(/[-–—]/g, ' ').replace(/\s+/g, ' ').trim();
}

const cuisineAliases = {
  Mexican: ['mexican', 'mexico'],
  Japanese: ['japanese', 'japan'],
  Italian: ['italian', 'italy'],
  Indian: ['indian', 'india'],
  Chinese: ['chinese', 'china'],
  Korean: ['korean', 'korea'],
  Levantine: ['levantine', 'lebanese', 'middle eastern', 'lebanon'],
};
const cityAliases = {
  'San Francisco': ['san francisco', 'sf', 's.f.', 'san fran'],
  'New York': ['new york city', 'new york', 'nyc', 'ny'],
  Chicago: ['chicago', 'chi town'],
};
const stopWords = new Set(('a an the i im id we were would like love want looking craving find search show me us get give recommend ' +
  'please can could you for to in at around near with that has have serves serving some any somewhere place places restaurant restaurants ' +
  'spot spots food cuisine cuisines meal eat eating try dinner lunch breakfast and of is are really good authentic').split(' '));
const escapeRegex = value => value.replace(/[.*+?^$()|[\]{}\\]/g, '\\$&');

export function parseNaturalSearch(input, items, selectedCity = 'All cities') {
  let remaining = normalizeSearch(input);
  const result = { city: null, cuisine: null, neighborhood: '', price: 'all', vegetarian: false, sort: 'recommended', excludeCuisines: [], query: '', notes: [], issues: [] };
  function take(phrase) {
    const pattern = new RegExp('(^|[^a-z0-9])(' + escapeRegex(phrase) + ')(?=$|[^a-z0-9])', 'g');
    let found = false;
    remaining = remaining.replace(pattern, (_, prefix) => { found = true; return prefix + ' '; });
    return found;
  }
  function takeAny(phrases) {
    // Consume every alias, even after a match.
    return phrases.sort((a, b) => b.length - a.length).map(take).some(Boolean);
  }
  function unsupported(pattern, message) {
    if (pattern.test(remaining)) {
      result.issues.push(message);
      remaining = remaining.replace(pattern, ' ');
    }
  }
  unsupported(/\b(?:open now|open late|open tonight|24 hours?|opening hours?|closing time)\b/g, 'Opening hours are not in the sample data. Remove the hours request to search.');
  unsupported(/\b(?:vegan|plant based|gluten free|dairy free|nut free|peanut free|halal|kosher|allerg(?:y|ies)|celiac)\b/g, 'The sample data cannot verify this dietary requirement. “Vegetarian options” is the only supported dietary filter.');
  unsupported(/\$\s*\d+(?:\.\d+)?|\b\d+(?:\.\d+)?\s*(?:dollars?|bucks?|usd)\b/g, 'Exact menu prices are unavailable. Try “cheap”, “moderate”, or “upscale” instead.');
  unsupported(/\b(?:within|less than|under)\s+\d+\s*(?:miles?|km|kilometers?|minutes?)\b/g, 'Distance and travel-time search are not available. Try a city or neighborhood.');
  unsupported(/\b(?:do not want|dont want|not|no|without|non|avoid)\s+(?:vegetarian|veggie|meat free|cheap|expensive|moderate|upscale)\b/g, 'That exclusion is not supported yet. Use a positive budget or dietary preference.');

  const useSelectedCity = takeAny(['near me', 'nearby', 'close to me']);
  if (useSelectedCity) result.notes.push('“Near me” uses the city selector; your device location is not accessed.');
  const foundCities = Object.entries(cityAliases).filter(([, aliases]) => takeAny([...aliases])).map(([name]) => name);
  if (foundCities.length > 1) result.issues.push('Choose one city per search, or use the All cities selector.');
  if (foundCities.length === 1) result.city = foundCities[0];
  if (takeAny(['all cities', 'any city', 'anywhere'])) result.city = 'All cities';

  const neighborhoods = [...new Map(items.map(r => [r.neighborhood, { name: r.neighborhood, city: r.city }])).values()];
  const neighborhoodAliases = neighborhoods.flatMap(n =>
    [...new Set([normalizeSearch(n.name), normalizeSearch(n.name.replace(/ District$/, ''))])]
      .map(alias => ({ ...n, alias })))
    .sort((a, b) => b.alias.length - a.alias.length);
  const foundNeighborhoods = [...new Map(neighborhoodAliases.filter(n => take(n.alias)).map(n => [n.name, n])).values()];
  if (foundNeighborhoods.length > 1) result.issues.push('Choose one neighborhood per search.');
  if (foundNeighborhoods.length === 1) {
    const neighborhood = foundNeighborhoods[0];
    if (result.city && result.city !== 'All cities' && result.city !== neighborhood.city) {
      result.issues.push(neighborhood.name + ' is listed in ' + neighborhood.city + ', not ' + result.city + '. Adjust the location.');
    } else {
      result.city = neighborhood.city;
      result.neighborhood = neighborhood.name;
    }
  }
  for (const [cuisine, aliases] of Object.entries(cuisineAliases)) {
    const negatives = aliases.flatMap(alias => ['do not want ', 'dont want ', 'avoid ', 'not ', 'no ', 'without ', 'except ', 'anything but ', 'other than '].map(prefix => prefix + alias));
    if (takeAny(negatives)) result.excludeCuisines.push(cuisine);
  }
  const foundCuisines = Object.entries(cuisineAliases).filter(([, aliases]) => takeAny([...aliases])).map(([name]) => name);
  if (foundCuisines.length > 1) result.issues.push('Choose one cuisine per search, or use All cuisines.');
  if (foundCuisines.length === 1) result.cuisine = foundCuisines[0];

  // Consume long price phrases before individual words or dollar signs.
  const budgetPhrases = [
    ['1', ['not too expensive', 'budget friendly', 'on a budget', 'wallet friendly', 'low cost', 'inexpensive', 'affordable', 'cheap', 'budget', '$']],
    ['2', ['mid range', 'midrange', 'moderate', 'moderately priced', '$$']],
    ['3', ['special occasion', 'fine dining', 'upscale', 'fancy', 'splurge', 'expensive', '$$$']],
  ].flatMap(([price, aliases]) => aliases.map(alias => ({ price, alias }))).sort((a, b) => b.alias.length - a.alias.length);
  // Sort phrases must be consumed before budget phrases like "expensive".
  const sorts = [
    ['rating', ['highest rated', 'highly rated', 'top rated', 'best rated', 'best', 'top']],
    ['reviews', ['most reviewed', 'most popular', 'popular']],
    ['price', ['cheapest', 'lowest price', 'least expensive']],
  ].filter(([, aliases]) => takeAny([...aliases])).map(([sort]) => sort);
  if (sorts.length > 1) result.issues.push('Choose one sort preference: best rated, most reviewed, or cheapest.');
  if (sorts.length === 1) result.sort = sorts[0];
  const foundBudgets = [...new Set(budgetPhrases.filter(({ alias }) => take(alias)).map(({ price }) => price))];
  if (foundBudgets.length > 1) result.issues.push('Choose one budget level: cheap, moderate, or upscale.');
  if (foundBudgets.length === 1) result.price = foundBudgets[0];
  result.vegetarian = takeAny(['vegetarian friendly', 'vegetarian options', 'vegetarian', 'veggie', 'meat free']);

  remaining = remaining.replace(/\bfamily (?:owned|run)\b/g, 'family');
  result.query = remaining.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(word => word && !stopWords.has(word)).join(' ');
  if (useSelectedCity && !result.city) result.city = selectedCity;
  return result;
}

export function matchesSearch(r, query) {
  const haystack = normalizeSearch([r.name, r.cuisine, r.region, r.city, r.neighborhood, r.dish, ...r.tags, r.description, r.quote, ...r.reviews.flatMap(review => [review.dish, review.text])].join(' '));
  const tokens = normalizeSearch(query).split(/\s+/).filter(Boolean);
  return tokens.every(token => haystack.includes(token));
}
