import Link from '@/components/site-link';
import { ArrowLeft, ArrowUpRight, Check } from 'lucide-react';
import { Brand } from '../landing';
import { whopListingUrl } from '@/lib/secrets.ts';

export const dynamic = 'force-dynamic';

export default function PricingPage() {
  const listing = whopListingUrl();
  return (
    <main className="privacy-page" id="main-content" tabIndex={-1}>
      <Brand />
      <h1>What someone actually buys.</h1>
      <p>
        They buy a desk that lists who to email, who to stop, and who to leave
        alone after a payment moves. They do not buy a Zapier course, a live ad
        dashboard, or proof that a deal worked. $49 once, or $19 a month.
      </p>
      <h2>Starter · $49 once</h2>
      <p>
        Failed payments and new buyers appear as people on the desk. One
        thousand events per UTC month. You copy the next step in Daymark. Stripe
        can post in directly. Zapier is optional.
      </p>
      <h2>Operator · $19 / month</h2>
      <p>
        Refunds, chargebacks, cancels, and stale leads join the same list.
        Twenty thousand events per UTC month. You can ping one follow-up URL
        when someone needs a message or a person.
      </p>
      <h2>What they do on day one</h2>
      <p>
        Open /operator. Work the labeled sample list. Redeem a key. Point Stripe
        at the setup URL. Load my people. The job does not change.
      </p>
      <h2>What is not included</h2>
      <p>
        Live ad accounts, Shopify cart checks, proof a campaign caused a sale,
        and a card form inside this app. Do not sell those.
      </p>
      <h2>How you ship this on Whop</h2>
      <p>
        Two products. License keys from <code>pnpm license:issue</code> after{' '}
        <code>DAYMARK_LICENSE_SECRET</code> is set. The buyer redeems on the
        desk. Read docs/WHOP_SHIP.md before you take money.
      </p>
      <div className="operator-actions" style={{ marginTop: 28 }}>
        {listing ? (
          <a className="button-primary" href={listing}>
            Buy on Whop <ArrowUpRight size={16} />
          </a>
        ) : (
          <span className="notice">
            No Whop listing URL is configured on this host yet.
          </span>
        )}
        <Link className="button-secondary" href="/operator">
          Open the desk <Check size={16} />
        </Link>
      </div>
      <Link className="text-link" href="/">
        <ArrowLeft size={15} /> Back to Daymark
      </Link>
    </main>
  );
}
