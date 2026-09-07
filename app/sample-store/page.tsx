import Link from '@/components/site-link';
import {
  getOffer,
  offerConditions,
  sampleCart,
  type Setup,
} from '@/lib/offer-checks';
import { money } from '@/lib/demo-data';
export default async function SampleStore({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const offer =
    getOffer(typeof params.offer === 'string' ? params.offer : '') ??
    getOffer('planner')!;
  const setup: Setup =
    params.setup === 'corrected' || params.setup === 'unavailable'
      ? params.setup
      : 'current';
  const cart = sampleCart(offer, setup, params.market === 'US');
  return (
    <main id="main-content" className="sample-store">
      <Link className="text-link" href="/demo">
        ← Back to Daymark
      </Link>
      <span className="label-pill">Fictional store · no purchase possible</span>
      <header>
        <span className="eyebrow">JUNE PAPER CO.</span>
        <h1>A little room to think.</h1>
        <p>{offer.title}</p>
      </header>
      <section className="sample-cart">
        <div>
          <span className="eyebrow">Your sample basket</span>
          <h2>{offer.product}</h2>
          <p>Quantity: 1 · {offerConditions(offer, params.market === 'US')}</p>
        </div>
        {cart ? (
          <>
            <dl>
              <div>
                <dt>Subtotal</dt>
                <dd>{money(cart.subtotalCents / 100)}</dd>
              </div>
              <div>
                <dt>Code: {offer.code}</dt>
                <dd>−{money(cart.discountCents / 100)}</dd>
              </div>
              {offer.gift && (
                <div>
                  <dt>Complimentary pen set</dt>
                  <dd>{cart.giftAdded ? 'Included' : 'Missing'}</dd>
                </div>
              )}
              <div>
                <dt>Shipping</dt>
                <dd>
                  {cart.shippingCents === null
                    ? 'Choose a region'
                    : money(cart.shippingCents / 100)}
                </dd>
              </div>
              <div>
                <dt>Total before tax</dt>
                <dd>
                  {cart.totalBeforeTaxCents === null
                    ? 'Not yet available'
                    : money(cart.totalBeforeTaxCents / 100)}
                </dd>
              </div>
            </dl>
            <p
              className={
                offer.id === 'planner' && !cart.discountCents
                  ? 'offer-error'
                  : 'sample-cart-message'
              }
            >
              {cart.message}
            </p>
          </>
        ) : (
          <p className="offer-error">
            This scenario simulates a checkout that cannot be reached.
          </p>
        )}
        <p className="sample-check-disclosure">
          This cart and Daymark’s sample checks use the same store rules. This
          page does not process payments, reserve stock, or submit an order.
        </p>
      </section>
    </main>
  );
}
