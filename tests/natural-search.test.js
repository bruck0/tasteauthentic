import test from 'node:test';
import assert from 'node:assert/strict';
import { parseNaturalSearch } from '../src/search.js';
import { restaurants, filterRestaurants } from '../src/data.js';

function search(text, selectedCity = 'San Francisco') {
  const parsed = parseNaturalSearch(text, restaurants, selectedCity);
  const matches = parsed.issues.length ? [] : filterRestaurants(restaurants, {
    ...parsed, city: parsed.city || selectedCity, cuisine: parsed.cuisine || 'All cuisines',
  });
  return { ...parsed, ids: matches.map(r => r.id) };
}

test('conversational query combines cuisine, budget, diet, and a city alias', () => {
  const result = search('Can you find me cheap vegetarian Mexican food in SF please?');
  assert.equal(result.city, 'San Francisco');
  assert.equal(result.cuisine, 'Mexican');
  assert.equal(result.price, '1');
  assert.equal(result.vegetarian, true);
  assert.equal(result.query, '');
  assert.deepEqual(result.ids, ['casa-maiz']);
});

test('dish search changes city and sorting without inventing menu items', () => {
  const ramen = search('Best ramen in NYC');
  assert.equal(ramen.sort, 'rating');
  assert.equal(ramen.query, 'ramen');
  assert.deepEqual(ramen.ids, ['komorebi']);
  assert.deepEqual(search('sushi in NYC').ids, []);
});

test('neighborhood shorthand infers its city and detects conflicting locations', () => {
  const result = search('Indian in the Sunset', 'Chicago');
  assert.equal(result.neighborhood, 'Sunset District');
  assert.equal(result.city, 'San Francisco');
  assert.deepEqual(result.ids, ['ammas-table']);
  assert.ok(search('Indian in the Sunset in Chicago').issues.length);
  assert.deepEqual(search('Mexican in Sunset Park').ids, ['mesa-abuelita']);
});

test('matches accented names, regional keywords, and review dishes', () => {
  assert.deepEqual(search('Casa de Maiz').ids, ['casa-maiz']);
  assert.deepEqual(search('Please find Sichuan noodles').ids, ['noodle-story']);
  assert.deepEqual(search('I would like a masala dosa').ids, ['ammas-table']);
});

test('does not turn an excluded cuisine into a positive filter', () => {
  const result = search('Vegetarian in SF, not Mexican');
  assert.deepEqual(result.excludeCuisines, ['Mexican']);
  assert.equal(result.cuisine, null);
  assert.ok(result.ids.length > 0);
  assert.ok(!result.ids.includes('casa-maiz'));
});

test('long price phrases and dollar symbols do not collide', () => {
  assert.equal(search('not too expensive Mexican in SF').price, '1');
  assert.equal(search('$$ Indian in SF').price, '2');
  assert.equal(search('$$$ Italian in Chicago').price, '3');
  assert.equal(search('least expensive Indian in SF').price, 'all');
  assert.equal(search('least expensive Indian in SF').sort, 'price');
});

test('unsupported constraints do not produce apparently verified matches', () => {
  for (const query of ['vegan Indian in SF', 'Mexican open now', 'Indian under $20', 'tacos within 2 miles', 'not vegetarian Chinese', 'non-vegetarian Indian', 'I don’t want vegetarian food']) {
    const result = search(query);
    assert.ok(result.issues.length > 0, query);
    assert.deepEqual(result.ids, [], query);
  }
});

test('near me explains the selected-city fallback and never requests geolocation', () => {
  const result = search('Mexican near me', 'Chicago');
  assert.equal(result.city, 'Chicago');
  assert.ok(result.notes.some(note => note.includes('device location is not accessed')));
  assert.deepEqual(result.ids, ['luna-masa']);
});

test('ambiguous choices are surfaced and unfamiliar terms are retained', () => {
  assert.ok(search('Mexican or Indian in SF').issues.length);
  assert.ok(search('noodles in Chicago or New York').issues.length);
  assert.ok(search('cheap upscale Indian').issues.length);
  const unknown = search('quiet candlelit rooftop tacos');
  assert.equal(unknown.query, 'quiet candlelit rooftop tacos');
  assert.deepEqual(unknown.ids, []);
});

test('new searches do not inherit previous interpreted constraints', () => {
  search('cheap vegetarian Mexican in Chicago');
  const result = search('best ramen in NYC');
  assert.equal(result.price, 'all');
  assert.equal(result.vegetarian, false);
  assert.equal(result.cuisine, null);
  assert.deepEqual(result.ids, ['komorebi']);
});
