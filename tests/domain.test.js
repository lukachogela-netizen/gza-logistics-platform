import test from 'node:test';
import assert from 'node:assert/strict';
import { ensureAvailableSeats, parsePositiveInteger } from '../server/domain.js';

test('booking seat count accepts a positive integer', () => {
  assert.equal(parsePositiveInteger(2), 2);
  assert.equal(parsePositiveInteger('1'), 1);
});

test('booking seat count rejects zero, decimals and values above limit', () => {
  assert.throws(() => parsePositiveInteger(0), { status: 400 });
  assert.throws(() => parsePositiveInteger(1.5), { status: 400 });
  assert.throws(() => parsePositiveInteger(61), { status: 400 });
});

test('booking validation rejects an overbooked route', () => {
  assert.throws(() => ensureAvailableSeats({ seats_available: 1 }, 2), { status: 409 });
  assert.doesNotThrow(() => ensureAvailableSeats({ seats_available: 2 }, 2));
});

test('booking validation returns not found for a missing route', () => {
  assert.throws(() => ensureAvailableSeats(null, 1), { status: 404 });
});
