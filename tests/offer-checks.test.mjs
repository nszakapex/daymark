import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  checkOffer,
  getOffer,
  sampleCart,
  offers,
  spendForOffer,
} from '../lib/offer-checks.ts';
import { syntheticData } from '../lib/synthetic-data.ts';

test('a broken planner promise fails, and a fresh check verifies a corrected eligible basket', () => {
  const original = checkOffer('planner', 'current');
  assert.equal(original.status, 'failed');
  assert.equal(original.expectedDiscountCents, 760);
  assert.equal(original.cart.discountCents, 0);
  assert.equal(original.cart.totalBeforeTaxCents, 4350);
  const corrected = checkOffer('planner', 'corrected');
  assert.equal(corrected.status, 'passed');
  assert.equal(corrected.cart.discountCents, 760);
  assert.equal(corrected.cart.totalBeforeTaxCents, 3590);
  assert.equal(original.status, 'failed');
  assert.match(original.scope, /not a live browser/);
});
test('gift is validated without fabricating a percentage discount', () => {
  const result = checkOffer('desk', 'current');
  assert.equal(result.status, 'passed');
  assert.equal(result.cart.giftAdded, true);
  assert.equal(result.cart.discountCents, 0);
  assert.equal(result.cart.totalBeforeTaxCents, 8400);
});
test('shipping requires confirmed market and a verified zero shipping rate', () => {
  const unknown = checkOffer('shipping', 'current');
  assert.equal(unknown.status, 'inconclusive');
  assert.equal(unknown.cart.shippingCents, null);
  assert.equal(unknown.cart.totalBeforeTaxCents, null);
  const confirmed = checkOffer('shipping', 'current', true);
  assert.equal(confirmed.status, 'passed');
  assert.equal(confirmed.cart.shippingCents, 0);
  assert.equal(confirmed.cart.totalBeforeTaxCents, 12800);
});
test('an unavailable checkout is never presented as a failed customer experience', () => {
  for (const offer of offers) {
    const result = checkOffer(offer.id, 'unavailable', true);
    assert.equal(result.status, 'inconclusive');
    assert.equal(result.cart, null);
    assert.equal(result.steps.at(-1).result, 'inconclusive');
  }
});
test('cart preview and evidence agree; campaign exposure is separate from discount or loss', () => {
  for (const offer of offers) {
    for (const setup of ['current', 'corrected', 'unavailable']) {
      assert.deepEqual(
        checkOffer(offer.id, setup).cart,
        sampleCart(offer, setup),
      );
    }
  }
  assert.equal(getOffer('invalid'), undefined);
  assert.equal(spendForOffer(getOffer('planner')), 61.26);
  assert.equal(
    spendForOffer(getOffer('planner'), [
      ...syntheticData.adDays,
      ...syntheticData.adDays,
    ]),
    61.26,
  );
});
