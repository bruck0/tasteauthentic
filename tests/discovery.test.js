import test from 'node:test';
import assert from 'node:assert/strict';
import { restaurants, collections, filterRestaurants } from '../src/data.js';

test('search combines city, cuisine, price, and dietary preferences', () => {
  const results = filterRestaurants(restaurants, { city: 'San Francisco', cuisine: 'Mexican', query: '  TORTILLAS ', price: '1', vegetarian: true });
  assert.deepEqual(results.map(r => r.id), ['casa-maiz']);
  assert.equal(filterRestaurants(restaurants, { city: 'Chicago', cuisine: 'Japanese' }).length, 0);
});

test('dish and regional searches find restaurants beyond their names', () => {
  assert.deepEqual(filterRestaurants(restaurants, { query: 'thali' }).map(r => r.id), ['ammas-table']);
  assert.deepEqual(filterRestaurants(restaurants, { query: 'Hakata' }).map(r => r.id), ['komorebi']);
});

test('saved places and collections limit results and empty saved lists stay empty', () => {
  assert.equal(filterRestaurants(restaurants, { ids: [] }).length, 0);
  assert.deepEqual(filterRestaurants(restaurants, { ids: ['ammas-table', 'seoul-table'], vegetarian: true }).map(r => r.id), ['ammas-table']);
  for (const collection of collections) {
    assert.equal(filterRestaurants(restaurants, { ids: collection.ids }).length, collection.ids.length);
  }
});

test('sorting changes order without modifying source data', () => {
  const originalOrder = restaurants.map(r => r.id);
  const byPrice = filterRestaurants(restaurants, { sort: 'price' });
  assert.ok(byPrice.every((r, i) => i === 0 || byPrice[i - 1].price <= r.price));
  const byRating = filterRestaurants(restaurants, { sort: 'rating' });
  assert.ok(byRating.every((r, i) => i === 0 || byRating[i - 1].score >= r.score));
  const byReviews = filterRestaurants(restaurants, { sort: 'reviews' });
  assert.ok(byReviews.every((r, i) => i === 0 || byReviews[i - 1].reviewCount >= r.reviewCount));
  assert.deepEqual(restaurants.map(r => r.id), originalOrder);
});
